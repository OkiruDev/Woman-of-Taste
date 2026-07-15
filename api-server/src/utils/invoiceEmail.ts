import type { EventArrivalDetails } from "./eventArrivalConfig.js";

function logoUrl(): string {
  const base = process.env["APP_URL"] ?? "https://womanoftaste.co.za";
  return `${base}/wot-logo.png`;
}

function auraSignatureBlock(): string {
  const base = process.env["APP_URL"] ?? "https://womanoftaste.co.za";
  return `<div style="padding:0;">
    <img src="${base}/aura-signature.gif" alt="Aura — Administrative Assistant, Woman of Taste"
      style="width:100%;display:block;border:none;" />
  </div>`;
}

function patienceSignatureBlock(): string {
  const base = process.env["APP_URL"] ?? "https://womanoftaste.co.za";
  return `<div style="padding:0;">
    <img src="${base}/patience-signature.gif" alt="Patience Bwanya — Founder, Woman of Taste"
      style="width:100%;display:block;border:none;" />
  </div>`;
}

function emailHeader(title: string, subtitle: string): string {
  return `
  <div style="background:linear-gradient(135deg,#1a2547 0%,#2a3a6a 100%);padding:36px 40px 28px;text-align:center;">
    <style>
      @keyframes wotFloat {
        0%,100%{transform:translateY(0) scale(1);filter:drop-shadow(0 0 8px rgba(201,169,110,0.35));}
        50%{transform:translateY(-5px) scale(1.04);filter:drop-shadow(0 0 18px rgba(201,169,110,0.7));}
      }
      @keyframes wotShimmer {
        0%,100%{opacity:0.92;}50%{opacity:1;}
      }
      .wot-logo-anim{animation:wotFloat 3.5s ease-in-out infinite;display:inline-block;}
    </style>
    <div class="wot-logo-anim">
      <img src="${logoUrl()}" alt="Woman of Taste" width="80" height="80"
        style="width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 14px;border-radius:50%;background:rgba(255,255,255,0.06);padding:6px;" />
    </div>
    <div style="font-family:Georgia,serif;font-size:22px;color:#c9a96e;letter-spacing:0.07em;margin-bottom:5px;">${title}</div>
    <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.45);">${subtitle}</div>
  </div>`;
}

interface InvoiceEmailData {
  invoiceNumber: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  dietary?: string | null;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  pricePerTicket: number;
  totalAmount: number;
}

