import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

interface InvoiceData {
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

function formatZAR(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<string> {
  const invoicesDir = path.resolve(
    process.cwd(),
    process.env["INVOICES_DIR"] ?? "data/invoices",
  );
  fs.mkdirSync(invoicesDir, { recursive: true });

  const filePath = path.join(invoicesDir, `${data.invoiceNumber}.pdf`);

  const issueDate = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const navy = "#1a2547";
  const gold = "#c9a96e";
  const ivory = "#f9f5ee";
  const muted = "#9a8268";
  const dark = "#2a1e12";

  // Resolve logo — try absolute paths first, then relative to cwd
  const logoPath = (() => {
    const candidates = [
      "/home/runner/workspace/artifacts/woman-of-taste/public/wot-logo.png",
      path.resolve(process.cwd(), "../woman-of-taste/public/wot-logo.png"),
      path.resolve(process.cwd(), "../../woman-of-taste/public/wot-logo.png"),
      path.resolve(process.cwd(), "artifacts/woman-of-taste/public/wot-logo.png"),
      path.resolve(process.cwd(), "public/wot-logo.png"),
    ];
    const found = candidates.find(p => fs.existsSync(p)) ?? null;
    console.log("[pdf] logo path resolved:", found ?? "NOT FOUND");
    return found;
  })();

  const bankName = process.env["BANK_NAME"] ?? "Investec Bank Limited";
  const accountName = process.env["BANK_ACCOUNT_NAME"] ?? "Woman of Taste";
  const accountNumber = process.env["BANK_ACCOUNT_NUMBER"] ?? "10013145814";
  const branchCode = process.env["BANK_BRANCH_CODE"] ?? "580105";
  const accountType = process.env["BANK_ACCOUNT_TYPE"] ?? "Current Account";
  const branchName = process.env["BANK_BRANCH_NAME"] ?? "100 Grayston Drive, Sandton";
  const swiftCode = process.env["BANK_SWIFT_CODE"] ?? "IVESZAJJ";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const W = 595 - 100;

    // ── HEADER BLOCK ──
    doc.rect(0, 0, 595, 140).fill(navy);

    // Logo image (if available) — placed left side of header
    let textX = 50;
    if (logoPath) {
      try {
        doc.image(logoPath, 48, 28, { height: 84, width: 84 });
        textX = 148;
      } catch (e) {
        console.error("[pdf] Logo embed failed:", e);
      }
    }

    doc.fillColor(gold).font("Helvetica-Bold").fontSize(22).text("Woman of Taste", textX, 44);
    doc.fillColor("white").font("Helvetica").fontSize(9).text("SAVORY & SOULFUL", textX, 72);
    doc.fillColor("white").font("Helvetica").fontSize(10).text("info@womanoftaste.co.za  |  womanoftaste.co.za", textX, 90);

    // Gold accent bar beneath header
    doc.rect(0, 140, 595, 3).fill(gold);

    // ── INVOICE META BAR ──
    doc.rect(0, 143, 595, 55).fill(ivory);
    doc.fillColor(muted).font("Helvetica").fontSize(8).text("INVOICE", 50, 155);
    doc.fillColor(navy).font("Helvetica-Bold").fontSize(16).text(data.invoiceNumber, 50, 166);
    doc.fillColor(muted).font("Helvetica").fontSize(8).text("ISSUE DATE", 350, 155);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(issueDate, 350, 166);
    doc.fillColor(muted).font("Helvetica").fontSize(8).text("DUE DATE", 460, 155);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(dueDate, 460, 166);

    let y = 218;

    // ── BILLED TO ──
    doc.fillColor(gold).font("Helvetica-Bold").fontSize(8).text("BILLED TO", 50, y);
    y += 14;
    doc.fillColor(dark).font("Helvetica-Bold").fontSize(12).text(`${data.firstName} ${data.surname}`, 50, y);
    y += 16;
    doc.fillColor(muted).font("Helvetica").fontSize(10).text(data.email, 50, y);
    y += 14;
    doc.fillColor(muted).font("Helvetica").fontSize(10).text(data.phone, 50, y);
    if (data.dietary) {
      y += 14;
      doc.fillColor(muted).font("Helvetica").fontSize(9).text(`Dietary: ${data.dietary}`, 50, y);
    }

    y += 30;
    doc.rect(50, y, W, 0.5).fill("#e8e0d4");

    // ── EVENT BLOCK ──
    y += 18;
    doc.rect(50, y, W, 72).fill(navy).stroke();
    doc.fillColor(gold).font("Helvetica-Bold").fontSize(8).text("EVENT", 66, y + 12);
    doc.fillColor("white").font("Helvetica-Bold").fontSize(13).text(data.eventTitle, 66, y + 26, { width: W - 32 });
    doc.fillColor("rgba(255,255,255,0.65)").font("Helvetica").fontSize(9)
      .text(`Date: ${data.eventDate}   |   Venue: ${data.eventLocation}`, 66, y + 52, { width: W - 32 });

    y += 90;

    // ── TICKET TABLE ──
    doc.fillColor(gold).font("Helvetica-Bold").fontSize(8).text("TICKET SUMMARY", 50, y);
    y += 14;
    doc.rect(50, y, W, 0.5).fill("#e8e0d4");
    y += 8;

    const colDesc = 50;
    const colQty = 340;
    const colUnit = 400;
    const colTotal = 470;

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(8);
    doc.text("DESCRIPTION", colDesc, y);
    doc.text("QTY", colQty, y);
    doc.text("UNIT PRICE", colUnit, y);
    doc.text("AMOUNT", colTotal, y);
    y += 14;
    doc.rect(50, y, W, 0.5).fill("#e8e0d4");
    y += 10;

    doc.fillColor(dark).font("Helvetica").fontSize(11);
    doc.text(`${data.eventTitle}`, colDesc, y, { width: 270 });
    doc.text(`${data.quantity}`, colQty, y);
    doc.text(formatZAR(data.pricePerTicket), colUnit, y);
    doc.text(formatZAR(data.quantity * data.pricePerTicket), colTotal, y);
    y += 26;

    doc.rect(50, y, W, 1.5).fill("#e8e0d4");
    y += 10;

    doc.fillColor(navy).font("Helvetica-Bold").fontSize(13);
    doc.text("TOTAL DUE", colDesc, y);
    doc.text(formatZAR(data.totalAmount), colTotal, y);

    y += 36;

    // ── PAYMENT SECTION ──
    doc.rect(50, y, W, 185).fill(ivory).stroke();
    doc.fillColor(navy).font("Helvetica-Bold").fontSize(11).text("Payment Details", 66, y + 14);

    const bY = y + 34;
    const col1 = 66;
    const col2 = 310;

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("BANK", col1, bY);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(bankName, col1, bY + 10);

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("ACCOUNT NAME", col2, bY);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(accountName, col2, bY + 10);

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("ACCOUNT NUMBER", col1, bY + 32);
    doc.fillColor(dark).font("Helvetica-Bold").fontSize(11).text(accountNumber, col1, bY + 42);

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("BRANCH CODE", col2, bY + 32);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(branchCode, col2, bY + 42);

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("ACCOUNT TYPE", col1, bY + 64);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(accountType, col1, bY + 74);

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("BRANCH NAME", col2, bY + 64);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(branchName, col2, bY + 74);

    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("SWIFT CODE", col1, bY + 96);
    doc.fillColor(dark).font("Helvetica").fontSize(10).text(swiftCode, col1, bY + 106);

    // Payment reference box
    doc.rect(col1, y + 148, W - 32, 26).fill("white").stroke();
    doc.fillColor(muted).font("Helvetica-Bold").fontSize(7).text("PAYMENT REFERENCE (use exactly)", col1 + 8, y + 152);
    doc.fillColor(navy).font("Helvetica-Bold").fontSize(11).text(data.invoiceNumber, 310, y + 151);

    y += 200;

    // ── NOTE ──
    doc.fillColor(muted).font("Helvetica").fontSize(9)
      .text(
        `Please use your invoice number ${data.invoiceNumber} as your payment reference so we can match your payment quickly.`,
        50, y, { width: W }
      );

    y += 26;
    doc.rect(50, y, W, 0.5).fill("#e8e0d4");
    y += 14;

    // ── FOOTER ──
    doc.fillColor(muted).font("Helvetica").fontSize(9).text(
      "Thank you for booking with Woman of Taste. For queries contact us at info@womanoftaste.co.za",
      50, y, { width: W, align: "center" }
    );

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}
