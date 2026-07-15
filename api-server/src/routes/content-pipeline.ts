import { Router } from "express";
import OpenAI from "openai";
import { db } from "@workspace/db";
import { blogPostsTable, emailCampaignsTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import { requireAdminAuth as authMiddleware } from "../middlewares/adminAuth.js";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? "placeholder",
});

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) + "-" + Date.now();
}

function weekMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

const ANIMATED_DIVIDER = `<div style="text-align:center;margin:2.5rem 0;"><svg xmlns="http://www.w3.org/2000/svg" width="300" height="32" viewBox="0 0 300 32"><style>@keyframes wotFade{0%,100%{opacity:.45}50%{opacity:1}}.d1{animation:wotFade 2.8s ease-in-out infinite}.d2{animation:wotFade 2.8s ease-in-out infinite .5s}.d3{animation:wotFade 2.8s ease-in-out infinite 1s}</style><line x1="0" y1="16" x2="108" y2="16" stroke="#c9a96e" stroke-width="0.9" class="d1"/><path d="M116 16 L123 9 L130 16 L123 23 Z" fill="none" stroke="#c9a96e" stroke-width="1.2" class="d2"/><circle cx="150" cy="16" r="4.5" fill="#c9a96e" class="d3"/><path d="M170 16 L177 9 L184 16 L177 23 Z" fill="none" stroke="#c9a96e" stroke-width="1.2" class="d2"/><line x1="192" y1="16" x2="300" y2="16" stroke="#c9a96e" stroke-width="0.9" class="d1"/></svg></div>`;
const ANIMATED_HEADER_ORNAMENT = `<div style="text-align:center;margin:0 0 2rem;"><svg xmlns="http://www.w3.org/2000/svg" width="180" height="24" viewBox="0 0 180 24"><style>@keyframes wotShimmer{0%,100%{opacity:.5;transform:scaleX(.95)}50%{opacity:1;transform:scaleX(1)}}.sh{animation:wotShimmer 3s ease-in-out infinite;transform-origin:center}</style><g class="sh"><line x1="0" y1="12" x2="60" y2="12" stroke="#c9a96e" stroke-width="0.8"/><polygon points="66,12 72,7 78,12 72,17" fill="none" stroke="#c9a96e" stroke-width="1"/><circle cx="90" cy="12" r="3.5" fill="#c9a96e"/><polygon points="102,12 108,7 114,12 108,17" fill="none" stroke="#c9a96e" stroke-width="1"/><line x1="120" y1="12" x2="180" y2="12" stroke="#c9a96e" stroke-width="0.8"/></g></svg></div>`;

const WOT_BRAND = `Woman of Taste (WOT) is a premium South African lifestyle, dining and hospitality brand founded by Patience Bwanya (@pashieb_the_wot on TikTok & Instagram). Voice: warm, sophisticated, feminine, editorial, intellectually curious — Condé Nast Traveller meets Black women-led African luxury. Never preachy. Always intentional.`;

