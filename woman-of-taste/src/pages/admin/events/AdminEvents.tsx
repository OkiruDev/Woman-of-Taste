import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import {
  Calendar, MapPin, ArrowRight, Plus, X, Check, Flag,
  Target, DollarSign, Users, ChevronDown, ChevronUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface EventProject {
  id: number; title: string; description?: string; event_date?: string;
  venue?: string; status: string; total_budget?: number; capacity?: number;
  milestone_total: number; milestone_done: number;
  budget_estimated: number; budget_actual: number;
}
interface WotEvent {
  eventTitle: string; eventDate: string; eventLocation: string;
  totalBookings: number; confirmedCount: number; paidCount: number;
  revenue: number; checkedInCount: number; confirmedTickets: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function R(v: number) { return `R\u202f${Number(v).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`; }
function daysUntil(d: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  planning:  { label: "Planning",  bg: "#f0f4ff", color: "hsl(225,50%,30%)" },
  confirmed: { label: "Confirmed", bg: "#dcfce7", color: "#166534" },
  open:      { label: "Open",      bg: "#dbeafe", color: "#1e40af" },
  completed: { label: "Completed", bg: "#f3f4f6", color: "#374151" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#991b1b" },
};
const FONT = "Raleway, sans-serif";
const SERIF = "Cormorant Garamond, serif";
const INPUT = { padding: "0.6rem 0.85rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.83rem", fontFamily: FONT, outline: "none", width: "100%", boxSizing: "border-box" as const };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.78rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT });

// ── New Event Modal ───────────────────────────────────────────────────────────
interface NewEventForm { title: string; eventDate: string; venue: string; capacity: string; totalBudget: string; status: string; description: string; }
const EMPTY_FORM: NewEventForm = { title: "", eventDate: "", venue: "", capacity: "", totalBudget: "", status: "planning", description: "" };

function NewEventModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [form, setForm] = useState<NewEventForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setSaving(true);
    const d = await adminFetch("/admin/event-projects", {
      method: "POST",
      body: JSON.stringify({
        title: form.title, eventDate: form.eventDate || null,
        venue: form.venue || null, capacity: form.capacity ? parseInt(form.capacity) : null,
        totalBudget: form.totalBudget ? parseFloat(form.totalBudget) : null,
        status: form.status, description: form.description || null,
      }),
    }).then(r => r.json());
    setSaving(false);
    if (d.ok) { onCreate(); onClose(); }
    else setErr(d.error ?? "Failed to create event.");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 520, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.45rem", color: "hsl(225,50%,22%)" }}>New Event Project</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
        </div>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Event Name *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. High Tea at The Westcliff" style={INPUT} autoFocus />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Event Date</label>
              <input type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} style={INPUT} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={INPUT}>
                {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Venue</label>
              <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="Venue name" style={INPUT} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Capacity</label>
              <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="Max guests" style={INPUT} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Total Budget (R)</label>
            <input type="number" value={form.totalBudget} onChange={e => setForm(f => ({ ...f, totalBudget: e.target.value }))} placeholder="0.00" style={INPUT} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4, fontFamily: FONT }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description…" style={{ ...INPUT, resize: "vertical" }} />
          </div>
          {err && <div style={{ color: "#dc2626", fontFamily: FONT, fontSize: "0.78rem" }}>{err}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={onClose} style={BTN("#f3f4f6", "#374151")}><X size={14} />Cancel</button>
            <button onClick={save} disabled={saving} style={BTN("hsl(225,50%,22%)")}><Check size={14} />{saving ? "Creating…" : "Create Event"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ p, onDelete }: { p: EventProject; onDelete: () => void }) {
  const sm = STATUS_META[p.status] ?? STATUS_META.planning;
  const days = daysUntil(p.event_date ?? null);
  const msPct = p.milestone_total ? Math.round((p.milestone_done / p.milestone_total) * 100) : null;

  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <Link href={`/admin/events/project/${p.id}`}>
        <div style={{ padding: "1.1rem 1.4rem", cursor: "pointer", display: "flex", gap: "1rem", alignItems: "flex-start" }}
          onMouseEnter={e2 => { (e2.currentTarget as HTMLDivElement).style.background = "#fafafa"; }}
          onMouseLeave={e2 => { (e2.currentTarget as HTMLDivElement).style.background = ""; }}
        >
          <Flag size={16} style={{ color: "hsl(225,50%,35%)", flexShrink: 0, marginTop: 3 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
              <span style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 600, color: "hsl(225,50%,22%)" }}>{p.title}</span>
              <span style={{ padding: "2px 10px", borderRadius: 20, background: sm.bg, color: sm.color, fontSize: "0.66rem", fontWeight: 700, fontFamily: FONT }}>{sm.label}</span>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {p.event_date && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: "0.74rem", color: days !== null && days <= 14 && days >= 0 ? "#f59e0b" : "#9ca3af" }}>
                  <Calendar size={11} /> {fmtDate(p.event_date)}
                  {days !== null && days >= 0 && days <= 30 && <span>({days}d)</span>}
                </span>
              )}
              {p.venue && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: "0.74rem", color: "#9ca3af" }}>
                  <MapPin size={11} /> {p.venue}
                </span>
              )}
              {p.capacity && (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: FONT, fontSize: "0.74rem", color: "#9ca3af" }}>
                  <Users size={11} /> {p.capacity} guests
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", flexShrink: 0, alignItems: "center" }}>
            {p.milestone_total > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 700, color: msPct === 100 ? "#10b981" : "hsl(225,50%,30%)" }}>{msPct}%</div>
                <div style={{ fontFamily: FONT, fontSize: "0.62rem", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{p.milestone_done}/{p.milestone_total} tasks</div>
              </div>
            )}
            {p.budget_estimated > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 700, color: "#374151" }}>{R(p.budget_estimated)}</div>
                <div style={{ fontFamily: FONT, fontSize: "0.62rem", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>Estimated</div>
              </div>
            )}
            <ArrowRight size={14} color="#d1d5db" />
          </div>
        </div>
      </Link>
      {/* Milestone progress bar */}
      {p.milestone_total > 0 && (
        <div style={{ height: 3, background: "#f0f0f0" }}>
          <div style={{ height: "100%", width: `${msPct}%`, background: msPct === 100 ? "#10b981" : "hsl(225,50%,35%)", transition: "width 0.4s" }} />
        </div>
      )}
    </div>
  );
}

