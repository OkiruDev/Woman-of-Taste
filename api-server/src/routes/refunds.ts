import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db } from "@workspace/db";
import { bookingsTable, refundRequestsTable } from "@workspace/db/schema";
import { createTransporter } from "../utils/mailer.js";
import { buildRefundRequestEmail, buildRefundSubmittedAdminEmail } from "../utils/invoiceEmail.js";
import { requireAdminAuth as authMiddleware } from "../middlewares/adminAuth.js";

const refundsRouter = Router();

// POST /api/admin/bookings/:id/refund-request — create & email refund link to guest
refundsRouter.post("/admin/bookings/:id/refund-request", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid booking ID." });

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) return res.status(404).json({ ok: false, error: "Booking not found." });

  const existing = await db.select().from(refundRequestsTable).where(eq(refundRequestsTable.bookingId, id));
  const active = existing.find(r => r.status !== "PROCESSED");
  if (active) {
    return res.status(409).json({ ok: false, error: "A refund request is already active for this booking.", refundId: active.id });
  }

  const transporter = createTransporter();
  if (!transporter) return res.status(503).json({ ok: false, error: "Email not configured." });

  const token = randomBytes(32).toString("hex");
  const appUrl = process.env["APP_URL"] ?? "https://womanoftaste.co.za";
  const refundUrl = `${appUrl}/refund/${token}`;

  const [refund] = await db.insert(refundRequestsTable).values({
    token,
    bookingId: id,
    invoiceNumber: booking.invoiceNumber,
    firstName: booking.firstName,
    surname: booking.surname,
    email: booking.email,
    eventTitle: booking.eventTitle,
    eventDate: booking.eventDate,
    totalAmount: booking.totalAmount,
    status: "PENDING_DETAILS",
  }).returning();

  const { subject, html } = buildRefundRequestEmail({
    firstName: booking.firstName,
    eventTitle: booking.eventTitle,
    eventDate: booking.eventDate,
    invoiceNumber: booking.invoiceNumber,
    totalAmount: booking.totalAmount,
    refundUrl,
  });

  await transporter.sendMail({
    from: `"Woman of Taste" <${process.env["SMTP_USER"] ?? "info@womanoftaste.co.za"}>`,
    to: booking.email,
    subject,
    html,
  });

  return res.json({ ok: true, refundId: refund.id });
});

// GET /api/refund/:token — public: load form info
refundsRouter.get("/refund/:token", async (req, res) => {
  const { token } = req.params;
  const [refund] = await db.select().from(refundRequestsTable).where(eq(refundRequestsTable.token, token));
  if (!refund) return res.status(404).json({ ok: false, error: "Invalid or expired refund link." });

  return res.json({
    ok: true,
    refund: {
      status: refund.status,
      firstName: refund.firstName,
      surname: refund.surname,
      eventTitle: refund.eventTitle,
      eventDate: refund.eventDate,
      invoiceNumber: refund.invoiceNumber,
      totalAmount: refund.totalAmount,
    },
  });
});

// POST /api/refund/:token — public: submit bank details
refundsRouter.post("/refund/:token", async (req, res) => {
  const { token } = req.params;
  const { accountHolder, bankName, accountNumber, branchCode, accountType } = req.body as {
    accountHolder: string; bankName: string; accountNumber: string; branchCode: string; accountType: string;
  };

  if (!accountHolder?.trim() || !bankName?.trim() || !accountNumber?.trim() || !branchCode?.trim() || !accountType?.trim()) {
    return res.status(400).json({ ok: false, error: "All bank detail fields are required." });
  }

  const [refund] = await db.select().from(refundRequestsTable).where(eq(refundRequestsTable.token, token));
  if (!refund) return res.status(404).json({ ok: false, error: "Invalid or expired refund link." });
  if (refund.status === "SUBMITTED" || refund.status === "PROCESSED") {
    return res.status(409).json({ ok: false, error: "Bank details have already been submitted." });
  }

  await db.update(refundRequestsTable)
    .set({
      accountHolder: accountHolder.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      branchCode: branchCode.trim(),
      accountType: accountType.trim(),
      status: "SUBMITTED",
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refundRequestsTable.token, token));

  try {
    const transporter = createTransporter();
    if (!transporter) throw new Error("Email not configured.");
    const adminAppUrl = process.env["ADMIN_APP_URL"] ?? "https://admin.womanoftaste.co.za";
    const { subject, html } = buildRefundSubmittedAdminEmail({
      firstName: refund.firstName,
      surname: refund.surname,
      email: refund.email,
      eventTitle: refund.eventTitle,
      invoiceNumber: refund.invoiceNumber,
      totalAmount: refund.totalAmount,
      accountHolder: accountHolder.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      branchCode: branchCode.trim(),
      accountType: accountType.trim(),
      adminUrl: `${adminAppUrl}/admin/refunds`,
    });
    await transporter.sendMail({
      from: `"Woman of Taste" <${process.env["SMTP_USER"] ?? "info@womanoftaste.co.za"}>`,
      to: process.env["SMTP_USER"] ?? "info@womanoftaste.co.za",
      subject,
      html,
    });
  } catch { /* silent */ }

  return res.json({ ok: true });
});

// GET /api/admin/refunds — list all refund requests
refundsRouter.get("/admin/refunds", authMiddleware, async (req, res) => {
  const refunds = await db.select().from(refundRequestsTable).orderBy(desc(refundRequestsTable.createdAt));
  return res.json({ ok: true, refunds });
});

// POST /api/admin/refunds/:id/processed — mark as processed
refundsRouter.post("/admin/refunds/:id/processed", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [refund] = await db.select().from(refundRequestsTable).where(eq(refundRequestsTable.id, id));
  if (!refund) return res.status(404).json({ ok: false, error: "Refund request not found." });

  await db.update(refundRequestsTable)
    .set({ status: "PROCESSED", processedAt: new Date(), updatedAt: new Date() })
    .where(eq(refundRequestsTable.id, id));

  return res.json({ ok: true });
});

export default refundsRouter;
