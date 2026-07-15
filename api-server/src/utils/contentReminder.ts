import OpenAI from "openai";
import { createTransporter } from "./mailer.js";

const WOT_CONTEXT = `Woman of Taste (WOT) is a premium South African lifestyle, dining and hospitality brand founded by Patience Bwanya (PashieB). The brand celebrates refined dining, intentional living, curated events, elegant storytelling, and hospitality excellence — with a focus on Black women's luxury and empowerment in South Africa. The voice is warm, sophisticated, editorial, and unapologetically elevated.`;

const BLOG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
const NEWS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
const DIVIDER = `<div style="margin:28px 0;text-align:center;"><svg xmlns="http://www.w3.org/2000/svg" width="240" height="20" viewBox="0 0 240 20"><line x1="0" y1="10" x2="90" y2="10" stroke="#c9a96e" stroke-width="0.8" opacity="0.6"/><circle cx="100" cy="10" r="2.5" fill="#c9a96e" opacity="0.7"/><circle cx="120" cy="10" r="3.5" fill="#c9a96e"/><circle cx="140" cy="10" r="2.5" fill="#c9a96e" opacity="0.7"/><line x1="150" y1="10" x2="240" y2="10" stroke="#c9a96e" stroke-width="0.8" opacity="0.6"/></svg></div>`;

interface TopicSuggestion {
  title: string;
  angle: string;
  why: string;
}

interface ContentSuggestions {
  blogTopics: TopicSuggestion[];
  newsletterTopics: TopicSuggestion[];
}

async function generateTopics(weekLabel: string): Promise<ContentSuggestions> {
  const openai = new OpenAI({
    baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
    apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
  });

  const currentMonth = new Date().toLocaleString("en-ZA", { month: "long", year: "numeric", timeZone: "Africa/Johannesburg" });

  const prompt = `${WOT_CONTEXT}

Today is ${weekLabel}. Generate content topic suggestions for ${currentMonth} in South Africa.

Return ONLY a valid JSON object in this exact format with no markdown, no extra text:
{
  "blogTopics": [
    { "title": "...", "angle": "...", "why": "..." },
    { "title": "...", "angle": "...", "why": "..." },
    { "title": "...", "angle": "...", "why": "..." },
    { "title": "...", "angle": "...", "why": "..." },
    { "title": "...", "angle": "...", "why": "..." }
  ],
  "newsletterTopics": [
    { "title": "...", "angle": "...", "why": "..." },
    { "title": "...", "angle": "...", "why": "..." },
    { "title": "...", "angle": "...", "why": "..." }
  ]
}

Rules:
- Blog topics (5): Long-form journal article ideas. Mix of: dining culture, women's lifestyle, South African travel/food scenes, hospitality experiences, season/month-relevant lifestyle themes, trending social conversations in Mzansi.
- Newsletter topics (3): Short campaign ideas perfect for a subscriber email — can be event announcements, curated reading lists, recipe/dining recommendations, or timely "women of taste" cultural moments.
- "angle": One sentence on the unique WOT perspective on this topic.
- "why": One sentence explaining why this topic is relevant/trending in South Africa RIGHT NOW in ${currentMonth}.
- Keep all suggestions grounded in South African culture, seasons, and current cultural conversations. Reference specific places, trends, or conversations happening in Mzansi when relevant.
- Vary the categories: include at least one fine dining, one lifestyle/women empowerment, one local travel/exploration, one culture/arts topic.`;

  const resp = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.82,
    max_tokens: 1200,
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  // Strip any markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  return JSON.parse(cleaned) as ContentSuggestions;
}

function topicCard(t: TopicSuggestion, index: number, icon: string): string {
  return `
    <div style="background:#ffffff;border:1px solid #e8e0d0;border-left:3px solid #c9a96e;border-radius:6px;padding:18px 20px;margin-bottom:14px;">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:8px;">
        <span style="flex-shrink:0;margin-top:1px;">${icon}</span>
        <div>
          <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#1e2d5c;line-height:1.35;">${index + 1}. ${t.title}</p>
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:12px;color:#8c7355;font-style:italic;line-height:1.5;">${t.angle}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11.5px;color:#6b5c45;background:#fdf8f0;border-radius:4px;padding:6px 10px;line-height:1.55;">
            <strong style="color:#a07840;">Why now:</strong> ${t.why}
          </p>
        </div>
      </div>
    </div>`;
}

