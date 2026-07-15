/**
 * Post-build prerender script.
 *
 * Generates a per-route HTML file for every known public route so that AI
 * crawlers, social bots, and search engines receive real page content,
 * correct metadata, and the right canonical URL in the initial HTML response
 * — without a full SSR framework migration.
 *
 * Why this works without React hydration errors:
 *   main.tsx uses createRoot().render(), NOT hydrateRoot(). React therefore
 *   completely replaces the #root contents on client mount, so injecting
 *   static body HTML for crawlers causes zero hydration mismatches.
 *
 * Coverage:
 *   - Static public pages  (13 routes)  — inline content + metadata
 *   - Event detail pages   (7  routes)  — from static events data
 *   - Blog post pages      (n  routes)  — queried from PostgreSQL at build time
 *   - Restaurant pages     (n  routes)  — queried from PostgreSQL at build time
 *   - /blog/* aliases for /journal/*
 *
 * Run via: vite build && node scripts/prerender.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist/public");
const SHELL_PATH = path.join(DIST_DIR, "index.html");

const BASE_URL = "https://womanoftaste.co.za";
const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function esc(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Minimal shared nav/footer wrapper for every prerendered page */
function wrapBody(content) {
  return `<div id="root">
  <header role="banner" style="padding:1rem 1.5rem;background:#1c2a52;display:flex;align-items:center;justify-content:space-between">
    <a href="/" style="color:#f5efe0;font-family:serif;font-size:1.25rem;text-decoration:none">Woman of Taste</a>
    <nav aria-label="Primary" style="display:flex;gap:1.5rem;font-family:sans-serif;font-size:0.8rem">
      <a href="/events" style="color:#c9a84c;text-decoration:none">Events</a>
      <a href="/journal" style="color:#c9a84c;text-decoration:none">Journal</a>
      <a href="/restaurants" style="color:#c9a84c;text-decoration:none">Restaurants</a>
      <a href="/about" style="color:#c9a84c;text-decoration:none">About</a>
    </nav>
  </header>
  <main role="main" style="max-width:56rem;margin:0 auto;padding:3rem 1.5rem">
    ${content}
  </main>
  <footer role="contentinfo" style="padding:2rem 1.5rem;background:#1c2a52;color:#c9a84c;font-family:sans-serif;font-size:0.8rem;text-align:center">
    <p>&copy; 2026 Woman of Taste &mdash; Savory &amp; Soulful &mdash; Johannesburg, South Africa</p>
    <nav aria-label="Footer" style="display:flex;gap:1rem;justify-content:center;margin-top:0.5rem;flex-wrap:wrap">
      <a href="/about" style="color:#c9a84c;text-decoration:none">About</a>
      <a href="/events" style="color:#c9a84c;text-decoration:none">Events</a>
      <a href="/journal" style="color:#c9a84c;text-decoration:none">Journal</a>
      <a href="/restaurants" style="color:#c9a84c;text-decoration:none">Restaurants</a>
      <a href="/partnerships" style="color:#c9a84c;text-decoration:none">Partnerships</a>
      <a href="/contact" style="color:#c9a84c;text-decoration:none">Contact</a>
    </nav>
  </footer>
</div>`;
}

// ---------------------------------------------------------------------------
// Per-page body content generators
// ---------------------------------------------------------------------------

