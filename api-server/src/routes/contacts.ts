import { Router } from "express";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { contactsTable, bookingsTable, activityLogTable } from "@workspace/db/schema";
import { requireAdminAuth as authMiddleware, requireAdminAuthAllowQueryToken } from "../middlewares/adminAuth.js";

const contactsRouter = Router();

async function logActivity(actionType: string, description: string, entityType = "", entityId = "") {
  try {
    await db.insert(activityLogTable).values({ actionType, description, entityType, entityId });
  } catch {}
}

// Sync bookings → contacts (call on demand or after each booking)
export async function syncBookingsToContacts() {
  const bookings = await db.select().from(bookingsTable).orderBy(bookingsTable.createdAt);
  for (const b of bookings) {
    const existing = await db.select().from(contactsTable).where(eq(contactsTable.email, b.email.toLowerCase())).limit(1);
    if (existing.length === 0) {
      await db.insert(contactsTable).values({
        firstName: b.firstName,
        lastName: b.surname,
        email: b.email.toLowerCase(),
        phone: b.phone ?? "",
        source: "booking",
        tags: "booking",
      });
    }
  }
}

// GET /api/admin/contacts — list with search + filter
contactsRouter.get("/admin/contacts", authMiddleware, async (req, res) => {
  const { search, source, optedOut, tag, page = "1", perPage = "50" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(perPage);

  let query = db.select().from(contactsTable).$dynamic();
  const conditions: any[] = [];

  if (search) {
    conditions.push(or(
      ilike(contactsTable.firstName, `%${search}%`),
      ilike(contactsTable.lastName, `%${search}%`),
      ilike(contactsTable.email, `%${search}%`),
      ilike(contactsTable.phone, `%${search}%`),
      ilike(contactsTable.tags, `%${search}%`)
    ));
  }
  if (source) conditions.push(eq(contactsTable.source, source));
  if (optedOut === "true") conditions.push(eq(contactsTable.optedOut, true));
  if (optedOut === "false") conditions.push(eq(contactsTable.optedOut, false));
  if (tag) conditions.push(ilike(contactsTable.tags, `%${tag}%`));

  if (conditions.length > 0) query = query.where(and(...conditions));

  const contacts = await query.orderBy(desc(contactsTable.createdAt)).limit(parseInt(perPage)).offset(offset);
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(contactsTable);
  const total = Number(totalResult[0]?.count ?? 0);

  return res.json({ ok: true, contacts, total, page: parseInt(page), perPage: parseInt(perPage) });
});

// GET /api/admin/contacts/export — CSV export
contactsRouter.get("/admin/contacts/export", requireAdminAuthAllowQueryToken, async (_req, res) => {
  const contacts = await db.select().from(contactsTable).orderBy(desc(contactsTable.createdAt));
  const header = "ID,First Name,Last Name,Email,Phone,Company,Source,Tags,Opted Out,Emails Received,Last Email Sent,Date Added\n";
  const rows = contacts.map(c =>
    [c.id, c.firstName, c.lastName, c.email, c.phone, c.company, c.source, c.tags, c.optedOut ? "Yes" : "No",
      c.emailsReceived, c.lastEmailSentAt ? new Date(c.lastEmailSentAt).toISOString() : "",
      new Date(c.createdAt).toISOString()].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=\"contacts.csv\"");
  return res.send(header + rows);
});

// GET /api/admin/contacts/sync — sync bookings to contacts
contactsRouter.post("/admin/contacts/sync", authMiddleware, async (_req, res) => {
  await syncBookingsToContacts();
  return res.json({ ok: true, message: "Sync complete." });
});

// GET /api/admin/contacts/:id — single contact with email history + booking history
contactsRouter.get("/admin/contacts/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const [contact] = await db.select().from(contactsTable).where(eq(contactsTable.id, id)).limit(1);
  if (!contact) return res.status(404).json({ ok: false, error: "Not found." });
  const bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.email, contact.email)).orderBy(desc(bookingsTable.createdAt));
  return res.json({ ok: true, contact, bookings });
});

