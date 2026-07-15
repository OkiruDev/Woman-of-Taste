import OpenAI from "openai";
import { createTransporter } from "./mailer.js";

const WOT_CONTEXT = `Woman of Taste (WOT) is a premium South African lifestyle, dining and hospitality brand founded by Patience Bwanya (PashieB). The brand celebrates refined dining, intentional living, curated events, elegant storytelling, and hospitality excellence — with a focus on Black women's luxury and empowerment in South Africa. The voice is warm, sophisticated, editorial, and unapologetically elevated. PashieB posts as @pashieb_the_wot on both TikTok and Instagram.`;

const TIKTOK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#c9a96e"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>`;

const INSTA_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;

const DIVIDER = `<div style="margin:28px 0;text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="240" height="20" viewBox="0 0 240 20"><line x1="0" y1="10" x2="90" y2="10" stroke="#c9a96e" stroke-width="0.8" opacity="0.6"/><circle cx="100" cy="10" r="2.5" fill="#c9a96e" opacity="0.7"/><circle cx="120" cy="10" r="3.5" fill="#c9a96e"/><circle cx="140" cy="10" r="2.5" fill="#c9a96e" opacity="0.7"/><line x1="150" y1="10" x2="240" y2="10" stroke="#c9a96e" stroke-width="0.8" opacity="0.6"/></svg></div>`;

interface PostIdea {
  hook: string;
  concept: string;
  caption: string;
  hashtags: string;
}

interface SocialSuggestions {
  tiktok: PostIdea[];
  instagram: PostIdea[];
}

async function generateSocialIdeas(monthLabel: string): Promise<SocialSuggestions> {
  const openai = new OpenAI({
    baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
    apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
  });

  const prompt = `${WOT_CONTEXT}

Today is ${monthLabel}. Generate social media post ideas for this month in South Africa.

Return ONLY a valid JSON object in this exact format with no markdown, no extra text:
{
  "tiktok": [
    { "hook": "...", "concept": "...", "caption": "...", "hashtags": "..." },
    { "hook": "...", "concept": "...", "caption": "...", "hashtags": "..." },
    { "hook": "...", "concept": "...", "caption": "...", "hashtags": "..." }
  ],
  "instagram": [
    { "hook": "...", "concept": "...", "caption": "...", "hashtags": "..." },
    { "hook": "...", "concept": "...", "caption": "...", "hashtags": "..." },
    { "hook": "...", "concept": "...", "caption": "...", "hashtags": "..." }
  ]
}

Rules:
- "hook": A punchy opening line to stop the scroll (under 12 words).
- "concept": One sentence describing the video/photo concept (what to film/shoot).
- "caption": 2–3 sentences of WOT-voice caption copy, ready to post. Warm, elevated, editorial tone.
- "hashtags": 5–8 relevant hashtags including #WomanOfTaste #PashieB and South African tags.
- TikTok ideas: Video-first — think talking head, GRWM dining, restaurant walk-throughs, "things a woman of taste would never…" formats, aesthetic tablescape reveals. Short, punchy, trend-aware.
- Instagram ideas: Elevated visuals — think flat lays, restaurant portraits, behind-the-scenes elegance, lifestyle carousels, quote graphics. More polished, editorial.
- Tie at least one post per platform to a South African cultural moment, season, or trending conversation in ${monthLabel}.
- Keep it genuinely helpful and specific — PashieB should be able to execute these TODAY.`;

  const resp = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    max_tokens: 1400,
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  return JSON.parse(cleaned) as SocialSuggestions;
}

function postCard(idea: PostIdea, index: number, icon: string): string {
  return `
    <div style="background:#ffffff;border:1px solid #e8e0d0;border-left:3px solid #c9a96e;border-radius:6px;padding:18px 20px;margin-bottom:14px;">
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="flex-shrink:0;margin-top:1px;">${icon}</span>
        <div style="width:100%;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#c9a96e;">Post ${index + 1}</p>
          <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#1e2d5c;line-height:1.35;">🎬 ${idea.hook}</p>
          <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;color:#8c7355;font-style:italic;line-height:1.55;padding:6px 10px;background:#fdf8f0;border-radius:4px;">📸 ${idea.concept}</p>
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12.5px;color:#3d3024;line-height:1.65;">${idea.caption}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11.5px;color:#a07840;">${idea.hashtags}</p>
        </div>
      </div>
    </div>`;
}