const PAGE_BODIES = {
  "/": () => wrapBody(`
    <h1>Women&rsquo;s Events &amp; Experiences in South Africa | Woman of Taste</h1>
    <p>South Africa&rsquo;s premium curated events and lifestyle experiences for women &mdash; private screenings, high tea, dining &amp; Women&rsquo;s Month celebrations in Johannesburg. Curated by Woman of Taste.</p>
    <p>From intimate private screenings to seasonal gatherings and Women&rsquo;s Month celebrations, Woman of Taste creates premium experiences for women who choose how they live.</p>
    <section aria-labelledby="events-heading">
      <h2 id="events-heading">Upcoming Events</h2>
      <p>Discover our curated calendar of events in Johannesburg, Cape Town, and Pretoria. <a href="/events">View all events</a>.</p>
    </section>
    <section aria-labelledby="journal-heading">
      <h2 id="journal-heading">The WOT Journal</h2>
      <p>Essays on dining culture, feminine elegance, and the art of intentional living. <a href="/journal">Read the Journal</a>.</p>
    </section>`),

  "/about": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; About</nav>
    <h1>About Patience Bwanya | Woman of Taste</h1>
    <p>Meet Patience Bwanya (PashieB), founder of Woman of Taste &mdash; Johannesburg&rsquo;s lifestyle brand for savory dining, feminine elegance &amp; the art of presence.</p>
    <section aria-labelledby="story-heading">
      <h2 id="story-heading">Our Story</h2>
      <p>Woman of Taste is a premium lifestyle and hospitality storytelling platform built on the belief that dining, culture, and intentional living deserve to be celebrated with elegance and depth. Founded by Patience Bwanya (PashieB) in Johannesburg, South Africa.</p>
    </section>
    <section aria-labelledby="values-heading">
      <h2 id="values-heading">Our Values</h2>
      <ul>
        <li><strong>Elegance</strong> &mdash; Elegance is not a dress size or a price tag. It is a posture, a perspective, a quiet confidence that cannot be bought or performed.</li>
        <li><strong>Presence</strong> &mdash; To be fully present is a radical act in a distracted world. We celebrate the woman who inhabits her life completely.</li>
        <li><strong>Culture</strong> &mdash; Food is culture. The table is where stories are passed down, identities affirmed, and communities nourished.</li>
        <li><strong>Intentionality</strong> &mdash; Every choice &mdash; where you eat, how you host, what you consume &mdash; is an act of intention.</li>
        <li><strong>Transformation</strong> &mdash; Like the butterfly, the Woman of Taste philosophy represents the slow, beautiful process of becoming who you are meant to be.</li>
      </ul>
    </section>`),

  "/journal": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; The Journal</nav>
    <h1>The Journal | Woman of Taste</h1>
    <p>Essays, reflections &amp; culture dispatches from Woman of Taste &mdash; dining culture, feminine elegance, the art of presence &amp; curated Johannesburg lifestyle.</p>
    <p>The WOT Journal is where food becomes a story, where dining becomes a philosophy, and where lifestyle becomes a discipline of intention. Read essays and reflections from founder Patience Bwanya (PashieB) and the Woman of Taste editorial voice.</p>`),

  "/blog": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; The Journal</nav>
    <h1>The Journal | Woman of Taste</h1>
    <p>Essays, reflections &amp; culture dispatches from Woman of Taste &mdash; dining culture, feminine elegance, the art of presence &amp; curated Johannesburg lifestyle.</p>
    <p>The WOT Journal is where food becomes a story, where dining becomes a philosophy, and where lifestyle becomes a discipline of intention. Read essays and reflections from founder Patience Bwanya (PashieB) and the Woman of Taste editorial voice.</p>`),

  "/events": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Events</nav>
    <h1>Events | Woman of Taste &mdash; Johannesburg</h1>
    <p>Curated events in Johannesburg &mdash; private screenings, high tea, Women&rsquo;s Month dinners, spring soir&eacute;es &amp; more. Book your seat at a Woman of Taste experience.</p>
    <p>Woman of Taste hosts premium, intimate events for women in South Africa. Each event is thoughtfully designed to bring women together around extraordinary food, culture, and conversation.</p>
    <ul>
      <li><a href="/events/johannesburg">Events in Johannesburg</a></li>
      <li><a href="/events/cape-town">Events in Cape Town</a></li>
      <li><a href="/events/pretoria">Events in Pretoria</a></li>
    </ul>`),

  "/events/johannesburg": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/events">Events</a> &rsaquo; Johannesburg</nav>
    <h1>Women&rsquo;s Events in Johannesburg | Woman of Taste</h1>
    <p>Premium women&rsquo;s events in Johannesburg &mdash; private screenings, intimate dining &amp; seasonal celebrations curated by Woman of Taste.</p>
    <p>Discover curated women&rsquo;s events hosted across Johannesburg&rsquo;s finest venues. From private cinema screenings to high tea at beloved Gauteng destinations, Woman of Taste brings premium experiences to the city. <a href="/events">View all upcoming events</a>.</p>`),

  "/events/cape-town": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/events">Events</a> &rsaquo; Cape Town</nav>
    <h1>Women&rsquo;s Events in Cape Town | Woman of Taste</h1>
    <p>Premium women&rsquo;s events in Cape Town &mdash; private screenings, intimate dining &amp; seasonal celebrations curated by Woman of Taste.</p>
    <p>Woman of Taste brings its curated experience philosophy to Cape Town. Intimate events for women who appreciate premium hospitality, meaningful connection, and the art of the well-lived moment. <a href="/events">View all upcoming events</a>.</p>`),

  "/events/pretoria": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/events">Events</a> &rsaquo; Pretoria</nav>
    <h1>Women&rsquo;s Events in Pretoria | Woman of Taste</h1>
    <p>Premium women&rsquo;s events in Pretoria &mdash; private screenings, intimate dining &amp; seasonal celebrations curated by Woman of Taste.</p>
    <p>Woman of Taste hosts intimate, premium events for women in Pretoria and Tshwane. <a href="/events">View all upcoming events</a>.</p>`),

  "/restaurants": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Restaurants &amp; Experiences</nav>
    <h1>Restaurants, Experiences &amp; Stays | Woman of Taste</h1>
    <p>PashieB&rsquo;s curated guide to restaurants, experiences &amp; stays in Johannesburg &mdash; only places featured on @pashieb_the_wot TikTok. Real places, real insight.</p>
    <p>Every restaurant, experience, and stay in this guide has been personally visited and reviewed by Patience Bwanya (PashieB). This is not a sponsored directory &mdash; it is a curated collection of the places that genuinely deliver on taste, atmosphere, and hospitality.</p>`),

  "/experiences/private-dining": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Experiences &rsaquo; Private Dining</nav>
    <h1>Private Dining Experiences South Africa | Woman of Taste</h1>
    <p>Exclusive private dining experiences in South Africa &mdash; chef-led evenings &amp; intimate dining journeys in Johannesburg, curated by Woman of Taste.</p>
    <p>Private dining is at the heart of what Woman of Taste does. These exclusive, intimate evenings bring a select group of women together around exceptional food, masterful service, and the kind of conversation that only happens when the setting is right. <a href="/events">Book an upcoming experience</a>.</p>`),

  "/experiences/wine-tasting": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Experiences &rsaquo; Wine Tasting</nav>
    <h1>Wine Tasting Events South Africa | Woman of Taste</h1>
    <p>Curated wine tasting events for women in South Africa &mdash; intimate evenings, expert-guided tastings &amp; food pairings at premium Johannesburg venues.</p>
    <p>Woman of Taste wine tasting experiences are designed for women who want to understand wine as a language &mdash; not just taste it. Expert-guided evenings at premium venues, with thoughtful pairings and genuine learning in a social, elegant atmosphere. <a href="/events">View upcoming wine events</a>.</p>`),

  "/experiences/networking": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Experiences &rsaquo; Networking</nav>
    <h1>Women&rsquo;s Networking Events South Africa | Woman of Taste</h1>
    <p>Premium women&rsquo;s networking events in South Africa &mdash; intimate gatherings, keynote speakers &amp; community evenings for women who lead, build &amp; inspire.</p>
    <p>Woman of Taste networking events are not your typical professional mixers. These are carefully curated evenings that bring together women from across industries &mdash; founders, executives, creatives, and community builders &mdash; in settings designed for genuine connection. <a href="/events">View upcoming networking events</a>.</p>`),

  "/experiences/lifestyle": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Experiences &rsaquo; Lifestyle</nav>
    <h1>Lifestyle Experiences South Africa | Woman of Taste</h1>
    <p>Curated lifestyle experiences for women in South Africa &mdash; private dining, wine evenings, seasonal celebrations &amp; community gatherings in Johannesburg.</p>
    <p>Lifestyle experiences at Woman of Taste cover the full range of the well-lived life &mdash; seasonal celebrations that mark the turning of the year, gathering events that honour community, and special evenings that combine food, beauty, and the joy of being fully present. <a href="/events">Explore upcoming lifestyle events</a>.</p>`),

  "/partnerships": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Partnerships</nav>
    <h1>Curated Experience Partnerships | Woman of Taste</h1>
    <p>Partner with Woman of Taste to market your restaurant, stay or event to women who spend intentionally. SEO, social strategy &amp; customer analytics.</p>
    <section aria-labelledby="partner-heading">
      <h2 id="partner-heading">The Savory &amp; Soulful Strategy</h2>
      <p>Woman of Taste partners with restaurants, hospitality venues, and lifestyle brands that want to connect authentically with South Africa&rsquo;s premium women&rsquo;s market. Our audience is curated, engaged, and makes deliberate spending decisions.</p>
      <p>Partnership offerings include digital storytelling, restaurant visibility campaigns, guest experience consulting, and branded event hosting through DineXP and Okiru.</p>
    </section>
    <section aria-labelledby="dinexp-heading">
      <h2 id="dinexp-heading">Woman of Taste &times; DineXP</h2>
      <p>In partnership with DineXP, Woman of Taste offers restaurants a complete growth toolkit: digital reach and storytelling, hospitality standards training, and the DineXP platform for reservations and analytics.</p>
    </section>`),

  "/contact": () => wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; Contact</nav>
    <h1>Contact | Woman of Taste</h1>
    <p>Get in touch with Woman of Taste &mdash; for event enquiries, restaurant partnership opportunities, press, or a simple hello. Based in Johannesburg, South Africa.</p>
    <section aria-labelledby="contact-info-heading">
      <h2 id="contact-info-heading">Get in Touch</h2>
      <address>
        <p>Email: <a href="mailto:info@womanoftaste.co.za">info@womanoftaste.co.za</a></p>
        <p>Location: Johannesburg, Gauteng, South Africa</p>
      </address>
      <p>Follow us on <a href="https://www.instagram.com/pashieb_the_wot" rel="noopener noreferrer">Instagram</a> and <a href="https://www.tiktok.com/@pashieb_the_wot" rel="noopener noreferrer">TikTok</a> @pashieb_the_wot.</p>
    </section>`),
};