// POST /api/admin/contacts — create manually
contactsRouter.post("/admin/contacts", authMiddleware, async (req, res) => {
  const { firstName, lastName, email, phone, company, tags, notes } = req.body;
  if (!firstName || !email) return res.status(400).json({ ok: false, error: "First name and email required." });

  const existing = await db.select().from(contactsTable).where(eq(contactsTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) return res.status(409).json({ ok: false, error: "A contact with this email already exists." });

  const [contact] = await db.insert(contactsTable).values({
    firstName, lastName: lastName ?? "", email: email.toLowerCase(),
    phone: phone ?? "", company: company ?? "", tags: tags ?? "", notes: notes ?? "",
    source: "manual",
  }).returning();

  await logActivity("contact_added", `Added contact: ${firstName} ${lastName ?? ""} (${email})`, "contact", String(contact.id));
  return res.json({ ok: true, contact });
});

// PATCH /api/admin/contacts/:id — update
contactsRouter.patch("/admin/contacts/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const { firstName, lastName, email, phone, company, tags, notes, optedOut } = req.body;
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (email !== undefined) updates.email = email.toLowerCase();
  if (phone !== undefined) updates.phone = phone;
  if (company !== undefined) updates.company = company;
  if (tags !== undefined) updates.tags = tags;
  if (notes !== undefined) updates.notes = notes;
  if (optedOut !== undefined) updates.optedOut = optedOut;

  await db.update(contactsTable).set(updates).where(eq(contactsTable.id, id));
  return res.json({ ok: true });
});

// DELETE /api/admin/contacts/:id
contactsRouter.delete("/admin/contacts/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  await db.delete(contactsTable).where(eq(contactsTable.id, id));
  return res.json({ ok: true });
});

// POST /api/admin/contacts/import — CSV import
contactsRouter.post("/admin/contacts/import", authMiddleware, async (req, res) => {
  const { contacts: raw } = req.body as { contacts: Array<{ firstName?: string; lastName?: string; email?: string; phone?: string; company?: string }> };
  if (!Array.isArray(raw)) return res.status(400).json({ ok: false, error: "contacts array required." });
  let added = 0, skipped = 0;
  for (const row of raw) {
    if (!row.email || !row.firstName) { skipped++; continue; }
    const existing = await db.select().from(contactsTable).where(eq(contactsTable.email, row.email.toLowerCase())).limit(1);
    if (existing.length > 0) { skipped++; continue; }
    await db.insert(contactsTable).values({
      firstName: row.firstName, lastName: row.lastName ?? "",
      email: row.email.toLowerCase(), phone: row.phone ?? "", company: row.company ?? "",
      source: "import",
    });
    added++;
  }
  await logActivity("contacts_imported", `Imported ${added} contacts (${skipped} skipped)`, "contacts", "");
  return res.json({ ok: true, added, skipped });
});

// POST /api/unsubscribe/:token — public unsubscribe
contactsRouter.get("/unsubscribe/:token", async (req, res) => {
  const { token } = req.params;
  const { emailSendsTable } = await import("@workspace/db/schema");
  const [send] = await db.select().from(emailSendsTable).where(eq(emailSendsTable.unsubscribeToken, token)).limit(1);
  if (!send) return res.send("<p>Invalid unsubscribe link.</p>");
  const [contact] = await db.select().from(contactsTable).where(eq(contactsTable.email, send.email)).limit(1);
  if (contact) await db.update(contactsTable).set({ optedOut: true, updatedAt: new Date() }).where(eq(contactsTable.id, contact.id));
  return res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head><body style="font-family:sans-serif;max-width:500px;margin:80px auto;text-align:center;padding:2rem"><h2 style="color:#1a2a5e">You've been unsubscribed</h2><p style="color:#555">You will no longer receive marketing emails from Woman of Taste.</p><a href="https://womanoftaste.co.za" style="color:#c9963a">Return to Woman of Taste</a></body></html>`);
});

export default contactsRouter;
