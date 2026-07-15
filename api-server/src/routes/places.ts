import { Router } from "express";
import { eq, desc, ilike, and, or, count } from "drizzle-orm";
import { db } from "@workspace/db";
import { placesTable, activityLogTable } from "@workspace/db/schema";
import OpenAI from "openai";
import { createTransporter } from "../utils/mailer";
import { SEED_PLACES } from "./placeSeedData";
import { requireAdminAuth as authMiddleware } from "../middlewares/adminAuth.js";

const placesPublicRouter = Router();
const placesAdminRouter = Router();


async function autoSeed() {
  try {
    // Clean up renamed or removed slugs
    const renamedSlugs = [
      "chuay-chau-sandton",
      "la-madeleine-pretoria",
      "the-saxon-hotel-sandton",
    ];
    for (const oldSlug of renamedSlugs) {
      try {
        await db.delete(placesTable).where(eq(placesTable.slug, oldSlug));
      } catch {}
    }
    for (const p of SEED_PLACES) {
      try {
        await db.insert(placesTable).values(p as any)
          .onConflictDoUpdate({
            target: placesTable.slug,
            set: {
              name: (p as any).name,
              tagline: (p as any).tagline,
              category: (p as any).category,
              cuisine: (p as any).cuisine,
              neighborhood: (p as any).neighborhood,
              city: (p as any).city,
              address: (p as any).address,
              priceRange: (p as any).priceRange,
              tiktokViews: (p as any).tiktokViews,
              coverImage: (p as any).coverImage,
              excerpt: (p as any).excerpt,
              description: (p as any).description,
              highlights: (p as any).highlights,
              mustTry: (p as any).mustTry,
              vibe: (p as any).vibe,
              perfectFor: (p as any).perfectFor,
              tags: (p as any).tags,
              seoKeywords: (p as any).seoKeywords,
              openingHours: (p as any).openingHours,
              reservations: (p as any).reservations,
              website: (p as any).website,
              instagramHandle: (p as any).instagramHandle,
            },
          });
      } catch (e) {
        console.error("Seed upsert error for", (p as any).slug, e);
      }
    }
    console.log("✓ Places seeded/updated:", SEED_PLACES.length, "entries");
  } catch (e) {
    console.error("Auto-seed failed:", e);
  }
}

autoSeed();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? "placeholder",
});

