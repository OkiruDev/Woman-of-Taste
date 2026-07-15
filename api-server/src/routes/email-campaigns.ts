import { Router } from "express";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { db } from "@workspace/db";
import { emailCampaignsTable, emailSendsTable, emailEventsTable, contactsTable, activityLogTable, bookingsTable } from "@workspace/db/schema";
import { createTransporter } from "../utils/mailer.js";
import crypto from "crypto";
import { requireAdminAuth as authMiddleware } from "../middlewares/adminAuth.js";

const emailRouter = Router();

async function logActivity(actionType: string, description: string, entityType = "", entityId = "") {
  try { await db.insert(activityLogTable).values({ actionType, description, entityType, entityId }); } catch {}
}

function buildEmailHtml(body: string, subject: string, unsubscribeUrl: string, previewText = "") {
  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title>
${previewText ? `<span style="display:none;max-height:0;overflow:hidden;">${previewText}</span>` : ""}
</head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:hsl(225,50%,22%);padding:32px 40px;text-align:center;">
  <img src="https://womanoftaste.co.za/wot-logo.png" alt="Woman of Taste" style="height:48px;opacity:0.9;mix-blend-mode:screen" />
  <p style="margin:8px 0 0;font-family:sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:hsl(38,45%,65%);">Woman of Taste · Savory &amp; Soulful</p>
</td></tr>
<tr><td style="padding:40px;">
  ${body}
  <hr style="border:none;border-top:1px solid #e8e3da;margin:32px 0;" />
  <p style="font-family:sans-serif;font-size:12px;color:#888;text-align:center;line-height:1.6;">
    Woman of Taste · ${smtpUser} · <a href="https://womanoftaste.co.za" style="color:#c9963a;">womanoftaste.co.za</a>
  </p>
  <p style="font-family:sans-serif;font-size:11px;color:#aaa;text-align:center;">
    <a href="${unsubscribeUrl}" style="color:#aaa;">Unsubscribe</a>
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

// GET /api/admin/email/event-list — distinct events that have bookings
emailRouter.get("/admin/email/event-list", authMiddleware, async (_req, res) => {
  const rows = await db
    .selectDistinct({ eventId: bookingsTable.eventId, eventTitle: bookingsTable.eventTitle, eventDate: bookingsTable.eventDate })
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.eventDate));
  return res.json({ ok: true, events: rows });
});

// GET /api/admin/email/event-count — count bookers for an event by status
emailRouter.get("/admin/email/event-count", authMiddleware, async (req, res) => {
  const { eventId, statuses } = req.query as { eventId?: string; statuses?: string };
  if (!eventId) return res.json({ ok: true, count: 0 });
  const statusList = statuses ? statuses.split(",").map(s => s.trim()).filter(Boolean) : ["PENDING","APPROVED","PAID","OVERDUE","WAITLIST"];
  if (statusList.length === 0) return res.json({ ok: true, count: 0, breakdown: {} });

  const rows = await db
    .select({ status: bookingsTable.status, email: bookingsTable.email })
    .from(bookingsTable)
    .where(and(
      eq(bookingsTable.eventId, eventId),
      sql`${bookingsTable.status} = ANY(ARRAY[${sql.raw(statusList.map(s => `'${s}'`).join(","))}])`,
    ));

  // Deduplicate by email within selected statuses
  const uniqueEmails = new Set(rows.map(r => r.email.toLowerCase()));
  const breakdown: Record<string, number> = {};
  for (const r of rows) {
    breakdown[r.status] = (breakdown[r.status] ?? 0) + 1;
  }
  return res.json({ ok: true, count: uniqueEmails.size, breakdown });
});

// GET /api/admin/email/campaigns — list all (non-template)
emailRouter.get("/admin/email/campaigns", authMiddleware, async (_req, res) => {
  const campaigns = await db.select().from(emailCampaignsTable)
    .where(eq(emailCampaignsTable.isTemplate, false))
    .orderBy(desc(emailCampaignsTable.createdAt));
  return res.json({ ok: true, campaigns });
});

// GET /api/admin/email/templates — list templates
emailRouter.get("/admin/email/templates", authMiddleware, async (_req, res) => {
  const templates = await db.select().from(emailCampaignsTable)
    .where(eq(emailCampaignsTable.isTemplate, true))
    .orderBy(desc(emailCampaignsTable.createdAt));
  return res.json({ ok: true, templates });
});

