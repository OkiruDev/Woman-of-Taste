import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import {
  ArrowLeft, Calendar, MapPin, Users, Edit2, Check, X,
  Plus, Trash2, ChevronDown, ChevronUp, Circle, CheckCircle2,
  Clock, AlertCircle, TrendingUp, DollarSign, Target, Flag
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────
const R = (v: number | string | null) =>
  `R\u202f${Number(v ?? 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function isoDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}
function daysUntil(d: string | null) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  return diff;
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  planning:  { label: "Planning",  bg: "#f0f4ff", color: "hsl(225,50%,30%)" },
  confirmed: { label: "Confirmed", bg: "#dcfce7", color: "#166534" },
  open:      { label: "Open",      bg: "#dbeafe", color: "#1e40af" },
  completed: { label: "Completed", bg: "#f3f4f6", color: "#374151" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
};
const MS_META: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  pending:    { label: "Pending",     color: "#9ca3af", icon: <Circle size={17} /> },
  in_progress:{ label: "In Progress", color: "#3b82f6", icon: <Clock size={17} /> },
  done:       { label: "Done",        color: "#10b981", icon: <CheckCircle2 size={17} /> },
};
const BUDGET_CATEGORIES = [
  "Venue", "Catering", "Marketing", "Printing", "Equipment",
  "Staff", "Transport", "Entertainment", "Décor", "Gifts & Prizes", "Other",
];

const FONT = "Raleway, sans-serif";
const SERIF = "Cormorant Garamond, serif";
const BTN = (bg: string, color = "white", small = false) => ({
  background: bg, color, border: "none", borderRadius: 8,
  padding: small ? "0.42rem 0.85rem" : "0.6rem 1.1rem",
  fontSize: small ? "0.73rem" : "0.8rem", fontWeight: 600 as const,
  cursor: "pointer", display: "flex", alignItems: "center",
  gap: 5, fontFamily: FONT,
});
const INPUT = {
  padding: "0.6rem 0.85rem", border: "1px solid #ddd", borderRadius: 8,
  fontSize: "0.83rem", fontFamily: FONT, outline: "none",
  width: "100%", boxSizing: "border-box" as const,
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Project {
  id: number; title: string; description?: string; event_date?: string;
  venue?: string; venue_contact?: string; capacity?: number; status: string;
  total_budget?: number; notes?: string;
}
interface Milestone {
  id: number; title: string; description?: string; due_date?: string;
  status: string; sort_order: number;
}
interface BudgetItem {
  id: number; category: string; description: string;
  estimated_amount: number; actual_amount?: number; paid: boolean; notes?: string;
}

// ── Tab: Overview ─────────────────────────────────────────────────────────────
function OverviewTab({ project, onSave }: { project: Project; onSave: (p: Partial<Project>) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...project });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ ...project }); }, [project]);

  async function save() {
    setSaving(true);
    await onSave({
      title: form.title, description: form.description, eventDate: form.event_date as any,
      venue: form.venue, venueContact: form.venue_contact, capacity: form.capacity,
      status: form.status, totalBudget: form.total_budget as any, notes: form.notes,
    });
    setSaving(false);
    setEditing(false);
  }

  const days = daysUntil(project.event_date ?? null);
  const sm = STATUS_META[project.status] ?? STATUS_META.planning;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Header card */}
      <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #eee", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            {editing
              ? <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ ...INPUT, fontSize: "1.1rem", fontFamily: SERIF, fontWeight: 600, color: "hsl(225,50%,22%)", maxWidth: 420 }} />
              : <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.5rem", color: "hsl(225,50%,22%)" }}>{project.title}</h2>
            }
            <span style={{ display: "inline-block", marginTop: 8, padding: "3px 12px", borderRadius: 20, background: sm.bg, color: sm.color, fontSize: "0.72rem", fontWeight: 700, fontFamily: FONT, letterSpacing: "0.05em" }}>
              {sm.label}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {editing
              ? <>
                  <button onClick={save} disabled={saving} style={BTN("hsl(225,50%,22%)")}><Check size={14} />{saving ? "Saving…" : "Save"}</button>
                  <button onClick={() => { setEditing(false); setForm({ ...project }); }} style={BTN("#f3f4f6", "#374151")}><X size={14} />Cancel</button>
                </>
              : <button onClick={() => setEditing(true)} style={BTN("#f0f4ff", "hsl(225,50%,30%)")}><Edit2 size={14} />Edit</button>
            }
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {/* Date */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Event Date</label>
            {editing
              ? <input type="date" value={isoDate(form.event_date ?? null)} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} style={INPUT} />
              : <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.85rem", color: "#374151" }}>
                  <Calendar size={14} color="#8b5cf6" />
                  {fmtDate(project.event_date ?? null)}
                  {days !== null && days >= 0 && <span style={{ fontSize: "0.7rem", color: days <= 7 ? "#dc2626" : "#6b7280" }}>({days}d away)</span>}
                  {days !== null && days < 0 && <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>(past)</span>}
                </div>
            }
          </div>
          {/* Venue */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Venue</label>
            {editing
              ? <input value={form.venue ?? ""} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Venue name" style={INPUT} />
              : <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.85rem", color: "#374151" }}><MapPin size={14} color="#8b5cf6" />{project.venue || "—"}</div>
            }
          </div>
          {/* Venue contact */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Venue Contact</label>
            {editing
              ? <input value={form.venue_contact ?? ""} onChange={e => setForm(f => ({ ...f, venue_contact: e.target.value }))} placeholder="Name / phone / email" style={INPUT} />
              : <div style={{ fontFamily: FONT, fontSize: "0.85rem", color: "#374151" }}>{project.venue_contact || "—"}</div>
            }
          </div>
          {/* Capacity */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Capacity</label>
            {editing
              ? <input type="number" value={form.capacity ?? ""} onChange={e => setForm(f => ({ ...f, capacity: e.target.value ? parseInt(e.target.value) : undefined }))} placeholder="Max guests" style={INPUT} />
              : <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.85rem", color: "#374151" }}><Users size={14} color="#8b5cf6" />{project.capacity ?? "—"}</div>
            }
          </div>
          {/* Status */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Status</label>
            {editing
              ? <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={INPUT}>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              : <span style={{ padding: "3px 12px", borderRadius: 20, background: sm.bg, color: sm.color, fontSize: "0.72rem", fontWeight: 700, fontFamily: FONT }}>{sm.label}</span>
            }
          </div>
          {/* Budget */}
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Total Budget</label>
            {editing
              ? <input type="number" value={form.total_budget ?? ""} onChange={e => setForm(f => ({ ...f, total_budget: e.target.value ? parseFloat(e.target.value) : undefined }))} placeholder="0.00" style={INPUT} />
              : <div style={{ fontFamily: FONT, fontSize: "0.85rem", color: "#374151", fontWeight: 600 }}>{project.total_budget ? R(project.total_budget) : "—"}</div>
            }
          </div>
        </div>

        {/* Description */}
        <div style={{ marginTop: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Description</label>
          {editing
            ? <textarea value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Brief event description…" style={{ ...INPUT, resize: "vertical" }} />
            : <div style={{ fontFamily: FONT, fontSize: "0.85rem", color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{project.description || <span style={{ color: "#bbb" }}>No description yet.</span>}</div>
          }
        </div>

        {/* Notes */}
        <div style={{ marginTop: "1rem" }}>
          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Notes & Action Items</label>
          {editing
            ? <textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} placeholder="Internal notes, to-dos, action items…" style={{ ...INPUT, resize: "vertical" }} />
            : <div style={{ fontFamily: FONT, fontSize: "0.85rem", color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "#fafafa", borderRadius: 8, padding: "0.75rem 1rem", border: "1px solid #f0f0f0" }}>{project.notes || <span style={{ color: "#bbb" }}>No notes yet.</span>}</div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Tab: Milestones ───────────────────────────────────────────────────────────
function MilestonesTab({ projectId }: { projectId: number }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [newForm, setNewForm] = useState({ title: "", description: "", dueDate: "", status: "pending" });
  const [editForm, setEditForm] = useState<Partial<Milestone>>({});

  async function load() {
    const d = await adminFetch(`/admin/event-projects/${projectId}/milestones`).then(r => r.json());
    if (d.ok) setMilestones(d.milestones);
    setLoading(false);
  }
  useEffect(() => { load(); }, [projectId]);

  async function add() {
    if (!newForm.title.trim()) return;
    await adminFetch(`/admin/event-projects/${projectId}/milestones`, { method: "POST", body: JSON.stringify({ ...newForm, sortOrder: milestones.length }) });
    setNewForm({ title: "", description: "", dueDate: "", status: "pending" });
    setAdding(false);
    load();
  }
  async function toggleDone(m: Milestone) {
    const newStatus = m.status === "done" ? "pending" : "done";
    await adminFetch(`/admin/event-milestones/${m.id}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
    load();
  }
  async function saveEdit(id: number) {
    await adminFetch(`/admin/event-milestones/${id}`, { method: "PATCH", body: JSON.stringify({ title: editForm.title, description: editForm.description, dueDate: editForm.due_date ? isoDate(editForm.due_date) : null, status: editForm.status }) });
    setEditId(null);
    load();
  }
  async function del(id: number) {
    if (!confirm("Delete this milestone?")) return;
    await adminFetch(`/admin/event-milestones/${id}`, { method: "DELETE" });
    load();
  }

  const done = milestones.filter(m => m.status === "done").length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  const overdue = milestones.filter(m => m.status !== "done" && m.due_date && daysUntil(m.due_date)! < 0);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Progress */}
      {milestones.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, padding: "1.25rem 1.5rem", border: "1px solid #eee", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>
              {done} of {milestones.length} milestones completed
            </span>
            <span style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, color: pct === 100 ? "#10b981" : "hsl(225,50%,30%)" }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : "hsl(225,50%,35%)", borderRadius: 99, transition: "width 0.4s" }} />
          </div>
          {overdue.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5, color: "#dc2626", fontSize: "0.73rem", fontFamily: FONT }}>
              <AlertCircle size={13} />{overdue.length} overdue milestone{overdue.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Milestones list */}
      <div style={{ background: "white", borderRadius: 14, padding: "1.25rem 1.5rem", border: "1px solid #eee", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.15rem", color: "hsl(225,50%,22%)" }}>Milestones</h3>
          <button onClick={() => setAdding(true)} style={BTN("hsl(225,50%,22%)", "white", true)}><Plus size={13} />Add Milestone</button>
        </div>

        {loading && <div style={{ color: "#aaa", fontSize: "0.85rem", fontFamily: FONT, padding: "1rem 0" }}>Loading…</div>}

        {!loading && milestones.length === 0 && !adding && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#bbb" }}>
            <Target size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontFamily: FONT, fontSize: "0.82rem", margin: 0 }}>No milestones yet. Add your first planning task.</p>
          </div>
        )}

        {/* Add form */}
        {adding && (
          <div style={{ background: "#fafafa", borderRadius: 10, padding: "1rem", marginBottom: "0.75rem", border: "1px solid #e5e7eb", display: "grid", gap: 8 }}>
            <input placeholder="Milestone title *" value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} style={INPUT} autoFocus />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input type="date" value={newForm.dueDate} onChange={e => setNewForm(f => ({ ...f, dueDate: e.target.value }))} style={INPUT} />
              <select value={newForm.status} onChange={e => setNewForm(f => ({ ...f, status: e.target.value }))} style={INPUT}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <input placeholder="Notes (optional)" value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} style={INPUT} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={add} style={BTN("hsl(225,50%,22%)", "white", true)}><Check size={13} />Save</button>
              <button onClick={() => { setAdding(false); setNewForm({ title: "", description: "", dueDate: "", status: "pending" }); }} style={BTN("#f3f4f6", "#374151", true)}><X size={13} />Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 6 }}>
          {milestones.map(m => {
            const msMeta = MS_META[m.status] ?? MS_META.pending;
            const days = daysUntil(m.due_date ?? null);
            const isOverdue = m.status !== "done" && days !== null && days < 0;
            if (editId === m.id) {
              return (
                <div key={m.id} style={{ background: "#fafafa", borderRadius: 10, padding: "0.9rem 1rem", border: "1px solid #e5e7eb", display: "grid", gap: 8 }}>
                  <input value={editForm.title ?? ""} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={INPUT} autoFocus />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input type="date" value={editForm.due_date ? isoDate(editForm.due_date) : ""} onChange={e => setEditForm(f => ({ ...f, due_date: e.target.value }))} style={INPUT} />
                    <select value={editForm.status ?? "pending"} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={INPUT}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <input value={editForm.description ?? ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Notes" style={INPUT} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveEdit(m.id)} style={BTN("hsl(225,50%,22%)", "white", true)}><Check size={13} />Save</button>
                    <button onClick={() => setEditId(null)} style={BTN("#f3f4f6", "#374151", true)}><X size={13} />Cancel</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "0.75rem 0.9rem", borderRadius: 10,
                background: m.status === "done" ? "#f0fdf4" : isOverdue ? "#fff7f7" : "white",
                border: `1px solid ${m.status === "done" ? "#bbf7d0" : isOverdue ? "#fecaca" : "#e5e7eb"}`,
              }}>
                <button onClick={() => toggleDone(m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: msMeta.color, flexShrink: 0, marginTop: 1 }} title={m.status === "done" ? "Mark pending" : "Mark done"}>
                  {msMeta.icon}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: m.status === "done" ? "#6b7280" : "#1a1a2e", textDecoration: m.status === "done" ? "line-through" : "none" }}>
                    {m.title}
                  </div>
                  {m.description && <div style={{ fontFamily: FONT, fontSize: "0.74rem", color: "#9ca3af", marginTop: 2 }}>{m.description}</div>}
                  {m.due_date && (
                    <div style={{ fontFamily: FONT, fontSize: "0.72rem", color: isOverdue ? "#dc2626" : "#9ca3af", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      {isOverdue && <AlertCircle size={11} />}
                      <Calendar size={11} /> {fmtDate(m.due_date)}
                      {days !== null && !isOverdue && days <= 7 && m.status !== "done" && <span style={{ color: "#f59e0b" }}>(in {days}d)</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => { setEditId(m.id); setEditForm({ ...m }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="Edit"><Edit2 size={13} /></button>
                  <button onClick={() => del(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5", padding: 4 }} title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Budget ───────────────────────────────────────────────────────────────
function BudgetTab({ project, onSave }: { project: Project; onSave: (p: Partial<Project>) => Promise<void> }) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [newForm, setNewForm] = useState({ category: "Venue", description: "", estimatedAmount: "", actualAmount: "", paid: false, notes: "" });
  const [editForm, setEditForm] = useState<Partial<BudgetItem & { estimatedAmount: string; actualAmount: string }>>({});

  async function load() {
    const d = await adminFetch(`/admin/event-projects/${project.id}/budget`).then(r => r.json());
    if (d.ok) setItems(d.items);
    setLoading(false);
  }
  useEffect(() => { load(); }, [project.id]);

  async function add() {
    if (!newForm.description.trim()) return;
    await adminFetch(`/admin/event-projects/${project.id}/budget`, {
      method: "POST",
      body: JSON.stringify({
        category: newForm.category, description: newForm.description,
        estimatedAmount: parseFloat(newForm.estimatedAmount) || 0,
        actualAmount: newForm.actualAmount ? parseFloat(newForm.actualAmount) : null,
        paid: newForm.paid, notes: newForm.notes,
      }),
    });
    setNewForm({ category: "Venue", description: "", estimatedAmount: "", actualAmount: "", paid: false, notes: "" });
    setAdding(false);
    load();
  }
  async function saveEdit(id: number) {
    await adminFetch(`/admin/event-budget-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        category: editForm.category, description: editForm.description,
        estimatedAmount: parseFloat(editForm.estimatedAmount as string) || 0,
        actualAmount: editForm.actualAmount ? parseFloat(editForm.actualAmount as string) : null,
        paid: editForm.paid, notes: editForm.notes,
      }),
    });
    setEditId(null);
    load();
  }
  async function togglePaid(item: BudgetItem) {
    await adminFetch(`/admin/event-budget-items/${item.id}`, { method: "PATCH", body: JSON.stringify({ paid: !item.paid }) });
    load();
  }
  async function del(id: number) {
    if (!confirm("Remove this budget item?")) return;
    await adminFetch(`/admin/event-budget-items/${id}`, { method: "DELETE" });
    load();
  }

  const totalEst = items.reduce((s, i) => s + Number(i.estimated_amount), 0);
  const totalAct = items.reduce((s, i) => s + (i.actual_amount ? Number(i.actual_amount) : 0), 0);
  const totalPaid = items.filter(i => i.paid).reduce((s, i) => s + (i.actual_amount ? Number(i.actual_amount) : Number(i.estimated_amount)), 0);
  const budget = project.total_budget ? Number(project.total_budget) : null;
  const pctUsed = budget ? Math.min(100, Math.round((totalEst / budget) * 100)) : null;
  const overBudget = budget !== null && totalEst > budget;

  // Group by category
  const grouped: Record<string, BudgetItem[]> = {};
  items.forEach(i => { if (!grouped[i.category]) grouped[i.category] = []; grouped[i.category].push(i); });

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Summary */}
      <div style={{ background: "white", borderRadius: 14, padding: "1.25rem 1.5rem", border: "1px solid #eee", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: budget !== null ? "1rem" : 0 }}>
          {budget !== null && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", fontFamily: FONT, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Total Budget</div>
              <div style={{ fontFamily: SERIF, fontSize: "1.35rem", fontWeight: 700, color: "hsl(225,50%,22%)" }}>{R(budget)}</div>
            </div>
          )}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.65rem", fontFamily: FONT, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Estimated</div>
            <div style={{ fontFamily: SERIF, fontSize: "1.35rem", fontWeight: 700, color: overBudget ? "#dc2626" : "#1a1a2e" }}>{R(totalEst)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.65rem", fontFamily: FONT, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Actual Spent</div>
            <div style={{ fontFamily: SERIF, fontSize: "1.35rem", fontWeight: 700, color: "#374151" }}>{R(totalAct)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.65rem", fontFamily: FONT, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Paid Out</div>
            <div style={{ fontFamily: SERIF, fontSize: "1.35rem", fontWeight: 700, color: "#10b981" }}>{R(totalPaid)}</div>
          </div>
          {budget !== null && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.65rem", fontFamily: FONT, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Remaining</div>
              <div style={{ fontFamily: SERIF, fontSize: "1.35rem", fontWeight: 700, color: budget - totalEst >= 0 ? "#166534" : "#dc2626" }}>{R(budget - totalEst)}</div>
            </div>
          )}
        </div>
        {pctUsed !== null && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9ca3af" }}>Budget used</span>
              <span style={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: overBudget ? "#dc2626" : "#374151" }}>{pctUsed}%{overBudget ? " — over budget!" : ""}</span>
            </div>
            <div style={{ height: 8, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, pctUsed)}%`, background: overBudget ? "#dc2626" : "hsl(225,50%,35%)", borderRadius: 99, transition: "width 0.4s" }} />
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{ background: "white", borderRadius: 14, padding: "1.25rem 1.5rem", border: "1px solid #eee", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.15rem", color: "hsl(225,50%,22%)" }}>Budget Line Items</h3>
          <button onClick={() => setAdding(true)} style={BTN("hsl(225,50%,22%)", "white", true)}><Plus size={13} />Add Item</button>
        </div>

        {loading && <div style={{ color: "#aaa", fontSize: "0.85rem", fontFamily: FONT, padding: "1rem 0" }}>Loading…</div>}

        {!loading && items.length === 0 && !adding && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#bbb" }}>
            <DollarSign size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ fontFamily: FONT, fontSize: "0.82rem", margin: 0 }}>No budget items yet.</p>
          </div>
        )}

        {/* Add form */}
        {adding && (
          <div style={{ background: "#fafafa", borderRadius: 10, padding: "1rem", marginBottom: "1rem", border: "1px solid #e5e7eb", display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <select value={newForm.category} onChange={e => setNewForm(f => ({ ...f, category: e.target.value }))} style={INPUT}>
                {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="Description *" value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} style={INPUT} autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input type="number" placeholder="Estimated (R)" value={newForm.estimatedAmount} onChange={e => setNewForm(f => ({ ...f, estimatedAmount: e.target.value }))} style={INPUT} />
              <input type="number" placeholder="Actual (R) — optional" value={newForm.actualAmount} onChange={e => setNewForm(f => ({ ...f, actualAmount: e.target.value }))} style={INPUT} />
            </div>
            <input placeholder="Notes (optional)" value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} style={INPUT} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={add} style={BTN("hsl(225,50%,22%)", "white", true)}><Check size={13} />Save</button>
              <button onClick={() => setAdding(false)} style={BTN("#f3f4f6", "#374151", true)}><X size={13} />Cancel</button>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.78rem", color: "#374151", cursor: "pointer" }}>
                <input type="checkbox" checked={newForm.paid} onChange={e => setNewForm(f => ({ ...f, paid: e.target.checked }))} /> Paid
              </label>
            </div>
          </div>
        )}

        {/* Grouped rows */}
        {Object.entries(grouped).map(([cat, catItems]) => {
          const catEst = catItems.reduce((s, i) => s + Number(i.estimated_amount), 0);
          return (
            <div key={cat} style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0", borderBottom: "1px solid #f0f0f0", marginBottom: 6 }}>
                <span style={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>{cat}</span>
                <span style={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9ca3af" }}>{R(catEst)}</span>
              </div>
              {catItems.map(item => {
                if (editId === item.id) {
                  return (
                    <div key={item.id} style={{ background: "#fafafa", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: 6, border: "1px solid #e5e7eb", display: "grid", gap: 8 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <select value={editForm.category ?? item.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} style={INPUT}>
                          {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input value={editForm.description ?? item.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={INPUT} autoFocus />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <input type="number" value={editForm.estimatedAmount ?? String(item.estimated_amount)} onChange={e => setEditForm(f => ({ ...f, estimatedAmount: e.target.value }))} placeholder="Estimated" style={INPUT} />
                        <input type="number" value={editForm.actualAmount ?? (item.actual_amount != null ? String(item.actual_amount) : "")} onChange={e => setEditForm(f => ({ ...f, actualAmount: e.target.value }))} placeholder="Actual" style={INPUT} />
                      </div>
                      <input value={editForm.notes ?? item.notes ?? ""} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" style={INPUT} />
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={() => saveEdit(item.id)} style={BTN("hsl(225,50%,22%)", "white", true)}><Check size={13} />Save</button>
                        <button onClick={() => setEditId(null)} style={BTN("#f3f4f6", "#374151", true)}><X size={13} />Cancel</button>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: "0.78rem", cursor: "pointer" }}>
                          <input type="checkbox" checked={editForm.paid ?? item.paid} onChange={e => setEditForm(f => ({ ...f, paid: e.target.checked }))} /> Paid
                        </label>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.55rem 0.9rem", borderRadius: 8, background: item.paid ? "#f0fdf4" : "white", border: `1px solid ${item.paid ? "#bbf7d0" : "#e5e7eb"}`, marginBottom: 5 }}>
                    <button onClick={() => togglePaid(item)} title={item.paid ? "Mark unpaid" : "Mark paid"} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: item.paid ? "#10b981" : "#d1d5db", flexShrink: 0 }}>
                      <CheckCircle2 size={17} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FONT, fontSize: "0.83rem", fontWeight: 500, color: "#1a1a2e" }}>{item.description}</div>
                      {item.notes && <div style={{ fontFamily: FONT, fontSize: "0.72rem", color: "#9ca3af" }}>{item.notes}</div>}
                    </div>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: FONT, fontSize: "0.78rem", color: "#374151", fontWeight: 600 }}>{R(item.estimated_amount)}</div>
                        {item.actual_amount != null && (
                          <div style={{ fontFamily: FONT, fontSize: "0.7rem", color: Number(item.actual_amount) > Number(item.estimated_amount) ? "#dc2626" : "#10b981" }}>
                            actual: {R(item.actual_amount)}
                          </div>
                        )}
                      </div>
                      {item.paid && <span style={{ fontFamily: FONT, fontSize: "0.65rem", fontWeight: 700, color: "#10b981", background: "#f0fdf4", padding: "2px 8px", borderRadius: 20 }}>PAID</span>}
                      <button onClick={() => { setEditId(item.id); setEditForm({ ...item, estimatedAmount: String(item.estimated_amount), actualAmount: item.actual_amount != null ? String(item.actual_amount) : "" }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}><Edit2 size={13} /></button>
                      <button onClick={() => del(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#fca5a5", padding: 2 }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = ["Overview", "Milestones", "Budget"] as const;
type Tab = typeof TABS[number];

export default function EventProject() {
  useAdminAuth();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  async function load() {
    const d = await adminFetch(`/admin/event-projects/${id}`).then(r => r.json());
    if (d.ok) setProject(d.project);
    setLoading(false);
  }
  useEffect(() => { load(); }, [id]);

  async function save(patch: Partial<Project>) {
    const d = await adminFetch(`/admin/event-projects/${id}`, { method: "PATCH", body: JSON.stringify(patch) }).then(r => r.json());
    if (d.ok) setProject(d.project);
  }

  if (loading) return <AdminLayout title="Event Project"><div style={{ fontFamily: FONT, color: "#aaa", padding: "2rem" }}>Loading…</div></AdminLayout>;
  if (!project) return <AdminLayout title="Event Project"><div style={{ fontFamily: FONT, color: "#dc2626", padding: "2rem" }}>Project not found.</div></AdminLayout>;

  const sm = STATUS_META[project.status] ?? STATUS_META.planning;

  return (
    <AdminLayout title={project.title}>
      <div style={{ maxWidth: 900 }}>
        {/* Back */}
        <Link href="/admin/events">
          <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "0.78rem", color: "#9ca3af", padding: 0, marginBottom: "1.25rem" }}>
            <ArrowLeft size={14} /> All Events
          </button>
        </Link>

        {/* Page header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Flag size={18} style={{ color: "hsl(225,50%,35%)" }} />
            <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.8rem", color: "hsl(225,50%,22%)" }}>{project.title}</h1>
            <span style={{ padding: "3px 12px", borderRadius: 20, background: sm.bg, color: sm.color, fontSize: "0.7rem", fontWeight: 700, fontFamily: FONT }}>{sm.label}</span>
          </div>
          {project.event_date && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: "0.8rem", color: "#6b7280" }}><Calendar size={13} />{fmtDate(project.event_date)}</span>
              {project.venue && <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: "0.8rem", color: "#6b7280" }}><MapPin size={13} />{project.venue}</span>}
              {project.capacity && <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: "0.8rem", color: "#6b7280" }}><Users size={13} />{project.capacity} guests</span>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb", paddingBottom: 1 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: "0.82rem", fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "hsl(225,50%,22%)" : "#9ca3af",
              padding: "0.55rem 1rem", borderBottom: `2px solid ${tab === t ? "hsl(225,50%,22%)" : "transparent"}`,
              marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && <OverviewTab project={project} onSave={save} />}
        {tab === "Milestones" && <MilestonesTab projectId={project.id} />}
        {tab === "Budget" && <BudgetTab project={project} onSave={save} />}
      </div>
    </AdminLayout>
  );
}
