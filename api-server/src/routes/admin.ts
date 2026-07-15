import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { db } from "@workspace/db";
import { bookingsTable } from "@workspace/db/schema";
import { createTransporter } from "../utils/mailer.js";
import { generateInvoicePdf } from "../utils/pdf.js";
import { buildFollowup1Email, buildInvoiceConfirmationEmail, buildDeclineEmail, buildPaymentConfirmedEmail, buildCinemaTicketEmail, buildOverdueReminderEmail, buildNonPaymentCancellationEmail } from "../utils/invoiceEmail.js";
import { getEventArrivalDetails } from "../utils/eventArrivalConfig.js";
import { sendWeeklyContentReminder } from "../utils/contentReminder.js";
import { sendMonthlySocialReminder } from "../utils/socialReminder.js";
import fs from "fs";
import path from "path";

const adminRouter = Router();

function getJwtSecret(): string {
  return process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "wot-admin-fallback";
}

function verifyToken(token?: string): boolean {
  if (!token) return false;
  try {
    jwt.verify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const queryToken = req.query?.token as string | undefined;
  if (!verifyToken(headerToken ?? queryToken)) {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }
  next();
}

const ADMIN_DOMAIN = "womanoftaste.co.za";

function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ADMIN_DOMAIN}`);
}

// POST /api/admin/auth — exchange email + password for JWT
adminRouter.post("/admin/auth", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const adminPassword = process.env["ADMIN_PASSWORD"];

  if (!adminPassword) {
    return res.status(503).json({ ok: false, error: "Admin password not configured. Set ADMIN_PASSWORD secret." });
  }

  if (!email || !isAdminEmail(email)) {
    return res.status(401).json({ ok: false, error: "Only @womanoftaste.co.za addresses have admin access." });
  }

  if (!password || password !== adminPassword) {
    return res.status(401).json({ ok: false, error: "Incorrect password." });
  }

  const token = jwt.sign({ role: "admin", email: email.trim().toLowerCase() }, getJwtSecret(), { expiresIn: "8h" });
  return res.json({ ok: true, token });
});

// GET /api/admin/bookings — list all bookings
adminRouter.get("/admin/bookings", authMiddleware, async (_req, res) => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(desc(bookingsTable.createdAt));
  return res.json({ ok: true, bookings });
});

// PATCH /api/admin/bookings/:id — update notes or status
adminRouter.patch("/admin/bookings/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const { notes, status } = req.body as { notes?: string; status?: string };
  const allowed = ["PENDING", "APPROVED", "PAID", "OVERDUE", "DECLINED"];

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (notes !== undefined) updates.notes = notes;
  if (status && allowed.includes(status)) {
    updates.status = status;
    if (status === "PAID") updates.paidAt = new Date();
  }

  await db.update(bookingsTable).set(updates).where(eq(bookingsTable.id, id));
  return res.json({ ok: true });
});

// DELETE /api/admin/bookings/:id — permanently delete a booking
adminRouter.delete("/admin/bookings/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });

  await db.delete(bookingsTable).where(eq(bookingsTable.id, id));
  return res.json({ ok: true, message: `Booking ${booking.invoiceNumber} deleted.` });
});

// POST /api/admin/bookings/:id/paid — mark as paid, generate QR token, send cinema ticket email
adminRouter.post("/admin/bookings/:id/paid", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1);

  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });

  // Generate a unique QR token for this booking
  const qrToken = randomBytes(24).toString("hex");
  const appUrl = process.env["APP_URL"] ?? "https://womanoftaste.co.za";
  const ticketPageUrl = `${appUrl}/ticket/${qrToken}`;

  await db
    .update(bookingsTable)
    .set({ status: "PAID", paidAt: new Date(), qrToken, checkedIn: false, updatedAt: new Date() })
    .where(eq(bookingsTable.id, id));

  // Send cinema ticket email with embedded QR code
  const transporter = createTransporter();
  if (transporter) {
    try {
      // Generate QR code as PNG buffer (CID attachment — works in all email clients)
      const qrCid = `entry-qr-${booking.invoiceNumber}@wot`;
      const qrBuffer = await QRCode.toBuffer(ticketPageUrl, {
        width: 240,
        margin: 2,
        color: { dark: "#0d0d0d", light: "#ffffff" },
      });

      const { subject, html } = buildCinemaTicketEmail({
        invoiceNumber: booking.invoiceNumber,
        firstName: booking.firstName,
        surname: booking.surname,
        eventTitle: booking.eventTitle,
        eventDate: booking.eventDate,
        eventLocation: booking.eventLocation,
        quantity: booking.quantity,
        pricePerTicket: booking.pricePerTicket,
        totalAmount: booking.totalAmount,
        qrCid,
        ticketPageUrl,
      });

      await transporter.sendMail({
        from: `"Woman of Taste" <${process.env["SMTP_USER"] ?? "info@womanoftaste.co.za"}>`,
        to: booking.email,
        subject,
        html,
        attachments: [
          {
            filename: "entry-qr.png",
            content: qrBuffer,
            cid: qrCid,
            contentType: "image/png",
          },
        ],
      });

      // Also send arrival details email
      try {
        const arrival = getEventArrivalDetails(booking.eventId);
        const { subject: arrivalSubject, html: arrivalHtml } = buildPaymentConfirmedEmail(
          {
            firstName: booking.firstName,
            eventTitle: booking.eventTitle,
            eventDate: booking.eventDate,
            invoiceNumber: booking.invoiceNumber,
            quantity: booking.quantity,
          },
          arrival
        );
        await transporter.sendMail({
          from: `"Woman of Taste" <${process.env["SMTP_USER"] ?? "info@womanoftaste.co.za"}>`,
          to: booking.email,
          subject: arrivalSubject,
          html: arrivalHtml,
        });
      } catch (err) {
        console.error("[paid] Failed to send arrival email:", err);
      }
    } catch (err) {
      console.error("[paid] Failed to send cinema ticket email:", err);
    }
  }

  return res.json({ ok: true, message: "Marked as paid. Cinema ticket sent." });
});

// GET /api/ticket/:qrToken/qr.png — returns QR code as PNG image
adminRouter.get("/ticket/:qrToken/qr.png", async (req, res) => {
  const { qrToken } = req.params;
  const appUrl = process.env["APP_URL"] ?? "https://womanoftaste.co.za";
  const ticketPageUrl = `${appUrl}/ticket/${qrToken}`;

  try {
    const qrBuffer = await QRCode.toBuffer(ticketPageUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#0d0d0d", light: "#ffffff" },
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(qrBuffer);
  } catch {
    return res.status(500).json({ ok: false, error: "QR generation failed." });
  }
});

// GET /api/ticket/:qrToken — public endpoint to fetch ticket details for the guest ticket page
adminRouter.get("/ticket/:qrToken", async (req, res) => {
  const { qrToken } = req.params;
  if (!qrToken) return res.status(400).json({ ok: false, error: "Missing token." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.qrToken, qrToken))
    .limit(1);

  if (!booking || booking.status !== "PAID") {
    return res.status(404).json({ ok: false, error: "Ticket not found." });
  }

  return res.json({
    ok: true,
    ticket: {
      invoiceNumber: booking.invoiceNumber,
      firstName: booking.firstName,
      surname: booking.surname,
      eventTitle: booking.eventTitle,
      eventDate: booking.eventDate,
      eventLocation: booking.eventLocation,
      quantity: booking.quantity,
      pricePerTicket: booking.pricePerTicket,
      totalAmount: booking.totalAmount,
      checkedIn: booking.checkedIn,
      checkedInAt: booking.checkedInAt,
    },
  });
});

// POST /api/admin/check-in/:qrToken — scan QR code to mark guest as checked in
adminRouter.post("/admin/check-in/:qrToken", authMiddleware, async (req, res) => {
  const { qrToken } = req.params;
  if (!qrToken) return res.status(400).json({ ok: false, error: "Missing token." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.qrToken, qrToken))
    .limit(1);

  if (!booking) return res.status(404).json({ ok: false, error: "Ticket not found." });
  if (booking.status !== "PAID") return res.status(400).json({ ok: false, error: "Only paid bookings can be checked in." });

  if (booking.checkedIn) {
    return res.json({
      ok: true,
      alreadyCheckedIn: true,
      guest: {
        invoiceNumber: booking.invoiceNumber,
        firstName: booking.firstName,
        surname: booking.surname,
        eventTitle: booking.eventTitle,
        quantity: booking.quantity,
        checkedInAt: booking.checkedInAt,
      },
    });
  }

  await db
    .update(bookingsTable)
    .set({ checkedIn: true, checkedInAt: new Date(), updatedAt: new Date() })
    .where(eq(bookingsTable.id, booking.id));

  return res.json({
    ok: true,
    alreadyCheckedIn: false,
    guest: {
      invoiceNumber: booking.invoiceNumber,
      firstName: booking.firstName,
      surname: booking.surname,
      eventTitle: booking.eventTitle,
      quantity: booking.quantity,
      checkedInAt: new Date(),
    },
  });
});

// POST /api/admin/bookings/:id/check-in — check in a guest by booking ID (from register)
adminRouter.post("/admin/bookings/:id/check-in", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1);

  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });
  if (booking.status !== "PAID") return res.status(400).json({ ok: false, error: "Only paid bookings can be checked in." });

  const alreadyCheckedIn = booking.checkedIn;
  if (!alreadyCheckedIn) {
    await db
      .update(bookingsTable)
      .set({ checkedIn: true, checkedInAt: new Date(), updatedAt: new Date() })
      .where(eq(bookingsTable.id, id));
  }

  return res.json({
    ok: true,
    alreadyCheckedIn,
    guest: {
      invoiceNumber: booking.invoiceNumber,
      firstName: booking.firstName,
      surname: booking.surname,
      eventTitle: booking.eventTitle,
      quantity: booking.quantity,
      checkedInAt: alreadyCheckedIn ? booking.checkedInAt : new Date(),
    },
  });
});

// GET /api/admin/attendance — get attendance list (optionally filter by eventId)
adminRouter.get("/admin/attendance", authMiddleware, async (req, res) => {
  const { eventId } = req.query as { eventId?: string };

  const allPaid = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.status, "PAID"))
    .orderBy(desc(bookingsTable.paidAt));

  const filtered = eventId
    ? allPaid.filter(b => b.eventId === eventId)
    : allPaid;

  const result = filtered.map(b => ({
    id: b.id,
    invoiceNumber: b.invoiceNumber,
    firstName: b.firstName,
    surname: b.surname,
    email: b.email,
    eventTitle: b.eventTitle,
    eventDate: b.eventDate,
    eventId: b.eventId,
    quantity: b.quantity,
    checkedIn: b.checkedIn,
    checkedInAt: b.checkedInAt,
    paidAt: b.paidAt,
  }));

  const events = [...new Set(allPaid.map(b => ({ id: b.eventId, title: b.eventTitle })).map(e => JSON.stringify(e)))]
    .map(s => JSON.parse(s) as { id: string; title: string });

  return res.json({ ok: true, guests: result, events });
});

// POST /api/admin/bookings/:id/overdue — mark as overdue + send personal payment reminder
adminRouter.post("/admin/bookings/:id/overdue", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1);

  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });

  await db
    .update(bookingsTable)
    .set({ status: "OVERDUE", lastFollowupSentAt: new Date(), updatedAt: new Date() })
    .where(eq(bookingsTable.id, id));

  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[admin] Overdue email skipped — SMTP not configured.");
    return res.json({ ok: true, message: "Marked overdue. Email not sent (SMTP not configured)." });
  }

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
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

  try {
    await transporter.sendMail({
      from: `"Patience Bwanya — Woman of Taste" <${smtpUser}>`,
      to: booking.email,
      cc: smtpUser,
      subject: `Re: Your booking is confirmed — invoice attached — Woman of Taste`,
      html: buildOverdueReminderEmail(emailData),
    });
    return res.json({ ok: true, message: "Marked overdue. Payment reminder sent." });
  } catch (err) {
    console.error("[admin] Overdue reminder email failed:", err);
    return res.json({ ok: true, message: "Marked overdue. Email delivery failed — check SMTP logs." });
  }
});

// POST /api/admin/bookings/:id/followup — send manual follow-up email
adminRouter.post("/admin/bookings/:id/followup", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1);

  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });

  const transporter = createTransporter();
  if (!transporter) return res.status(503).json({ ok: false, error: "Email not configured." });

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
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

  try {
    await transporter.sendMail({
      from: `"Woman of Taste Events" <${smtpUser}>`,
      to: booking.email,
      subject: `Friendly reminder — your Woman of Taste booking payment`,
      html: buildFollowup1Email(emailData),
    });

    await db
      .update(bookingsTable)
      .set({ lastFollowupSentAt: new Date(), updatedAt: new Date() })
      .where(eq(bookingsTable.id, id));

    return res.json({ ok: true, message: "Follow-up sent." });
  } catch (err) {
    console.error("[admin] Follow-up email failed:", err);
    return res.status(500).json({ ok: false, error: "Failed to send email." });
  }
});

// POST /api/admin/bookings/:id/approve — approve & send invoice email
adminRouter.post("/admin/bookings/:id/approve", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });
  if (booking.status !== "PENDING") return res.status(409).json({ ok: false, error: `Booking is already ${booking.status.toLowerCase()}.` });

  const emailData = {
    invoiceNumber: booking.invoiceNumber, firstName: booking.firstName, surname: booking.surname,
    email: booking.email, phone: booking.phone, dietary: booking.dietary,
    eventTitle: booking.eventTitle, eventDate: booking.eventDate, eventLocation: booking.eventLocation,
    quantity: booking.quantity, pricePerTicket: booking.pricePerTicket, totalAmount: booking.totalAmount,
  };

  let pdfPath: string | null = null;
  try { pdfPath = await generateInvoicePdf(emailData); } catch (err) { console.error("[admin] PDF generation failed:", err); }

  const now = new Date();
  await db.update(bookingsTable).set({
    status: "APPROVED", approvalToken: null, declineToken: null,
    invoicePdfPath: pdfPath, invoiceSentAt: now, updatedAt: now,
  }).where(eq(bookingsTable.id, id));

  const transporter = createTransporter();
  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

  let emailSent = false;
  if (transporter) {
    try {
      const mailOptions: Parameters<typeof transporter.sendMail>[0] = {
        from: `"Woman of Taste Events" <${smtpUser}>`,
        to: booking.email,
        subject: `Your booking is confirmed — invoice attached — Woman of Taste`,
        html: buildInvoiceConfirmationEmail(emailData, dueDate),
      };
      if (pdfPath && fs.existsSync(pdfPath)) {
        mailOptions.attachments = [{ filename: `${booking.invoiceNumber}.pdf`, path: pdfPath, contentType: "application/pdf" }];
      }
      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`[admin] Booking ${booking.invoiceNumber} approved & invoice sent to ${booking.email}`);
    } catch (err) { console.error("[admin] Approval email failed:", err); }
  }

  return res.json({ ok: true, emailSent, message: `Booking approved. Invoice ${emailSent ? "sent to " + booking.email : "generated (email failed)."}` });
});

// POST /api/admin/bookings/:id/decline — decline & notify guest
adminRouter.post("/admin/bookings/:id/decline", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });
  if (booking.status === "DECLINED") return res.status(409).json({ ok: false, error: "Booking is already declined." });

  await db.update(bookingsTable).set({
    status: "DECLINED", approvalToken: null, declineToken: null, updatedAt: new Date(),
  }).where(eq(bookingsTable.id, id));

  const transporter = createTransporter();
  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";

  let emailSent = false;
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Woman of Taste Events" <${smtpUser}>`,
        to: booking.email,
        subject: `Regarding your Woman of Taste booking request`,
        html: buildDeclineEmail({
          invoiceNumber: booking.invoiceNumber, firstName: booking.firstName, surname: booking.surname,
          email: booking.email, phone: booking.phone, dietary: booking.dietary,
          eventTitle: booking.eventTitle, eventDate: booking.eventDate, eventLocation: booking.eventLocation,
          quantity: booking.quantity, pricePerTicket: booking.pricePerTicket, totalAmount: booking.totalAmount,
        }),
      });
      emailSent = true;
      console.log(`[admin] Booking ${booking.invoiceNumber} declined. Email sent to ${booking.email}`);
    } catch (err) { console.error("[admin] Decline email failed:", err); }
  }

  return res.json({ ok: true, emailSent, message: `Booking declined. Guest ${emailSent ? "notified at " + booking.email : "notification failed."}` });
});

