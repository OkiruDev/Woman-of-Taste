import cron from "node-cron";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db/schema";
import { eq, and, isNull, lte, gte, or } from "drizzle-orm";
import { createTransporter } from "./mailer.js";
import { buildFollowup1Email, buildFollowup2Email, buildDWP2HypeEmail } from "./invoiceEmail.js";
import { sendWeeklyContentReminder } from "./contentReminder.js";
import { sendMonthlySocialReminder } from "./socialReminder.js";

function msAgo(ms: number): Date {
  return new Date(Date.now() - ms);
}

const HOUR = 60 * 60 * 1000;

async function runFollowup1() {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[scheduler] SMTP not configured, skipping follow-up 1 run");
    return;
  }

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";

  // Follow-up 1: APPROVED, invoice sent 20–28 hours ago, no followup1 yet.
  // Window ensures it fires once per booking without re-sending on later hourly runs.
  const fu1WindowStart = msAgo(28 * HOUR); // invoiceSentAt >= 28h ago (oldest in window)
  const fu1WindowEnd = msAgo(20 * HOUR);   // invoiceSentAt <= 20h ago (youngest in window)

  const needFu1 = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.status, "APPROVED"),
        isNull(bookingsTable.followup1SentAt),
        gte(bookingsTable.invoiceSentAt!, fu1WindowStart),
        lte(bookingsTable.invoiceSentAt!, fu1WindowEnd),
      ),
    );

  for (const booking of needFu1) {
    try {
      const html = buildFollowup1Email({
        invoiceNumber: booking.invoiceNumber,
        firstName: booking.firstName,
        surname: booking.surname,
        email: booking.email,
        phone: booking.phone,
        dietary: booking.dietary,
        eventTitle: booking.eventTitle,
        eventDate: booking.eventDate,
        eventLocation: booking.eventLocation,
        quantity: booking.quantity,
        pricePerTicket: booking.pricePerTicket,
        totalAmount: booking.totalAmount,
      });

      await transporter.sendMail({
        from: `"Woman of Taste" <${smtpUser}>`,
        to: booking.email,
        subject: `Friendly reminder — your Woman of Taste booking payment`,
        html,
      });

      await db
        .update(bookingsTable)
        .set({ followup1SentAt: new Date(), lastFollowupSentAt: new Date(), updatedAt: new Date() })
        .where(eq(bookingsTable.id, booking.id));

      console.log(`[scheduler] Follow-up 1 sent to ${booking.email} for ${booking.invoiceNumber}`);
    } catch (err) {
      console.error(`[scheduler] Follow-up 1 failed for ${booking.invoiceNumber}:`, err);
    }
  }
}

async function runFollowup2() {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[scheduler] SMTP not configured, skipping follow-up 2 run");
    return;
  }

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";

  // Follow-up 2 (Wednesday final warning): APPROVED or OVERDUE, received follow-up 1, no follow-up 2 yet.
  const needFu2 = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        or(eq(bookingsTable.status, "APPROVED"), eq(bookingsTable.status, "OVERDUE")),
        isNull(bookingsTable.followup2SentAt),
        // Must have already received follow-up 1
        lte(bookingsTable.followup1SentAt!, msAgo(1 * HOUR)),
      ),
    );

  for (const booking of needFu2) {
    try {
      const html = buildFollowup2Email({
        invoiceNumber: booking.invoiceNumber,
        firstName: booking.firstName,
        surname: booking.surname,
        email: booking.email,
        phone: booking.phone,
        dietary: booking.dietary,
        eventTitle: booking.eventTitle,
        eventDate: booking.eventDate,
        eventLocation: booking.eventLocation,
        quantity: booking.quantity,
        pricePerTicket: booking.pricePerTicket,
        totalAmount: booking.totalAmount,
      });

      await transporter.sendMail({
        from: `"Woman of Taste" <${smtpUser}>`,
        to: booking.email,
        subject: `Final reminder — payment needed to keep your Woman of Taste booking`,
        html,
      });

      await db
        .update(bookingsTable)
        .set({
          followup2SentAt: new Date(),
          lastFollowupSentAt: new Date(),
          status: "OVERDUE",
          updatedAt: new Date(),
        })
        .where(eq(bookingsTable.id, booking.id));

      console.log(`[scheduler] Follow-up 2 sent + OVERDUE for ${booking.invoiceNumber}`);
    } catch (err) {
      console.error(`[scheduler] Follow-up 2 failed for ${booking.invoiceNumber}:`, err);
    }
  }
}

