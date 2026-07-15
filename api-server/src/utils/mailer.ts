import nodemailer from "nodemailer";

export function createTransporter() {
  const host = process.env["SMTP_HOST"] ?? "smtppro.zoho.com";
  const port = Number(process.env["SMTP_PORT"] ?? "465");
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
