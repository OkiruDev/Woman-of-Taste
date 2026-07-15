import { Router } from "express";
import { eq, asc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router = Router();

function getJwtSecret() {
  return process.env["JWT_SECRET"] ?? process.env["SESSION_SECRET"] ?? "wot-admin-fallback";
}
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7) : undefined;
  if (!token) return res.status(401).json({ ok: false, error: "Unauthorized." });
  try { jwt.verify(token, getJwtSecret()); next(); }
  catch { return res.status(401).json({ ok: false, error: "Unauthorized." }); }
}

// ── Event Projects ────────────────────────────────────────────────────────────

// GET /api/admin/event-projects
router.get("/admin/event-projects", authMiddleware, async (_req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT ep.*,
        COUNT(em.id)::int AS milestone_total,
        COUNT(CASE WHEN em.status = 'done' THEN 1 END)::int AS milestone_done,
        COALESCE(SUM(ebi.estimated_amount), 0)::numeric AS budget_estimated,
        COALESCE(SUM(ebi.actual_amount), 0)::numeric AS budget_actual
      FROM event_projects ep
      LEFT JOIN event_milestones em ON em.event_project_id = ep.id
      LEFT JOIN event_budget_items ebi ON ebi.event_project_id = ep.id
      GROUP BY ep.id
      ORDER BY ep.event_date ASC NULLS LAST, ep.created_at DESC
    `);
    return res.json({ ok: true, projects: rows.rows });
  } catch (err) {
    console.error("[event-projects GET]", err);
    return res.status(500).json({ ok: false, error: "Failed to load projects." });
  }
});

// POST /api/admin/event-projects
router.post("/admin/event-projects", authMiddleware, async (req, res) => {
  try {
    const { title, description, eventDate, venue, venueContact, capacity, status, totalBudget, notes } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: "Title required." });
    const [row] = await db.execute(sql`
      INSERT INTO event_projects (title, description, event_date, venue, venue_contact, capacity, status, total_budget, notes)
      VALUES (${title}, ${description ?? null}, ${eventDate ?? null}, ${venue ?? null}, ${venueContact ?? null},
              ${capacity ?? null}, ${status ?? "planning"}, ${totalBudget ?? null}, ${notes ?? null})
      RETURNING *
    `);
    return res.json({ ok: true, project: (row as any) });
  } catch (err) {
    console.error("[event-projects POST]", err);
    return res.status(500).json({ ok: false, error: "Failed to create project." });
  }
});

// GET /api/admin/event-projects/:id
router.get("/admin/event-projects/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await db.execute(sql`SELECT * FROM event_projects WHERE id = ${id}`);
    if (!rows.rows.length) return res.status(404).json({ ok: false, error: "Not found." });
    return res.json({ ok: true, project: rows.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

// PATCH /api/admin/event-projects/:id
router.patch("/admin/event-projects/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, eventDate, venue, venueContact, capacity, status, totalBudget, notes } = req.body;
    await db.execute(sql`
      UPDATE event_projects SET
        title = COALESCE(${title ?? null}, title),
        description = ${description ?? null},
        event_date = ${eventDate ?? null},
        venue = ${venue ?? null},
        venue_contact = ${venueContact ?? null},
        capacity = ${capacity ?? null},
        status = COALESCE(${status ?? null}, status),
        total_budget = ${totalBudget ?? null},
        notes = ${notes ?? null},
        updated_at = NOW()
      WHERE id = ${id}
    `);
    const rows = await db.execute(sql`SELECT * FROM event_projects WHERE id = ${id}`);
    return res.json({ ok: true, project: rows.rows[0] });
  } catch (err) {
    console.error("[event-projects PATCH]", err);
    return res.status(500).json({ ok: false, error: "Failed to update." });
  }
});

// DELETE /api/admin/event-projects/:id
router.delete("/admin/event-projects/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.execute(sql`DELETE FROM event_projects WHERE id = ${id}`);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to delete." });
  }
});

// ── Milestones ────────────────────────────────────────────────────────────────

// GET /api/admin/event-projects/:id/milestones
router.get("/admin/event-projects/:id/milestones", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await db.execute(sql`
      SELECT * FROM event_milestones WHERE event_project_id = ${id} ORDER BY sort_order ASC, due_date ASC NULLS LAST, created_at ASC
    `);
    return res.json({ ok: true, milestones: rows.rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

// POST /api/admin/event-projects/:id/milestones
router.post("/admin/event-projects/:id/milestones", authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { title, description, dueDate, status, sortOrder } = req.body;
    if (!title) return res.status(400).json({ ok: false, error: "Title required." });
    const rows = await db.execute(sql`
      INSERT INTO event_milestones (event_project_id, title, description, due_date, status, sort_order)
      VALUES (${projectId}, ${title}, ${description ?? null}, ${dueDate ?? null}, ${status ?? "pending"}, ${sortOrder ?? 0})
      RETURNING *
    `);
    return res.json({ ok: true, milestone: rows.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to create milestone." });
  }
});

// PATCH /api/admin/event-milestones/:id
router.patch("/admin/event-milestones/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, dueDate, status, sortOrder } = req.body;
    await db.execute(sql`
      UPDATE event_milestones SET
        title = COALESCE(${title ?? null}, title),
        description = ${description !== undefined ? description : sql`description`},
        due_date = ${dueDate !== undefined ? dueDate : sql`due_date`},
        status = COALESCE(${status ?? null}, status),
        sort_order = COALESCE(${sortOrder ?? null}, sort_order),
        updated_at = NOW()
      WHERE id = ${id}
    `);
    const rows = await db.execute(sql`SELECT * FROM event_milestones WHERE id = ${id}`);
    return res.json({ ok: true, milestone: rows.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to update milestone." });
  }
});

// DELETE /api/admin/event-milestones/:id
router.delete("/admin/event-milestones/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.execute(sql`DELETE FROM event_milestones WHERE id = ${id}`);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

// ── Budget Items ──────────────────────────────────────────────────────────────

// GET /api/admin/event-projects/:id/budget
router.get("/admin/event-projects/:id/budget", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rows = await db.execute(sql`
      SELECT * FROM event_budget_items WHERE event_project_id = ${id} ORDER BY category ASC, created_at ASC
    `);
    return res.json({ ok: true, items: rows.rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

// POST /api/admin/event-projects/:id/budget
router.post("/admin/event-projects/:id/budget", authMiddleware, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { category, description, estimatedAmount, actualAmount, paid, notes } = req.body;
    if (!category || !description) return res.status(400).json({ ok: false, error: "Category and description required." });
    const rows = await db.execute(sql`
      INSERT INTO event_budget_items (event_project_id, category, description, estimated_amount, actual_amount, paid, notes)
      VALUES (${projectId}, ${category}, ${description}, ${estimatedAmount ?? 0}, ${actualAmount ?? null}, ${paid ?? false}, ${notes ?? null})
      RETURNING *
    `);
    return res.json({ ok: true, item: rows.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to create budget item." });
  }
});

// PATCH /api/admin/event-budget-items/:id
router.patch("/admin/event-budget-items/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { category, description, estimatedAmount, actualAmount, paid, notes } = req.body;
    await db.execute(sql`
      UPDATE event_budget_items SET
        category = COALESCE(${category ?? null}, category),
        description = COALESCE(${description ?? null}, description),
        estimated_amount = COALESCE(${estimatedAmount ?? null}, estimated_amount),
        actual_amount = ${actualAmount !== undefined ? actualAmount : sql`actual_amount`},
        paid = COALESCE(${paid !== undefined ? paid : null}, paid),
        notes = ${notes !== undefined ? notes : sql`notes`},
        updated_at = NOW()
      WHERE id = ${id}
    `);
    const rows = await db.execute(sql`SELECT * FROM event_budget_items WHERE id = ${id}`);
    return res.json({ ok: true, item: rows.rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to update item." });
  }
});

// DELETE /api/admin/event-budget-items/:id
router.delete("/admin/event-budget-items/:id", authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.execute(sql`DELETE FROM event_budget_items WHERE id = ${id}`);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed." });
  }
});

export default router;
