import nodemailer from "nodemailer";

const SMTP_HOST = "smtppro.zoho.com";
const SMTP_PORT = 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const DOMAIN = "https://womanoftaste.co.za";

const allUrls = [
  // Core pages
  { section: "Core Pages", url: "/", priority: "1.0 — Homepage" },
  { section: "Core Pages", url: "/about", priority: "0.8" },
  { section: "Core Pages", url: "/contact", priority: "0.6" },
  { section: "Core Pages", url: "/partnerships", priority: "0.7" },
  // Events
  { section: "Events", url: "/events", priority: "0.95" },
  { section: "Events", url: "/events/johannesburg", priority: "0.92" },
  { section: "Events", url: "/events/cape-town", priority: "0.85" },
  { section: "Events", url: "/events/pretoria", priority: "0.85" },
  { section: "Events", url: "/events/devil-wears-prada-screening-apr-2026", priority: "0.95" },
  { section: "Events", url: "/events/high-tea-buitengeluk-jun-2026", priority: "0.85" },
  { section: "Events", url: "/events/womans-month-aug-2026", priority: "0.85" },
  { section: "Events", url: "/events/spring-bloom-sep-2026", priority: "0.85" },
  { section: "Events", url: "/events/december-braai-farmhouse58-dec-2026", priority: "0.85" },
  // Experiences
  { section: "Experiences", url: "/experiences/lifestyle", priority: "0.9" },
  { section: "Experiences", url: "/experiences/private-dining", priority: "0.85" },
  { section: "Experiences", url: "/experiences/wine-tasting", priority: "0.85" },
  { section: "Experiences", url: "/experiences/networking", priority: "0.85" },
  // Explore (Restaurants/Stays/Experiences)
  { section: "Explore — Listing", url: "/restaurants", priority: "0.92 — Explore listing" },
  { section: "Explore — Place Pages", url: "/restaurants/marble-rosebank-johannesburg", priority: "0.88 — Marble (191K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/farmhouse-58-muldersdrift", priority: "0.85 — Farmhouse 58 (167K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/bounce-fourways", priority: "0.85 — BOUNCE (100K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/san-deck-sandton-city", priority: "0.85 — San Deck (91.7K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/egrek-cinema-parkhurst", priority: "0.82 — Egrek Cinema (69.5K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/the-tasting-room-johannesburg", priority: "0.82 — The Tasting Room (44.4K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/northriding-ice-rink", priority: "0.80 — Ice Rink Northriding (39.7K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/chuay-chau-sandton", priority: "0.80 — Chuay Chau (39.4K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/the-test-bakery-braamfontein", priority: "0.78 — The Test Bakery (34K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/nineteen-on-fourth-parkhurst", priority: "0.78 — Nineteen on Fourth (30.2K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/club-como-morningside", priority: "0.78 — Club Como (25.9K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/the-potato-shed-waterfall", priority: "0.75 — The Potato Shed (25.3K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/saint-sandton", priority: "0.75 — SAINT (24.6K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/artistry-sandton", priority: "0.75 — Artistry (21.8K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/ethos-rosebank", priority: "0.75 — ETHOS (21.1K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/the-station-parkhurst", priority: "0.75 — The Station (19.3K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/lupa-osteria-fourways", priority: "0.72 — Lupa Osteria (12.3K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/nomad-fourways", priority: "0.72 — Nomad (12K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/sakhumzi-soweto", priority: "0.72 — Sakhumzi (10.8K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/dos-manos-melville", priority: "0.70 — Dos Manos (10.5K views)" },
  { section: "Explore — Place Pages", url: "/restaurants/life-grand-cafe-waterfall", priority: "0.70 — Life Grand Café (10.5K views)" },
  // Journal
  { section: "Journal", url: "/journal", priority: "0.9 — Journal listing" },
  { section: "Journal Posts", url: "/journal/devil-wears-prada-ii-private-screening-johannesburg", priority: "0.95" },
  { section: "Journal Posts", url: "/journal/things-to-do-this-weekend-johannesburg", priority: "0.88" },
  { section: "Journal Posts", url: "/journal/best-womens-events-south-africa-2026", priority: "0.88" },
  { section: "Journal Posts", url: "/journal/unique-experiences-cape-town-women", priority: "0.85" },
  { section: "Journal Posts", url: "/journal/what-taste-really-means-in-a-noisy-world", priority: "0.85" },
  { section: "Journal Posts", url: "/journal/private-dining-experiences-johannesburg-guide", priority: "0.85" },
  { section: "Journal Posts", url: "/journal/womens-networking-events-that-feel-premium", priority: "0.82" },
  { section: "Journal Posts", url: "/journal/the-modern-elegant-womans-table", priority: "0.82" },
  { section: "Journal Posts", url: "/journal/rise-of-curated-experiences-women-south-africa", priority: "0.80" },
  { section: "Journal Posts", url: "/journal/soft-power-and-the-art-of-presence", priority: "0.80" },
  { section: "Journal Posts", url: "/journal/how-to-choose-lifestyle-event-worth-your-time", priority: "0.78" },
  { section: "Journal Posts", url: "/journal/what-to-wear-premium-womens-event", priority: "0.78" },
  { section: "Journal Posts", url: "/journal/the-restaurant-experience-economy", priority: "0.75" },
  { section: "Journal Posts", url: "/journal/winter-events-johannesburg-2026", priority: "0.78" },
  { section: "Journal Posts", url: "/journal/the-art-of-entering-a-room", priority: "0.75" },
  { section: "Journal Posts", url: "/journal/social-events-women-south-africa-2026", priority: "0.75" },
  { section: "Journal Posts", url: "/journal/curating-the-dining-experience", priority: "0.72" },
];