// POST /api/admin/bookings/:id/cancel-nonpayment — cancel due to non-payment, keep contact, send warm email
adminRouter.post("/admin/bookings/:id/cancel-nonpayment", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });
  if (booking.status === "DECLINED") return res.status(409).json({ ok: false, error: "Booking is already cancelled." });

  // Cancel the booking
  await db.update(bookingsTable).set({
    status: "DECLINED",
    approvalToken: null,
    declineToken: null,
    updatedAt: new Date(),
  }).where(eq(bookingsTable.id, id));

  // Ensure their contact record is preserved in the CRM
  const { upsertContact } = await import("../utils/upsertContact.js");
  await upsertContact({
    email: booking.email,
    firstName: booking.firstName,
    lastName: booking.surname,
    phone: booking.phone ?? "",
    source: "booking",
    tag: "cancelled-nonpayment",
  });

  const transporter = createTransporter();
  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
  const emailData = {
    invoiceNumber: booking.invoiceNumber, firstName: booking.firstName, surname: booking.surname,
    email: booking.email, phone: booking.phone, dietary: booking.dietary,
    eventTitle: booking.eventTitle, eventDate: booking.eventDate, eventLocation: booking.eventLocation,
    quantity: booking.quantity, pricePerTicket: booking.pricePerTicket, totalAmount: booking.totalAmount,
  };

  let emailSent = false;
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Patience Bwanya — Woman of Taste" <${smtpUser}>`,
        to: booking.email,
        cc: smtpUser,
        subject: `Your Woman of Taste reservation — ${booking.eventTitle}`,
        html: buildNonPaymentCancellationEmail(emailData),
      });
      emailSent = true;
      console.log(`[admin] Non-payment cancellation for ${booking.invoiceNumber}. Email sent to ${booking.email}`);
    } catch (err) {
      console.error("[admin] Cancellation email failed:", err);
    }
  }

  return res.json({
    ok: true,
    emailSent,
    message: `Reservation cancelled. Contact kept on record. ${emailSent ? `Cancellation email sent to ${booking.email}.` : "Email delivery failed — check SMTP logs."}`,
  });
});

