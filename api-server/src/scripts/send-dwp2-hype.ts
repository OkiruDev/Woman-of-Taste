/**
 * One-shot script: Send The Devil Wears Prada II hype email
 * to all PAID and APPROVED ticket holders for this event.
 * Run with: pnpm --filter @workspace/api-server exec tsx src/scripts/send-dwp2-hype.ts
 */

import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db/schema";
import { eq, and, or } from "drizzle-orm";
import { createTransporter } from "../utils/mailer.js";
import { buildDWP2HypeEmail } from "../utils/invoiceEmail.js";

const EVENT_ID = "devil-wears-prada-screening-apr-2026";
const EVENT_TITLE = "The Devil Wears Prada II";
const EVENT_DATE = "1 May 2026 · 17:30 — Late";
const EVENT_LOCATION = "Egrek Cinema, Parkhurst";

async function run() {
  const transporter = createTransporter();
  if (!transporter) {
    console.error("[hype-send] SMTP not configured. Aborting.");
    process.exit(1);
  }

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.eventId, EVENT_ID),
        or(
          eq(bookingsTable.status, "PAID"),
          eq(bookingsTable.status, "APPROVED"),
        ),
      ),
    );

  console.log(`[hype-send] Found ${bookings.length} confirmed/approved ticket holder(s) for "${EVENT_TITLE}".`);

  if (bookings.length === 0) {
    console.log("[hype-send] No recipients. Exiting.");
    process.exit(0);
  }

  let sent = 0;
  let failed = 0;

  for (const booking of bookings) {
    try {
      const html = buildDWP2HypeEmail({
        firstName: booking.firstName,
        eventTitle: EVENT_TITLE,
        eventDate: EVENT_DATE,
        eventLocation: EVENT_LOCATION,
        invoiceNumber: booking.invoiceNumber,
      });

      await transporter.sendMail({
        from: `"Patience — Woman of Taste" <${smtpUser}>`,
        to: booking.email,
        subject: `The trailer is HERE 🎬 — your Devil Wears Prada II screening is 1 May`,
        html,
      });

      console.log(`[hype-send] ✓ Sent to ${booking.firstName} ${booking.surname} <${booking.email}> (${booking.invoiceNumber})`);
      sent++;

      // Small delay to avoid SMTP throttling
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`[hype-send] ✗ Failed for ${booking.email}:`, err);
      failed++;
    }
  }

  console.log(`\n[hype-send] Done. ${sent} sent, ${failed} failed.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("[hype-send] Fatal error:", err);
  process.exit(1);
});