function eventBody(ev) {
  return wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/events">Events</a> &rsaquo; ${esc(ev.title)}</nav>
    <h1>${esc(ev.title)} &mdash; ${esc(ev.subtitle)} | Woman of Taste</h1>
    <p>${esc(ev.description)}</p>
    ${ev.date ? `<p><strong>Date:</strong> ${esc(ev.date)}${ev.time ? " &middot; " + esc(ev.time) : ""}</p>` : ""}
    ${ev.location ? `<p><strong>Location:</strong> ${esc(ev.location)}${ev.locationDetail ? " &mdash; " + esc(ev.locationDetail) : ""}</p>` : ""}
    ${ev.price ? `<p><strong>Ticket Price:</strong> R${ev.price} per person</p>` : ""}
    ${ev.dressCode ? `<p><strong>Dress Code:</strong> ${esc(ev.dressCode)}</p>` : ""}
    <section aria-labelledby="event-story-heading">
      <h2 id="event-story-heading">About This Event</h2>
      ${ev.story ? ev.story.split("\n\n").map(p => `<p>${esc(p.replace(/\\n/g, " "))}</p>`).join("\n      ") : ""}
      ${ev.storyAct2 ? ev.storyAct2.split("\n\n").map(p => `<p>${esc(p.replace(/\\n/g, " "))}</p>`).join("\n      ") : ""}
    </section>
    <p><a href="/events">Back to all events</a> | <a href="/contact">Enquire about this event</a></p>`);
}

function journalBody(post) {
  const contentText = post.content
    ? post.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000)
    : "";
  return wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/journal">The Journal</a> &rsaquo; ${esc(post.title)}</nav>
    <article>
      <header>
        <h1>${esc(post.title)}</h1>
        ${post.category ? `<p><em>${esc(post.category)}</em></p>` : ""}
        ${post.date ? `<time>${esc(post.date)}</time>` : ""}
      </header>
      <p>${esc(post.excerpt || "")}</p>
      ${contentText ? `<section>${esc(contentText)}</section>` : ""}
      <p><a href="/journal">Back to The Journal</a></p>
    </article>`);
}