// GET /api/admin/email/drafts — list drafts
emailRouter.get("/admin/email/drafts", authMiddleware, async (_req, res) => {
  const drafts = await db.select().from(emailCampaignsTable)
    .where(and(eq(emailCampaignsTable.status, "draft"), eq(emailCampaignsTable.isTemplate, false)))
    .orderBy(desc(emailCampaignsTable.updatedAt));
  return res.json({ ok: true, drafts });
});

// GET /api/admin/email/:id — single campaign
emailRouter.get("/admin/email/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
  if (!campaign) return res.status(404).json({ ok: false, error: "Not found." });
  return res.json({ ok: true, campaign });
});

// POST /api/admin/email — create draft / template
emailRouter.post("/admin/email", authMiddleware, async (req, res) => {
  const { name, subject, previewText, body, recipientType, recipientFilter, manualEmails, isTemplate, templateName, scheduledAt } = req.body;
  if (!subject) return res.status(400).json({ ok: false, error: "Subject required." });

  const [campaign] = await db.insert(emailCampaignsTable).values({
    name: name ?? subject, subject, previewText: previewText ?? "",
    body: body ?? "", recipientType: recipientType ?? "all",
    recipientFilter: recipientFilter ?? "", manualEmails: manualEmails ?? "",
    status: scheduledAt ? "scheduled" : "draft",
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    isTemplate: isTemplate ?? false,
    templateName: templateName ?? "",
  }).returning();

  return res.json({ ok: true, campaign });
});

// PATCH /api/admin/email/:id — update draft
emailRouter.patch("/admin/email/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const updates: Record<string, any> = { updatedAt: new Date() };
  const fields = ["name", "subject", "previewText", "body", "recipientType", "recipientFilter", "manualEmails", "status", "scheduledAt", "isTemplate", "templateName"];
  for (const f of fields) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
  await db.update(emailCampaignsTable).set(updates).where(eq(emailCampaignsTable.id, id));
  const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
  return res.json({ ok: true, campaign });
});

// DELETE /api/admin/email/:id
emailRouter.delete("/admin/email/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  await db.delete(emailCampaignsTable).where(eq(emailCampaignsTable.id, id));
  return res.json({ ok: true });
});

// POST /api/admin/email/:id/send — broadcast
emailRouter.post("/admin/email/:id/send", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const { testEmail } = req.body;

  const [campaign] = await db.select().from(emailCampaignsTable).where(eq(emailCampaignsTable.id, id)).limit(1);
  if (!campaign) return res.status(404).json({ ok: false, error: "Campaign not found." });

  const transporter = createTransporter();
  if (!transporter) return res.status(503).json({ ok: false, error: "Email not configured." });

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
  const baseUrl = process.env["APP_URL"] ?? "https://womanoftaste.co.za";

  // Test send
  if (testEmail) {
    const testToken = crypto.randomBytes(16).toString("hex");
    const html = buildEmailHtml(campaign.body, campaign.subject, `${baseUrl}/api/unsubscribe/${testToken}`, campaign.previewText ?? "");
    await transporter.sendMail({ from: `"Woman of Taste" <${smtpUser}>`, to: testEmail, subject: `[TEST] ${campaign.subject}`, html });
    return res.json({ ok: true, message: `Test email sent to ${testEmail}` });
  }

  // Get recipients
  let recipients: Array<{ email: string; id?: number }> = [];
  if (campaign.recipientType === "all") {
    const contacts = await db.select({ email: contactsTable.email, id: contactsTable.id })
      .from(contactsTable).where(eq(contactsTable.optedOut, false));
    recipients = contacts;
  } else if (campaign.recipientType === "event" && campaign.recipientFilter) {
    // Parse recipientFilter — supports both plain eventId string and JSON {eventId, statuses}
    let eventId = campaign.recipientFilter;
    let statusList = ["PENDING","APPROVED","PAID","OVERDUE","WAITLIST"];
    try {
      const parsed = JSON.parse(campaign.recipientFilter);
      if (parsed.eventId) eventId = parsed.eventId;
      if (Array.isArray(parsed.statuses) && parsed.statuses.length > 0) statusList = parsed.statuses;
    } catch { /* plain string — use defaults */ }

    const bookings = await db
      .selectDistinct({ email: bookingsTable.email })
      .from(bookingsTable)
      .where(and(
        eq(bookingsTable.eventId, eventId),
        sql`${bookingsTable.status} = ANY(ARRAY[${sql.raw(statusList.map(s => `'${s}'`).join(","))}])`,
      ));
    const eventEmails = bookings.map(b => b.email.trim().toLowerCase()).filter(Boolean);
    if (eventEmails.length > 0) {
      const contacts = await db.select({ email: contactsTable.email, id: contactsTable.id })
        .from(contactsTable)
        .where(and(
          eq(contactsTable.optedOut, false),
          inArray(contactsTable.email, eventEmails),
        ));
      // Include anyone not yet in contacts (booked but not yet upserted)
      const inContacts = new Set(contacts.map(c => c.email));
      const notInContacts = eventEmails
        .filter(e => !inContacts.has(e))
        .map(e => ({ email: e }));
      recipients = [...contacts, ...notInContacts];
    }
  } else if (campaign.recipientType === "manual" && campaign.manualEmails) {
    recipients = campaign.manualEmails.split(",").map(e => ({ email: e.trim() })).filter(e => e.email);
  } else if (campaign.recipientType === "segment") {
    const contacts = await db.select({ email: contactsTable.email, id: contactsTable.id })
      .from(contactsTable).where(eq(contactsTable.optedOut, false));
    recipients = contacts;
  }

  let sent = 0;
  for (const r of recipients) {
    try {
      const token = crypto.randomBytes(24).toString("hex");
      const unsubUrl = `${baseUrl}/api/unsubscribe/${token}`;
      const html = buildEmailHtml(campaign.body, campaign.subject, unsubUrl, campaign.previewText ?? "");
      await transporter.sendMail({ from: `"Woman of Taste" <${smtpUser}>`, to: r.email, subject: campaign.subject, html });
      await db.insert(emailSendsTable).values({
        campaignId: campaign.id, contactId: r.id ?? null, email: r.email,
        status: "sent", unsubscribeToken: token,
      });
      if (r.id) {
        await db.update(contactsTable).set({
          emailsReceived: sql`${contactsTable.emailsReceived} + 1`,
          lastEmailSentAt: new Date(), updatedAt: new Date(),
        }).where(eq(contactsTable.id, r.id));
      }
      sent++;
    } catch {}
  }

  await db.update(emailCampaignsTable).set({
    status: "sent", sentAt: new Date(), recipientsCount: sent, updatedAt: new Date(),
  }).where(eq(emailCampaignsTable.id, id));

  await logActivity("email_sent", `Sent campaign "${campaign.subject}" to ${sent} recipients`, "email_campaign", String(id));
  return res.json({ ok: true, sent });
});

