import { Router } from "express";
import OpenAI from "openai";
import jwt from "jsonwebtoken";

const contentGenRouter = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

function getJwtSecret() {
  return process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "wot-admin-fallback";
}

function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.query?.token;
  if (!token) return res.status(401).json({ ok: false, error: "Unauthorized." });
  try { jwt.verify(token, getJwtSecret()); next(); } catch { return res.status(401).json({ ok: false, error: "Unauthorized." }); }
}

const ANIMATED_DIVIDER = `<div style="text-align:center;margin:2.5rem 0;"><svg xmlns="http://www.w3.org/2000/svg" width="300" height="32" viewBox="0 0 300 32"><style>@keyframes wotFade{0%,100%{opacity:.45}50%{opacity:1}}.d1{animation:wotFade 2.8s ease-in-out infinite}.d2{animation:wotFade 2.8s ease-in-out infinite .5s}.d3{animation:wotFade 2.8s ease-in-out infinite 1s}</style><line x1="0" y1="16" x2="108" y2="16" stroke="#c9a96e" stroke-width="0.9" class="d1"/><path d="M116 16 L123 9 L130 16 L123 23 Z" fill="none" stroke="#c9a96e" stroke-width="1.2" class="d2"/><circle cx="150" cy="16" r="4.5" fill="#c9a96e" class="d3"/><path d="M170 16 L177 9 L184 16 L177 23 Z" fill="none" stroke="#c9a96e" stroke-width="1.2" class="d2"/><line x1="192" y1="16" x2="300" y2="16" stroke="#c9a96e" stroke-width="0.9" class="d1"/></svg></div>`;

const ANIMATED_HEADER_ORNAMENT = `<div style="text-align:center;margin:0 0 2rem;"><svg xmlns="http://www.w3.org/2000/svg" width="180" height="24" viewBox="0 0 180 24"><style>@keyframes wotShimmer{0%,100%{opacity:.5;transform:scaleX(.95)}50%{opacity:1;transform:scaleX(1)}}.sh{animation:wotShimmer 3s ease-in-out infinite;transform-origin:center}</style><g class="sh"><line x1="0" y1="12" x2="60" y2="12" stroke="#c9a96e" stroke-width="0.8"/><polygon points="66,12 72,7 78,12 72,17" fill="none" stroke="#c9a96e" stroke-width="1"/><circle cx="90" cy="12" r="3.5" fill="#c9a96e"/><polygon points="102,12 108,7 114,12 108,17" fill="none" stroke="#c9a96e" stroke-width="1"/><line x1="120" y1="12" x2="180" y2="12" stroke="#c9a96e" stroke-width="0.8"/></g></svg></div>`;

const WOT_BRAND_CONTEXT = `Woman of Taste (WOT) is a premium South African lifestyle, dining and hospitality brand founded by Patience Bwanya (known as PashieB, @pashieb_the_wot on TikTok and Instagram). The brand focuses on refined dining, intentional living, elegant storytelling, curated experiences, and hospitality excellence. The WOT voice is: warm, sophisticated, feminine, editorial, intellectually curious, unapologetically elevated. Think Condé Nast Traveller meets a Black women-led African luxury brand. Never preachy, never basic. Always intentional.`;