function restaurantBody(place) {
  return wrapBody(`
    <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/restaurants">Restaurants &amp; Experiences</a> &rsaquo; ${esc(place.name)}</nav>
    <article>
      <header>
        <h1>${esc(place.name)} &mdash; ${esc(place.city)} ${esc(place.category)} | Woman of Taste</h1>
        ${place.tagline ? `<p><em>${esc(place.tagline)}</em></p>` : ""}
        <p>${esc(place.neighborhood || place.city)}, South Africa${place.price_range ? " &middot; " + esc(place.price_range) : ""}</p>
      </header>
      <p>${esc(place.excerpt || "")}</p>
      ${place.description ? `<section><p>${esc(place.description)}</p></section>` : ""}
      <p><a href="/restaurants">Back to Restaurants &amp; Experiences</a></p>
    </article>`);
}

// ---------------------------------------------------------------------------
// Static public routes with metadata
// ---------------------------------------------------------------------------

const STATIC_ROUTES = [
  { path: "/", title: "Women's Events & Experiences in South Africa | Woman of Taste", description: "South Africa's premium women's events — private screenings, high tea, dining & Women's Month celebrations in Johannesburg. Curated by Woman of Taste.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/about", title: "About Patience Bwanya | Woman of Taste", description: "Meet Patience Bwanya (PashieB), founder of Woman of Taste — Johannesburg's lifestyle brand for savory dining, feminine elegance & the art of presence.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/journal", title: "The Journal | Woman of Taste", description: "Essays, reflections & culture dispatches from Woman of Taste — dining culture, feminine elegance, the art of presence & curated Johannesburg lifestyle.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/blog", title: "The Journal | Woman of Taste", description: "Essays, reflections & culture dispatches from Woman of Taste — dining culture, feminine elegance, the art of presence & curated Johannesburg lifestyle.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/events", title: "Events | Woman of Taste — Johannesburg", description: "Curated events in Johannesburg — private screenings, high tea, Women's Month dinners, spring soirées & more. Book your seat at a Woman of Taste experience.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/events/johannesburg", title: "Women's Events in Johannesburg | Woman of Taste", description: "Premium women's events in Johannesburg — private screenings, intimate dining & seasonal celebrations curated by Woman of Taste.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/events/cape-town", title: "Women's Events in Cape Town | Woman of Taste", description: "Premium women's events in Cape Town — private screenings, intimate dining & seasonal celebrations curated by Woman of Taste.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/events/pretoria", title: "Women's Events in Pretoria | Woman of Taste", description: "Premium women's events in Pretoria — private screenings, intimate dining & seasonal celebrations curated by Woman of Taste.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/restaurants", title: "Restaurants, Experiences & Stays | Woman of Taste", description: "PashieB's curated guide to restaurants, experiences & stays in Johannesburg — only places featured on @pashieb_the_wot TikTok. Real places, real insight.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/experiences/private-dining", title: "Private Dining Experiences South Africa | Woman of Taste", description: "Exclusive private dining experiences in South Africa — chef-led evenings & intimate dining journeys in Johannesburg, curated by Woman of Taste.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/experiences/wine-tasting", title: "Wine Tasting Events South Africa | Woman of Taste", description: "Curated wine tasting events for women in South Africa — intimate evenings, expert-guided tastings & food pairings at premium Johannesburg venues.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/experiences/networking", title: "Women's Networking Events South Africa | Woman of Taste", description: "Premium women's networking events in South Africa — intimate gatherings, keynote speakers & community evenings for women who lead, build & inspire.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/experiences/lifestyle", title: "Lifestyle Experiences South Africa | Woman of Taste", description: "Curated lifestyle experiences for women in South Africa — private dining, wine evenings, seasonal celebrations & community gatherings in Johannesburg.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/partnerships", title: "Curated Experience Partnerships | Woman of Taste", description: "Partner with Woman of Taste to market your restaurant, stay or event to women who spend intentionally. SEO, social strategy & customer analytics.", ogImage: DEFAULT_OG_IMAGE },
  { path: "/contact", title: "Contact | Woman of Taste", description: "Get in touch with Woman of Taste — for event enquiries, restaurant partnership opportunities, press, or a simple hello. Based in Johannesburg, South Africa.", ogImage: DEFAULT_OG_IMAGE },
];