async function logActivity(actionType: string, description: string) {
  try { await db.insert(activityLogTable).values({ actionType, description, entityType: "place", entityId: "" }); } catch {}
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// GET /api/places — list all published places
placesPublicRouter.get("/places", async (_req, res) => {
  try {
    const results = await db.select().from(placesTable)
      .where(eq(placesTable.status, "published"))
      .orderBy(desc(placesTable.tiktokViews));
    return res.json({ ok: true, places: results });
  } catch (err) {
    console.error("GET /places error", err);
    return res.status(500).json({ ok: false, error: "Failed to fetch places." });
  }
});

// GET /api/places/:slug — single place
placesPublicRouter.get("/places/:slug", async (req, res) => {
  try {
    const [place] = await db.select().from(placesTable)
      .where(and(eq(placesTable.slug, req.params.slug), eq(placesTable.status, "published")));
    if (!place) return res.status(404).json({ ok: false, error: "Not found." });
    return res.json({ ok: true, place });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to fetch place." });
  }
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// GET /api/admin/places — list all places (including drafts)
placesAdminRouter.get("/admin/places", authMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query as Record<string, string>;
    let query = db.select().from(placesTable).$dynamic();
    const conditions: any[] = [];
    if (status && status !== "all") conditions.push(eq(placesTable.status, status));
    if (search) conditions.push(or(ilike(placesTable.name, `%${search}%`), ilike(placesTable.neighborhood, `%${search}%`), ilike(placesTable.category, `%${search}%`)));
    if (conditions.length > 0) query = query.where(and(...conditions));
    const places = await query.orderBy(desc(placesTable.tiktokViews));
    return res.json({ ok: true, places });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to fetch places." });
  }
});

// ─── APPROVAL EMAIL ─────────────────────────────────────────────────────────
async function sendApprovalEmail(place: any) {
  const transporter = createTransporter();
  if (!transporter) return;

  const APPROVAL_TO = "info@womanoftaste.co.za";
  const adminAppUrl = process.env["ADMIN_APP_URL"] ?? "https://admin.womanoftaste.co.za";
  const adminUrl = `${adminAppUrl}/admin/places`;
  const views = place.tiktokViews >= 1000
    ? `${(place.tiktokViews / 1000).toFixed(place.tiktokViews >= 10000 ? 0 : 1)}K`
    : String(place.tiktokViews);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Place Awaiting Approval</title>
</head>
<body style="margin:0;padding:0;background:#f8f6f2;font-family:Georgia,serif;">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:hsl(225,50%,22%);padding:32px 36px 28px;">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:hsl(38,45%,65%);">Woman of Taste</p>
      <h1 style="margin:0;font-size:22px;font-weight:600;color:#fff;line-height:1.3;">New place awaiting<br/>your approval</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px;">
      <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:14px;color:#555;line-height:1.7;">
        A new place has been submitted to the <strong>Explore section</strong> of womanoftaste.co.za.
        It was saved as a <span style="background:#fef3c7;padding:1px 6px;border-radius:4px;font-weight:700;color:#92400e;">draft pending approval</span>
        because it has <strong style="color:hsl(225,50%,22%);">${views} TikTok views</strong> — above the 10K threshold.
      </p>

      <!-- Place card -->
      <div style="background:hsl(40,25%,97%);border:1.5px solid #e8e3d8;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;">${place.category}</p>
        <h2 style="margin:0 0 4px;font-size:20px;color:hsl(225,50%,22%);font-weight:700;">${place.name}</h2>
        <p style="margin:0 0 14px;font-size:13px;color:hsl(38,45%,52%);font-style:italic;">${place.tagline || ""}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:11px;color:#888;padding:4px 0;width:38%;">Location</td>
            <td style="font-family:Arial,sans-serif;font-size:12px;color:#333;padding:4px 0;">${place.neighborhood}${place.neighborhood && place.city ? ", " : ""}${place.city}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:11px;color:#888;padding:4px 0;">TikTok views</td>
            <td style="font-family:Arial,sans-serif;font-size:12px;color:hsl(225,50%,22%);font-weight:700;padding:4px 0;">${views}</td>
          </tr>
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:11px;color:#888;padding:4px 0;">Price range</td>
            <td style="font-family:Arial,sans-serif;font-size:12px;color:#333;padding:4px 0;">${place.priceRange}</td>
          </tr>
        </table>
        ${place.excerpt ? `<p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#555;line-height:1.7;border-top:1px solid #e8e3d8;padding-top:12px;">${place.excerpt}</p>` : ""}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${adminUrl}" style="display:inline-block;background:hsl(38,45%,65%);color:hsl(225,50%,22%);padding:13px 32px;border-radius:99px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.04em;">
          Review &amp; Approve in Admin →
        </a>
      </div>

      <p style="font-family:Arial,sans-serif;font-size:11px;color:#bbb;text-align:center;margin:0;line-height:1.6;">
        Log in to the admin panel, find the place under <strong>Pending</strong> in the Explore Manager, then click <strong>Approve &amp; Publish</strong> to make it live.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8f6f2;padding:18px 36px;border-top:1px solid #e8e3d8;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#bbb;text-align:center;">
        Woman of Taste · womanoftaste.co.za · This is an automated notification.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Woman of Taste" <${process.env["SMTP_USER"]}>`,
      to: APPROVAL_TO,
      subject: `🍽️ New place pending approval: ${place.name} (${views} TikTok views)`,
      html,
    });
    console.log(`[places] Approval email sent for: ${place.name}`);
  } catch (e) {
    console.error("[places] Failed to send approval email:", e);
  }
}