function buildReminderEmail(weekLabel: string, suggestions: ContentSuggestions): string {
  const blogCards = suggestions.blogTopics.map((t, i) => topicCard(t, i, BLOG_ICON)).join("");
  const newsCards = suggestions.newsletterTopics.map((t, i) => topicCard(t, i, NEWS_ICON)).join("");

  const appUrl = process.env["ADMIN_APP_URL"] ?? "https://admin.womanoftaste.co.za";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WOT Content Reminder</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,sans-serif;">

  <div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(30,45,92,0.10);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,hsl(225,50%,22%) 0%,hsl(225,42%,18%) 100%);padding:36px 40px 28px;text-align:center;">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;">Woman of Taste</p>
      <h1 style="margin:0 0 8px;font-family:'Georgia',serif;font-size:24px;font-weight:400;color:#f5f0e8;letter-spacing:0.02em;">Your Weekly Content Reminder</h1>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:rgba(245,240,232,0.65);">${weekLabel}</p>
    </div>

    <!-- Greeting -->
    <div style="padding:32px 40px 0;">
      <p style="font-family:'Georgia',serif;font-size:17px;color:#1e2d5c;font-style:italic;line-height:1.6;margin:0 0 8px;">
        "A woman of taste never misses a moment to share her story."
      </p>
      <p style="font-family:Arial,sans-serif;font-size:13.5px;color:#5a4a38;line-height:1.7;margin:0 0 4px;">
        Hi Patience 👋
      </p>
      <p style="font-family:Arial,sans-serif;font-size:13.5px;color:#5a4a38;line-height:1.7;margin:0;">
        Here are this week's content suggestions — tailored to what's trending and culturally relevant in South Africa right now. Pick what speaks to you and bring the WOT voice to it. ✨
      </p>
    </div>

    ${DIVIDER}

    <!-- Blog Topics -->
    <div style="padding:0 40px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
        ${BLOG_ICON}
        <h2 style="margin:0;font-family:'Georgia',serif;font-size:18px;font-weight:600;color:#1e2d5c;">Blog Post Ideas</h2>
      </div>
      <p style="font-family:Arial,sans-serif;font-size:12.5px;color:#8c7355;margin:0 0 18px;line-height:1.6;">
        These are topics that would make beautiful long-form journal pieces for the WOT audience.
      </p>
      ${blogCards}

      <div style="text-align:center;margin:24px 0 8px;">
        <a href="${appUrl}/admin/blog/generate"
          style="display:inline-block;background:#1e2d5c;color:#f5f0e8;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;padding:13px 28px;border-radius:50px;">
          ✍️ Write a Blog Post
        </a>
      </div>
    </div>

    ${DIVIDER}

    <!-- Newsletter Topics -->
    <div style="padding:0 40px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
        ${NEWS_ICON}
        <h2 style="margin:0;font-family:'Georgia',serif;font-size:18px;font-weight:600;color:#1e2d5c;">Newsletter Campaign Ideas</h2>
      </div>
      <p style="font-family:Arial,sans-serif;font-size:12.5px;color:#8c7355;margin:0 0 18px;line-height:1.6;">
        These are ready-to-send newsletter angles for your subscribers this week.
      </p>
      ${newsCards}

      <div style="text-align:center;margin:24px 0 8px;">
        <a href="${appUrl}/admin/email/generate"
          style="display:inline-block;background:transparent;color:#1e2d5c;text-decoration:none;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;padding:12px 28px;border-radius:50px;border:1.5px solid #1e2d5c;">
          📧 Draft a Newsletter
        </a>
      </div>
    </div>

    ${DIVIDER}

    <!-- Tips row -->
    <div style="padding:0 40px 10px;">
      <div style="background:#fdf8f0;border-radius:8px;padding:20px 22px;">
        <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#a07840;">Quick Reminders</p>
        <ul style="margin:0;padding:0 0 0 18px;font-family:Arial,sans-serif;font-size:12.5px;color:#5a4a38;line-height:2;">
          <li>Aim for <strong>1 blog post</strong> and <strong>1 newsletter</strong> per week to keep your audience engaged.</li>
          <li>Use the AI Blog Generator or Newsletter Generator in your admin panel to draft quickly.</li>
          <li>Cross-post your story to Instagram and TikTok — use the Social Media Generator for captions.</li>
          <li>Your most loyal readers expect to hear from you. Show up consistently. 💛</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:hsl(225,50%,22%);padding:24px 40px;margin-top:32px;text-align:center;">
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#c9a96e;">Woman of Taste</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:10.5px;color:rgba(245,240,232,0.5);">
        Savory &amp; Soulful · womanoftaste.co.za<br>
        This reminder is sent every Monday morning to keep your content calendar on track.
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function sendWeeklyContentReminder(): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[content-reminder] SMTP not configured, skipping.");
    return;
  }

  const smtpUser = process.env["SMTP_USER"] ?? "info@womanoftaste.co.za";
  const to       = "info@womanoftaste.co.za";
  const cc       = "admin@womanoftaste.co.za";

  const now = new Date();
  const weekLabel = now.toLocaleDateString("en-ZA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "Africa/Johannesburg",
  });

  console.log(`[content-reminder] Generating topics for ${weekLabel}…`);

  let suggestions: ContentSuggestions;
  try {
    suggestions = await generateTopics(weekLabel);
  } catch (err) {
    console.error("[content-reminder] AI topic generation failed:", err);
    /* Fall back to a static placeholder set so the email still goes out */
    suggestions = {
      blogTopics: [
        { title: "The Art of the South African Sunday Lunch", angle: "How the SA Sunday table ritual mirrors the WOT ethos of communal, intentional eating.", why: "Winter season makes comfort dining and gathering culture especially resonant right now." },
        { title: "Women Who Dine Alone — and Love It", angle: "A celebration of the solitary dining experience as an act of self-taste.", why: "Solo dining is trending as South African women reclaim leisure time for themselves." },
        { title: "Joburg's Most Underrated Dining Neighbourhoods", angle: "A WOT insider's map of dining streets beyond the usual suspects.", why: "New restaurant openings in Melville and Rosebank are sparking fresh dining conversations." },
        { title: "What Hospitality Excellence Really Means in Africa", angle: "Ubuntu meets fine dining — defining a distinctly African standard of service.", why: "The luxury hospitality conversation in Africa is growing rapidly post-pandemic." },
        { title: "Dressing the Table: The Aesthetics of a WOT Dinner Party", angle: "How intentional table design elevates a gathering from a meal to a memory.", why: "Tablescape aesthetics are dominating lifestyle content across SA social media." },
      ],
      newsletterTopics: [
        { title: "5 Restaurants Worth the Drive This Winter", angle: "A curated road trip dining guide for the colder months.", why: "Winter travel within SA is peaking as people look for cosy destination dining." },
        { title: "The WOT Winter Edit — What We're Reading, Watching, Eating", angle: "A lifestyle roundup newsletter celebrating the season.", why: "Seasonal editorial roundups perform well with engaged lifestyle subscribers." },
        { title: "Reminder: The Next WOT Experience Is Coming", angle: "Build anticipation for the next curated event.", why: "Event teaser emails consistently achieve the highest open rates." },
      ],
    };
    console.warn("[content-reminder] Using fallback topics due to AI failure.");
  }

  const html = buildReminderEmail(weekLabel, suggestions);

  try {
    await transporter.sendMail({
      from:    `"Woman of Taste" <${smtpUser}>`,
      to,
      cc,
      subject: `✨ Your WOT Content Reminder — Week of ${weekLabel}`,
      html,
    });
    console.log(`[content-reminder] Weekly reminder sent to ${to} (cc: ${cc})`);
  } catch (err) {
    console.error("[content-reminder] Failed to send reminder email:", err);
  }
}