// ---------------------------------------------------------------------------
// Event data (mirrored from src/data/events.ts — keep in sync)
// ---------------------------------------------------------------------------

const EVENTS = [
  { id: "devil-wears-prada-screening-apr-2026", title: "The Devil Wears Prada II", subtitle: "A Private Screening Evening", date: "1 May 2026", time: "17:30 — Late", location: "Egrek Cinema, Parkhurst", locationDetail: "Venue details shared upon reservation", price: 650, dressCode: "Fashion Editorial — your most compelling look", description: "An exclusive private screening of The Devil Wears Prada sequel — curated for women who understand that style is not just what you wear, but how you live.", story: "She didn't just walk into the room. She changed the temperature of it.\n\nThe Devil Wears Prada defined a generation of women who dared to want more — who understood that ambition and elegance are not opposites, but companions. Now, the sequel arrives. And Woman of Taste is hosting an exclusive private screening for the women who understood that from the very beginning.\n\nThis is not a movie night. This is a declaration.", storyAct2: "Arrive dressed as the editor of your own life. Mingle with women who are building something — brands, careers, legacies, dining tables worth gathering around. Sip bubbly in a setting designed to feel like the opening scene of a film you were always meant to be in." },
  { id: "high-tea-buitengeluk-jun-2026", title: "High Tea at Buitengeluk", subtitle: "A Winter Afternoon in the Country", date: "16 June 2026", time: "17:00 — 20:00", location: "Buitengeluk, Broadacres", locationDetail: "Buitengeluk, Broadacres, Johannesburg", price: 950, dressCode: "Garden elegance — florals, linen, your softest self", description: "An intimate winter high tea at the beloved Buitengeluk in Broadacres, Johannesburg. Think crisp June air, open fires, delicate tiered stands, and the kind of afternoon that stays with you long after the last cup.", story: "There is a specific kind of magic that only winter knows.\n\nWhen Johannesburg exhales its summer heat and the highveld turns gold. When the air sharpens and every warm drink becomes an act of grace." },
  { id: "womans-month-aug-2026", title: "She Who Gathers", subtitle: "A Women's Month Celebration", date: "8 August 2026", time: "17:00 — 21:00", location: "Johannesburg", price: 1100, dressCode: "Power dressing — bold, beautiful, unapologetically you", description: "A powerful, intimate celebration honouring the women who build, lead, and nourish — hosted during Women's Month to gather, reflect, and rise together.", story: "August belongs to women. Not just symbolically — but in every room that fills with purpose, every voice that names what it wants without apology, every table set with intention and care." },
  { id: "spring-bloom-sep-2026", title: "In Full Bloom", subtitle: "A Spring Celebration", date: "13 September 2026", time: "17:00 — Late", location: "Johannesburg", price: 780, dressCode: "Spring florals, pastels, and your brightest self", description: "Spring returns. The jacarandas bloom. And Woman of Taste hosts an outdoor celebration of new beginnings, beauty, and the joy of being fully, seasonally alive.", story: "There is a moment in September when Johannesburg exhales.\n\nThe jacarandas release their purple — slowly at first, then all at once — and the city remembers what it looks like to be in bloom." },
  { id: "december-braai-farmhouse58-dec-2026", title: "The December Braai", subtitle: "A Summer Gathering at Farmhouse 58", date: "6 December 2026", time: "17:00 — Sundown", location: "Farmhouse 58, Johannesburg", locationDetail: "Farmhouse 58, Johannesburg", price: 850, dressCode: "Summer ease — linen, colour, and comfortable shoes", description: "An elevated end-of-year braai at the beautiful Farmhouse 58 — think wood smoke, warm Johannesburg sunshine, long tables, and a community of women celebrating everything the year has held.", story: "There is no better way to close a year than around a fire.\n\nDecember in Johannesburg is something specific — the air thick with heat and the smell of rain just done, the light golden and forgiving, the city finally exhaling." },
  { id: "restaurant-immersion-experience", title: "Restaurant Immersion Experience", subtitle: "A Private Dining Journey", date: "By Invitation Only", location: "Partner Restaurant — Johannesburg", description: "A private dining experience hosted in collaboration with one of our curated restaurant partners. Guests receive a behind-the-scenes perspective on hospitality excellence.", story: "An exclusive look behind the pass at one of Johannesburg's finest establishments." },
  { id: "wot-x-dinexp-sip-and-connect", title: "WOT × DineXP: Sip & Connect", subtitle: "A Community Gathering", date: "By Invitation Only", location: "Rotating Venues — Johannesburg & Cape Town", description: "A quarterly gathering of restaurant owners, hospitality professionals, and the Woman of Taste community around what it means to deliver truly exceptional dining experiences.", story: "An invitation-only evening of conversation and strategy for the hospitality community." },
];

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