// POST /api/admin/generate/blog
contentGenRouter.post("/admin/generate/blog", authMiddleware, async (req, res) => {
  const { topic, category = "Editorial", notes = "" } = req.body as { topic: string; category?: string; notes?: string };
  if (!topic?.trim()) return res.status(400).json({ ok: false, error: "Topic is required." });

  try {
    const prompt = `${WOT_BRAND_CONTEXT}

Write a complete WOT journal blog post for the following topic:
Topic: "${topic}"
Category: ${category}
${notes ? `Additional notes: ${notes}` : ""}

Requirements:
- Title: compelling, editorial, slightly poetic (max 12 words)
- Voice: warm, refined, feminine, editorial (think high-end lifestyle journalism)
- Length: 450–650 words of body content
- Structure: Use HTML tags (<p>, <h2>, <h3>, <strong>, <em>, <blockquote>, <ul><li>)
- Include exactly 2 subheadings (<h2>)
- Include 1 blockquote (a powerful pull quote)
- Include exactly 2 placeholders: [ANIMATED_DIVIDER] between major sections
- South African cultural context where natural
- The excerpt (1–2 sentences) must be compelling enough to stop a scroll

Return ONLY valid JSON (no markdown, no code fences) with these exact fields:
{
  "title": "the post title",
  "excerpt": "compelling one-to-two sentence excerpt",
  "content": "full HTML content with [ANIMATED_DIVIDER] placeholders",
  "metaTitle": "SEO meta title (under 60 chars)",
  "metaDescription": "SEO meta description (under 155 chars)",
  "focusKeyword": "primary SEO keyword",
  "readTime": "X min read"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    let raw = completion.choices[0]?.message?.content ?? "";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(raw);

    // Replace [ANIMATED_DIVIDER] with the actual SVG animated divider
    if (parsed.content) {
      parsed.content = ANIMATED_HEADER_ORNAMENT + parsed.content.replace(/\[ANIMATED_DIVIDER\]/g, ANIMATED_DIVIDER);
    }

    return res.json({ ok: true, post: parsed });
  } catch (err) {
    console.error("[content-gen/blog] Error:", err);
    return res.status(500).json({ ok: false, error: "AI generation failed. Please try again." });
  }
});

// POST /api/admin/generate/newsletter
contentGenRouter.post("/admin/generate/newsletter", authMiddleware, async (req, res) => {
  const { topic, newsletterType = "Newsletter", notes = "" } = req.body as { topic: string; newsletterType?: string; notes?: string };
  if (!topic?.trim()) return res.status(400).json({ ok: false, error: "Topic is required." });

  try {
    const dividerHtml = `<div style="text-align:center;margin:28px 0;"><svg xmlns='http://www.w3.org/2000/svg' width='260' height='24' viewBox='0 0 260 24'><style>@keyframes wf{0%,100%{opacity:.4}50%{opacity:.9}}.w{animation:wf 3s ease-in-out infinite}</style><line x1='0' y1='12' x2='92' y2='12' stroke='#c9a96e' stroke-width='0.8' class='w'/><path d='M100 12 L107 6 L114 12 L107 18 Z' fill='none' stroke='#c9a96e' stroke-width='1.1' class='w'/><circle cx='130' cy='12' r='4' fill='#c9a96e' class='w'/><path d='M146 12 L153 6 L160 12 L153 18 Z' fill='none' stroke='#c9a96e' stroke-width='1.1' class='w'/><line x1='168' y1='12' x2='260' y2='12' stroke='#c9a96e' stroke-width='0.8' class='w'/></svg></div>`;

    const prompt = `${WOT_BRAND_CONTEXT}

Write a complete WOT email newsletter for:
Type: ${newsletterType}
Topic: "${topic}"
${notes ? `Additional notes: ${notes}` : ""}

Requirements:
- Voice: warm, sophisticated, personal letter from PashieB/WOT team
- This is the BODY ONLY — do NOT include an email header banner, footer, unsubscribe link, or signature (those are added automatically)
- Start with a warm personal greeting: e.g. "Dear WOT family," or "Hello beautiful,"
- Include 2–3 content sections with HTML subheadings
- Include a clear call-to-action (CTA) near the end
- Use this animated divider HTML between sections (paste it exactly): ${dividerHtml}
- HTML formatted: <p>, <h2>, <h3>, <strong>, <em>, <ul><li>, <a href="">
- South African context naturally woven in
- 300–500 words

Return ONLY valid JSON (no markdown, no code fences):
{
  "name": "internal campaign name",
  "subject": "compelling email subject line",
  "previewText": "inbox preview text (under 90 chars)",
  "body": "full HTML body content"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    let raw = completion.choices[0]?.message?.content ?? "";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(raw);
    return res.json({ ok: true, campaign: parsed });
  } catch (err) {
    console.error("[content-gen/newsletter] Error:", err);
    return res.status(500).json({ ok: false, error: "AI generation failed. Please try again." });
  }
});

// POST /api/admin/generate/social
contentGenRouter.post("/admin/generate/social", authMiddleware, async (req, res) => {
  const { topic, platform = "both", tone = "aspirational", notes = "" } = req.body as { topic: string; platform?: string; tone?: string; notes?: string };
  if (!topic?.trim()) return res.status(400).json({ ok: false, error: "Topic is required." });

  try {
    const prompt = `${WOT_BRAND_CONTEXT}
PashieB's handles: @pashieb_the_wot (TikTok and Instagram).

Write social media captions for the following:
Topic/Occasion: "${topic}"
Platform: ${platform}
Tone: ${tone}
${notes ? `Additional notes: ${notes}` : ""}

Requirements for Instagram caption:
- Hook in first line (stops the scroll)
- 180–260 words total
- Personal, aspirational, story-driven
- 1–2 emojis per paragraph (not excessive)
- 12–16 hashtags at the end (mix: #WomanOfTaste #PashieB #WOT brand tags + niche + broad South African + lifestyle)
- End with a question or CTA to boost engagement

Requirements for TikTok caption:
- Energy from first word — punchy hook
- 100–150 words
- Conversational, trend-aware, still premium
- 8–12 hashtags (trending + brand + niche)
- CTA (follow, comment, share)

Requirements for Pinterest description (if applicable):
- 80–120 words
- Descriptive, keyword-rich for SEO
- 5–8 hashtags

Return ONLY valid JSON (no markdown, no code fences):
{
  "instagram": "full instagram caption with hashtags",
  "tiktok": "full tiktok caption with hashtags",
  "pinterest": "pinterest description with hashtags"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1500,
    });

    let raw = completion.choices[0]?.message?.content ?? "";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(raw);
    return res.json({ ok: true, posts: parsed });
  } catch (err) {
    console.error("[content-gen/social] Error:", err);
    return res.status(500).json({ ok: false, error: "AI generation failed. Please try again." });
  }
});

export default contentGenRouter;
