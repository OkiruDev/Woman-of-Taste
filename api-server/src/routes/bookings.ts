import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db/schema";
import { createTransporter } from "../utils/mailer.js";
import { generateInvoicePdf } from "../utils/pdf.js";
import {
  buildInvoiceConfirmationEmail,
  buildDeclineEmail,
} from "../utils/invoiceEmail.js";
import fs from "fs";
import path from "path";

const bookingsRouter = Router();

// One-time migration: clear cached PDF paths generated before the Investec bank details update
// so invoices regenerate with correct banking information on next download
async function clearOldInvoicePdfs() {
  try {
    await db.update(bookingsTable)
      .set({ invoicePdfPath: null })
      .where(sql`invoice_pdf_path IS NOT NULL AND invoice_sent_at < '2026-04-12 20:00:00'`);
    console.log("✓ Old invoice PDF paths cleared — will regenerate with updated bank details");
  } catch (e) {
    console.error("Invoice PDF cache clear failed:", e);
  }
}
clearOldInvoicePdfs();

function successPage(title: string, message: string, color: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Woman of Taste</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Georgia,serif; background:#f4f1ec; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .card { background:#fff; border-radius:20px; padding:50px 48px; max-width:480px; text-align:center; border:1px solid #e2d9cc; }
    .icon { font-size:48px; margin-bottom:20px; }
    h1 { font-size:26px; color:#1a2547; margin-bottom:12px; font-weight:400; }
    p { font-family:Arial,sans-serif; font-size:14px; line-height:1.75; color:#6a5a48; margin-bottom:8px; }
    .badge { display:inline-block; margin-top:16px; background:${color}; color:#fff; border-radius:50px; padding:8px 22px; font-family:Arial,sans-serif; font-size:12px; font-weight:bold; letter-spacing:0.1em; text-transform:uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${color === "#16a34a" ? "✅" : "❌"}</div>
    <h1>${title}</h1>
    ${message}
    <div class="badge">Woman of Taste</div>
  </div>
</body>
</html>`;
}

// APPROVE booking
bookingsRouter.get("/bookings/approve/:token", async (req, res) => {
  const { token } = req.params;

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.approvalToken, token))
    .limit(1);

  if (!booking) {
    return res.status(404).json({ ok: false, error: "This approval link is invalid or has already been used." });
  }

  if (booking.status !== "PENDING") {
    return res.status(409).json({ ok: false, error: `This booking (${booking.invoiceNumber}) has already been ${booking.status.toLowerCase()}.` });
  }

  if (booking.tokenExpiresAt && new Date() > booking.tokenExpiresAt) {
    return res.status(410).json({ ok: false, error: "This approval link has expired (72 hours). Please log in to the admin dashboard to process this booking manually." });
  }

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const emailData = {
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
  };

  let pdfPath: string | null = null;

  try {
    pdfPath = await generateInvoicePdf(emailData);
  } catch (err) {
    console.error(`[bookings] PDF generation failed for ${booking.invoiceNumber}:`, err);
  }

  const now = new Date();
  await db
    .update(bookingsTable)
    .set({
      status: "APPROVED",
      approvalToken: null,
      declineToken: null,
      invoicePdfPath: pdfPath,
      invoiceSentAt: now,
      updatedAt: now,
    })
    .where(eq(bookingsTable.id, booking.id));

  const transporter = createTransporter();
  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";

  if (transporter) {
    try {
      const mailOptions: Parameters<typeof transporter.sendMail>[0] = {
        from: `"Woman of Taste Events" <${smtpUser}>`,
        to: booking.email,
        subject: `Your booking is confirmed — invoice attached — Woman of Taste`,
        html: buildInvoiceConfirmationEmail(emailData, dueDate),
      };

      if (pdfPath && fs.existsSync(pdfPath)) {
        mailOptions.attachments = [
          {
            filename: `${booking.invoiceNumber}.pdf`,
            path: pdfPath,
            contentType: "application/pdf",
          },
        ];
      }

      await transporter.sendMail(mailOptions);
      console.log(`[bookings] Invoice ${booking.invoiceNumber} approved & sent to ${booking.email}`);
    } catch (err) {
      console.error("[bookings] Email send failed:", err);
    }
  }

  return res.json({
    ok: true,
    message: `Booking ${booking.invoiceNumber} approved. Invoice sent to ${booking.email}.`,
    booking: {
      invoiceNumber: booking.invoiceNumber,
      firstName: booking.firstName,
      surname: booking.surname,
      email: booking.email,
      eventTitle: booking.eventTitle,
      eventDate: booking.eventDate,
      quantity: booking.quantity,
      totalAmount: booking.totalAmount,
    },
  });
});

// DECLINE booking
bookingsRouter.get("/bookings/decline/:token", async (req, res) => {
  const { token } = req.params;

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.declineToken, token))
    .limit(1);

  if (!booking) {
    return res.status(404).json({ ok: false, error: "This decline link is invalid or has already been used." });
  }

  if (booking.status !== "PENDING") {
    return res.status(409).json({ ok: false, error: `This booking (${booking.invoiceNumber}) has already been ${booking.status.toLowerCase()}.` });
  }

  if (booking.tokenExpiresAt && new Date() > booking.tokenExpiresAt) {
    return res.status(410).json({ ok: false, error: "This decline link has expired. Please use the admin dashboard." });
  }

  await db
    .update(bookingsTable)
    .set({
      status: "DECLINED",
      approvalToken: null,
      declineToken: null,
      updatedAt: new Date(),
    })
    .where(eq(bookingsTable.id, booking.id));

  const transporter = createTransporter();
  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Woman of Taste Events" <${smtpUser}>`,
        to: booking.email,
        subject: `Regarding your Woman of Taste booking request`,
        html: buildDeclineEmail({
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
        }),
      });
      console.log(`[bookings] Booking ${booking.invoiceNumber} declined. Email sent to ${booking.email}`);
    } catch (err) {
      console.error("[bookings] Decline email failed:", err);
    }
  }

  return res.json({
    ok: true,
    message: `Booking ${booking.invoiceNumber} declined. Guest notified at ${booking.email}.`,
    firstName: booking.firstName,
    invoiceNumber: booking.invoiceNumber,
  });
});

