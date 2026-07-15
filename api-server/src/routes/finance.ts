import { Router } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { db } from "@workspace/db";
import { bookingsTable, expensesTable } from "@workspace/db/schema";
import { requireAdminAuth as authMiddleware } from "../middlewares/adminAuth.js";

const financeRouter = Router();

function saveReceiptImage(base64: string): string | null {
  try {
    let mimeType = "image/jpeg";
    let data = base64;
    if (base64.startsWith("data:")) {
      const match = base64.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;
      mimeType = match[1];
      data = match[2];
    }
    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : mimeType.includes("gif") ? "gif" : "jpg";
    const filename = `receipt_${randomBytes(16).toString("hex")}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "receipts");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), Buffer.from(data, "base64"));
    return `/uploads/receipts/${filename}`;
  } catch { return null; }
}

// GET /api/admin/finance/events — distinct events from bookings + expenses
financeRouter.get("/admin/finance/events", authMiddleware, async (_req, res) => {
  const fromBookings = await db
    .selectDistinct({ eventId: bookingsTable.eventId, eventTitle: bookingsTable.eventTitle })
    .from(bookingsTable);
  const fromExpenses = await db
    .selectDistinct({ eventId: expensesTable.eventId, eventTitle: expensesTable.eventTitle })
    .from(expensesTable);

  const seen = new Set<string>();
  const events: { eventId: string; eventTitle: string }[] = [];
  for (const e of [...fromBookings, ...fromExpenses]) {
    if (!seen.has(e.eventId)) { seen.add(e.eventId); events.push(e); }
  }
  events.sort((a, b) => a.eventTitle.localeCompare(b.eventTitle));
  return res.json({ ok: true, events });
});

// GET /api/admin/finance/summary — per-event P&L
financeRouter.get("/admin/finance/summary", authMiddleware, async (_req, res) => {
  const revenues = await db.select({
    eventId: bookingsTable.eventId,
    eventTitle: bookingsTable.eventTitle,
    revenue: sql<number>`COALESCE(SUM(${bookingsTable.totalAmount}), 0)::float`,
    ticketCount: sql<number>`COUNT(*)::int`,
  }).from(bookingsTable).where(eq(bookingsTable.status, "PAID")).groupBy(bookingsTable.eventId, bookingsTable.eventTitle);

  const expenseTotals = await db.select({
    eventId: expensesTable.eventId,
    eventTitle: expensesTable.eventTitle,
    totalExpenses: sql<number>`COALESCE(SUM(${expensesTable.amount}), 0)::float`,
    expenseCount: sql<number>`COUNT(*)::int`,
  }).from(expensesTable).groupBy(expensesTable.eventId, expensesTable.eventTitle);

  const expMap = new Map<string, { totalExpenses: number; expenseCount: number; eventTitle: string }>();
  for (const e of expenseTotals) expMap.set(e.eventId, e);

  const revMap = new Map<string, { revenue: number; ticketCount: number; eventTitle: string }>();
  for (const r of revenues) revMap.set(r.eventId, r);

  const allEventIds = new Set([...revMap.keys(), ...expMap.keys()]);
  const eventsSummary = Array.from(allEventIds).map(eventId => {
    const rev = revMap.get(eventId);
    const exp = expMap.get(eventId);
    const revenue = rev?.revenue ?? 0;
    const expenses = exp?.totalExpenses ?? 0;
    const profit = revenue - expenses;
    return {
      eventId,
      eventTitle: rev?.eventTitle ?? exp?.eventTitle ?? eventId,
      revenue,
      ticketCount: rev?.ticketCount ?? 0,
      expenses,
      expenseCount: exp?.expenseCount ?? 0,
      profit,
      margin: revenue > 0 ? Math.round((profit / revenue) * 100) : null,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = eventsSummary.reduce((s, e) => s + e.revenue, 0);
  const totalExpenses = eventsSummary.reduce((s, e) => s + e.expenses, 0);

  return res.json({
    ok: true,
    summary: { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses, events: eventsSummary },
  });
});

// GET /api/admin/expenses — list all (optional ?eventId filter)
financeRouter.get("/admin/expenses", authMiddleware, async (req, res) => {
  const { eventId } = req.query as { eventId?: string };
  const rows = eventId
    ? await db.select().from(expensesTable).where(eq(expensesTable.eventId, eventId)).orderBy(desc(expensesTable.date))
    : await db.select().from(expensesTable).orderBy(desc(expensesTable.date));
  return res.json({ ok: true, expenses: rows });
});

// POST /api/admin/expenses — create
financeRouter.post("/admin/expenses", authMiddleware, async (req, res) => {
  const { eventId, eventTitle, category, description, amount, date, receiptBase64, notes } = req.body as {
    eventId: string; eventTitle: string; category: string; description: string;
    amount: number; date: string; receiptBase64?: string; notes?: string;
  };

  if (!eventId?.trim() || !eventTitle?.trim() || !category?.trim() || !description?.trim() || !amount || !date) {
    return res.status(400).json({ ok: false, error: "All required fields must be filled." });
  }

  let receiptPath: string | null = null;
  if (receiptBase64) receiptPath = saveReceiptImage(receiptBase64);

  const [expense] = await db.insert(expensesTable).values({
    eventId: eventId.trim(),
    eventTitle: eventTitle.trim(),
    category: category.trim(),
    description: description.trim(),
    amount: parseFloat(String(amount)),
    date,
    receiptPath,
    notes: notes?.trim() || null,
  }).returning();

  return res.status(201).json({ ok: true, expense });
});

// PATCH /api/admin/expenses/:id — update
financeRouter.patch("/admin/expenses/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const { eventId, eventTitle, category, description, amount, date, receiptBase64, notes } = req.body as {
    eventId?: string; eventTitle?: string; category?: string; description?: string;
    amount?: number; date?: string; receiptBase64?: string; notes?: string;
  };

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (eventId !== undefined) updates.eventId = eventId.trim();
  if (eventTitle !== undefined) updates.eventTitle = eventTitle.trim();
  if (category !== undefined) updates.category = category.trim();
  if (description !== undefined) updates.description = description.trim();
  if (amount !== undefined) updates.amount = parseFloat(String(amount));
  if (date !== undefined) updates.date = date;
  if (notes !== undefined) updates.notes = notes?.trim() || null;
  if (receiptBase64) {
    const p = saveReceiptImage(receiptBase64);
    if (p) updates.receiptPath = p;
  }

  const [updated] = await db.update(expensesTable).set(updates as any).where(eq(expensesTable.id, id)).returning();
  if (!updated) return res.status(404).json({ ok: false, error: "Expense not found." });
  return res.json({ ok: true, expense: updated });
});

// DELETE /api/admin/expenses/:id
financeRouter.delete("/admin/expenses/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const [expense] = await db.select().from(expensesTable).where(eq(expensesTable.id, id));
  if (!expense) return res.status(404).json({ ok: false, error: "Expense not found." });

  if (expense.receiptPath) {
    try {
      const fullPath = path.join(process.cwd(), "public", expense.receiptPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch { /* silent */ }
  }

  await db.delete(expensesTable).where(eq(expensesTable.id, id));
  return res.json({ ok: true });
});

export default financeRouter;