// GET /api/admin/email/:id/recipients — who received/opened
emailRouter.get("/admin/email/:id/recipients", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const sends = await db.select().from(emailSendsTable).where(eq(emailSendsTable.campaignId, id)).orderBy(desc(emailSendsTable.sentAt));
  const events = await db.select().from(emailEventsTable).where(eq(emailEventsTable.campaignId, id));
  return res.json({ ok: true, sends, events });
});

// ── Tracking ──────────────────────────────────────────────────────────────────

// GET /api/track/open/:sendId — 1x1 pixel tracking
emailRouter.get("/track/open/:sendId", async (req, res) => {
  const sendId = parseInt(req.params.sendId);
  if (!isNaN(sendId)) {
    const [send] = await db.select().from(emailSendsTable).where(eq(emailSendsTable.id, sendId)).limit(1);
    if (send) {
      await db.insert(emailEventsTable).values({ sendId, campaignId: send.campaignId, eventType: "open", ipAddress: req.ip ?? "" });
      await db.update(emailCampaignsTable)
        .set({ opensCount: sql`${emailCampaignsTable.opensCount} + 1` })
        .where(eq(emailCampaignsTable.id, send.campaignId));
    }
  }
  const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
  res.writeHead(200, { "Content-Type": "image/gif", "Content-Length": pixel.length, "Cache-Control": "no-store" });
  return res.end(pixel);
});

// GET /api/track/click/:sendId/:linkId — click tracking redirect
emailRouter.get("/track/click/:sendId/:linkId", async (req, res) => {
  const sendId = parseInt(req.params.sendId);
  const linkId = req.params.linkId;
  const url = Buffer.from(linkId, "base64").toString("utf8");
  if (!isNaN(sendId)) {
    const [send] = await db.select().from(emailSendsTable).where(eq(emailSendsTable.id, sendId)).limit(1);
    if (send) {
      await db.insert(emailEventsTable).values({ sendId, campaignId: send.campaignId, eventType: "click", linkUrl: url, linkId, ipAddress: req.ip ?? "" });
      await db.update(emailCampaignsTable)
        .set({ clicksCount: sql`${emailCampaignsTable.clicksCount} + 1` })
        .where(eq(emailCampaignsTable.id, send.campaignId));
    }
  }
  return res.redirect(url.startsWith("http") ? url : "https://womanoftaste.co.za");
});

export default emailRouter;
