import { Router } from "express";
import { eq, desc, gte, and, sql, count } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  contactsTable, bookingsTable, emailCampaignsTable, emailSendsTable,
  blogPostsTable, activityLogTable, adminSettingsTable,
} from "@workspace/db/schema";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { requireAdminAuth as authMiddleware } from "../middlewares/adminAuth.js";

const statsRouter = Router();

// GET /api/admin/stats — dashboard stats
statsRouter.get("/admin/stats", authMiddleware, async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalContacts] = await db.select({ count: count() }).from(contactsTable);
  const [emailsThisMonth] = await db.select({ count: count() }).from(emailSendsTable)
    .where(gte(emailSendsTable.sentAt, monthStart));
  const [activeBookings] = await db.select({ count: count() }).from(bookingsTable)
    .where(eq(bookingsTable.status, "APPROVED"));
  const [outstandingPayments] = await db.select({ count: count() }).from(bookingsTable)
    .where(and(eq(bookingsTable.status, "APPROVED"), sql`${bookingsTable.paidAt} IS NULL`));
  const [totalPosts] = await db.select({ count: count() }).from(blogPostsTable)
    .where(eq(blogPostsTable.status, "published"));
  const latestBooking = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt)).limit(1);
  const [optedOut] = await db.select({ count: count() }).from(contactsTable).where(eq(contactsTable.optedOut, true));

  return res.json({
    ok: true,
    stats: {
      totalContacts: Number(totalContacts?.count ?? 0),
      emailsThisMonth: Number(emailsThisMonth?.count ?? 0),
      activeBookings: Number(activeBookings?.count ?? 0),
      outstandingPayments: Number(outstandingPayments?.count ?? 0),
      totalPosts: Number(totalPosts?.count ?? 0),
      optedOutContacts: Number(optedOut?.count ?? 0),
      latestBooking: latestBooking[0] ?? null,
    },
  });
});

// GET /api/admin/activity — recent activity feed
statsRouter.get("/admin/activity", authMiddleware, async (_req, res) => {
  const activity = await db.select().from(activityLogTable).orderBy(desc(activityLogTable.createdAt)).limit(20);
  return res.json({ ok: true, activity });
});

// GET /api/admin/settings — all settings
statsRouter.get("/admin/settings", authMiddleware, async (_req, res) => {
  const rows = await db.select().from(adminSettingsTable);
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return res.json({ ok: true, settings });
});

// PATCH /api/admin/settings — update settings
statsRouter.patch("/admin/settings", authMiddleware, async (req, res) => {
  const updates = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    const existing = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, key)).limit(1);
    if (existing.length > 0) {
      await db.update(adminSettingsTable).set({ value: String(value), updatedAt: new Date() }).where(eq(adminSettingsTable.key, key));
    } else {
      await db.insert(adminSettingsTable).values({ key, value: String(value) });
    }
  }
  return res.json({ ok: true });
});

// POST /api/admin/settings/password — change admin password
statsRouter.post("/admin/settings/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminPassword = process.env["ADMIN_PASSWORD"];
  if (currentPassword !== adminPassword) return res.status(401).json({ ok: false, error: "Current password is incorrect." });
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ ok: false, error: "New password must be at least 6 characters." });
  return res.json({ ok: false, error: "To change the password, update the ADMIN_PASSWORD secret in Replit Secrets and restart the server." });
});

// POST /api/admin/settings/test-openai — validate an OpenAI API key
statsRouter.post("/admin/settings/test-openai", authMiddleware, async (req, res) => {
  const { key } = req.body;
  if (!key || typeof key !== "string" || !key.startsWith("sk-")) {
    return res.status(400).json({ ok: false, error: "Key must start with sk-." });
  }
  try {
    const openai = new OpenAI({ apiKey: key, timeout: 8000 });
    const models = await openai.models.list();
    const found = models.data.some(m => m.id.startsWith("gpt-"));
    return res.json({ ok: found, message: found ? "Key is valid and working." : "Key authenticated but no GPT models found." });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    const isAuth = msg.includes("Incorrect API key") || msg.includes("invalid_api_key") || err?.status === 401;
    return res.status(400).json({ ok: false, error: isAuth ? "Invalid API key — check it at platform.openai.com." : `OpenAI error: ${msg}` });
  }
});