async function loadPg() {
  const libDbPath = path.resolve(__dirname, "../../lib/db/node_modules/pg");
  try {
    const require = createRequire(import.meta.url);
    const pg = require(libDbPath);
    return pg.default ?? pg;
  } catch {
    return null;
  }
}

async function fetchBlogPosts(pg) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.warn("[prerender] DATABASE_URL not set — skipping blog routes"); return []; }
  const pool = new pg.Pool({ connectionString: dbUrl });
  try {
    const { rows } = await pool.query(
      `SELECT slug, title, excerpt, content, category, read_time, cover_image_url,
              to_char(published_at, 'DD Month YYYY') AS date
         FROM blog_posts
        WHERE status = 'published' AND slug IS NOT NULL
        ORDER BY published_at DESC`
    );
    return rows;
  } catch (err) {
    console.warn("[prerender] Could not query blog_posts:", err.message);
    return [];
  } finally {
    await pool.end();
  }
}

async function fetchPlaces(pg) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.warn("[prerender] DATABASE_URL not set — skipping restaurant routes"); return []; }
  const pool = new pg.Pool({ connectionString: dbUrl });
  try {
    const { rows } = await pool.query(
      `SELECT slug, name, city, category, excerpt, description, tagline, neighborhood,
              price_range, cover_image
         FROM places
        WHERE status = 'published' AND slug IS NOT NULL`
    );
    return rows;
  } catch (err) {
    console.warn("[prerender] Could not query places:", err.message);
    return [];
  } finally {
    await pool.end();
  }
}