function buildSocialReminderEmail(monthLabel: string, suggestions: SocialSuggestions): string {
  const tiktokCards = suggestions.tiktok.map((t, i) => postCard(t, i, TIKTOK_ICON)).join("");
  const instaCards = suggestions.instagram.map((t, i) => postCard(t, i, INSTA_ICON)).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WOT Social Media Reminder</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,sans-serif;">

  <div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(30,45,92,0.10);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,hsl(225,50%,22%) 0%,hsl(225,42%,18%) 100%);padding:36px 40px 28px;text-align:center;">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;">Woman of Taste</p>
      <h1 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;font-weight:400;color:#f5f0e8;letter-spacing:0.02em;">Your Monthly Social Reminder</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:rgba(245,240,232,0.65);">${monthLabel}</p>
    </div>

    <!-- Greeting -->
    <div style="padding:32px 40px 0;">
      <p style="font-family:'Georgia',serif;font-size:17px;color:#1e2d5c;font-style:italic;line-height:1.6;margin:0 0 8px;">
        "Consistency is the signature of a woman who knows her worth."
      </p>
      <p style="font-family:Arial,sans-serif;font-size:13.5px;color:#5a4a38;line-height:1.7;margin:0 0 4px;">
        Hi Patience 👋
      </p>
      <p style="font-family:Arial,sans-serif;font-size:13.5px;color:#5a4a38;line-height:1.7;margin:0;">
        This is your monthly nudge to show up on TikTok and Instagram for the WOT community. Below are ready-to-execute post ideas curated for <strong>${monthLabel}</strong>. At least one post per platform this month — you've got this. 🦋
      </p>
    </div>

    <!-- Platform pills -->
    <div style="padding:18px 40px 0;display:flex;gap:10px;flex-wrap:wrap;">
      <a href="https://tiktok.com/@pashieb_the_wot" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#1e2d5c;color:#f5f0e8;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:8px 16px;border-radius:50px;">
        ${TIKTOK_ICON} &nbsp;@pashieb_the_wot
      </a>
      <a href="https://instagram.com/pashieb_the_wot" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:transparent;color:#1e2d5c;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:8px 16px;border-radius:50px;border:1.5px solid #1e2d5c;">
        ${INSTA_ICON} &nbsp;@pashieb_the_wot
      </a>
    </div>

    ${DIVIDER}

    <!-- TikTok -->
    <div style="padding:0 40px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
        ${TIKTOK_ICON}
        <h2 style="margin:0;font-family:'Georgia',serif;font-size:18px;font-weight:600;color:#1e2d5c;">TikTok Ideas</h2>
      </div>
      <p style="font-family:Arial,sans-serif;font-size:12.5px;color:#8c7355;margin:0 0 18px;line-height:1.6;">
        Scroll-stopping video concepts for @pashieb_the_wot — trend-aware and ready to film.
      </p>
      ${tiktokCards}
    </div>

    ${DIVIDER}

    <!-- Instagram -->
    <div style="padding:0 40px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
        ${INSTA_ICON}
        <h2 style="margin:0;font-family:'Georgia',serif;font-size:18px;font-weight:600;color:#1e2d5c;">Instagram Ideas</h2>
      </div>
      <p style="font-family:Arial,sans-serif;font-size:12.5px;color:#8c7355;margin:0 0 18px;line-height:1.6;">
        Elevated, editorial content ideas for your Instagram grid and stories.
      </p>
      ${instaCards}
    </div>

    ${DIVIDER}

    <!-- Tips -->
    <div style="padding:0 40px 10px;">
      <div style="background:#fdf8f0;border-radius:8px;padding:20px 22px;">
        <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#a07840;">Quick Reminders</p>
        <ul style="margin:0;padding:0 0 0 18px;font-family:Arial,sans-serif;font-size:12.5px;color:#5a4a38;line-height:2;">
          <li>Aim for <strong>at least 1 post per platform</strong> this month to maintain visibility.</li>
          <li>Reuse content across platforms — film once, adapt for both TikTok and Reels.</li>
          <li>Use the <strong>Social Media Generator</strong> in your admin panel to draft more captions instantly.</li>
          <li>Stories and Reels get 3× the reach of static posts — prioritise video content. 🎥</li>
          <li>Your community is always watching. Show up as the woman of taste you are. 💛</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:hsl(225,50%,22%);padding:24px 40px;margin-top:32px;text-align:center;">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#c9a96e;">Woman of Taste</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:10.5px;color:rgba(245,240,232,0.5);">
        Savory &amp; Soulful · womanoftaste.co.za<br>
        This reminder is sent on the 1st of every month to keep you consistent on social media.
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function sendMonthlySocialReminder(): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[social-reminder] SMTP not configured, skipping.");
    return;
  }

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
  const to = "info@womanoftaste.co.za";
  const cc = "admin@womanoftaste.co.za";

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-ZA", {
    year: "numeric", month: "long",
    timeZone: "Africa/Johannesburg",
  });

  console.log(`[social-reminder] Generating social ideas for ${monthLabel}…`);

  let suggestions: SocialSuggestions;
  try {
    suggestions = await generateSocialIdeas(monthLabel);
  } catch (err) {
    console.error("[social-reminder] AI generation failed:", err);
    suggestions = {
      tiktok: [
        {
          hook: "Things a Woman of Taste would never do at a restaurant…",
          concept: "Talking-head video listing dining etiquette red flags with elegant humour — film at a beautifully set table.",
          caption: "Because taste is in the details, darling. 🍷 We know what we want, how we want it, and we never settle for less at the table — or in life. What's your dining non-negotiable?",
          hashtags: "#WomanOfTaste #PashieB #DiningEtiquette #SouthAfricanCreator #LuxuryLifestyle #BlackGirlMagic #WOT",
        },
        {
          hook: "Watch me transform a simple dinner into a whole experience…",
          concept: "Aesthetic tablescape set-up time-lapse — beautiful linens, candles, flowers, and a styled plate reveal at the end.",
          caption: "A woman of taste doesn't just eat — she creates an atmosphere. ✨ Every meal is an occasion. This is how we do it at WOT. #TableGoals",
          hashtags: "#WomanOfTaste #PashieB #TablescapeGoals #DiningAesthetic #SouthAfrica #LuxuryDining #WOT",
        },
        {
          hook: "I visited the most underrated restaurant in Johannesburg…",
          concept: "Restaurant walk-through vlog — entrance, ambience, dish reveal, honest reaction. Film vertically with lifestyle B-roll.",
          caption: "Not all gems have Michelin stars — sometimes the best dining in Joburg is hiding in plain sight. Full review is on the blog. 🔗",
          hashtags: "#WomanOfTaste #PashieB #JoburgEats #SouthAfricanFoodie #RestaurantReview #JoziLife #WOT",
        },
      ],
      instagram: [
        {
          hook: "The table is set. Are you ready?",
          concept: "Overhead flat lay of an elegantly styled dinner table — navy linen, gold cutlery, candles, a single rose. Warm editorial lighting.",
          caption: "Every gathering begins with intention. At Woman of Taste, we believe the table is sacred — a place where stories are shared, bonds are deepened, and life is savoured. When last did you truly set the table for yourself? ✨",
          hashtags: "#WomanOfTaste #PashieB #TableSetting #DiningInStyle #SouthAfricanBlogger #LuxuryLifestyle #WOT",
        },
        {
          hook: "She dines with purpose.",
          concept: "Portrait shot — Patience seated at a beautifully styled restaurant or home table, looking elegant and confident. Natural light preferred.",
          caption: "A woman of taste knows that dining is never just about the food. It's the conversation, the ambience, the intention you bring to the table. This month, I'm committing to more moments that nourish the soul. 🍷 What nourishes yours?",
          hashtags: "#WomanOfTaste #PashieB #BlackWomenLuxury #SouthAfricanLifestyle #DineWithStyle #WOT #Intentionalliving",
        },
        {
          hook: "The WOT guide to dining in South Africa this month.",
          concept: "Carousel post — 5 slides featuring curated restaurant recommendations, each with a styled food photo and brief review text overlay in WOT brand colours.",
          caption: "Your monthly curated dining edit from Woman of Taste 🦋 Five spots that embody the WOT standard — beautiful food, exceptional service, memorable atmosphere. Save this for your next dinner plans. Which one are you visiting first?",
          hashtags: "#WomanOfTaste #PashieB #SouthAfricanFoodie #JoburgEats #CapeEats #DiningGuide #WOT",
        },
      ],
    };
    console.warn("[social-reminder] Using fallback ideas due to AI failure.");
  }

  const html = buildSocialReminderEmail(monthLabel, suggestions);

  try {
    await transporter.sendMail({
      from: `"Woman of Taste" <${smtpUser}>`,
      to,
      cc,
      subject: `📱 Your WOT Social Media Reminder — ${monthLabel}`,
      html,
    });
    console.log(`[social-reminder] Monthly social reminder sent to ${to} (cc: ${cc})`);
  } catch (err) {
    console.error("[social-reminder] Failed to send reminder email:", err);
  }
}