// Download invoice PDF (admin use)
bookingsRouter.get("/bookings/:id/invoice", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1);

  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });

  let pdfPath = booking.invoicePdfPath;

  // Regenerate if missing
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    try {
      pdfPath = await generateInvoicePdf({
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
      await db
        .update(bookingsTable)
        .set({ invoicePdfPath: pdfPath, updatedAt: new Date() })
        .where(eq(bookingsTable.id, booking.id));
    } catch (err) {
      console.error("[bookings] PDF regeneration failed:", err);
      return res.status(500).json({ ok: false, error: "Could not generate PDF." });
    }
  }

  const fileName = path.basename(pdfPath!);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/pdf");
  return res.sendFile(path.resolve(pdfPath!));
});

// GET /api/events/:eventId/seats — public: returns confirmed, reserved and remaining ticket counts
bookingsRouter.get("/events/:eventId/seats", async (req, res) => {
  const { eventId } = req.params;

  const rows = await db
    .select({
      status: bookingsTable.status,
      total: sql<number>`COALESCE(SUM(${bookingsTable.quantity}), 0)`,
    })
    .from(bookingsTable)
    .where(and(
      eq(bookingsTable.eventId, eventId),
      sql`${bookingsTable.status} IN ('PAID', 'APPROVED', 'PENDING', 'OVERDUE')`
    ))
    .groupBy(bookingsTable.status);

  const confirmedTickets = rows
    .filter((r) => r.status === "PAID")
    .reduce((s, r) => s + Number(r.total), 0);

  const reservedTickets = rows
    .filter((r) => r.status === "PENDING" || r.status === "APPROVED" || r.status === "OVERDUE")
    .reduce((s, r) => s + Number(r.total), 0);

  return res.json({ ok: true, eventId, confirmedTickets, reservedTickets });
});

export default bookingsRouter;