// GET /api/admin/bookings/:id/invoice — download PDF
adminRouter.get("/admin/bookings/:id/invoice", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1);

  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });

  let pdfPath = booking.invoicePdfPath;

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
      console.error("[admin] PDF generation failed:", err);
      return res.status(500).json({ ok: false, error: "Could not generate PDF." });
    }
  }

  const fileName = path.basename(pdfPath!);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "application/pdf");
  return res.sendFile(path.resolve(pdfPath!));
});

/* ── POST /api/admin/content-reminder/send — manual trigger (JWT required) ── */
// GET /api/admin/events — distinct events with aggregated stats
adminRouter.get("/admin/events", authMiddleware, async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        event_title      AS "eventTitle",
        event_date       AS "eventDate",
        event_location   AS "eventLocation",
        COUNT(*)::int                                                        AS "totalBookings",
        COUNT(CASE WHEN status IN ('APPROVED','PAID') THEN 1 END)::int      AS "confirmedCount",
        COUNT(CASE WHEN status = 'PAID' THEN 1 END)::int                    AS "paidCount",
        COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END),0)::numeric AS "revenue",
        COUNT(CASE WHEN checked_in = true THEN 1 END)::int                  AS "checkedInCount",
        COALESCE(SUM(CASE WHEN status IN ('APPROVED','PAID') THEN quantity ELSE 0 END),0)::int AS "confirmedTickets"
      FROM bookings
      GROUP BY event_title, event_date, event_location
      ORDER BY event_date DESC
    `);
    return res.json({ ok: true, events: result.rows });
  } catch (err) {
    console.error("[admin/events]", err);
    return res.status(500).json({ ok: false, error: "Failed to load events." });
  }
});

// GET /api/admin/events/:eventTitle/bookings — bookings for one event
adminRouter.get("/admin/events/:eventTitle/bookings", authMiddleware, async (req, res) => {
  try {
    const { eventTitle } = req.params;
    const title = decodeURIComponent(eventTitle);
    const rows = await db.select().from(bookingsTable)
      .where(eq(bookingsTable.eventTitle, title))
      .orderBy(desc(bookingsTable.createdAt));
    return res.json({ ok: true, bookings: rows });
  } catch (err) {
    console.error("[admin/events/:title/bookings]", err);
    return res.status(500).json({ ok: false, error: "Failed to load bookings." });
  }
});

adminRouter.post("/admin/content-reminder/send", authMiddleware, async (_req, res) => {
  try {
    await sendWeeklyContentReminder();
    return res.json({ ok: true, message: "Content reminder email sent." });
  } catch (err: any) {
    console.error("[admin] Content reminder trigger failed:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? "Failed to send reminder." });
  }
});

/* ── POST /api/admin/social-reminder/send — manual trigger (JWT required) ── */
adminRouter.post("/admin/social-reminder/send", authMiddleware, async (_req, res) => {
  try {
    await sendMonthlySocialReminder();
    return res.json({ ok: true, message: "Social media reminder email sent." });
  } catch (err: any) {
    console.error("[admin] Social reminder trigger failed:", err);
    return res.status(500).json({ ok: false, error: err?.message ?? "Failed to send reminder." });
  }
});

export default adminRouter;