// Group by section
const sections = {};
for (const item of allUrls) {
  if (!sections[item.section]) sections[item.section] = [];
  sections[item.section].push(item);
}

function buildSectionRows(items) {
  return items.map(item => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #e8e0d4;font-family:monospace;font-size:12px;color:#1a2a5e;">
        <a href="${DOMAIN}${item.url}" style="color:#1a2a5e;text-decoration:none;">${DOMAIN}${item.url}</a>
      </td>
      <td style="padding:6px 12px;border-bottom:1px solid #e8e0d4;font-size:11px;color:#8a7a6a;white-space:nowrap;">${item.priority}</td>
    </tr>`).join("");
}

function buildHtml() {
  const date = new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  const totalUrls = allUrls.length;

  let sectionsHtml = "";
  for (const [sectionName, items] of Object.entries(sections)) {
    sectionsHtml += `
      <tr>
        <td colspan="2" style="padding:14px 12px 6px;background:#f5f0e8;font-family:Georgia,serif;font-size:13px;font-weight:600;color:#8a6a2a;letter-spacing:0.05em;text-transform:uppercase;border-top:2px solid #c9a84c;">
          ${sectionName} (${items.length})
        </td>
      </tr>
      ${buildSectionRows(items)}
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f7f3ec;font-family:Georgia,serif;">
  <div style="max-width:800px;margin:0 auto;background:#fff;border:1px solid #e0d8cc;">

    <!-- Header -->
    <div style="background:#1a2a5e;padding:32px 40px;">
      <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:11px;font-weight:400;color:#c9a84c;letter-spacing:0.15em;text-transform:uppercase;">Woman of Taste</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#f5f0e8;">Site URL Report</h1>
      <p style="margin:8px 0 0;font-family:Helvetica,sans-serif;font-size:12px;color:#9aa8c8;">Generated ${date} · ${totalUrls} URLs · sitemap.xml updated</p>
    </div>

    <!-- Intro -->
    <div style="padding:28px 40px;border-bottom:1px solid #e8e0d4;">
      <p style="margin:0 0 12px;font-size:14px;color:#2a2a2a;line-height:1.6;">
        This is your complete site URL inventory for <strong>womanoftaste.co.za</strong>, current as of ${date}.
        The <code style="font-size:12px;background:#f5f0e8;padding:1px 5px;border-radius:3px;">sitemap.xml</code> has been updated to include all ${totalUrls} URLs below and is live at:
      </p>
      <p style="margin:0 0 16px;">
        <a href="${DOMAIN}/sitemap.xml" style="font-family:monospace;font-size:13px;color:#1a2a5e;font-weight:600;">${DOMAIN}/sitemap.xml</a>
      </p>
      <div style="background:#f0ede5;border-left:3px solid #c9a84c;padding:14px 16px;border-radius:0 4px 4px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1a2a5e;">Next steps for Google indexing:</p>
        <ol style="margin:0;padding-left:18px;font-size:13px;color:#3a3a3a;line-height:1.8;">
          <li>Go to <a href="https://search.google.com/search-console" style="color:#1a2a5e;">Google Search Console</a> → select your property</li>
          <li>Click <strong>Sitemaps</strong> in the left sidebar</li>
          <li>Enter <code style="background:#e8e0d4;padding:1px 4px;border-radius:2px;">sitemap.xml</code> and click <strong>Submit</strong></li>
          <li>Use <strong>URL Inspection</strong> to request indexing for priority pages individually</li>
        </ol>
      </div>
    </div>

    <!-- URL Table -->
    <div style="padding:0 40px 32px;">
      <h2 style="font-family:Georgia,serif;font-size:16px;font-weight:400;color:#1a2a5e;margin:24px 0 12px;">Complete URL List (${totalUrls} pages)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#1a2a5e;">
            <th style="padding:8px 12px;text-align:left;color:#c9a84c;font-family:Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">URL</th>
            <th style="padding:8px 12px;text-align:left;color:#c9a84c;font-family:Helvetica,sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">Priority / Note</th>
          </tr>
        </thead>
        <tbody>
          ${sectionsHtml}
        </tbody>
      </table>
    </div>

    <!-- Sitemap reference -->
    <div style="padding:20px 40px;background:#f5f0e8;border-top:1px solid #e8e0d4;">
      <p style="margin:0;font-size:12px;color:#6a5a4a;line-height:1.6;">
        <strong>Sitemap URL:</strong> <a href="${DOMAIN}/sitemap.xml" style="color:#1a2a5e;">${DOMAIN}/sitemap.xml</a><br>
        <strong>Robots.txt:</strong> <a href="${DOMAIN}/robots.txt" style="color:#1a2a5e;">${DOMAIN}/robots.txt</a> (points to sitemap)<br>
        <strong>New since last update:</strong> 22 Explore pages (1 listing + 21 place pages) added to sitemap on ${date}.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 40px;background:#1a2a5e;">
      <p style="margin:0;font-family:Helvetica,sans-serif;font-size:10px;color:#6a78a8;letter-spacing:0.1em;text-transform:uppercase;">
        Woman of Taste · womanoftaste.co.za · info@womanoftaste.co.za
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function send() {
  const html = buildHtml();

  const info = await transporter.sendMail({
    from: `"Woman of Taste" <${SMTP_USER}>`,
    to: "admin@womanoftaste.co.za",
    subject: `Site URL Report — ${allUrls.length} URLs indexed in sitemap · womanoftaste.co.za`,
    html,
    text: allUrls.map(u => `${DOMAIN}${u.url}`).join("\n"),
  });

  console.log("✓ Email sent:", info.messageId);
  console.log(`  → ${allUrls.length} URLs listed`);
  console.log("  → Delivered to: admin@womanoftaste.co.za");
}

send().catch(e => { console.error("Email failed:", e.message); process.exit(1); });