// ── GET /api/admin/content-direction ─────────────────────────────────────────
router.get("/admin/content-direction", authMiddleware, async (_req, res) => {
  try {
    const rows = await db.execute(sql`SELECT * FROM content_direction WHERE id = 1`);
    const dir = rows.rows[0] ?? {};
    return res.json({ ok: true, direction: dir });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

// ── PATCH /api/admin/content-direction ───────────────────────────────────────
router.patch("/admin/content-direction", authMiddleware, async (req, res) => {
  try {
    const { focusAreas, tiktokThemes, trendingTopics, contentPillars, targetKeywords, locationFocus, seoAudience, notes } = req.body;
    await db.execute(sql`
      INSERT INTO content_direction (id, focus_areas, tiktok_themes, trending_topics, content_pillars, target_keywords, location_focus, seo_audience, notes, updated_at)
      VALUES (1, ${JSON.stringify(focusAreas ?? [])}, ${tiktokThemes ?? ""}, ${trendingTopics ?? ""}, ${JSON.stringify(contentPillars ?? [])}, ${targetKeywords ?? ""}, ${locationFocus ?? "Johannesburg"}, ${seoAudience ?? ""}, ${notes ?? ""}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        focus_areas = EXCLUDED.focus_areas,
        tiktok_themes = EXCLUDED.tiktok_themes,
        trending_topics = EXCLUDED.trending_topics,
        content_pillars = EXCLUDED.content_pillars,
        target_keywords = EXCLUDED.target_keywords,
        location_focus = EXCLUDED.location_focus,
        seo_audience = EXCLUDED.seo_audience,
        notes = EXCLUDED.notes,
        updated_at = NOW()
    `);
    const rows = await db.execute(sql`SELECT * FROM content_direction WHERE id = 1`);
    return res.json({ ok: true, direction: rows.rows[0] });
  } catch (err) {
    console.error("[content-direction PATCH]", err);
    return res.status(500).json({ ok: false, error: "Failed to save direction." });
  }
});

// ── GET /api/admin/content-pipeline/weeks ────────────────────────────────────
router.get("/admin/content-pipeline/weeks", authMiddleware, async (_req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT w.*,
        bp.title AS blog_title, bp.slug AS blog_slug, bp.status AS blog_status, bp.excerpt AS blog_excerpt,
        ec.name AS email_name, ec.subject AS email_subject, ec.status AS email_status
      FROM content_pipeline_weeks w
      LEFT JOIN blog_posts bp ON bp.id = w.blog_post_id
      LEFT JOIN email_campaigns ec ON ec.id = w.email_campaign_id
      ORDER BY w.week_of DESC
    `);
    return res.json({ ok: true, weeks: rows.rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

// ── POST /api/admin/content-pipeline/generate ────────────────────────────────
router.post("/admin/content-pipeline/generate", authMiddleware, async (req, res) => {
  try {
    const dirRows = await db.execute(sql`SELECT * FROM content_direction WHERE id = 1`);
    const dir = dirRows.rows[0] as any ?? {};

    const focusAreas: string[] = dir.focus_areas ?? [];
    const tiktokThemes: string = dir.tiktok_themes ?? "";
    const trendingTopics: string = dir.trending_topics ?? "";
    const pillars: string[] = dir.content_pillars ?? [];
    const location: string = dir.location_focus ?? "Johannesburg";
    const audience: string = dir.seo_audience ?? "affluent South African women aged 28-45";
    const keywords: string = dir.target_keywords ?? "";
    const weekOf = weekMonday();

    // Build direction context
    const dirContext = [
      focusAreas.length ? `Focus areas: ${focusAreas.join(", ")}` : "",
      pillars.length ? `Content pillars: ${pillars.join(", ")}` : "",
      tiktokThemes ? `Patience's current TikTok themes: ${tiktokThemes}` : "",
      trendingTopics ? `Currently trending in SA: ${trendingTopics}` : "",
      keywords ? `SEO keywords to target: ${keywords}` : "",
      `Location focus: ${location}`,
      `Target audience: ${audience}`,
    ].filter(Boolean).join("\n");

    // ── Step 1: Generate blog post ──────────────────────────────────────────
    const blogPrompt = `${WOT_BRAND}

CONTENT DIRECTION:
${dirContext}

Generate a WOT journal blog post that:
1. Targets the focus areas and aligns with Patience's TikTok content style
2. Drives traffic from trending topics while staying on-brand
3. Encourages readers to follow @pashieb_the_wot on TikTok/Instagram
4. Has strong SEO for the ${location} lifestyle and food scene

Requirements:
- Title: editorial, slightly poetic, max 12 words
- Voice: warm, refined, feminine, editorial
- Length: 450–650 words
- HTML: <p>, <h2>, <h3>, <strong>, <em>, <blockquote>, <ul><li>
- Exactly 2 <h2> subheadings
- 1 blockquote pull quote
- Use [ANIMATED_DIVIDER] between major sections
- End with a subtle TikTok/Instagram CTA (natural, not forced)

Return ONLY valid JSON:
{
  "title": "...",
  "excerpt": "compelling 1-2 sentence excerpt",
  "content": "full HTML with [ANIMATED_DIVIDER]",
  "metaTitle": "SEO meta title under 60 chars",
  "metaDescription": "SEO meta description under 155 chars",
  "focusKeyword": "primary keyword",
  "readTime": "X min read",
  "category": "one of: Dining, Lifestyle, Events, Travel, Wellness, Editorial"
}`;

    const blogCompletion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: blogPrompt }],
      temperature: 0.8, max_tokens: 2200,
    });

    let blogRaw = blogCompletion.choices[0]?.message?.content ?? "";
    blogRaw = blogRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const blogData = JSON.parse(blogRaw);
    if (blogData.content) {
      blogData.content = ANIMATED_HEADER_ORNAMENT + blogData.content.replace(/\[ANIMATED_DIVIDER\]/g, ANIMATED_DIVIDER);
    }

    // ── Step 2: Generate email ──────────────────────────────────────────────
    const dividerHtml = `<div style="text-align:center;margin:28px 0;"><svg xmlns='http://www.w3.org/2000/svg' width='260' height='24' viewBox='0 0 260 24'><style>@keyframes wf{0%,100%{opacity:.4}50%{opacity:.9}}.w{animation:wf 3s ease-in-out infinite}</style><line x1='0' y1='12' x2='92' y2='12' stroke='#c9a96e' stroke-width='0.8' class='w'/><path d='M100 12 L107 6 L114 12 L107 18 Z' fill='none' stroke='#c9a96e' stroke-width='1.1' class='w'/><circle cx='130' cy='12' r='4' fill='#c9a96e' class='w'/><path d='M146 12 L153 6 L160 12 L153 18 Z' fill='none' stroke='#c9a96e' stroke-width='1.1' class='w'/><line x1='168' y1='12' x2='260' y2='12' stroke='#c9a96e' stroke-width='0.8' class='w'/></svg></div>`;

    const emailPrompt = `${WOT_BRAND}

CONTENT DIRECTION:
${dirContext}

This week's blog post topic: "${blogData.title}"

Write an engaging WOT email newsletter that:
1. Connects to this week's blog content and invites readers to read the full post
2. Incorporates Patience's TikTok vibe — personal, relatable, aspirational
3. Includes a CTA to follow @pashieb_the_wot on TikTok
4. Feels like a personal note from Patience to her community

Requirements:
- Warm personal greeting (e.g. "Hello beautiful," or "Dear WOT family,")
- 2-3 sections with HTML subheadings
- Body only — no header, footer, unsubscribe link
- Use this animated divider between sections: ${dividerHtml}
- HTML: <p>, <h2>, <h3>, <strong>, <em>, <ul><li>, <a href="">
- 280-400 words
- End with a TikTok follow CTA and reading the new blog post

Return ONLY valid JSON:
{
  "name": "internal campaign name",
  "subject": "compelling subject line",
  "previewText": "inbox preview under 90 chars",
  "body": "full HTML body"
}`;

    const emailCompletion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: emailPrompt }],
      temperature: 0.78, max_tokens: 1800,
    });

    let emailRaw = emailCompletion.choices[0]?.message?.content ?? "";
    emailRaw = emailRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const emailData = JSON.parse(emailRaw);

    // ── Step 3: Save blog as draft ──────────────────────────────────────────
    const slug = slugify(blogData.title ?? "wot-content");
    const [blogPost] = await db.insert(blogPostsTable).values({
      slug, title: blogData.title ?? "Untitled",
      category: blogData.category ?? "Editorial",
      excerpt: blogData.excerpt ?? "",
      content: blogData.content ?? "",
      metaTitle: blogData.metaTitle ?? "",
      metaDescription: blogData.metaDescription ?? "",
      focusKeyword: blogData.focusKeyword ?? "",
      readTime: blogData.readTime ?? "5 min read",
      status: "draft",
    }).returning();

    // ── Step 4: Save email as draft ─────────────────────────────────────────
    const [emailCampaign] = await db.insert(emailCampaignsTable).values({
      name: emailData.name ?? "WOT Weekly",
      subject: emailData.subject ?? "This week from Woman of Taste",
      previewText: emailData.previewText ?? "",
      body: emailData.body ?? "",
      recipientType: "all",
      status: "draft",
    }).returning();

    // ── Step 5: Create pipeline week entry ──────────────────────────────────
    const weekRows = await db.execute(sql`
      INSERT INTO content_pipeline_weeks (week_of, blog_post_id, email_campaign_id, status, blog_topic, email_topic, seo_keyword)
      VALUES (${weekOf}, ${blogPost.id}, ${emailCampaign.id}, 'pending_approval', ${blogData.title}, ${emailData.subject}, ${blogData.focusKeyword ?? ""})
      RETURNING *
    `);
    const week = weekRows.rows[0];

    return res.json({
      ok: true, week,
      blogTitle: blogData.title, emailSubject: emailData.subject,
      blogPostId: blogPost.id, emailCampaignId: emailCampaign.id,
    });
  } catch (err) {
    console.error("[content-pipeline generate]", err);
    return res.status(500).json({ ok: false, error: "AI generation failed. Please try again." });
  }
});

