import { useState, useEffect, useCallback, useRef } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { TrendingUp, TrendingDown, Plus, Trash2, Edit2, RefreshCw, Receipt, Camera, X, Check, ImageIcon } from "lucide-react";
import RandIcon from "../../../components/RandIcon";
import { useIsMobile } from "../../../hooks/use-mobile";

// ── Types ────────────────────────────────────────────────────────────────────

interface FinanceEvent {
  eventId: string; eventTitle: string;
  revenue: number; ticketCount: number;
  expenses: number; expenseCount: number;
  profit: number; margin: number | null;
}
interface FinanceSummary { totalRevenue: number; totalExpenses: number; netProfit: number; events: FinanceEvent[] }
interface Expense {
  id: number; eventId: string; eventTitle: string;
  category: string; description: string; amount: number; date: string;
  receiptPath: string | null; notes: string | null; createdAt: string;
}
interface KnownEvent { eventId: string; eventTitle: string }

// ── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "Venue",         bg: "#dbeafe", text: "#1e40af" },
  { value: "Catering",      bg: "#fff7ed", text: "#c2410c" },
  { value: "Marketing",     bg: "#f5f3ff", text: "#7c3aed" },
  { value: "Printing",      bg: "#f0f9ff", text: "#0369a1" },
  { value: "Equipment",     bg: "#f9fafb", text: "#374151" },
  { value: "Staff",         bg: "#f0fdf4", text: "#15803d" },
  { value: "Transport",     bg: "#ecfdf5", text: "#065f46" },
  { value: "Entertainment", bg: "#fdf2f8", text: "#be185d" },
  { value: "Décor",         bg: "#fefce8", text: "#a16207" },
  { value: "Gifts & Prizes",bg: "#faf5ff", text: "#9333ea" },
  { value: "Other",         bg: "#f8fafc", text: "#64748b" },
];
const catStyle = (cat: string) => CATEGORIES.find(c => c.value === cat) ?? { bg: "#f3f4f6", text: "#6b7280" };

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtZAR(v: number) { return `R ${Math.abs(v).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }); }

function CategoryBadge({ category }: { category: string }) {
  const s = catStyle(category);
  return <span style={{ background: s.bg, color: s.text, fontSize: "0.68rem", padding: "2px 8px", borderRadius: 99, fontWeight: 700, whiteSpace: "nowrap" }}>{category}</span>;
}

function StatCard({ icon, label, value, sub, color, negative }: { icon: React.ReactNode; label: string; value: string; sub?: string; color: string; negative?: boolean }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "1rem 1.1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: "1.35rem", fontWeight: 700, color: negative ? "#dc2626" : "#1a1a2e", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: "0.73rem", color: "#888", marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Expense Form Modal ────────────────────────────────────────────────────────

const EMPTY_FORM = { eventTitle: "", eventId: "", category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0], notes: "" };

function ExpenseModal({
  editing, knownEvents, onClose, onSaved,
}: { editing: Expense | null; knownEvents: KnownEvent[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(() => editing ? {
    eventTitle: editing.eventTitle, eventId: editing.eventId, category: editing.category,
    description: editing.description, amount: String(editing.amount), date: editing.date, notes: editing.notes ?? "",
  } : { ...EMPTY_FORM });
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  function handleEventChange(title: string) {
    const known = knownEvents.find(e => e.eventTitle === title);
    setForm(p => ({ ...p, eventTitle: title, eventId: known ? known.eventId : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
  }

  function handleReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReceiptDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.eventTitle.trim() || !form.category || !form.description.trim() || !form.amount || !form.date) {
      setError("Please fill in all required fields."); return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { setError("Amount must be a positive number."); return; }

    setSaving(true); setError("");
    try {
      const body = { ...form, amount: amt, receiptBase64: receiptDataUrl ?? undefined };
      const res = await adminFetch(editing ? `/admin/expenses/${editing.id}` : "/admin/expenses", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.ok) { onSaved(); onClose(); }
      else { setError(d.error ?? "Failed to save."); }
    } catch { setError("Network error — please try again."); }
    finally { setSaving(false); }
  }

  const INPUT: React.CSSProperties = { width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #dde", borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.87rem", outline: "none", boxSizing: "border-box", background: "#fafafe" };
  const LABEL: React.CSSProperties = { display: "block", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: "0.35rem" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto" }}>
      <div style={{ background: "white", borderRadius: 18, padding: "1.5rem", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "hsl(225,50%,22%)" }}>
            {editing ? "Edit Expense" : "Add Expense"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Event */}
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={LABEL}>Event <span style={{ color: "#ef4444" }}>*</span></label>
            <input list="events-list" value={form.eventTitle} onChange={e => handleEventChange(e.target.value)} required
              placeholder="Start typing or select an event…" style={INPUT} />
            <datalist id="events-list">
              {knownEvents.map(e => <option key={e.eventId} value={e.eventTitle} />)}
            </datalist>
          </div>

          {/* Category */}
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={LABEL}>Category <span style={{ color: "#ef4444" }}>*</span></label>
            <select value={form.category} onChange={e => set("category", e.target.value)} required
              style={{ ...INPUT, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M6 8L0 0h12z' fill='%23aaa'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", paddingRight: "2rem" }}>
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={LABEL}>Description <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={form.description} onChange={e => set("description", e.target.value)} required
              placeholder="e.g. Venue hire — Egrek Cinema" style={INPUT} />
          </div>

          {/* Amount + Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.85rem" }}>
            <div>
              <label style={LABEL}>Amount (R) <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} required
                placeholder="0.00" style={INPUT} inputMode="decimal" />
            </div>
            <div>
              <label style={LABEL}>Date <span style={{ color: "#ef4444" }}>*</span></label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} required style={INPUT} />
            </div>
          </div>

          {/* Receipt */}
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={LABEL}>Receipt Photo <span style={{ color: "#aaa", fontSize: "0.65rem", fontWeight: 400 }}>(optional)</span></label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleReceipt}
              style={{ display: "none" }} />
            {receiptDataUrl || (editing?.receiptPath) ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={receiptDataUrl ?? `/api${editing?.receiptPath}`}
                  alt="Receipt"
                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #dde" }}
                />
                <div style={{ flex: 1, fontSize: "0.78rem", color: "#888" }}>
                  {receiptDataUrl ? "New image selected" : "Current receipt"}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                  Change
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#fafafe", border: "2px dashed #dde", borderRadius: 8, padding: "0.65rem 1rem", cursor: "pointer", color: "#888", fontSize: "0.82rem", width: "100%" }}>
                <Camera size={16} /> Take Photo or Upload Receipt
              </button>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={LABEL}>Notes <span style={{ color: "#aaa", fontSize: "0.65rem", fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2}
              placeholder="Additional details…"
              style={{ ...INPUT, resize: "vertical", fontFamily: "Raleway, sans-serif" }} />
          </div>

          {error && <div style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 8, padding: "0.6rem 0.85rem", fontSize: "0.82rem", marginBottom: "0.85rem" }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ background: "#f0f0f5", color: "#555", border: "none", borderRadius: 8, padding: "0.6rem 1.1rem", fontSize: "0.83rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={saving}
              style={{ background: "hsl(225,50%,22%)", color: "white", border: "none", borderRadius: 8, padding: "0.6rem 1.3rem", fontSize: "0.83rem", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── P&L Summary Tab ───────────────────────────────────────────────────────────

function SummaryTab({ summary, loading }: { summary: FinanceSummary | null; loading: boolean }) {
  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading P&L data…</div>;
  if (!summary) return <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>No data available.</div>;

  const isProfit = summary.netProfit >= 0;

  return (
    <div>
      {/* Top stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "0.7rem", marginBottom: "1.5rem" }}>
        <StatCard icon={<TrendingUp size={20} />} label="Total Revenue" value={fmtZAR(summary.totalRevenue)} sub="From paid bookings" color="#10b981" />
        <StatCard icon={<Receipt size={20} />} label="Total Expenses" value={fmtZAR(summary.totalExpenses)} sub="Logged costs" color="#f59e0b" />
        <StatCard
          icon={isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          label={isProfit ? "Net Profit" : "Net Loss"}
          value={`${isProfit ? "+" : "-"}${fmtZAR(summary.netProfit)}`}
          sub={summary.totalRevenue > 0 ? `${Math.round((summary.netProfit / summary.totalRevenue) * 100)}% margin` : undefined}
          color={isProfit ? "#3b82f6" : "#ef4444"}
          negative={!isProfit}
        />
      </div>

      {/* Per-event table */}
      {summary.events.length === 0 ? (
        <div style={{ background: "white", borderRadius: 12, padding: "2.5rem", textAlign: "center", color: "#aaa" }}>
          No financial data yet. Add expenses and approve bookings to see P&L summaries here.
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f0f0f5", display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={15} style={{ color: "hsl(225,50%,30%)" }} />
            <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1rem", color: "hsl(225,50%,22%)", fontWeight: 600 }}>Event P&amp;L Breakdown</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
              <thead>
                <tr style={{ background: "#f8f8fc" }}>
                  {["Event", "Revenue", "Tickets Sold", "Expenses", "Profit / Loss", "Margin", "Status"].map(h => (
                    <th key={h} style={{ padding: "0.65rem 1rem", textAlign: "left", fontWeight: 700, color: "#666", fontSize: "0.67rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.events.map((ev, i) => {
                  const profitable = ev.profit >= 0;
                  return (
                    <tr key={ev.eventId} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderLeft: `3px solid ${profitable ? "#10b981" : "#ef4444"}` }}>
                      <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #f0f0f5", fontWeight: 600, color: "#1a1a2e" }}>{ev.eventTitle}</td>
                      <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #f0f0f5", fontWeight: 600, color: "#10b981", whiteSpace: "nowrap" }}>{fmtZAR(ev.revenue)}</td>
                      <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#888", textAlign: "center" }}>{ev.ticketCount}</td>
                      <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#f59e0b", whiteSpace: "nowrap" }}>{fmtZAR(ev.expenses)}</td>
                      <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #f0f0f5", fontWeight: 700, color: profitable ? "#16a34a" : "#dc2626", whiteSpace: "nowrap" }}>
                        {profitable ? "+" : "-"}{fmtZAR(ev.profit)}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#888" }}>
                        {ev.margin !== null ? `${ev.margin}%` : ev.revenue === 0 ? "—" : "0%"}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                        <span style={{ background: profitable ? "#dcfce7" : "#fee2e2", color: profitable ? "#166534" : "#991b1b", fontSize: "0.68rem", padding: "2px 9px", borderRadius: 99, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {profitable ? <Check size={11} /> : <TrendingDown size={11} />} {profitable ? "Profitable" : "Loss"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expenses Tab ──────────────────────────────────────────────────────────────

function ExpensesTab({
  expenses, loading, knownEvents, onAdd, onEdit, onDelete, onRefresh,
}: {
  expenses: Expense[]; loading: boolean; knownEvents: KnownEvent[];
  onAdd: () => void; onEdit: (e: Expense) => void; onDelete: (e: Expense) => void; onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const isMobile = useIsMobile();

  const filtered = filter === "all" ? expenses : expenses.filter(e => e.eventId === filter);

  const eventOptions = Array.from(new Map(expenses.map(e => [e.eventId, e.eventTitle])).entries());

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading expenses…</div>;

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: "0.5rem 0.75rem", border: "1px solid #dde", borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.83rem", background: "white", outline: "none" }}>
          <option value="all">All Events</option>
          {eventOptions.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={onRefresh} style={{ background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 8, padding: "0.5rem 0.85rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <RefreshCw size={13} /> Refresh
        </button>
        <button onClick={onAdd}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "hsl(225,50%,22%)", color: "white", border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.83rem", fontWeight: 700, cursor: "pointer" }}>
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Summary for filtered set */}
      {filtered.length > 0 && (
        <div style={{ background: "hsl(225,50%,97%)", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "hsl(225,50%,40%)" }}><strong>{filtered.length}</strong> expense{filtered.length !== 1 ? "s" : ""}</span>
          <span style={{ fontSize: "0.8rem", color: "hsl(225,50%,40%)" }}>Total: <strong>{fmtZAR(filtered.reduce((s, e) => s + e.amount, 0))}</strong></span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: 12, padding: "3rem", textAlign: "center", color: "#aaa" }}>
          No expenses logged yet. Click "Add Expense" to record your first one.
        </div>
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {filtered.map(e => (
            <div key={e.id} style={{ background: "white", borderRadius: 12, padding: "1rem", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                <CategoryBadge category={e.category} />
                <span style={{ fontWeight: 700, fontSize: "1rem", color: "hsl(225,50%,22%)" }}>{fmtZAR(e.amount)}</span>
              </div>
              <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.9rem", marginBottom: "0.2rem" }}>{e.description}</div>
              <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.1rem" }}>{e.eventTitle}</div>
              <div style={{ fontSize: "0.72rem", color: "#bbb", marginBottom: "0.5rem" }}>{fmtDate(e.date)}</div>
              {e.notes && <div style={{ fontSize: "0.75rem", color: "#999", fontStyle: "italic", marginBottom: "0.5rem" }}>{e.notes}</div>}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {e.receiptPath && (
                  <a href={`/api${e.receiptPath}`} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0fdf4", color: "#15803d", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: "0.7rem", fontWeight: 600, textDecoration: "none" }}>
                    <ImageIcon size={11} /> Receipt
                  </a>
                )}
                <div style={{ flex: 1 }} />
                <button onClick={() => onEdit(e)} style={{ background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: "0.7rem" }}><Edit2 size={12} /></button>
                <button onClick={() => onDelete(e)} style={{ background: "#fff0f0", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 9px", cursor: "pointer", fontSize: "0.7rem" }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
            <thead>
              <tr style={{ background: "#f8f8fc" }}>
                {["Date", "Event", "Category", "Description", "Amount", "Receipt", "Notes", ""].map(h => (
                  <th key={h} style={{ padding: "0.65rem 0.9rem", textAlign: "left", fontWeight: 700, color: "#666", fontSize: "0.67rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5", color: "#888", whiteSpace: "nowrap" }}>{fmtDate(e.date)}</td>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5", color: "#555", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.eventTitle}</td>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5" }}><CategoryBadge category={e.category} /></td>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5", fontWeight: 500, color: "#1a1a2e" }}>{e.description}</td>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5", fontWeight: 700, color: "#1a1a2e", whiteSpace: "nowrap" }}>{fmtZAR(e.amount)}</td>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5" }}>
                    {e.receiptPath ? (
                      <a href={`/api${e.receiptPath}`} target="_blank" rel="noreferrer" title="View receipt">
                        <img src={`/api${e.receiptPath}`} alt="Receipt" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6, border: "1px solid #dde", display: "block" }} />
                      </a>
                    ) : <span style={{ color: "#ccc", fontSize: "0.72rem" }}>—</span>}
                  </td>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5", color: "#999", fontStyle: e.notes ? "normal" : "italic", fontSize: "0.78rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.notes || "—"}
                  </td>
                  <td style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid #f0f0f5" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => onEdit(e)} title="Edit" style={{ background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 6, padding: "4px 7px", cursor: "pointer" }}><Edit2 size={13} /></button>
                      <button onClick={() => onDelete(e)} title="Delete" style={{ background: "#fff0f0", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 7px", cursor: "pointer" }}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminFinance() {
  useAdminAuth();
  const [tab, setTab] = useState<"summary" | "expenses">("summary");
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [knownEvents, setKnownEvents] = useState<KnownEvent[]>([]);
  const [loadingSum, setLoadingSum] = useState(true);
  const [loadingExp, setLoadingExp] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Expense | null }>({ open: false, editing: null });
  const [msg, setMsg] = useState("");
  const isMobile = useIsMobile();

  const loadSummary = useCallback(async () => {
    setLoadingSum(true);
    try {
      const res = await adminFetch("/admin/finance/summary");
      const d = await res.json();
      if (d.ok) setSummary(d.summary);
    } catch { /* ignore */ } finally { setLoadingSum(false); }
  }, []);

  const loadExpenses = useCallback(async () => {
    setLoadingExp(true);
    try {
      const res = await adminFetch("/admin/expenses");
      const d = await res.json();
      if (d.ok) setExpenses(d.expenses);
    } catch { /* ignore */ } finally { setLoadingExp(false); }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const res = await adminFetch("/admin/finance/events");
      const d = await res.json();
      if (d.ok) setKnownEvents(d.events);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    loadSummary();
    loadExpenses();
    loadEvents();
  }, [loadSummary, loadExpenses, loadEvents]);

  function showMsg(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function handleDelete(e: Expense) {
    if (!window.confirm(`Delete expense "${e.description}" (${fmtZAR(e.amount)})?`)) return;
    try {
      const res = await adminFetch(`/admin/expenses/${e.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.ok) { await loadExpenses(); await loadSummary(); await loadEvents(); showMsg("Expense deleted."); }
      else showMsg(d.error ?? "Delete failed.");
    } catch { showMsg("Delete failed — please try again."); }
  }

  function handleSaved() {
    loadExpenses();
    loadSummary();
    loadEvents();
    showMsg("Expense saved ✓");
  }

  const TAB_BTN = (t: "summary" | "expenses", label: string) => (
    <button onClick={() => setTab(t)} style={{
      background: tab === t ? "hsl(225,50%,22%)" : "white",
      color: tab === t ? "white" : "#666",
      border: tab === t ? "none" : "1px solid #dde",
      borderRadius: 8, padding: "0.55rem 1.1rem",
      fontSize: "0.83rem", fontWeight: tab === t ? 700 : 500,
      cursor: "pointer", fontFamily: "Raleway, sans-serif",
    }}>{label}</button>
  );

  return (
    <AdminLayout title="Finance">
      {msg && (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1rem", left: isMobile ? "1rem" : "auto", background: "hsl(225,50%,22%)", color: "white", padding: "0.75rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, zIndex: 300, textAlign: isMobile ? "center" : "left" }}>
          {msg}
        </div>
      )}

      {modal.open && (
        <ExpenseModal
          editing={modal.editing}
          knownEvents={knownEvents}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={handleSaved}
        />
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {TAB_BTN("summary", "📊 P&L Summary")}
        {TAB_BTN("expenses", "🧾 Expenses")}
      </div>

      {tab === "summary" && <SummaryTab summary={summary} loading={loadingSum} />}
      {tab === "expenses" && (
        <ExpensesTab
          expenses={expenses}
          loading={loadingExp}
          knownEvents={knownEvents}
          onAdd={() => setModal({ open: true, editing: null })}
          onEdit={e => setModal({ open: true, editing: e })}
          onDelete={handleDelete}
          onRefresh={() => { loadExpenses(); loadSummary(); loadEvents(); }}
        />
      )}
    </AdminLayout>
  );
}