// ── Past Events (from bookings) ───────────────────────────────────────────────
function StatusPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div style={{ fontFamily: FONT, fontSize: "1rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 1 }}>{label}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminEvents() {
  useAdminAuth();
  const [projects, setProjects] = useState<EventProject[]>([]);
  const [pastEvents, setPastEvents] = useState<WotEvent[]>([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingE, setLoadingE] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPast, setShowPast] = useState(false);

  async function loadProjects() {
    const d = await adminFetch("/admin/event-projects").then(r => r.json());
    if (d.ok) setProjects(d.projects);
    setLoadingP(false);
  }
  async function loadPast() {
    const d = await adminFetch("/admin/events").then(r => r.json());
    if (d.ok) setPastEvents(d.events);
    setLoadingE(false);
  }

  useEffect(() => { loadProjects(); loadPast(); }, []);

  return (
    <AdminLayout title="Events">
      {showModal && <NewEventModal onClose={() => setShowModal(false)} onCreate={loadProjects} />}

      <div style={{ maxWidth: 960 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.6rem", color: "hsl(225,50%,22%)" }}>Events</h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#888", fontFamily: FONT }}>
              Plan and manage events — milestones, budgets &amp; bookings in one place
            </p>
          </div>
          <button onClick={() => setShowModal(true)} style={BTN("hsl(225,50%,22%)")}>
            <Plus size={14} /> New Event
          </button>
        </div>

        {/* Planned Events */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 0.85rem", fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Event Projects ({projects.length})
          </h3>
          {loadingP && <div style={{ fontFamily: FONT, color: "#aaa", fontSize: "0.85rem" }}>Loading…</div>}
          {!loadingP && projects.length === 0 && (
            <div style={{ background: "white", borderRadius: 14, padding: "3rem 2rem", textAlign: "center", border: "1px solid #eee" }}>
              <Flag size={30} style={{ color: "#e5e7eb", marginBottom: 10 }} />
              <div style={{ fontFamily: SERIF, fontSize: "1.1rem", color: "#bbb", marginBottom: 6 }}>No events planned yet</div>
              <p style={{ fontFamily: FONT, fontSize: "0.8rem", color: "#ccc", margin: "0 0 1rem" }}>Create your first event project to start planning with milestones and budget tracking.</p>
              <button onClick={() => setShowModal(true)} style={{ ...BTN("hsl(225,50%,22%)"), margin: "0 auto" }}><Plus size={14} />Create First Event</button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {projects.map(p => <ProjectCard key={p.id} p={p} onDelete={loadProjects} />)}
          </div>
        </div>

        {/* Past Events (from bookings) */}
        <div>
          <button
            onClick={() => setShowPast(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "0.75rem" }}
          >
            <span style={{ fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Past Events from Bookings ({pastEvents.length})
            </span>
            {showPast ? <ChevronUp size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
          </button>

          {showPast && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {loadingE && <div style={{ fontFamily: FONT, color: "#aaa", fontSize: "0.85rem" }}>Loading…</div>}
              {!loadingE && pastEvents.length === 0 && (
                <div style={{ background: "white", borderRadius: 12, padding: "2rem", textAlign: "center", border: "1px solid #eee", fontFamily: FONT, fontSize: "0.82rem", color: "#bbb" }}>
                  No booking events found.
                </div>
              )}
              {pastEvents.map(e => (
                <Link key={e.eventTitle + e.eventDate} href={`/admin/events/${encodeURIComponent(e.eventTitle)}`}>
                  <div style={{ background: "white", borderRadius: 12, padding: "1rem 1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #eee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
                    onMouseEnter={el => { (el.currentTarget as HTMLDivElement).style.borderColor = "hsl(225,50%,80%)"; }}
                    onMouseLeave={el => { (el.currentTarget as HTMLDivElement).style.borderColor = "#eee"; }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 600, color: "hsl(225,50%,22%)", marginBottom: 3 }}>{e.eventTitle}</div>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {e.eventDate && <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: FONT, fontSize: "0.72rem", color: "#9ca3af" }}><Calendar size={11} />{fmtDate(e.eventDate)}</span>}
                        {e.eventLocation && <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: FONT, fontSize: "0.72rem", color: "#9ca3af" }}><MapPin size={11} />{e.eventLocation}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", flexShrink: 0, alignItems: "center" }}>
                      <StatusPill label="Confirmed" value={e.confirmedCount} color="#1e40af" />
                      <StatusPill label="Paid" value={e.paidCount} color="#166534" />
                      <StatusPill label="Attended" value={e.checkedInCount} color="#6d28d9" />
                      <StatusPill label="Revenue" value={R(e.revenue)} color="#b45309" />
                      <ArrowRight size={13} color="#d1d5db" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