// GET /api/admin/analytics/overview — comprehensive growth & financial dashboard
statsRouter.get("/admin/analytics/overview", authMiddleware, async (_req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // ── Audience ──────────────────────────────────────────────────────────────
  const allContacts = await db.select({
    createdAt: contactsTable.createdAt,
    optedOut: contactsTable.optedOut,
    source: contactsTable.source,
    tags: contactsTable.tags,
  }).from(contactsTable);

  const totalContacts = allContacts.length;
  const optedOut = allContacts.filter(c => c.optedOut).length;
  const optedIn = totalContacts - optedOut;
  const newsletterContacts = allContacts.filter(c =>
    c.source === "newsletter" || (c.tags ?? "").includes("newsletter")
  ).length;
  const newThisMonth = allContacts.filter(c => new Date(c.createdAt) >= monthStart).length;

  // Monthly contact growth — last 6 months
  const contactsByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-ZA", { month: "short", year: "2-digit" });
    contactsByMonth[key] = 0;
  }
  for (const c of allContacts) {
    const d = new Date(c.createdAt);
    const key = d.toLocaleString("en-ZA", { month: "short", year: "2-digit" });
    if (key in contactsByMonth) contactsByMonth[key]++;
  }
  const audienceGrowth = Object.entries(contactsByMonth).map(([month, contacts]) => ({ month, contacts }));

  // ── Bookings & Revenue ────────────────────────────────────────────────────
  const allBookings = await db.select({
    status: bookingsTable.status,
    totalAmount: bookingsTable.totalAmount,
    paidAt: bookingsTable.paidAt,
    createdAt: bookingsTable.createdAt,
    eventTitle: bookingsTable.eventTitle,
    quantity: bookingsTable.quantity,
  }).from(bookingsTable);

  const bookingFunnel = {
    total: allBookings.length,
    pending: allBookings.filter(b => b.status === "PENDING").length,
    approved: allBookings.filter(b => b.status === "APPROVED").length,
    paid: allBookings.filter(b => b.status === "PAID").length,
    overdue: allBookings.filter(b => b.status === "OVERDUE").length,
    declined: allBookings.filter(b => b.status === "DECLINED").length,
  };

  const paidBookings = allBookings.filter(b => b.status === "PAID");
  const totalRevenue = paidBookings.reduce((s, b) => s + b.totalAmount, 0);
  const outstandingRevenue = allBookings
    .filter(b => b.status === "APPROVED" || b.status === "OVERDUE")
    .reduce((s, b) => s + b.totalAmount, 0);
  const revenueThisMonth = paidBookings
    .filter(b => b.paidAt && new Date(b.paidAt) >= monthStart)
    .reduce((s, b) => s + b.totalAmount, 0);
  const revenueLastMonth = paidBookings
    .filter(b => b.paidAt && new Date(b.paidAt) >= lastMonthStart && new Date(b.paidAt) < monthStart)
    .reduce((s, b) => s + b.totalAmount, 0);

  // Monthly revenue — last 6 months
  const revenueByMonth: Record<string, { revenue: number; tickets: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-ZA", { month: "short", year: "2-digit" });
    revenueByMonth[key] = { revenue: 0, tickets: 0 };
  }
  for (const b of paidBookings) {
    const d = new Date(b.paidAt ?? b.createdAt);
    const key = d.toLocaleString("en-ZA", { month: "short", year: "2-digit" });
    if (key in revenueByMonth) {
      revenueByMonth[key].revenue += b.totalAmount;
      revenueByMonth[key].tickets += b.quantity;
    }
  }
  const monthlyRevenue = Object.entries(revenueByMonth).map(([month, v]) => ({ month, ...v }));

  // Monthly booking requests — last 6 months
  const bookingsByMonth: Record<string, { requests: number; paid: number; approved: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-ZA", { month: "short", year: "2-digit" });
    bookingsByMonth[key] = { requests: 0, paid: 0, approved: 0 };
  }
  for (const b of allBookings) {
    const d = new Date(b.createdAt);
    const key = d.toLocaleString("en-ZA", { month: "short", year: "2-digit" });
    if (key in bookingsByMonth) {
      bookingsByMonth[key].requests++;
      if (b.status === "PAID") bookingsByMonth[key].paid++;
      if (b.status === "APPROVED" || b.status === "PAID") bookingsByMonth[key].approved++;
    }
  }
  const monthlyBookings = Object.entries(bookingsByMonth).map(([month, v]) => ({ month, ...v }));

  // Contacts last month (for MoM comparison)
  const newLastMonth = allContacts.filter(c => {
    const d = new Date(c.createdAt);
    return d >= lastMonthStart && d < monthStart;
  }).length;

  // Bookings this month vs last month
  const bookingsThisMonth = allBookings.filter(b => new Date(b.createdAt) >= monthStart).length;
  const bookingsLastMonth = allBookings.filter(b => {
    const d = new Date(b.createdAt);
    return d >= lastMonthStart && d < monthStart;
  }).length;

  // Revenue by event
  const eventRevMap: Record<string, { revenue: number; tickets: number; bookings: number }> = {};
  for (const b of paidBookings) {
    if (!eventRevMap[b.eventTitle]) eventRevMap[b.eventTitle] = { revenue: 0, tickets: 0, bookings: 0 };
    eventRevMap[b.eventTitle].revenue += b.totalAmount;
    eventRevMap[b.eventTitle].tickets += b.quantity;
    eventRevMap[b.eventTitle].bookings++;
  }
  const revenueByEvent = Object.entries(eventRevMap)
    .map(([event, v]) => ({ event, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Email ─────────────────────────────────────────────────────────────────
  const campaigns = await db.select({
    recipientsCount: emailCampaignsTable.recipientsCount,
    opensCount: emailCampaignsTable.opensCount,
    clicksCount: emailCampaignsTable.clicksCount,
  }).from(emailCampaignsTable)
    .where(and(eq(emailCampaignsTable.isTemplate, false), eq(emailCampaignsTable.status, "sent")));

  const totalEmailsSent = campaigns.reduce((s, c) => s + c.recipientsCount, 0);
  const totalOpens = campaigns.reduce((s, c) => s + c.opensCount, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicksCount, 0);
  const avgOpenRate = totalEmailsSent > 0 ? Math.round((totalOpens / totalEmailsSent) * 100) : 0;
  const avgClickRate = totalEmailsSent > 0 ? Math.round((totalClicks / totalEmailsSent) * 100) : 0;

  const conversionRate = bookingFunnel.total > 0
    ? Math.round((bookingFunnel.paid / bookingFunnel.total) * 100) : 0;

  return res.json({
    ok: true,
    data: {
      audience: { totalContacts, optedOut, optedIn, newsletterContacts, newThisMonth, newLastMonth, audienceGrowth },
      revenue: { totalRevenue, outstandingRevenue, revenueThisMonth, revenueLastMonth, monthlyRevenue, revenueByEvent },
      bookings: { ...bookingFunnel, conversionRate, bookingsThisMonth, bookingsLastMonth, monthlyBookings },
      email: { totalEmailsSent, avgOpenRate, avgClickRate, campaignCount: campaigns.length },
    },
  });
});

// GET /api/admin/email/stats — email performance
statsRouter.get("/admin/email/stats", authMiddleware, async (_req, res) => {
  const campaigns = await db.select().from(emailCampaignsTable)
    .where(and(eq(emailCampaignsTable.isTemplate, false), eq(emailCampaignsTable.status, "sent")))
    .orderBy(desc(emailCampaignsTable.sentAt));

  const totalSent = campaigns.reduce((s, c) => s + c.recipientsCount, 0);
  const totalOpens = campaigns.reduce((s, c) => s + c.opensCount, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicksCount, 0);
  const totalOptOuts = campaigns.reduce((s, c) => s + c.optOutsCount, 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
  const avgClickRate = totalSent > 0 ? Math.round((totalClicks / totalSent) * 100) : 0;

  const topCampaigns = [...campaigns]
    .sort((a, b) => (b.recipientsCount > 0 ? b.opensCount / b.recipientsCount : 0) - (a.recipientsCount > 0 ? a.opensCount / a.recipientsCount : 0))
    .slice(0, 5);

  return res.json({ ok: true, stats: { totalSent, totalOpens, totalClicks, totalOptOuts, avgOpenRate, avgClickRate, campaigns: topCampaigns } });
});

// GET /api/admin/analytics/insights — AI-generated growth analysis
statsRouter.get("/admin/analytics/insights", authMiddleware, async (_req, res) => {
  // Load targets from settings
  const settingsRows = await db.select().from(adminSettingsTable);
  const settings: Record<string, string> = {};
  for (const row of settingsRows) settings[row.key] = row.value;

  // Gather live analytics data (same as /overview)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const allContacts = await db.select({
    createdAt: contactsTable.createdAt, optedOut: contactsTable.optedOut,
    source: contactsTable.source, tags: contactsTable.tags,
  }).from(contactsTable);

  const allBookings = await db.select({
    status: bookingsTable.status, totalAmount: bookingsTable.totalAmount,
    paidAt: bookingsTable.paidAt, createdAt: bookingsTable.createdAt,
    eventTitle: bookingsTable.eventTitle, quantity: bookingsTable.quantity,
  }).from(bookingsTable);

  const campaigns = await db.select({
    recipientsCount: emailCampaignsTable.recipientsCount,
    opensCount: emailCampaignsTable.opensCount,
    clicksCount: emailCampaignsTable.clicksCount,
  }).from(emailCampaignsTable)
    .where(and(eq(emailCampaignsTable.isTemplate, false), eq(emailCampaignsTable.status, "sent")));

  const paidBookings = allBookings.filter(b => b.status === "PAID");
  const totalRevenue = paidBookings.reduce((s, b) => s + b.totalAmount, 0);
  const outstandingRevenue = allBookings.filter(b => b.status === "APPROVED" || b.status === "OVERDUE").reduce((s, b) => s + b.totalAmount, 0);
  const revenueThisMonth = paidBookings.filter(b => b.paidAt && new Date(b.paidAt) >= monthStart).reduce((s, b) => s + b.totalAmount, 0);
  const revenueLastMonth = paidBookings.filter(b => b.paidAt && new Date(b.paidAt) >= lastMonthStart && new Date(b.paidAt) < monthStart).reduce((s, b) => s + b.totalAmount, 0);
  const newContactsThisMonth = allContacts.filter(c => new Date(c.createdAt) >= monthStart).length;
  const newContactsLastMonth = allContacts.filter(c => new Date(c.createdAt) >= lastMonthStart && new Date(c.createdAt) < monthStart).length;
  const totalEmailsSent = campaigns.reduce((s, c) => s + c.recipientsCount, 0);
  const totalOpens = campaigns.reduce((s, c) => s + c.opensCount, 0);
  const avgOpenRate = totalEmailsSent > 0 ? Math.round((totalOpens / totalEmailsSent) * 100) : 0;
  const conversionRate = allBookings.length > 0 ? Math.round((paidBookings.length / allBookings.length) * 100) : 0;
  const totalTickets = paidBookings.reduce((s, b) => s + b.quantity, 0);

  // Targets from settings
  const targets = {
    monthly_revenue: Number(settings["target_monthly_revenue"] ?? 0),
    monthly_contacts: Number(settings["target_monthly_contacts"] ?? 0),
    monthly_bookings: Number(settings["target_monthly_bookings"] ?? 0),
    email_open_rate: Number(settings["target_email_open_rate"] ?? 0),
    conversion_rate: Number(settings["target_conversion_rate"] ?? 0),
    tiktok_followers: Number(settings["target_tiktok_followers"] ?? 0),
    instagram_followers: Number(settings["target_instagram_followers"] ?? 0),
  };

  // Build analytics context for Claude
  const analyticsContext = `
Woman of Taste — Analytics Snapshot (${now.toLocaleDateString("en-ZA", { month: "long", year: "numeric" })})
Founder: Patience Bwanya (@pashieb_the_wot on TikTok & Instagram)
Business: Premium lifestyle brand — curated events, screenings, networking experiences for women
Location: South Africa

AUDIENCE
- Total contacts on mailing list: ${allContacts.length}
- New contacts this month: ${newContactsThisMonth} (last month: ${newContactsLastMonth})
- Newsletter subscribers: ${allContacts.filter(c => c.source === "newsletter" || (c.tags ?? "").includes("newsletter")).length}
- Opted out: ${allContacts.filter(c => c.optedOut).length}

FINANCIAL PERFORMANCE
- Total revenue collected (all time): R${totalRevenue.toFixed(2)}
- Revenue this month: R${revenueThisMonth.toFixed(2)} (last month: R${revenueLastMonth.toFixed(2)})
- Outstanding (unpaid invoices): R${outstandingRevenue.toFixed(2)}
- Total tickets sold: ${totalTickets}
- Total booking requests: ${allBookings.length} → ${paidBookings.length} paid (${conversionRate}% conversion)
- Pending: ${allBookings.filter(b => b.status === "PENDING").length}, Approved: ${allBookings.filter(b => b.status === "APPROVED").length}, Overdue: ${allBookings.filter(b => b.status === "OVERDUE").length}

EMAIL MARKETING
- Total emails sent: ${totalEmailsSent}
- Average open rate: ${avgOpenRate}% (industry benchmark: ~25%)
- Campaigns sent: ${campaigns.length}

GROWTH TARGETS SET BY FOUNDER
${targets.monthly_revenue > 0 ? `- Monthly revenue target: R${targets.monthly_revenue} (current: R${revenueThisMonth.toFixed(2)}, ${Math.round((revenueThisMonth / targets.monthly_revenue) * 100)}% of target)` : "- Monthly revenue target: not set"}
${targets.monthly_contacts > 0 ? `- Monthly new contacts target: ${targets.monthly_contacts} (current: ${newContactsThisMonth}, ${Math.round((newContactsThisMonth / targets.monthly_contacts) * 100)}% of target)` : "- Monthly new contacts target: not set"}
${targets.monthly_bookings > 0 ? `- Monthly bookings target: ${targets.monthly_bookings} (current month paid: ${paidBookings.filter(b => b.paidAt && new Date(b.paidAt) >= monthStart).length})` : "- Monthly bookings target: not set"}
${targets.email_open_rate > 0 ? `- Email open rate target: ${targets.email_open_rate}% (current: ${avgOpenRate}%)` : "- Email open rate target: not set"}
${targets.conversion_rate > 0 ? `- Booking conversion rate target: ${targets.conversion_rate}% (current: ${conversionRate}%)` : "- Conversion rate target: not set"}
${targets.tiktok_followers > 0 ? `- TikTok follower target: ${targets.tiktok_followers.toLocaleString()}` : "- TikTok follower target: not set"}
${targets.instagram_followers > 0 ? `- Instagram follower target: ${targets.instagram_followers.toLocaleString()}` : "- Instagram follower target: not set"}
`;

  // Build the shared prompt
  const insightPrompt = `You are a sharp business analyst advising Patience Bwanya, founder of Woman of Taste — a premium South African lifestyle brand for women that runs curated events and experiences. She is building her brand primarily on TikTok and Instagram and monetising through ticket sales.

Here is her current analytics data:
${analyticsContext}

Generate a JSON response with this exact structure (no markdown, just raw JSON):
{
  "headline": "One encouraging sentence summarising her business momentum right now",
  "insights": [
    {
      "area": "area name (e.g. Revenue, Audience, Email, Bookings)",
      "status": "good" | "warning" | "opportunity",
      "finding": "specific observation from the data (1-2 sentences)",
      "action": "one specific, practical action she can take this week"
    }
  ],
  "growthSuggestions": [
    {
      "title": "Short suggestion title",
      "description": "2-3 sentences on what to do and why it will work for Woman of Taste specifically",
      "impact": "high" | "medium" | "low",
      "effort": "high" | "medium" | "low"
    }
  ],
  "winThisWeek": "One very specific quick-win action she can take right now to move the needle"
}

Produce exactly 4 insights and 4 growth suggestions. Be specific to her brand, South African context, and the actual numbers. No generic advice. Focus on monetisation and audience growth.

CRITICAL JSON RULES:
- Output ONLY raw JSON with no markdown, no code fences, no backticks
- Every string value must be on a single line — NO newlines, NO line breaks inside strings
- Use only standard JSON characters — no special unicode, no smart quotes
- Keep each string under 200 characters`;

  function cleanJsonResponse(raw: string): string {
    let s = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    const firstBrace = s.indexOf("{");
    const lastBrace = s.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) s = s.slice(firstBrace, lastBrace + 1);
    return s.replace(/\t/g, " ").replace(/\r/g, "").replace(/\n/g, " ");
  }

  // Determine which provider to use
  const openAiKey = settings["openai_api_key"] ?? "";
  const openAiModel = settings["openai_model"] ?? "gpt-5-mini";
  const preferredProvider = settings["ai_provider"] ?? "anthropic";
  const useOpenAI = preferredProvider === "openai" && openAiKey.length > 0;

  try {
    let rawText = "";

    if (useOpenAI) {
      const openai = new OpenAI({ apiKey: openAiKey });
      const completion = await openai.chat.completions.create({
        model: openAiModel,
        max_tokens: 2000,
        messages: [{ role: "user", content: insightPrompt }],
        response_format: { type: "json_object" },
      });
      rawText = completion.choices[0]?.message?.content ?? "";
    } else {
      const anthropic = new Anthropic({
        baseURL: process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"],
        apiKey: process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] ?? "dummy",
      });
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 8192,
        messages: [{ role: "user", content: insightPrompt }],
      });
      rawText = message.content[0]?.type === "text" ? message.content[0].text : "";
    }

    const jsonStr = cleanJsonResponse(rawText);
    const parsed = JSON.parse(jsonStr);
    const providerUsed = useOpenAI ? `openai:${openAiModel}` : "anthropic:claude-haiku-4-5";
    return res.json({ ok: true, insights: parsed, targets, provider: providerUsed });
  } catch (err: any) {
    console.error("[insights] AI error:", err?.message ?? err);
    const isOpenAiKeyError = useOpenAI && (err?.message?.includes("Incorrect API key") || err?.message?.includes("invalid_api_key") || err?.status === 401);
    const errorMsg = isOpenAiKeyError
      ? "Invalid OpenAI API key. Please check your key in Settings → AI Configuration."
      : useOpenAI
        ? `OpenAI error: ${err?.message ?? "Unknown error"}`
        : "Could not generate AI insights. Check that AI_INTEGRATIONS_ANTHROPIC_BASE_URL is set.";
    return res.status(500).json({ ok: false, error: errorMsg });
  }
});

export default statsRouter;
