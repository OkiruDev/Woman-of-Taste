import { Router } from "express";
import { randomBytes } from "crypto";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db/schema";
import { createTransporter } from "../utils/mailer.js";
import {
  buildApprovalAdminEmail,
  buildClientConfirmationEmail,
  buildWaitlistConfirmationEmail,
} from "../utils/invoiceEmail.js";
import { upsertContact } from "../utils/upsertContact.js";

const ticketsRouter = Router();

interface TicketPayload {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  quantity: number;
  pricePerTicket: number;
  dietary?: string;
  totalCapacity?: number;
}

ticketsRouter.post("/tickets", async (req, res) => {
  const payload = req.body as TicketPayload;
  const {
    eventId,
    eventTitle,
    eventDate,
    eventLocation,
    firstName,
    surname,
    email,
    phone,
    quantity,
    pricePerTicket,
  } = payload;

  if (
    !eventId || !eventTitle || !firstName || !surname ||
    !email || !phone || !quantity || !pricePerTicket
  ) {
    return res.status(400).json({ ok: false, error: "Missing required fields." });
  }

  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ ok: false, error: "Invalid ticket quantity." });
  }

  const totalAmount = quantity * pricePerTicket;

  // Approval/decline tokens (expire in 72 hours)
  const approvalToken = randomBytes(32).toString("hex");
  const declineToken = randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  try {
    // ── Check real-time seat availability if event has a capacity ──────────
    let isWaitlist = false;
    if (payload.totalCapacity && payload.totalCapacity > 0) {
      const seatRows = await db
        .select({
          status: bookingsTable.status,
          total: sql<number>`COALESCE(SUM(${bookingsTable.quantity}), 0)`,
        })
        .from(bookingsTable)
        .where(and(
          eq(bookingsTable.eventId, eventId),
          sql`${bookingsTable.status} IN ('PAID', 'APPROVED', 'PENDING', 'OVERDUE')`,
        ))
        .groupBy(bookingsTable.status);

      const taken = seatRows.reduce((s, r) => s + Number(r.total), 0);
      const remaining = Math.max(0, payload.totalCapacity - taken);
      if (remaining === 0) isWaitlist = true;
    }

    // Insert booking with a temp invoice number first (we need the DB id for the sequential number)
    const tempInvoice = `WOT-TEMP-${Date.now()}`;
    const [inserted] = await db
      .insert(bookingsTable)
      .values({
        invoiceNumber: tempInvoice,
        status: isWaitlist ? "WAITLIST" : "PENDING",
        eventId,
        eventTitle,
        eventDate,
        eventLocation,
        firstName,
        surname,
        email,
        phone,
        dietary: payload.dietary?.trim() || null,
        quantity,
        pricePerTicket,
        totalAmount,
        approvalToken,
        declineToken,
        tokenExpiresAt,
      })
      .returning();

    // Generate sequential invoice number: WOT-YYYY-XXXX
    const year = new Date().getFullYear();
    const invoiceNumber = `WOT-${year}-${String(inserted.id).padStart(4, "0")}`;

    await db
      .update(bookingsTable)
      .set({ invoiceNumber, updatedAt: new Date() })
      .where(eq(bookingsTable.id, inserted.id));

    // Add to mailing list / CRM contacts
    await upsertContact({
      email,
      firstName,
      lastName: surname,
      phone,
      source: "booking",
      tag: isWaitlist ? "waitlist" : "booking",
    });

    const transporter = createTransporter();
    const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
    const replitDomain = process.env["REPLIT_DOMAINS"]?.split(",")[0]?.trim();
    const appUrl = replitDomain
      ? `https://${replitDomain}`
      : (process.env["APP_URL"] ?? "https://womanoftaste.co.za");

    const approveUrl = `${appUrl}/bookings/approve/${approvalToken}`;
    const declineUrl = `${appUrl}/bookings/decline/${declineToken}`;

    const emailData = {
      invoiceNumber,
      firstName,
      surname,
      email,
      phone,
      dietary: payload.dietary?.trim() || null,
      eventTitle,
      eventDate,
      eventLocation,
      quantity,
      pricePerTicket,
      totalAmount,
    };

    if (transporter) {
      try {
        if (isWaitlist) {
          // Waitlist: only send client waitlist confirmation, no admin approval needed
          await transporter.sendMail({
            from: `"Woman of Taste Events" <${smtpUser}>`,
            to: email,
            subject: `You're on the waitlist — ${eventTitle} — Woman of Taste`,
            html: buildWaitlistConfirmationEmail(emailData),
          });
          console.log(`[tickets] Waitlist booking ${invoiceNumber} saved → waitlist email → ${email}`);
        } else {
          // Normal booking: admin approval + client confirmation
          await Promise.all([
            transporter.sendMail({
              from: `"Woman of Taste Events" <${smtpUser}>`,
              to: "info@womanoftaste.co.za",
              subject: `New booking request — ${eventTitle} — ${firstName} ${surname}`,
              html: buildApprovalAdminEmail(emailData, approveUrl, declineUrl),
            }),
            transporter.sendMail({
              from: `"Woman of Taste Events" <${smtpUser}>`,
              to: email,
              subject: `We've received your booking request — Woman of Taste`,
              html: buildClientConfirmationEmail(emailData),
            }),
          ]);
          console.log(`[tickets] Booking ${invoiceNumber} saved. Approval email → info@; confirmation → ${email}`);
        }
      } catch (err) {
        console.error("[tickets] Email error:", err);
      }
    } else {
      console.warn(`[tickets] SMTP not configured. ${isWaitlist ? "Waitlist" : "Booking"} saved:`, invoiceNumber);
    }

    return res.json({ ok: true, invoiceNumber, total: totalAmount, waitlisted: isWaitlist });
  } catch (err) {
    console.error("[tickets] DB error:", err);
    return res.status(500).json({ ok: false, error: "Failed to save booking. Please try again." });
  }
});

export default ticketsRouter;