// ---------------------------------------------------------------------------
// HTML injection
// ---------------------------------------------------------------------------

/**
 * Replace the existing shell metadata AND inject crawlable body content into
 * the #root div so that non-JS crawlers receive real page content.
 *
 * Because main.tsx uses createRoot().render() (not hydrateRoot), React will
 * fully replace the #root innerHTML on client mount — no hydration errors.
 */
function buildHtml(shell, { title, description, canonical, ogImage, bodyHtml }) {
  const t = esc(title);
  const d = esc(description);
  const c = esc(canonical);
  const img = esc(ogImage || DEFAULT_OG_IMAGE);

  let html = shell;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${d}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${c}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${t}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${d}" />`);
  html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${img}" />`);
  html = html.replace(/<meta property="og:image:alt" content="[^"]*"\s*\/>/, `<meta property="og:image:alt" content="${esc("Woman of Taste — curated experiences for women in South Africa")}" />`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${t}" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${d}" />`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${img}" />`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${c}" />`);

  // Inject body content into #root (React replaces this on client mount)
  html = html.replace(/<div id="root"><\/div>/, bodyHtml);

  return html;
}

function writeRoute(shell, routePath, title, description, ogImage, bodyHtml) {
  const canonical = `${BASE_URL}${routePath}`;
  const dir = path.join(DIST_DIR, routePath);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, "index.html");
  fs.writeFileSync(out, buildHtml(shell, { title, description, canonical, ogImage, bodyHtml }), "utf-8");
  console.log(`[prerender] ✓ ${routePath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  if (!fs.existsSync(SHELL_PATH)) {
    console.error(`[prerender] Shell not found at ${SHELL_PATH}. Run 'vite build' first.`);
    process.exit(1);
  }

  const shell = fs.readFileSync(SHELL_PATH, "utf-8");
  let total = 0;

  // Static routes
  for (const r of STATIC_ROUTES) {
    const bodyFn = PAGE_BODIES[r.path];
    const body = bodyFn ? bodyFn() : wrapBody(`<h1>${esc(r.title)}</h1><p>${esc(r.description)}</p>`);
    writeRoute(shell, r.path, r.title, r.description, r.ogImage, body);
    total++;
  }

  // Event routes (static data)
  for (const ev of EVENTS) {
    const routePath = `/events/${ev.id}`;
    const title = `${ev.title} — ${ev.subtitle} | Woman of Taste`;
    const description = ev.description;
    writeRoute(shell, routePath, title, description, DEFAULT_OG_IMAGE, eventBody(ev));
    total++;
  }

  // Dynamic routes via DB
  const pg = await loadPg();
  if (pg) {
    const [posts, places] = await Promise.all([fetchBlogPosts(pg), fetchPlaces(pg)]);

    for (const post of posts) {
      const title = `${post.title} | Woman of Taste`;
      const description = post.excerpt || `Read "${post.title}" on the Woman of Taste Journal.`;
      const ogImage = post.cover_image_url || DEFAULT_OG_IMAGE;
      // Write under both /journal/:slug and /blog/:slug
      writeRoute(shell, `/journal/${post.slug}`, title, description, ogImage, journalBody(post));
      writeRoute(shell, `/blog/${post.slug}`, title, description, ogImage, journalBody(post));
      total += 2;
    }

    for (const place of places) {
      const title = `${place.name} — ${place.city} ${place.category} | Woman of Taste`;
      const description = place.excerpt || `Discover ${place.name} on Woman of Taste.`;
      const ogImage = place.cover_image || DEFAULT_OG_IMAGE;
      writeRoute(shell, `/restaurants/${place.slug}`, title, description, ogImage, restaurantBody(place));
      total++;
    }

    console.log(`[prerender] Generated ${total} route HTML files (${posts.length} blog posts, ${places.length} restaurants).`);
  } else {
    console.warn("[prerender] pg not found — blog and restaurant routes skipped.");
    console.log(`[prerender] Generated ${total} route HTML files (static + events only).`);
  }
}

run().catch((err) => {
  console.error("[prerender] Fatal error:", err);
  process.exit(1);
});