// POST /api/admin/places — create a new place
placesAdminRouter.post("/admin/places", authMiddleware, async (req, res) => {
  try {
    const body = req.body as Record<string, any>;
    if (!body.name?.trim()) return res.status(400).json({ ok: false, error: "Name is required." });

    const slug = body.slug?.trim() || slugify(body.name + (body.neighborhood ? `-${body.neighborhood}` : ""));

    const [existing] = await db.select({ id: placesTable.id }).from(placesTable).where(eq(placesTable.slug, slug));
    if (existing) return res.status(409).json({ ok: false, error: "A place with this slug already exists." });

    const views = Number(body.tiktokViews) || 0;
    // Places with 10K+ TikTok views require approval before going live
    const autoStatus = views >= 10000 ? "pending" : (body.status ?? "published");

    const [created] = await db.insert(placesTable).values({
      slug,
      name: body.name.trim(),
      tagline: body.tagline ?? "",
      category: body.category ?? "Restaurant",
      cuisine: body.cuisine ?? "",
      neighborhood: body.neighborhood ?? "",
      city: body.city ?? "Johannesburg",
      address: body.address ?? "",
      priceRange: body.priceRange ?? "RR",
      tiktokViews: views,
      tiktokUrl: body.tiktokUrl ?? "https://www.tiktok.com/@pashieb_the_wot",
      coverImage: body.coverImage ?? "",
      excerpt: body.excerpt ?? "",
      description: body.description ?? "",
      highlights: body.highlights ?? [],
      mustTry: body.mustTry ?? [],
      vibe: body.vibe ?? "",
      perfectFor: body.perfectFor ?? [],
      tags: body.tags ?? [],
      openingHours: body.openingHours ?? "",
      reservations: body.reservations ?? false,
      website: body.website ?? "",
      instagramHandle: body.instagramHandle ?? "",
      seoKeywords: body.seoKeywords ?? [],
      status: autoStatus,
      featured: body.featured ?? false,
      datePosted: body.datePosted ?? new Date().toISOString().slice(0, 10),
    }).returning();

    await logActivity("place_created", `New place created: ${created.name} (${created.category}, status: ${autoStatus})`);

    // Fire approval email in background (don't block the response)
    if (autoStatus === "pending") {
      sendApprovalEmail(created).catch(() => {});
    }

    return res.json({ ok: true, place: created, pendingApproval: autoStatus === "pending" });
  } catch (err: any) {
    console.error("POST /admin/places error", err);
    return res.status(500).json({ ok: false, error: err?.message ?? "Failed to create place." });
  }
});

// PUT /api/admin/places/:id — update place
placesAdminRouter.put("/admin/places/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body as Record<string, any>;
    const updates: Record<string, any> = { updatedAt: new Date() };
    const allowed = ["name","tagline","category","cuisine","neighborhood","city","address","priceRange","tiktokViews","tiktokUrl","coverImage","excerpt","description","highlights","mustTry","vibe","perfectFor","tags","openingHours","reservations","website","instagramHandle","seoKeywords","status","featured","datePosted","slug"];

    const fieldMap: Record<string, string> = {
      priceRange: "priceRange",
      tiktokViews: "tiktokViews",
      tiktokUrl: "tiktokUrl",
      coverImage: "coverImage",
      openingHours: "openingHours",
      instagramHandle: "instagramHandle",
      seoKeywords: "seoKeywords",
      perfectFor: "perfectFor",
      mustTry: "mustTry",
      datePosted: "datePosted",
    };

    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const [updated] = await db.update(placesTable).set(updates).where(eq(placesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ ok: false, error: "Place not found." });
    await logActivity("place_updated", `Place updated: ${updated.name}`);
    return res.json({ ok: true, place: updated });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? "Failed to update place." });
  }
});

