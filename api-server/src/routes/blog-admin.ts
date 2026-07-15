import { Router } from "express";
import { eq, desc, ilike, and, or } from "drizzle-orm";
import { db } from "@workspace/db";
import { blogPostsTable, blogCategoriesTable, activityLogTable } from "@workspace/db/schema";
import multer from "multer";
import path from "path";
import { requireAdminAuth as authMiddleware } from "../middlewares/adminAuth.js";
import { uploadPublicFile } from "../utils/objectStorage.js";

const blogPublicRouter = Router();
const blogAdminRouter = Router();

async function logActivity(actionType: string, description: string, entityType = "", entityId = "") {
  try { await db.insert(activityLogTable).values({ actionType, description, entityType, entityId }); } catch {}
}

// File upload setup — buffered in memory, then pushed to object storage (see objectStorage.ts)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// POST /api/admin/upload — image upload
blogAdminRouter.post("/admin/upload", authMiddleware, upload.single("image"), async (req: any, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: "No file uploaded." });
  try {
    const ext = path.extname(req.file.originalname);
    const key = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const url = await uploadPublicFile(key, req.file.buffer, req.file.mimetype);
    return res.json({ ok: true, url });
  } catch (err: any) {
    console.error("Blog image upload error:", err);
    return res.status(503).json({ ok: false, error: err?.message ?? "Upload failed." });
  }
});

// GET /api/admin/blog — list posts
blogAdminRouter.get("/admin/blog", authMiddleware, async (req, res) => {
  const { status, search } = req.query as Record<string, string>;
  let query = db.select().from(blogPostsTable).$dynamic();
  const conditions: any[] = [];
  if (status && status !== "all") conditions.push(eq(blogPostsTable.status, status));
  if (search) conditions.push(or(ilike(blogPostsTable.title, `%${search}%`), ilike(blogPostsTable.category, `%${search}%`)));
  if (conditions.length > 0) query = query.where(and(...conditions));
  const posts = await query.orderBy(desc(blogPostsTable.createdAt));
  return res.json({ ok: true, posts });
});

// GET /api/admin/blog/categories — list categories
blogAdminRouter.get("/admin/blog/categories", authMiddleware, async (_req, res) => {
  const cats = await db.select().from(blogCategoriesTable).orderBy(blogCategoriesTable.name);
  return res.json({ ok: true, categories: cats });
});

// GET /api/admin/blog/:id — single post
blogAdminRouter.get("/admin/blog/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  if (!post) return res.status(404).json({ ok: false, error: "Not found." });
  return res.json({ ok: true, post });
});

// POST /api/admin/blog — create post
blogAdminRouter.post("/admin/blog", authMiddleware, async (req, res) => {
  const { title, slug, category, author, excerpt, content, coverImageUrl, readTime,
    metaTitle, metaDescription, focusKeyword, status, featured, publishedAt } = req.body;
  if (!title || !slug) return res.status(400).json({ ok: false, error: "Title and slug required." });

  // Ensure category exists
  if (category) {
    const existing = await db.select().from(blogCategoriesTable).where(eq(blogCategoriesTable.name, category)).limit(1);
    if (existing.length === 0) await db.insert(blogCategoriesTable).values({ name: category });
  }

  const [post] = await db.insert(blogPostsTable).values({
    title, slug, category: category ?? "General",
    author: author ?? "Woman of Taste Editorial",
    excerpt: excerpt ?? "", content: content ?? "",
    coverImageUrl: coverImageUrl ?? "", readTime: readTime ?? "5 min read",
    metaTitle: metaTitle ?? "", metaDescription: metaDescription ?? "", focusKeyword: focusKeyword ?? "",
    status: status ?? "draft", featured: featured ?? false,
    publishedAt: status === "published" ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
  }).returning();

  await logActivity("blog_post_created", `Created post: "${title}"`, "blog_post", String(post.id));
  return res.json({ ok: true, post });
});

// PATCH /api/admin/blog/:id — update post
blogAdminRouter.patch("/admin/blog/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });

  const updates: Record<string, any> = { updatedAt: new Date() };
  const fields = ["title", "slug", "category", "author", "excerpt", "content", "coverImageUrl",
    "readTime", "metaTitle", "metaDescription", "focusKeyword", "status", "featured", "publishedAt"];
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (typeof updates.publishedAt === "string") updates.publishedAt = new Date(updates.publishedAt);
  if (req.body.status === "published" && !req.body.publishedAt) {
    const [current] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
    if (!current?.publishedAt) updates.publishedAt = new Date();
  }

  if (updates.category) {
    const existing = await db.select().from(blogCategoriesTable).where(eq(blogCategoriesTable.name, updates.category)).limit(1);
    if (existing.length === 0) await db.insert(blogCategoriesTable).values({ name: updates.category });
  }

  await db.update(blogPostsTable).set(updates).where(eq(blogPostsTable.id, id));
  const [post] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);

  if (req.body.status === "published") {
    await logActivity("blog_post_published", `Published post: "${post?.title}"`, "blog_post", String(id));
  }
  return res.json({ ok: true, post });
});

// DELETE /api/admin/blog/:id — soft delete (archive)
blogAdminRouter.delete("/admin/blog/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ ok: false, error: "Invalid ID." });
  const hard = req.query.hard === "true";
  if (hard) {
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  } else {
    await db.update(blogPostsTable).set({ status: "archived", updatedAt: new Date() }).where(eq(blogPostsTable.id, id));
  }
  await logActivity("blog_post_deleted", `${hard ? "Deleted" : "Archived"} blog post #${id}`, "blog_post", String(id));
  return res.json({ ok: true });
});

// ── Public blog routes ────────────────────────────────────────────────────────

// GET /api/blog — public list (published only)
blogPublicRouter.get("/blog", async (_req, res) => {
  const posts = await db.select({
    id: blogPostsTable.id, slug: blogPostsTable.slug, title: blogPostsTable.title,
    category: blogPostsTable.category, author: blogPostsTable.author,
    excerpt: blogPostsTable.excerpt, coverImageUrl: blogPostsTable.coverImageUrl,
    readTime: blogPostsTable.readTime, featured: blogPostsTable.featured,
    publishedAt: blogPostsTable.publishedAt, createdAt: blogPostsTable.createdAt,
  }).from(blogPostsTable).where(eq(blogPostsTable.status, "published")).orderBy(desc(blogPostsTable.publishedAt));
  return res.json({ ok: true, posts });
});

// GET /api/blog/categories — public categories
blogPublicRouter.get("/blog/categories", async (_req, res) => {
  const cats = await db.select().from(blogCategoriesTable).orderBy(blogCategoriesTable.name);
  return res.json({ ok: true, categories: cats.map(c => c.name) });
});

// GET /api/blog/:slug — single post
blogPublicRouter.get("/blog/:slug", async (req, res) => {
  const [post] = await db.select().from(blogPostsTable)
    .where(and(eq(blogPostsTable.slug, req.params.slug), eq(blogPostsTable.status, "published"))).limit(1);
  if (!post) return res.status(404).json({ ok: false, error: "Post not found." });
  return res.json({ ok: true, post });
});

export { blogPublicRouter, blogAdminRouter };