// ── PATCH /api/admin/content-pipeline/:id/approve ────────────────────────────
router.patch("/admin/content-pipeline/:id/approve", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await db.execute(sql`SELECT * FROM content_pipeline_weeks WHERE id = ${id}`);
    const week = rows.rows[0] as any;
    if (!week) return res.status(404).json({ ok: false, error: "Not found." });

    // Publish the blog post
    if (week.blog_post_id) {
      await db.execute(sql`UPDATE blog_posts SET status = 'published', published_at = NOW(), updated_at = NOW() WHERE id = ${week.blog_post_id}`);
    }

    // Mark pipeline week as approved
    await db.execute(sql`UPDATE content_pipeline_weeks SET status = 'approved', approved_at = NOW() WHERE id = ${id}`);

    return res.json({ ok: true, message: "Blog published. Email is ready to send in Drafts." });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to approve." });
  }
});

// ── PATCH /api/admin/content-pipeline/:id/reject ─────────────────────────────
router.patch("/admin/content-pipeline/:id/reject", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { notes } = req.body;
    await db.execute(sql`UPDATE content_pipeline_weeks SET status = 'rejected', notes = ${notes ?? null} WHERE id = ${id}`);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

// ── POST /api/admin/seo/suggestions ──────────────────────────────────────────
router.post("/admin/seo/suggestions", authMiddleware, async (req, res) => {
  try {
    const { customContext } = req.body;
    const dirRows = await db.execute(sql`SELECT * FROM content_direction WHERE id = 1`);
    const dir = dirRows.rows[0] as any ?? {};

    const focusAreas: string[] = dir.focus_areas ?? [];
    const trendingTopics: string = dir.trending_topics ?? "";
    const tiktokThemes: string = dir.tiktok_themes ?? "";
    const pillars: string[] = dir.content_pillars ?? [];
    const location: string = dir.location_focus ?? "Johannesburg";
    const audience: string = dir.seo_audience ?? "affluent South African women aged 28-45";
    const keywords: string = dir.target_keywords ?? "";

    const prompt = `${WOT_BRAND}

SEO CONTEXT:
- Focus areas: ${focusAreas.join(", ") || "lifestyle, dining, events"}
- Content pillars: ${pillars.join(", ") || "lifestyle, food, events"}
- Trending in SA: ${trendingTopics || "not specified"}
- Patience's TikTok themes: ${tiktokThemes || "not specified"}
- Location: ${location}
- Target audience: ${audience}
- Keywords to target: ${keywords || "none specified"}
${customContext ? `\nAdditional context from owner: ${customContext}` : ""}

Generate 7 SEO blog topic suggestions that:
1. Target high-intent searches relevant to WOT's audience in ${location}
2. Align with trending topics (movies, events, food culture, women's lifestyle)
3. Connect naturally to Patience's TikTok content to drive cross-platform traffic
4. Balance trending relevance with evergreen WOT brand topics

Also identify 4 quick SEO wins (specific, actionable).

Return ONLY valid JSON:
{
  "suggestions": [
    {
      "title": "Blog post title idea",
      "keyword": "primary SEO keyword",
      "trendReason": "why this will drive traffic right now (1-2 sentences)",
      "tiktokAngle": "how this connects to TikTok content strategy",
      "difficulty": "easy|medium|hard",
      "category": "Dining|Lifestyle|Events|Travel|Wellness|Editorial"
    }
  ],
  "quickWins": [
    "specific actionable SEO improvement"
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75, max_tokens: 1800,
    });

    let raw = completion.choices[0]?.message?.content ?? "";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(raw);
    return res.json({ ok: true, ...parsed });
  } catch (err) {
    console.error("[seo/suggestions]", err);
    return res.status(500).json({ ok: false, error: "AI generation failed." });
  }
});

// ── POST /api/admin/seo/create-draft ─────────────────────────────────────────
router.post("/admin/seo/create-draft", authMiddleware, async (req, res) => {
  try {
    const { title, keyword, category, trendReason } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: "Title required." });

    const prompt = `${WOT_BRAND}

Write a WOT journal blog post targeting this SEO opportunity:
Topic: "${title}"
Primary keyword: "${keyword}"
Category: ${category ?? "Editorial"}
Context: ${trendReason ?? ""}

Requirements:
- Title: editorial, poetic, max 12 words (can refine the provided topic)
- Voice: warm, sophisticated, feminine, editorial
- Length: 450–650 words
- HTML: <p>, <h2>, <h3>, <strong>, <em>, <blockquote>, <ul><li>
- Exactly 2 <h2> subheadings
- 1 blockquote pull quote
- Use [ANIMATED_DIVIDER] between major sections
- Natural TikTok/Instagram CTA at the end

Return ONLY valid JSON:
{
  "title": "...",
  "excerpt": "compelling 1-2 sentence excerpt",
  "content": "full HTML with [ANIMATED_DIVIDER]",
  "metaTitle": "SEO meta title under 60 chars",
  "metaDescription": "SEO meta description under 155 chars",
  "focusKeyword": "primary keyword",
  "readTime": "X min read"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.78, max_tokens: 2000,
    });

    let raw = completion.choices[0]?.message?.content ?? "";
    raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const blogData = JSON.parse(raw);
    if (blogData.content) {
      blogData.content = ANIMATED_HEADER_ORNAMENT + blogData.content.replace(/\[ANIMATED_DIVIDER\]/g, ANIMATED_DIVIDER);
    }

    const slug = slugify(blogData.title ?? title);
    const [blogPost] = await db.insert(blogPostsTable).values({
      slug, title: blogData.title ?? title,
      category: category ?? "Editorial",
      excerpt: blogData.excerpt ?? "",
      content: blogData.content ?? "",
      metaTitle: blogData.metaTitle ?? "",
      metaDescription: blogData.metaDescription ?? "",
      focusKeyword: blogData.focusKeyword ?? keyword ?? "",
      readTime: blogData.readTime ?? "5 min read",
      status: "draft",
    }).returning();

    return res.json({ ok: true, blogPostId: blogPost.id, title: blogPost.title });
  } catch (err) {
    console.error("[seo/create-draft]", err);
    return res.status(500).json({ ok: false, error: "Draft creation failed." });
  }
});

export default router;