// POST /api/admin/places/:id/approve — approve a pending place → published
placesAdminRouter.post("/admin/places/:id/approve", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [place] = await db.select().from(placesTable).where(eq(placesTable.id, id));
    if (!place) return res.status(404).json({ ok: false, error: "Place not found." });

    const [approved] = await db.update(placesTable)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(placesTable.id, id))
      .returning();

    await logActivity("place_approved", `Place approved & published: ${approved.name}`);

    // Send a quick confirmation email
    const transporter = createTransporter();
    if (transporter) {
      const views = approved.tiktokViews >= 1000
        ? `${(approved.tiktokViews / 1000).toFixed(approved.tiktokViews >= 10000 ? 0 : 1)}K`
        : String(approved.tiktokViews);
      transporter.sendMail({
        from: `"Woman of Taste" <${process.env["SMTP_USER"]}>`,
        to: "info@womanoftaste.co.za",
        subject: `✅ "${approved.name}" is now live on womanoftaste.co.za`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;">
          <p style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:hsl(38,45%,52%);">Woman of Taste</p>
          <h2 style="color:hsl(225,50%,22%);margin:8px 0 16px;">"${approved.name}" is now live</h2>
          <p style="font-size:14px;color:#555;line-height:1.7;">
            The place was approved and is now publicly visible on the Explore page at
            <a href="https://womanoftaste.co.za/restaurants/${approved.slug}" style="color:hsl(225,50%,22%);">womanoftaste.co.za/restaurants/${approved.slug}</a>.
          </p>
          <p style="font-size:13px;color:#888;">TikTok views: <strong>${views}</strong> · Category: ${approved.category}</p>
        </div>`,
      }).catch(() => {});
    }

    return res.json({ ok: true, place: approved });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? "Failed to approve place." });
  }
});

// GET /api/admin/places/pending-count — quick badge count
placesAdminRouter.get("/admin/places/pending-count", authMiddleware, async (req, res) => {
  try {
    const [row] = await db.select({ c: count() }).from(placesTable).where(eq(placesTable.status, "pending"));
    return res.json({ ok: true, count: row?.c ?? 0 });
  } catch {
    return res.json({ ok: true, count: 0 });
  }
});

// DELETE /api/admin/places/:id
placesAdminRouter.delete("/admin/places/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [deleted] = await db.delete(placesTable).where(eq(placesTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ ok: false, error: "Not found." });
    await logActivity("place_deleted", `Place deleted: ${deleted.name}`);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to delete." });
  }
});

// ─── AI CONTENT GENERATION ───────────────────────────────────────────────────

// POST /api/admin/places/generate — AI-generate SEO content for a new place
placesAdminRouter.post("/admin/places/generate", authMiddleware, async (req, res) => {
  const { name, category, cuisine, neighborhood, city, tiktokViews, tiktokUrl, priceRange, notes } =
    req.body as Record<string, any>;

  if (!name?.trim()) return res.status(400).json({ ok: false, error: "Name is required." });

  const WOT_CONTEXT = `Woman of Taste (WOT) is a premium South African lifestyle brand founded by Patience Bwanya (PashieB, @pashieb_the_wot on TikTok/Instagram). The brand voice is warm, sophisticated, feminine, editorial, and unapologetically elevated. Think Condé Nast Traveller meets a Black women-led African luxury brand.

The WOT "Explore" section features restaurants, experiences and stays that PashieB has personally visited and posted on TikTok with 10,000+ views. Content is framed as INSIGHT not formal reviews — honest, specific, helpful. No star ratings. Never use the word "review". Write for a discerning South African woman who eats, travels and experiences with intention.`;

  const prompt = `${WOT_CONTEXT}

Generate SEO-rich insight content for this place PashieB has featured on TikTok:

Name: ${name}
Category: ${category || "Restaurant"}
Cuisine/Type: ${cuisine || "Contemporary"}
Neighborhood: ${neighborhood || "Johannesburg"}
City: ${city || "Johannesburg"}
Price Range: ${priceRange || "RR"} (R=Budget, RR=Mid-range, RRR=Upscale, RRRR=Fine Dining)
TikTok Views: ${tiktokViews ? `${Math.round(Number(tiktokViews) / 1000)}K views` : "10K+ views"}
${notes ? `Additional context from PashieB: ${notes}` : ""}

Return ONLY a valid JSON object with these exact fields:
{
  "tagline": "One-line description with view count (max 12 words)",
  "excerpt": "2-3 sentence hook, mentions TikTok views, sets up the insight (100-130 words)",
  "description": "4 paragraphs of rich SEO-optimised insight text. Each paragraph ~80-100 words. Paragraph 1: introduce the place and why it resonated on TikTok. Paragraph 2: what to expect when you walk in. Paragraph 3: what makes it distinctive. Paragraph 4: who it's for and why it's worth going. Never use the word 'review'. Use South African context naturally.",
  "highlights": ["4 specific bullet points, each starting with the TikTok view count or a specific fact", "...", "...", "..."],
  "mustTry": [
    {"name": "Specific dish or experience name", "note": "Why this specific thing, what it delivers"},
    {"name": "...", "note": "..."},
    {"name": "...", "note": "..."}
  ],
  "vibe": "One-sentence description of the atmosphere and who will love it",
  "perfectFor": ["Use case 1", "Use case 2", "Use case 3", "Use case 4"],
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "seoKeywords": ["keyword phrase 1", "keyword phrase 2", "keyword phrase 3", "keyword phrase 4", "keyword phrase 5"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let content: Record<string, any>;
    try { content = JSON.parse(raw); } catch { return res.status(500).json({ ok: false, error: "AI returned invalid JSON." }); }

    return res.json({ ok: true, content });
  } catch (err: any) {
    console.error("AI places generate error:", err?.message);
    return res.status(500).json({ ok: false, error: err?.message ?? "AI generation failed." });
  }
});

export { placesPublicRouter, placesAdminRouter };
