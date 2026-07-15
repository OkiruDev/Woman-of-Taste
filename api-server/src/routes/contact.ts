import { Router } from "express";
import nodemailer from "nodemailer";
import { upsertContact } from "../utils/upsertContact.js";

const contactRouter = Router();

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function createTransporter() {
  const host = process.env["SMTP_HOST"] ?? "smtp.gmail.com";
  const port = Number(process.env["SMTP_PORT"] ?? "587");
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
  });
}

contactRouter.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body as ContactPayload;

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ ok: false, error: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, error: "Invalid email address." });
  }

  // Split name into first / last as best we can
  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0] || name.trim();
  const lastName = nameParts.slice(1).join(" ");

  // Always add to mailing list regardless of SMTP status
  await upsertContact({
    email,
    firstName,
    lastName,
    source: "contact-form",
    tag: "contact-form",
    notes: `Subject: ${subject}`,
  });

  const transporter = createTransporter();

  if (!transporter) {
    console.warn("[contact] SMTP not configured. Logging submission instead.");
    console.log("[contact] Submission:", { name, email, subject, message: message.slice(0, 100) });
    return res.json({ ok: true, message: "Message received." });
  }

  const primaryRecipient = process.env["CONTACT_EMAIL"] ?? "contact@pashieb.co.za";
  const recipients = primaryRecipient;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Georgia, serif; background: #f9f6f1; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border: 1px solid #e8e0d4; border-radius: 16px; overflow: hidden; }
    .header { background: #1e2d5c; padding: 32px 36px; }
    .header h1 { color: #c9a85c; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 0.05em; }
    .header p { color: rgba(249,246,241,0.7); font-size: 13px; margin: 6px 0 0; font-family: sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
    .body { padding: 36px; }
    .field { margin-bottom: 24px; }
    .field label { display: block; font-family: sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #c9a85c; margin-bottom: 6px; }
    .field p { font-family: sans-serif; font-size: 15px; color: #2a1f0f; margin: 0; line-height: 1.6; }
    .message-box { background: #f9f6f1; border-left: 3px solid #c9a85c; padding: 16px 20px; border-radius: 0 8px 8px 0; }
    .footer { background: #f2ede6; padding: 20px 36px; font-family: sans-serif; font-size: 11px; color: #9a8878; text-align: center; letter-spacing: 0.05em; }
    .divider { height: 1px; background: #e8e0d4; margin: 0 36px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>New Message, Woman of Taste</h1>
        <p>womanoftaste.co.za, Contact Form</p>
      </div>
      <div class="body">
        <div class="field">
          <label>From</label>
          <p>${escapeHtml(name)}</p>
        </div>
        <div class="field">
          <label>Reply To</label>
          <p><a href="mailto:${escapeHtml(email)}" style="color:#1e2d5c;">${escapeHtml(email)}</a></p>
        </div>
        <div class="field">
          <label>Subject</label>
          <p>${escapeHtml(subject)}</p>
        </div>
        <div class="field">
          <label>Message</label>
          <div class="message-box">
            <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="footer">
        Sent via womanoftaste.co.za, Savory &amp; Soulful
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
    await transporter.sendMail({
      from: `"Woman of Taste" <${smtpUser}>`,
      to: recipients,
      cc: smtpUser,
      replyTo: email,
      subject: `[WOT Contact] ${subject}, from ${name}`,
      html: htmlBody,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    return res.json({ ok: true, message: "Your message has been sent." });
  } catch (err) {
    console.error("[contact] Failed to send email:", err);
    return res.status(500).json({ ok: false, error: "Failed to send message. Please try again or reach out directly." });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default contactRouter;
