import { Router } from "express";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { db } from "@workspace/db";
import { contactsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const newsletterRouter = Router();

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "subscribers.json");

interface Subscriber {
  email: string;
  name?: string;
  subscribedAt: string;
}

// Upsert a newsletter subscriber into the contacts table
async function upsertSubscriberContact(email: string, name?: string) {
  try {
    const nameParts = (name ?? "").trim().split(" ");
    const firstName = nameParts[0] || "Newsletter";
    const lastName = nameParts.slice(1).join(" ") || "Subscriber";

    const existing = await db
      .select()
      .from(contactsTable)
      .where(eq(contactsTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(contactsTable).values({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: "",
        source: "newsletter",
        tags: "newsletter",
      });
    } else {
      // Ensure the newsletter tag is present
      const contact = existing[0]!;
      const tags = contact.tags ?? "";
      if (!tags.includes("newsletter")) {
        await db
          .update(contactsTable)
          .set({ tags: tags ? `${tags},newsletter` : "newsletter", updatedAt: new Date() })
          .where(eq(contactsTable.email, email.toLowerCase()));
      }
    }
  } catch (err) {
    console.error("[newsletter] Failed to upsert contact:", err);
  }
}

// Sync all JSON subscribers → contacts table (run on startup)
export async function syncNewsletterToContacts() {
  const subscribers = loadSubscribers();
  for (const s of subscribers) {
    await upsertSubscriberContact(s.email, s.name);
  }
  if (subscribers.length > 0) {
    console.log(`[newsletter] Synced ${subscribers.length} subscriber(s) to contacts.`);
  }
}

function loadSubscribers(): Subscriber[] {
  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveSubscribers(list: Subscriber[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), "utf-8");
}

function createMailer() {
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env["SMTP_HOST"] ?? "smtppro.zoho.com",
    port: Number(process.env["SMTP_PORT"] ?? "465"),
    secure: true,
    auth: { user, pass },
  });
}

newsletterRouter.post("/newsletter", async (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };

  if (!email?.trim()) {
    return res.status(400).json({ ok: false, error: "Email address is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  }

  const normalized = email.trim().toLowerCase();
  const subscribers = loadSubscribers();

  if (subscribers.some((s) => s.email.toLowerCase() === normalized)) {
    return res.json({ ok: true, message: "You are already on the list." });
  }

  subscribers.push({ email: normalized, name: name?.trim() || undefined, subscribedAt: new Date().toISOString() });
  saveSubscribers(subscribers);

  // Add to contacts table so they appear in the admin CRM
  await upsertSubscriberContact(normalized, name?.trim());

  const mailer = createMailer();
  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
  const displayName = name?.trim() || "Beloved Reader";

  if (mailer) {
    const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Georgia, serif; background: #f9f6f1; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border: 1px solid #e8e0d4; border-radius: 16px; overflow: hidden; }
    .header { background: #1e2d5c; padding: 40px 36px 32px; text-align: center; }
    .header img { width: 72px; height: 72px; object-fit: contain; border-radius: 8px; margin-bottom: 16px; }
    .header h1 { color: #c9a85c; font-size: 24px; font-weight: 400; margin: 0 0 6px; letter-spacing: 0.04em; }
    .header p { color: rgba(249,246,241,0.65); font-family: sans-serif; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; margin: 0; }
    .body { padding: 40px 36px; }
    .body p { font-family: sans-serif; font-size: 15px; color: #3a2f24; line-height: 1.75; margin: 0 0 18px; }
    .body .greeting { font-size: 18px; font-family: Georgia, serif; color: #1e2d5c; margin-bottom: 20px; }
    .divider { height: 1px; background: #e8e0d4; margin: 0 36px; }
    .footer { background: #f2ede6; padding: 20px 36px; font-family: sans-serif; font-size: 11px; color: #9a8878; text-align: center; letter-spacing: 0.05em; line-height: 1.6; }
    .gold { color: #c9a85c; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>Woman of Taste</h1>
        <p>Savory &amp; Soulful</p>
      </div>
      <div class="body">
        <p class="greeting">Welcome, ${escapeHtml(displayName)}.</p>
        <p>You have joined a circle of women who believe that dining is an art, hospitality is a language, and every meal is a story worth telling.</p>
        <p>Expect curated journal entries, exclusive event invitations, behind-the-scenes hospitality stories, and refined dining inspiration — delivered with intention.</p>
        <p style="font-style: italic; color: #6b5c4e;">We are delighted to have you here.</p>
        <p>With warmth,<br /><span class="gold">Patience Bwanya (PashieB)</span><br />Founder, Woman of Taste</p>
      </div>
      <div class="divider"></div>
      <div class="footer">
        womanoftaste.co.za &nbsp;·&nbsp; info@womanoftaste.co.za<br />
        You are receiving this because you subscribed at womanoftaste.co.za
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const notifyHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  body { font-family: sans-serif; background: #f9f6f1; margin: 0; padding: 20px; }
  .card { background: #fff; border-radius: 12px; padding: 28px 32px; max-width: 480px; border: 1px solid #e8e0d4; }
  h2 { color: #1e2d5c; font-size: 16px; margin: 0 0 12px; }
  p { color: #3a2f24; font-size: 14px; line-height: 1.6; margin: 4px 0; }
  .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.15em; color: #c9a85c; font-weight: 600; margin-top: 12px; }
</style></head>
<body>
  <div class="card">
    <h2>New Newsletter Subscriber</h2>
    <p class="label">Name</p><p>${escapeHtml(displayName)}</p>
    <p class="label">Email</p><p>${escapeHtml(normalized)}</p>
    <p class="label">Subscribed</p><p>${new Date().toLocaleString("en-ZA")}</p>
    <p class="label">Total Subscribers</p><p>${subscribers.length}</p>
  </div>
</body>
</html>
    `.trim();

    try {
      await Promise.all([
        mailer.sendMail({
          from: `"Woman of Taste" <${smtpUser}>`,
          to: normalized,
          subject: "Welcome to Woman of Taste — Savory & Soulful",
          html: welcomeHtml,
          text: `Welcome, ${displayName}.\n\nYou have joined the Woman of Taste community.\n\nExpect curated journal entries, exclusive event invitations, and refined dining inspiration.\n\nWith warmth,\nPatience Bwanya (PashieB)\nFounder, Woman of Taste\nwomanoftaste.co.za`,
        }),
        mailer.sendMail({
          from: `"Woman of Taste" <${smtpUser}>`,
          to: smtpUser,
          subject: `[WOT Newsletter] New subscriber: ${normalized}`,
          html: notifyHtml,
          text: `New subscriber: ${normalized} (${displayName}) — Total: ${subscribers.length}`,
        }),
      ]);
    } catch (err) {
      console.error("[newsletter] Email send failed:", err);
    }
  }

  return res.json({ ok: true, message: "You are on the list." });
});

newsletterRouter.get("/newsletter/subscribers", async (req, res) => {
  const subscribers = loadSubscribers();
  return res.json({ count: subscribers.length, subscribers });
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default newsletterRouter;