export function formatZAR(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function buildApprovalAdminEmail(
  data: InvoiceEmailData,
  approveUrl: string,
  declineUrl: string,
): string {
  const total = data.totalAmount;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background:#f4f1ec; color:#2a1e12; }
  .page { max-width:620px; margin:0 auto; padding:32px 20px; }
  .card { background:#fff; border-radius:16px; overflow:hidden; border:1px solid #e2d9cc; }
  .hdr { padding:0; }
  .body { padding:32px 36px; }
  .ref { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#9a8268; margin-bottom:4px; }
  .ref-num { font-size:22px; color:#1a2547; font-weight:bold; margin-bottom:24px; }
  .row { display:flex; gap:16px; margin-bottom:16px; }
  .field { flex:1; }
  .field label { display:block; font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:#9a8268; margin-bottom:3px; }
  .field value { display:block; font-size:13px; color:#2a1e12; }
  .event-chip { background:#f0ebf8; border:1px solid #d8cde8; border-radius:10px; padding:14px 18px; margin-bottom:20px; }
  .event-chip strong { color:#1a2547; font-size:15px; display:block; margin-bottom:6px; }
  .event-chip span { font-size:11px; color:#6a5a48; }
  .total-box { background:#1a2547; color:#fff; border-radius:10px; padding:14px 18px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; }
  .total-box .label { font-size:9px; letter-spacing:0.15em; text-transform:uppercase; color:rgba(255,255,255,0.55); }
  .total-box .amount { font-size:22px; color:#c9a96e; font-weight:bold; }
  .btn-row { display:flex; gap:12px; margin-top:8px; }
  .btn { display:block; flex:1; text-align:center; padding:16px 12px; border-radius:50px; font-size:12px; font-weight:bold; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; }
  .btn-approve { background:#16a34a; color:#fff; }
  .btn-decline { background:#6b7280; color:#fff; }
  .footer { border-top:1px solid #e8e0d4; padding:16px 36px; text-align:center; font-size:10px; color:#bbb; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="hdr">${emailHeader("New Booking Request", "Action required — Woman of Taste")}</div>
  <div class="body">
    <div class="ref">Invoice / Reference</div>
    <div class="ref-num">${data.invoiceNumber}</div>

    <div class="row">
      <div class="field"><label>Booker Name</label><value>${data.firstName} ${data.surname}</value></div>
      <div class="field"><label>Email</label><value>${data.email}</value></div>
    </div>
    <div class="row">
      <div class="field"><label>Phone</label><value>${data.phone}</value></div>
      <div class="field"><label>Guests</label><value>${data.quantity}</value></div>
    </div>
    ${data.dietary ? `<div class="row"><div class="field"><label>Dietary</label><value>${data.dietary}</value></div></div>` : ""}

    <div class="event-chip">
      <strong>${data.eventTitle}</strong>
      <span>📅 ${data.eventDate} &nbsp;·&nbsp; 📍 ${data.eventLocation}</span>
    </div>

    <div class="total-box">
      <div>
        <div class="label">Total Value</div>
        <div class="amount">${formatZAR(total)}</div>
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,0.65);">${data.quantity} × ${formatZAR(data.pricePerTicket)}</div>
    </div>

    <p style="font-size:12px;color:#6a5a48;margin-bottom:14px;">Click one of the buttons below to approve or decline this booking. Links expire in 72 hours.</p>

    <div class="btn-row">
      <a href="${approveUrl}" class="btn btn-approve">✅ Approve Booking</a>
      <a href="${declineUrl}" class="btn btn-decline">❌ Decline Booking</a>
    </div>
  </div>
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za</div>
</div></div>
</body></html>`;
}

export function buildClientConfirmationEmail(data: InvoiceEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; background:#f4f1ec; color:#2a1e12; }
  .page { max-width:560px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .header { padding:0; }
  .body { padding:40px; }
  .ref { font-family:Arial,sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#9a8268; margin-bottom:6px; }
  .ref-num { font-size:22px; color:#1a2547; margin-bottom:28px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:16px; }
  .chip { display:inline-block; background:#f9f5ee; border:1px solid #e2d9cc; border-radius:8px; padding:10px 18px; font-family:Arial,sans-serif; font-size:12px; color:#1a2547; margin-bottom:24px; }
  .footer { border-top:1px solid #e8e0d4; padding:20px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:#bbb; line-height:1.8; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("Woman of Taste", "Savory &amp; Soulful")}</div>
  <div class="body">
    <div class="ref">Booking Reference</div>
    <div class="ref-num">${data.invoiceNumber}</div>
    <p>Dear ${data.firstName},</p>
    <p>Thank you for your booking request. We have received your details and your booking is currently under review.</p>
    <div class="chip">📅 &nbsp;<strong>${data.eventTitle}</strong> &nbsp;·&nbsp; ${data.eventDate} &nbsp;·&nbsp; 📍 ${data.eventLocation}</div>
    <p><strong>Summary:</strong> ${data.quantity} guest${data.quantity > 1 ? "s" : ""} &nbsp;·&nbsp; Total: <strong>R ${data.totalAmount.toLocaleString("en-ZA")}</strong></p>
    <p>Once approved, your invoice will be sent to this email with full payment details. Please allow up to <strong>24 hours</strong> for confirmation.</p>
    <p>If you have any questions, reach us at <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e">info@womanoftaste.co.za</a>.</p>
    <p style="font-style:italic;color:#9a8268;">We look forward to welcoming you.</p>
  </div>
  ${auraSignatureBlock()}
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za</div>
</div></div>
</body></html>`;
}

export function buildInvoiceConfirmationEmail(
  data: InvoiceEmailData,
  dueDate: string,
): string {
  const bankName = process.env["BANK_NAME"] ?? "Investec Bank Limited";
  const accountName = process.env["BANK_ACCOUNT_NAME"] ?? "Woman of Taste";
  const accountNumber = process.env["BANK_ACCOUNT_NUMBER"] ?? "10013145814";
  const branchCode = process.env["BANK_BRANCH_CODE"] ?? "580105";
  const accountType = process.env["BANK_ACCOUNT_TYPE"] ?? "Current Account";
  const swiftCode = process.env["BANK_SWIFT_CODE"] ?? "IVESZAJJ";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; background:#f4f1ec; color:#2a1e12; }
  .page { max-width:580px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .header { padding:0; }
  .body { padding:36px 40px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:14px; }
  .chip { background:#1a2547; color:#fff; border-radius:10px; padding:14px 18px; margin-bottom:20px; }
  .chip strong { color:#c9a96e; font-size:14px; display:block; margin-bottom:6px; }
  .chip span { font-family:Arial,sans-serif; font-size:11px; color:rgba(255,255,255,0.65); }
  .banking { background:#f9f5ee; border:1px solid #e2d9cc; border-radius:12px; padding:22px; margin:20px 0; }
  .banking h3 { font-family:Georgia,serif; font-size:14px; color:#1a2547; margin-bottom:14px; }
  .brow { margin-bottom:8px; }
  .brow label { display:block; font-family:Arial,sans-serif; font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:#9a8268; margin-bottom:2px; }
  .brow value { display:block; font-family:Arial,sans-serif; font-size:13px; font-weight:bold; color:#2a1e12; }
  .ref-box { background:#fff; border:1px dashed #c9a96e; border-radius:8px; padding:10px 16px; text-align:center; margin-top:12px; }
  .ref-box .rl { font-family:Arial,sans-serif; font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:#9a8268; margin-bottom:4px; }
  .ref-box .rv { font-size:20px; color:#1a2547; font-weight:bold; letter-spacing:0.05em; }
  .footer { border-top:1px solid #e8e0d4; padding:18px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:#bbb; line-height:1.8; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("Woman of Taste", "Savory &amp; Soulful")}</div>
  <div class="body">
    <p>Dear ${data.firstName},</p>
    <p>🎉 Wonderful news — <strong>your booking has been confirmed!</strong> Please find your invoice attached to this email.</p>

    <div class="chip">
      <strong>${data.eventTitle}</strong>
      <span>📅 ${data.eventDate} &nbsp;·&nbsp; 📍 ${data.eventLocation} &nbsp;·&nbsp; ${data.quantity} guest${data.quantity > 1 ? "s" : ""}</span>
    </div>

    <div class="banking">
      <h3>Payment Instructions</h3>
      <div class="brow"><label>Bank</label><value>${bankName}</value></div>
      <div class="brow"><label>Account Name</label><value>${accountName}</value></div>
      <div class="brow"><label>Account Number</label><value>${accountNumber}</value></div>
      <div class="brow"><label>Branch Code</label><value>${branchCode}</value></div>
      <div class="brow"><label>Account Type</label><value>${accountType}</value></div>
      <div class="brow"><label>Swift Code</label><value>${swiftCode}</value></div>
      <div class="ref-box">
        <div class="rl">Payment Reference (use exactly)</div>
        <div class="rv">${data.invoiceNumber}</div>
      </div>
    </div>

    <p><strong>Total Due: R ${data.totalAmount.toLocaleString("en-ZA")}</strong><br/>Payment is due by <strong>${dueDate}</strong>. Your seat will be confirmed once payment clears.</p>
    <p style="font-size:11px;color:#9a8268;">Please email <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e">info@womanoftaste.co.za</a> once you have made payment so we can confirm your booking promptly.</p>
  </div>
  ${auraSignatureBlock()}
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za</div>
</div></div>
</body></html>`;
}

export function buildDeclineEmail(data: InvoiceEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; background:#f4f1ec; }
  .page { max-width:560px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .header { padding:0; }
  .body { padding:40px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:14px; }
  .footer { border-top:1px solid #e8e0d4; padding:18px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:#bbb; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("Woman of Taste", "Savory &amp; Soulful")}</div>
  <div class="body">
    <p>Dear ${data.firstName},</p>
    <p>Thank you for your interest in <strong>${data.eventTitle}</strong>.</p>
    <p>Unfortunately, we are unable to confirm your booking request at this time. This may be due to capacity, date availability, or other operational reasons.</p>
    <p>We would love to help you find an alternative. Please reach out to us at <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e">info@womanoftaste.co.za</a> and we will do our best to accommodate you at another date or event.</p>
    <p style="font-style:italic;color:#9a8268;">We appreciate your understanding and hope to welcome you soon.</p>
    <p>Warm regards,<br/><strong>The Woman of Taste Team</strong></p>
  </div>
  ${auraSignatureBlock()}
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za</div>
</div></div>
</body></html>`;
}

export function buildNonPaymentCancellationEmail(data: InvoiceEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; background:#f4f1ec; }
  .page { max-width:560px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .body { padding:36px 40px; }
  p { font-family:Arial,sans-serif; font-size:13.5px; line-height:1.85; color:#3a2e22; margin-bottom:16px; }
  .highlight { background:#f9f5ee; border-left:3px solid #c9a96e; border-radius:0 8px 8px 0; padding:14px 18px; margin:20px 0; font-family:Arial,sans-serif; font-size:13px; color:#5a4535; }
  .disclaimer { border-top:1px solid #e8e0d4; padding:20px 40px; font-family:Arial,sans-serif; font-size:10px; color:#aaa; line-height:1.6; }
  .disclaimer strong { color:#888; }
</style></head>
<body>
<div class="page"><div class="card">
  <div>${emailHeader("Woman of Taste", "Savory &amp; Soulful")}</div>
  <div class="body">
    <p>Good day ${data.firstName},</p>
    <p>I hope this message finds you well.</p>
    <p>I am reaching out regarding your reservation for <strong>${data.eventTitle}</strong> on <strong>${data.eventDate}</strong>.</p>
    <p>Unfortunately, as we have not yet received payment for your booking (Reference: <strong>${data.invoiceNumber}</strong>), we have had to release your seat so that it may be offered to someone on our waitlist.</p>
    <div class="highlight">
      We truly would have loved to have you with us. Your presence would have meant so much, and we are genuinely sorry that it did not work out for this one.
    </div>
    <p>Please know that your details remain with us and you will be among the very first to hear about our upcoming events and experiences. We hope with all our hearts to see you at the next one.</p>
    <p>If you believe this was a mistake or would like to discuss your booking, please do not hesitate to reply to this email or reach out to us at <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e;">info@womanoftaste.co.za</a> — we are always happy to help.</p>
    <p>Kind Regards</p>
  </div>
  ${patienceSignatureBlock()}
  <div class="disclaimer">
    <strong>Disclaimer</strong><br/>
    This communication, including any attachments, is confidential and intended solely for the named recipient. If you are not the intended recipient, please notify Woman of Taste immediately and delete this message from your system. Any unauthorised review, copying, or distribution of this communication is strictly prohibited.
  </div>
</div></div>
</body></html>`;
}

export function buildOverdueReminderEmail(data: InvoiceEmailData): string {
  const bankName = process.env["BANK_NAME"] ?? "Investec Bank Limited";
  const accountName = process.env["BANK_ACCOUNT_NAME"] ?? "Woman of Taste";
  const accountNumber = process.env["BANK_ACCOUNT_NUMBER"] ?? "10013145814";
  const branchCode = process.env["BANK_BRANCH_CODE"] ?? "580105";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; background:#f4f1ec; }
  .page { max-width:560px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .body { padding:36px 40px; }
  p { font-family:Arial,sans-serif; font-size:13.5px; line-height:1.8; color:#3a2e22; margin-bottom:16px; }
  .ref-box { background:#f9f5ee; border:1px solid #e2d9cc; border-radius:10px; padding:16px 20px; margin:20px 0; }
  .ref-box .rl { font-family:Arial,sans-serif; font-size:8px; letter-spacing:0.18em; text-transform:uppercase; color:#9a8268; margin-top:10px; }
  .ref-box .rl:first-child { margin-top:0; }
  .ref-box .rv { font-size:15px; color:#1a2547; font-weight:bold; margin-top:2px; }
  .disclaimer { border-top:1px solid #e8e0d4; padding:20px 40px; font-family:Arial,sans-serif; font-size:10px; color:#aaa; line-height:1.6; }
  .disclaimer strong { color:#888; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("Woman of Taste", "Savory &amp; Soulful")}</div>
  <div class="body">
    <p>Good day ${data.firstName},</p>
    <p>Hope you are well.</p>
    <p>Thank you so much for your incredible support!</p>
    <p>I just wanted to finalise catering numbers and wanted to check in on the timeline for receipt of payment for your ticket to <strong>${data.eventTitle}</strong>.</p>
    <p>When you are ready, please use the payment details below — your reference number ensures we can match your payment straight away:</p>
    <div class="ref-box">
      <div class="rl">Bank</div><div class="rv">${bankName}</div>
      <div class="rl">Account Name</div><div class="rv">${accountName}</div>
      <div class="rl">Account Number</div><div class="rv">${accountNumber}</div>
      <div class="rl">Branch Code</div><div class="rv">${branchCode}</div>
      <div class="rl">Payment Reference</div><div class="rv">${data.invoiceNumber}</div>
      <div class="rl">Amount Due</div><div class="rv">R ${data.totalAmount.toLocaleString("en-ZA")}</div>
    </div>
    <p style="font-size:12px;color:#9a8268;">Already paid? Simply reply to this email or send your proof of payment to <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e;">info@womanoftaste.co.za</a> and we will update your booking immediately.</p>
    <p>Kind Regards</p>
  </div>
  ${patienceSignatureBlock()}
  <div class="disclaimer">
    <strong>Disclaimer</strong><br/>
    This communication, including any attachments, is confidential and intended solely for the named recipient. If you are not the intended recipient, please notify Woman of Taste immediately and delete this message from your system. Any unauthorised review, copying, or distribution of this communication is strictly prohibited. Only authorised representatives of Woman of Taste may send communications on behalf of the organisation.
  </div>
</div></div>
</body></html>`;
}

export function buildFollowup1Email(data: InvoiceEmailData): string {
  const bankName = process.env["BANK_NAME"] ?? "Investec Bank Limited";
  const accountName = process.env["BANK_ACCOUNT_NAME"] ?? "Woman of Taste";
  const accountNumber = process.env["BANK_ACCOUNT_NUMBER"] ?? "10013145814";
  const branchCode = process.env["BANK_BRANCH_CODE"] ?? "580105";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; background:#f4f1ec; }
  .page { max-width:560px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .header { padding:0; }
  .body { padding:36px 40px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:14px; }
  .ref-box { background:#f9f5ee; border:1px solid #e2d9cc; border-radius:10px; padding:14px 18px; margin:16px 0; }
  .ref-box .rl { font-family:Arial,sans-serif; font-size:8px; letter-spacing:0.15em; text-transform:uppercase; color:#9a8268; }
  .ref-box .rv { font-size:18px; color:#1a2547; font-weight:bold; }
  .footer { border-top:1px solid #e8e0d4; padding:16px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:#bbb; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("Woman of Taste", "Savory &amp; Soulful")}</div>
  <div class="body">
    <p>Dear ${data.firstName},</p>
    <p>Just a warm reminder that your booking for <strong>${data.eventTitle}</strong> on <strong>${data.eventDate}</strong> is confirmed, and payment is still outstanding.</p>
    <p>To secure your seat, please transfer <strong>R ${data.totalAmount.toLocaleString("en-ZA")}</strong> using the details below:</p>
    <div class="ref-box">
      <div class="rl">Bank</div><div class="rv">${bankName}</div>
      <div class="rl" style="margin-top:8px;">Account Name</div><div class="rv">${accountName}</div>
      <div class="rl" style="margin-top:8px;">Account Number</div><div class="rv">${accountNumber}</div>
      <div class="rl" style="margin-top:8px;">Branch Code</div><div class="rv">${branchCode}</div>
      <div class="rl" style="margin-top:8px;">Payment Reference</div><div class="rv">${data.invoiceNumber}</div>
    </div>
    <p style="font-size:11px;color:#9a8268;">If you have already paid, please ignore this reminder and email <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e">info@womanoftaste.co.za</a> to confirm so we can update your booking.</p>
    <p>Warm regards,<br/><strong>The Woman of Taste Team</strong></p>
  </div>
  ${auraSignatureBlock()}
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za</div>
</div></div>
</body></html>`;
}

export function buildFollowup2Email(data: InvoiceEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; background:#f4f1ec; }
  .page { max-width:560px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .header { padding:0; }
  .body { padding:36px 40px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:14px; }
  .warning { background:#fff8e1; border-left:3px solid #f59e0b; border-radius:0 8px 8px 0; padding:12px 16px; margin:16px 0; font-family:Arial,sans-serif; font-size:12px; color:#92400e; }
  .footer { border-top:1px solid #e8e0d4; padding:16px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:#bbb; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("Woman of Taste", "Savory &amp; Soulful")}</div>
  <div class="body">
    <p>Dear ${data.firstName},</p>
    <p>We are writing regarding your booking for <strong>${data.eventTitle}</strong> (Reference: <strong>${data.invoiceNumber}</strong>).</p>
    <div class="warning">
      ⚠️ Payment of <strong>R ${data.totalAmount.toLocaleString("en-ZA")}</strong> is now overdue. Please note that your seat may be released if payment is not received within <strong>48 hours</strong>.
    </div>
    <p>If you are experiencing difficulty with payment or need to discuss your booking, please contact us <strong>urgently</strong> at <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e">info@womanoftaste.co.za</a>.</p>
    <p>Your payment reference is <strong>${data.invoiceNumber}</strong>.</p>
    <p>We hope to resolve this quickly so we can look forward to welcoming you.</p>
    <p>Kind regards,<br/><strong>The Woman of Taste Team</strong></p>
  </div>
  ${auraSignatureBlock()}
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za</div>
</div></div>
</body></html>`;
}

// ─── EVENT HYPE / PRE-SCREENING EMAIL ─────────────────────────────────────
interface EventHypeData {
  firstName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  invoiceNumber: string;
}

export function buildDWP2HypeEmail(data: EventHypeData): string {
  const trailerUrl = "https://www.youtube.com/watch?v=e9HXmMnUEdE";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; background:#0e0505; color:#f0e8e8; }
  .page { max-width:580px; margin:0 auto; padding:40px 20px; }
  .card { background:#1a0808; border-radius:20px; overflow:hidden; border:1px solid rgba(200,100,100,0.2); }
  .header { padding:0; }
  .body { padding:36px 40px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.8; color:rgba(255,235,235,0.82); margin-bottom:16px; }
  .trailer-btn { display:block; text-align:center; background:linear-gradient(135deg,#8b1a1a,#c9453a); color:#fff; font-family:Arial,sans-serif; font-size:12px; font-weight:bold; letter-spacing:0.15em; text-transform:uppercase; text-decoration:none; padding:18px 32px; border-radius:50px; margin:28px 0; }
  .look-section { background:rgba(255,255,255,0.04); border:1px solid rgba(200,120,120,0.15); border-radius:14px; padding:28px; margin:28px 0; }
  .look-label { font-family:Arial,sans-serif; font-size:8px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(201,169,110,0.7); margin-bottom:18px; }
  .look-item { margin-bottom:22px; padding-bottom:22px; border-bottom:1px solid rgba(255,255,255,0.07); }
  .look-item:last-child { margin-bottom:0; padding-bottom:0; border-bottom:none; }
  .look-number { font-family:Georgia,serif; font-size:30px; color:rgba(201,169,110,0.25); float:left; line-height:1; margin-right:14px; margin-top:-4px; }
  .look-title { font-family:Georgia,serif; font-size:16px; color:#c9a96e; margin-bottom:6px; }
  .look-body { font-family:Arial,sans-serif; font-size:12px; line-height:1.75; color:rgba(255,235,235,0.72); clear:both; }
  .dress-badge { background:rgba(201,169,110,0.1); border:1px solid rgba(201,169,110,0.3); border-radius:10px; padding:16px 20px; margin:24px 0; text-align:center; }
  .dress-badge .icon { font-size:28px; display:block; margin-bottom:8px; }
  .dress-badge p { font-family:Arial,sans-serif; font-size:12px; color:rgba(201,169,110,0.9); margin:0; }
  .footer { border-top:1px solid rgba(255,255,255,0.07); padding:18px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:rgba(255,255,255,0.3); line-height:1.8; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("The Devil Wears Prada II", "Your Screening is 1 May 2026 · Egrek Cinema, Parkhurst")}</div>
  <div class="body">
    <p>Dear ${data.firstName},</p>
    <p>We are counting down — and we want to make sure you arrive <em>ready</em>. Your seat for <strong>The Devil Wears Prada II</strong> private screening is confirmed, and this evening deserves your most compelling look.</p>
    <p>First things first — watch the official trailer and let the goosebumps set in:</p>

    <a href="${trailerUrl}" class="trailer-btn">▶&nbsp;&nbsp;Watch the Official Trailer</a>

    <div class="look-section">
      <div class="look-label">3 Style Directions for the Evening</div>

      <div class="look-item">
        <div class="look-number">I</div>
        <div class="look-title">Power Editorial Black</div>
        <div class="look-body">Miranda Priestly built an empire in monochrome. A sharp blazer, tailored trousers, a sleek column dress — black is never boring when it's worn with intention. Add one statement accessory and let your presence do the rest. This is the look that owns every room before you say a word.</div>
      </div>

      <div class="look-item">
        <div class="look-number">II</div>
        <div class="look-title">The Cerulean Moment</div>
        <div class="look-body">"That blue represents millions of dollars and countless jobs." If you know, you know. Cerulean, cobalt, sapphire — a nod to the film's most iconic scene signals you're not just a fan, you're fluent. Style it with clean lines and minimal accessories. The colour is the statement.</div>
      </div>

      <div class="look-item">
        <div class="look-number">III</div>
        <div class="look-title">Andy's Glow-Up Energy</div>
        <div class="look-body">Channel the transformation arc. Bold silhouette, structured shoulders, a heel that means business — and enough confidence to walk into a Parisian atelier unannounced. Think fashion-forward, intentional, and dressed for every version of your ambition. The glow-up is the point.</div>
      </div>
    </div>

    <div class="dress-badge">
      <span class="icon">📸</span>
      <p>Come dressed to impress — there will be a styled reception, gorgeous people, and every reason to document this evening. Bring your best angles and your most memorable look. We'll be capturing content throughout the night.</p>
    </div>

    <p>Your booking reference is <strong>${data.invoiceNumber}</strong>. Doors open at <strong>17:30</strong> at <strong>Egrek Cinema, Parkhurst</strong>. Arrive a little early — the reception is part of the experience.</p>
    <p style="font-style:italic;color:rgba(201,169,110,0.75);">We cannot wait to see you there. Dress as the editor of your own life — and have the most magnificent time.</p>
  </div>
  ${patienceSignatureBlock()}
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za<br/>Your booking: ${data.invoiceNumber} · ${data.eventDate} · ${data.eventLocation}</div>
</div></div>
</body></html>`;
}

// ─── WAITLIST CONFIRMATION EMAIL ──────────────────────────────────────────
export function buildWaitlistConfirmationEmail(data: InvoiceEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; background:#f4f1ec; color:#2a1e12; }
  .page { max-width:560px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .header { padding:0; }
  .body { padding:40px; }
  .ref { font-family:Arial,sans-serif; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:#9a8268; margin-bottom:6px; }
  .ref-num { font-size:22px; color:#1a2547; margin-bottom:28px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:16px; }
  .chip { display:inline-block; background:#f9f5ee; border:1px solid #e2d9cc; border-radius:8px; padding:10px 18px; font-family:Arial,sans-serif; font-size:12px; color:#1a2547; margin-bottom:24px; }
  .notice { background:#fff8e1; border-left:3px solid #c9a96e; border-radius:0 8px 8px 0; padding:12px 16px; margin:16px 0; font-family:Arial,sans-serif; font-size:12px; color:#6a5a30; line-height:1.65; }
  .footer { border-top:1px solid #e8e0d4; padding:20px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:#bbb; line-height:1.8; }
</style></head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("You're on the Waitlist", "Woman of Taste — Savory &amp; Soulful")}</div>
  <div class="body">
    <div class="ref">Waitlist Reference</div>
    <div class="ref-num">${data.invoiceNumber}</div>
    <p>Dear ${data.firstName},</p>
    <p>Thank you for your interest in <strong>${data.eventTitle}</strong>. This event is currently fully booked — but we have added you to the waitlist.</p>
    <div class="chip">📅 &nbsp;<strong>${data.eventTitle}</strong> &nbsp;·&nbsp; ${data.eventDate} &nbsp;·&nbsp; 📍 ${data.eventLocation}</div>
    <div class="notice">
      🕐 <strong>What happens next?</strong> If a seat becomes available, we will contact you directly at this email address. Waitlist spots are offered on a first-come, first-served basis, and you will have <strong>48 hours</strong> to confirm and pay before the seat is offered to the next person.
    </div>
    <p>In the meantime, keep an eye on our upcoming events — there's always something exciting at Woman of Taste.</p>
    <p>If you have any questions, reach us at <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e">info@womanoftaste.co.za</a>.</p>
    <p style="font-style:italic;color:#9a8268;">We hope to welcome you soon.</p>
  </div>
  ${auraSignatureBlock()}
  <div class="footer">Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za</div>
</div></div>
</body></html>`;
}

// ─── PAYMENT CONFIRMED EMAIL ───────────────────────────────────────────────
interface PaymentConfirmedData {
  firstName: string;
  eventTitle: string;
  eventDate: string;
  invoiceNumber: string;
  quantity: number;
}

export function buildPaymentConfirmedEmail(
  data: PaymentConfirmedData,
  arrival: EventArrivalDetails | null
): { subject: string; html: string } {
  const subject = arrival
    ? `${arrival.subjectPrefix}: ${data.eventTitle} | ${data.eventDate}`
    : `✅ You're Confirmed — ${data.eventTitle} | ${data.eventDate}`;

  const scheduleRows = arrival
    ? arrival.schedule.map((s) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #ede8df;font-family:Arial,sans-serif;font-size:12px;color:#c9a96e;font-weight:bold;width:90px;vertical-align:top;">${s.time}</td>
        <td style="padding:8px 0 8px 16px;border-bottom:1px solid #ede8df;font-family:Arial,sans-serif;font-size:12px;color:#2a1e12;">${s.label}</td>
      </tr>`).join("")
    : "";

  const protocolItems = arrival
    ? arrival.protocol.map((p) => `
      <div style="margin-bottom:16px;">
        <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;color:#1a2547;margin-bottom:4px;">${p.icon} ${p.title}</div>
        <div style="font-family:Arial,sans-serif;font-size:12px;color:#4a3a28;line-height:1.65;padding-left:28px;">${p.detail}</div>
      </div>`).join("")
    : "";

  const venueBlock = arrival ? `
    <div style="background:#1a2547;border-radius:14px;padding:22px 24px;margin:22px 0;">
      <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:6px;">✨ The Venue</div>
      <div style="font-family:Georgia,serif;font-size:16px;color:#c9a96e;margin-bottom:4px;">${arrival.venueDisplayName}</div>
      <div style="font-family:Arial,sans-serif;font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:14px;">${arrival.venueFullAddress}</div>
      <a href="${arrival.mapUrl}" target="_blank"
        style="display:inline-block;background:rgba(201,169,110,0.15);border:1px solid rgba(201,169,110,0.4);color:#c9a96e;font-family:Arial,sans-serif;font-size:11px;padding:8px 18px;border-radius:20px;text-decoration:none;letter-spacing:0.04em;">
        📍 Open in Google Maps
      </a>
    </div>` : "";

  const scheduleBlock = arrival ? `
    <div style="background:#f9f5ee;border-radius:14px;padding:20px 24px;margin:22px 0;">
      <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#9a8268;margin-bottom:12px;">🕐 Arrival &amp; Schedule</div>
      <table style="width:100%;border-collapse:collapse;">${scheduleRows}</table>
    </div>` : "";

  const protocolBlock = arrival ? `
    <div style="background:#fff;border:1px solid #e2d9cc;border-radius:14px;padding:22px 24px;margin:22px 0;">
      <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#9a8268;margin-bottom:16px;">Arrival Protocol</div>
      ${protocolItems}
    </div>` : "";

  const closingNote = arrival?.closingNote ?? "We look forward to welcoming you.";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>You're Confirmed — ${data.eventTitle}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Georgia,serif; background:#f4f1ec; color:#2a1e12; }
  .page { max-width:600px; margin:0 auto; padding:40px 20px; }
  .card { background:#fff; border-radius:20px; overflow:hidden; border:1px solid #e2d9cc; }
  .header { padding:0; }
  .body { padding:36px 40px; }
  p { font-family:Arial,sans-serif; font-size:13px; line-height:1.75; color:#4a3a28; margin-bottom:14px; }
  .footer { border-top:1px solid #e8e0d4; padding:18px 40px; text-align:center; font-family:Arial,sans-serif; font-size:10px; color:#bbb; line-height:1.8; }
</style>
</head>
<body>
<div class="page"><div class="card">
  <div class="header">${emailHeader("You're In!", "Payment received — Woman of Taste")}</div>
  <div class="body">
    <p>Hello ${data.firstName},</p>
    <p>Thank you for completing your booking! We are <strong>thrilled</strong> to have you join us for this exclusive experience.</p>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:#9a8268;">Ref: ${data.invoiceNumber} &nbsp;·&nbsp; ${data.quantity} guest${data.quantity > 1 ? "s" : ""} &nbsp;·&nbsp; ${data.eventDate}</p>

    <p>As promised, here are the private details for your arrival:</p>

    ${venueBlock}
    ${scheduleBlock}
    ${protocolBlock}

    <p style="font-style:italic;color:#9a8268;margin-top:20px;">${closingNote}</p>

    <p style="margin-top:24px;">Warmly,<br/>
    <strong style="font-family:Georgia,serif;font-size:14px;color:#1a2547;">Patience Bwanya</strong><br/>
    <span style="font-family:Arial,sans-serif;font-size:11px;color:#9a8268;">Founder | Woman of Taste (WOT)</span><br/>
    <a href="https://womanoftaste.co.za" style="font-family:Arial,sans-serif;font-size:11px;color:#c9a96e;text-decoration:none;">womanoftaste.co.za</a>
    </p>

  </div>
  ${patienceSignatureBlock()}
  <div class="footer">
    Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za
  </div>
</div></div>
</body></html>`;

  return { subject, html };
}

export interface CinemaTicketData {
  invoiceNumber: string;
  firstName: string;
  surname: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  pricePerTicket: number;
  totalAmount: number;
  qrCid: string;
  ticketPageUrl: string;
}

export function buildCinemaTicketEmail(data: CinemaTicketData): { subject: string; html: string } {
  const subject = `🎬 Your Cinema Ticket — ${data.eventTitle}`;
  const base = process.env["APP_URL"] ?? "https://womanoftaste.co.za";
  const logoSrc = `${base}/wot-logo.png`;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Your Cinema Ticket — ${data.eventTitle}</title>
</head>
<body style="margin:0;padding:0;background:#1a0a0a;font-family:Georgia,serif;">
<div style="max-width:640px;margin:0 auto;padding:32px 16px;">

  <!-- Pre-header -->
  <div style="text-align:center;margin-bottom:20px;">
    <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;">Woman of Taste · Exclusive Event</div>
  </div>

  <!-- Cinema Ticket -->
  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#0d0d0d;border-radius:16px;border:2px solid #7a1c1c;overflow:hidden;">
    <tr>
      <!-- LEFT: Admit One strip -->
      <td style="width:36px;background:#1a0808;border-right:2px solid #7a1c1c;padding:0;text-align:center;vertical-align:middle;">
        <div style="writing-mode:vertical-rl;transform:rotate(180deg);color:#c9a96e;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.35em;text-transform:uppercase;padding:20px 0;white-space:nowrap;">
          ★ ADMIT ONE ★
        </div>
      </td>

      <!-- CENTRE: Main ticket body -->
      <td style="padding:28px 24px;vertical-align:top;text-align:center;">
        <!-- Ref + logo row -->
        <div style="display:inline-block;background:rgba(201,169,110,0.1);border:1px solid rgba(201,169,110,0.3);border-radius:20px;padding:4px 14px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;margin-bottom:16px;">
          ${data.invoiceNumber}
        </div>

        <div style="margin-bottom:14px;">
          <img src="${logoSrc}" alt="WOT" width="56" height="56" style="width:56px;height:56px;border-radius:50%;background:rgba(201,169,110,0.1);padding:4px;display:block;margin:0 auto;" />
        </div>

        <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.35em;text-transform:uppercase;color:rgba(201,169,110,0.6);margin-bottom:6px;">CINEMA TICKET</div>
        <div style="font-size:22px;font-weight:bold;color:#c9a96e;letter-spacing:0.06em;text-transform:uppercase;line-height:1.15;margin-bottom:10px;">${data.eventTitle}</div>
        <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(201,169,110,0.55);margin-bottom:20px;">EVENT BY WOMAN OF TASTE</div>

        <!-- Details row -->
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-top:1px dashed rgba(201,169,110,0.25);padding-top:18px;margin-top:4px;">
          <tr>
            <td style="text-align:center;padding:0 8px;">
              <div style="font-family:Arial,sans-serif;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:5px;">DATE</div>
              <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#c9a96e;">${data.eventDate}</div>
            </td>
            <td style="text-align:center;padding:0 8px;border-left:1px solid rgba(201,169,110,0.2);">
              <div style="font-family:Arial,sans-serif;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:5px;">GUESTS</div>
              <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;color:#c9a96e;">${data.quantity}</div>
            </td>
            <td style="text-align:center;padding:0 8px;border-left:1px solid rgba(201,169,110,0.2);">
              <div style="font-family:Arial,sans-serif;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:5px;">VENUE</div>
              <div style="font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#c9a96e;max-width:120px;">${data.eventLocation}</div>
            </td>
          </tr>
        </table>
      </td>

      <!-- PERFORATED DIVIDER -->
      <td style="width:3px;padding:0;">
        <div style="width:3px;height:100%;background:repeating-linear-gradient(to bottom,transparent 0px,transparent 7px,#7a1c1c 7px,#7a1c1c 11px);"></div>
      </td>

      <!-- RIGHT: Tear-off stub -->
      <td style="width:170px;padding:20px 16px;background:#110808;vertical-align:top;text-align:center;">
        <!-- Guest name -->
        <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(201,169,110,0.55);margin-bottom:3px;">GUEST</div>
        <div style="font-size:14px;font-weight:700;color:#c9a96e;letter-spacing:0.05em;margin-bottom:18px;word-break:break-word;">${data.firstName} ${data.surname}</div>

        <div style="margin-bottom:10px;">
          <div style="font-family:Arial,sans-serif;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:3px;">PRICE</div>
          <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#c9a96e;">R ${data.pricePerTicket.toLocaleString("en-ZA")}</div>
        </div>

        <div style="border-top:1px dashed rgba(201,169,110,0.2);padding-top:14px;margin-bottom:14px;">
          <div style="font-family:Arial,sans-serif;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;">SCAN TO CHECK IN</div>
          <img src="cid:${data.qrCid}" alt="Entry QR Code" width="120" height="120" style="width:120px;height:120px;display:block;margin:0 auto;border-radius:6px;background:#fff;padding:4px;" />
        </div>

        <a href="${data.ticketPageUrl}" style="display:block;font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.1em;color:rgba(201,169,110,0.7);text-decoration:none;">View Ticket Online →</a>
      </td>
    </tr>
  </table>

  <!-- Bottom note -->
  <div style="text-align:center;margin-top:24px;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.35);line-height:1.8;">
    Please present this ticket (or the QR code) at the door.<br/>
    For assistance: <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e;text-decoration:none;">info@womanoftaste.co.za</a>
    <br/><br/>
    <span style="font-size:10px;opacity:0.5;">Woman of Taste · womanoftaste.co.za</span>
  </div>

</div>
</body></html>`;

  return { subject, html };
}

// ── Refund Request Email (to guest) ─────────────────────────────────────────
export function buildRefundRequestEmail(data: {
  firstName: string;
  eventTitle: string;
  eventDate: string;
  invoiceNumber: string;
  totalAmount: number;
  refundUrl: string;
}): { subject: string; html: string } {
  const subject = `Your Refund — ${data.eventTitle}`;
  const amount = `R ${data.totalAmount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Arial,sans-serif;">
<div style="max-width:620px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2d9cc;">
    ${emailHeader("Your Refund", "Woman of Taste")}
    <div style="padding:36px 40px;">
      <p style="font-family:Georgia,serif;font-size:18px;color:#1a2547;margin:0 0 18px;">Dear ${data.firstName},</p>
      <p style="font-size:14px;color:#4a3728;line-height:1.8;margin:0 0 20px;">
        We are processing a refund for your booking of <strong>${data.eventTitle}</strong>. To complete the process, we need your South African banking details so we can transfer the funds directly to you.
      </p>

      <div style="background:#f8f5f0;border-radius:12px;padding:20px 24px;margin:0 0 28px;border:1px solid #e8e0d4;">
        <div style="font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#9a8268;margin-bottom:12px;">Refund Details</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="font-size:11px;color:#9a8268;padding:4px 0;">Invoice</td><td style="font-size:13px;font-weight:bold;color:#1a2547;text-align:right;">${data.invoiceNumber}</td></tr>
          <tr><td style="font-size:11px;color:#9a8268;padding:4px 0;">Event</td><td style="font-size:13px;color:#2a1e12;text-align:right;">${data.eventTitle}</td></tr>
          <tr><td style="font-size:11px;color:#9a8268;padding:4px 0;">Date</td><td style="font-size:13px;color:#2a1e12;text-align:right;">${data.eventDate}</td></tr>
          <tr style="border-top:1px solid #e8e0d4;"><td style="font-size:11px;color:#9a8268;padding:8px 0 4px;">Refund Amount</td><td style="font-size:16px;font-weight:bold;color:#1a2547;text-align:right;padding-top:8px;">${amount}</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin:0 0 28px;">
        <a href="${data.refundUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#1a2547,#2a3a6a);color:#c9a96e;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;padding:16px 40px;border-radius:50px;">
          Submit My Bank Details →
        </a>
      </div>

      <p style="font-size:12px;color:#9a8268;line-height:1.8;margin:0 0 8px;">
        The link above will take you to a secure form where you can enter your banking details. Once submitted, our team will process your refund promptly.
      </p>
      <p style="font-size:12px;color:#9a8268;line-height:1.8;margin:0 0 24px;">
        If you have any questions, please don't hesitate to reach out at <a href="mailto:info@womanoftaste.co.za" style="color:#c9a96e;">info@womanoftaste.co.za</a>.
      </p>

      ${patienceSignatureBlock()}
    </div>
  </div>
  <div style="text-align:center;padding:20px 0;font-size:10px;color:#9a8268;">
    Woman of Taste · <a href="https://womanoftaste.co.za" style="color:#c9a96e;text-decoration:none;">womanoftaste.co.za</a>
  </div>
</div>
</body></html>`;
  return { subject, html };
}

// ── Refund Submitted Admin Notification ─────────────────────────────────────
export function buildRefundSubmittedAdminEmail(data: {
  firstName: string;
  surname: string;
  email: string;
  eventTitle: string;
  invoiceNumber: string;
  totalAmount: number;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  adminUrl: string;
}): { subject: string; html: string } {
  const subject = `Bank Details Received — ${data.firstName} ${data.surname} (${data.invoiceNumber})`;
  const amount = `R ${data.totalAmount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Arial,sans-serif;">
<div style="max-width:620px;margin:0 auto;padding:32px 20px;">
  <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2d9cc;">
    ${emailHeader("Bank Details Received", "Refund Processing")}
    <div style="padding:36px 40px;">
      <p style="font-size:14px;color:#4a3728;line-height:1.8;margin:0 0 20px;">
        <strong>${data.firstName} ${data.surname}</strong> has submitted their banking details for the ${data.eventTitle} refund.
      </p>

      <div style="background:#f0f4ff;border-radius:12px;padding:20px 24px;margin:0 0 20px;border:1px solid #d0daff;">
        <div style="font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#4b6cb7;margin-bottom:12px;">Banking Details</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="font-size:11px;color:#6b7280;padding:5px 0;">Account Holder</td><td style="font-size:13px;font-weight:bold;color:#1a2547;text-align:right;">${data.accountHolder}</td></tr>
          <tr><td style="font-size:11px;color:#6b7280;padding:5px 0;">Bank</td><td style="font-size:13px;color:#2a1e12;text-align:right;">${data.bankName}</td></tr>
          <tr><td style="font-size:11px;color:#6b7280;padding:5px 0;">Account Number</td><td style="font-size:13px;font-weight:bold;color:#1a2547;text-align:right;">${data.accountNumber}</td></tr>
          <tr><td style="font-size:11px;color:#6b7280;padding:5px 0;">Branch Code</td><td style="font-size:13px;color:#2a1e12;text-align:right;">${data.branchCode}</td></tr>
          <tr><td style="font-size:11px;color:#6b7280;padding:5px 0;">Account Type</td><td style="font-size:13px;color:#2a1e12;text-align:right;">${data.accountType}</td></tr>
        </table>
      </div>

      <div style="background:#f8f5f0;border-radius:12px;padding:16px 20px;margin:0 0 24px;border:1px solid #e8e0d4;">
        <div style="font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#9a8268;margin-bottom:10px;">Booking Info</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="font-size:11px;color:#9a8268;padding:3px 0;">Guest</td><td style="font-size:12px;color:#2a1e12;text-align:right;">${data.firstName} ${data.surname} · ${data.email}</td></tr>
          <tr><td style="font-size:11px;color:#9a8268;padding:3px 0;">Invoice</td><td style="font-size:12px;color:#2a1e12;text-align:right;">${data.invoiceNumber}</td></tr>
          <tr><td style="font-size:11px;color:#9a8268;padding:3px 0;">Event</td><td style="font-size:12px;color:#2a1e12;text-align:right;">${data.eventTitle}</td></tr>
          <tr><td style="font-size:11px;color:#9a8268;padding:3px 0;">Amount</td><td style="font-size:13px;font-weight:bold;color:#1a2547;text-align:right;">${amount}</td></tr>
        </table>
      </div>

      <div style="text-align:center;margin:0 0 20px;">
        <a href="${data.adminUrl}"
          style="display:inline-block;background:linear-gradient(135deg,#1a2547,#2a3a6a);color:#c9a96e;text-decoration:none;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;padding:14px 32px;border-radius:50px;">
          View in Admin Portal →
        </a>
      </div>

      ${auraSignatureBlock()}
    </div>
  </div>
</div>
</body></html>`;
  return { subject, html };
}