// ── DWP2 Monday blast: hype email to ticket holders + TikTok nudge to admin ─
async function sendDWP2MondayBlast() {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[scheduler] SMTP not configured, skipping DWP2 Monday blast");
    return;
  }

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";

  // Only run if the event is still upcoming (before 1 May 2026 23:59 SAST)
  const eventDate = new Date("2026-05-01T21:59:00Z"); // 23:59 SAST = 21:59 UTC
  if (new Date() > eventDate) {
    console.log("[scheduler] DWP2 blast skipped — event has passed.");
    return;
  }

  // ── 1. Hype email to all confirmed + approved ticket holders ──────────────
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.eventId, "devil-wears-prada-screening-apr-2026"),
        or(
          eq(bookingsTable.status, "PAID"),
          eq(bookingsTable.status, "APPROVED"),
        ),
      ),
    );

  console.log(`[scheduler] DWP2 blast: ${bookings.length} ticket holder(s) to email.`);

  for (const booking of bookings) {
    try {
      await transporter.sendMail({
        from: `"Patience — Woman of Taste" <${smtpUser}>`,
        to: booking.email,
        subject: `The trailer is HERE 🎬 — your Devil Wears Prada II screening is 1 May`,
        html: buildDWP2HypeEmail({
          firstName: booking.firstName,
          eventTitle: "The Devil Wears Prada II",
          eventDate: "1 May 2026 · 17:30 — Late",
          eventLocation: "Egrek Cinema, Parkhurst",
          invoiceNumber: booking.invoiceNumber,
        }),
      });
      console.log(`[scheduler] DWP2 hype → ${booking.email} (${booking.invoiceNumber})`);
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`[scheduler] DWP2 hype failed for ${booking.email}:`, err);
    }
  }

  // ── 2. TikTok nudge to info@ ──────────────────────────────────────────────
  try {
    await transporter.sendMail({
      from: `"WOT Scheduler" <${smtpUser}>`,
      to: "info@womanoftaste.co.za",
      subject: `📱 Monday reminder — post your DWP2 teaser on TikTok today`,
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; background:#f4f1ec; }
  .page { max-width:540px; margin:0 auto; padding:36px 20px; }
  .card { background:#fff; border-radius:16px; overflow:hidden; border:1px solid #e2d9cc; }
  .top { background:linear-gradient(135deg,#1a2547,#2a3a6a); padding:28px 32px; }
  .top h1 { font-family:Georgia,serif; font-size:20px; color:#c9a96e; margin-bottom:4px; }
  .top p { font-family:Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.5); letter-spacing:0.15em; text-transform:uppercase; }
  .body { padding:32px; }
  p { font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:14px; }
  .checklist { background:#f9f5ee; border-radius:10px; padding:20px 24px; margin:20px 0; }
  .checklist h3 { font-family:Georgia,serif; font-size:14px; color:#1a2547; margin-bottom:12px; }
  .item { display:flex; gap:10px; margin-bottom:10px; font-size:13px; color:#4a3a28; line-height:1.5; }
  .item .bullet { flex-shrink:0; width:20px; height:20px; background:#1a2547; border-radius:50%; color:#c9a96e; font-size:10px; display:flex; align-items:center; justify-content:center; font-weight:bold; margin-top:1px; }
  .event-pill { background:#1a2547; color:#c9a96e; border-radius:8px; padding:10px 16px; font-size:12px; font-family:Georgia,serif; margin-top:8px; display:inline-block; }
  .footer { border-top:1px solid #e8e0d4; padding:14px 32px; text-align:center; font-size:10px; color:#bbb; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="top">
    <h1>📱 TikTok Reminder</h1>
    <p>Monday content nudge — Devil Wears Prada II</p>
  </div>
  <div class="body">
    <p>Hey PashieB 👋</p>
    <p>This is your Monday reminder to post a <strong>teaser or hype video</strong> on TikTok for the <strong>Devil Wears Prada II</strong> screening. You've just sent guests their style guide email — keep the excitement building on socials!</p>

    <div class="checklist">
      <h3>Ideas for today's post</h3>
      <div class="item"><div class="bullet">1</div><div>Drop the official trailer with your reaction — stitch or duet it on TikTok. Let people feel your excitement.</div></div>
      <div class="item"><div class="bullet">2</div><div>Film a quick "what I'm wearing to the screening" teaser — outfit flat lay, mirror check, or a sneak peek of your look for May 1.</div></div>
      <div class="item"><div class="bullet">3</div><div>Do a "3 looks inspired by Devil Wears Prada" style breakdown — invite followers to tag you in their picks.</div></div>
      <div class="item"><div class="bullet">4</div><div>Behind-the-scenes of the planning — popcorn, bubbly, the cinema, the vibe. Build the anticipation.</div></div>
    </div>

    <p>The event is <strong>Thursday 1 May</strong> — this week! A few posts between now and then will keep your guests buzzing and attract attention from people who missed out.</p>
    <p>Suggested hashtags: <strong>#DevilWearsPrada2 #WomanOfTaste #PrivateScreening #Parkhurst #FashionEditorial</strong></p>
    <div class="event-pill">🎬 The Devil Wears Prada II · 1 May 2026 · Egrek Cinema, Parkhurst</div>
  </div>
  <div class="footer">Woman of Taste Scheduler · Auto-sent every Monday before the DWP2 event</div>
</div></div>
</body></html>`,
    });
    console.log("[scheduler] DWP2 TikTok nudge → info@womanoftaste.co.za");
  } catch (err) {
    console.error("[scheduler] DWP2 TikTok nudge failed:", err);
  }
}

export function startScheduler() {
  // Follow-up 1: run every hour to catch invoices sent 20–28h ago
  cron.schedule("0 * * * *", () => {
    console.log("[scheduler] Running follow-up 1 check (20–28h window)…");
    runFollowup1().catch((err) => console.error("[scheduler] Follow-up 1 error:", err));
  });
  console.log("[scheduler] Follow-up 1 scheduler started (runs hourly, fires 20–28h after invoice).");

  // Follow-up 2: every Wednesday at 09:00 SAST (07:00 UTC) — final warning
  cron.schedule("0 7 * * 3", () => {
    console.log("[scheduler] Running Wednesday follow-up 2 (final warning)…");
    runFollowup2().catch((err) => console.error("[scheduler] Follow-up 2 error:", err));
  });
  console.log("[scheduler] Follow-up 2 scheduled (Wednesdays 09:00 SAST).");

  // Weekly content reminder: every Monday at 07:00 UTC (09:00 SAST)
  cron.schedule("0 7 * * 1", () => {
    console.log("[scheduler] Sending weekly content reminder…");
    sendWeeklyContentReminder().catch((err) =>
      console.error("[scheduler] Content reminder error:", err)
    );
  });
  console.log("[scheduler] Weekly content reminder scheduled (Mondays 09:00 SAST).");

  // DWP2 Monday blast: hype email to ticket holders + TikTok nudge to admin
  // Runs every Monday at 08:00 UTC (10:00 SAST). Self-disables once event date passes.
  cron.schedule("0 8 * * 1", () => {
    console.log("[scheduler] Running DWP2 Monday blast…");
    sendDWP2MondayBlast().catch((err) =>
      console.error("[scheduler] DWP2 Monday blast error:", err)
    );
  });
  console.log("[scheduler] DWP2 Monday blast scheduled (Mondays 10:00 SAST, active until 1 May 2026).");

  // Monthly social media reminder: 1st of every month at 07:00 UTC (09:00 SAST)
  cron.schedule("0 7 1 * *", () => {
    console.log("[scheduler] Sending monthly social media reminder…");
    sendMonthlySocialReminder().catch((err) =>
      console.error("[scheduler] Social reminder error:", err)
    );
  });
  console.log("[scheduler] Monthly social reminder scheduled (1st of month, 09:00 SAST).");
}
