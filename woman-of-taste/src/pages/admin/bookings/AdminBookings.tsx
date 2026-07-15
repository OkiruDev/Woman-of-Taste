import { useState, useEffect, useCallback } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { RefreshCw, Download, AlertTriangle, Send, FileText, StickyNote, Check, X, Trash2, Ban, Phone, Mail, MessageCircle, RotateCcw } from "lucide-react";
import RandIcon from "../../../components/RandIcon";
import { useIsMobile } from "../../../hooks/use-mobile";

type BookingStatus = "PENDING" | "APPROVED" | "PAID" | "OVERDUE" | "DECLINED" | "WAITLIST";

interface Booking {
  id: number; invoiceNumber: string; status: BookingStatus;
  firstName: string; surname: string; email: string; phone: string;
  eventTitle: string; eventDate: string; quantity: number; totalAmount: number;
  notes: string | null; lastFollowupSentAt: string | null; invoiceSentAt: string | null;
  paidAt: string | null; createdAt: string;
}

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING:  { bg: "#fef9c3", text: "#a16207",  label: "Pending" },
  APPROVED: { bg: "#dbeafe", text: "#1e40af",  label: "Approved" },
  PAID:     { bg: "#dcfce7", text: "#166534",  label: "Paid" },
  OVERDUE:  { bg: "#fee2e2", text: "#991b1b",  label: "Overdue" },
  DECLINED: { bg: "#f3f4f6", text: "#6b7280",  label: "Declined" },
  WAITLIST: { bg: "#fdf4ff", text: "#7e22ce",  label: "Waitlist" },
};

function fmtZAR(v: number) { return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`; }
function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"; }
function waLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "27" + digits.slice(1) : digits;
  return `https://wa.me/${intl}`;
}
function ContactButtons({ email, phone, compact = false }: { email: string; phone: string; compact?: boolean }) {
  const sz = compact ? 11 : 13;
  const pad = compact ? "3px 7px" : "5px 10px";
  const btn = (href: string, title: string, bg: string, color: string, icon: React.ReactNode) => (
    <a href={href} target="_blank" rel="noreferrer" title={title}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, border: "none", borderRadius: 6, padding: pad, fontSize: compact ? "0.68rem" : "0.72rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
      {icon}{!compact && title}
    </a>
  );
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: compact ? 4 : 6 }}>
      {phone && btn(`tel:${phone}`, "Call", "#f0f9ff", "#0369a1", <Phone size={sz} />)}
      {phone && btn(waLink(phone), "WhatsApp", "#f0fdf4", "#15803d", <MessageCircle size={sz} />)}
      {btn(`mailto:${email}`, "Email", "#fdf4ff", "#7e22ce", <Mail size={sz} />)}
    </div>
  );
}

function NotesModal({ booking, onClose, onSaved }: { booking: Booking; onClose: () => void; onSaved: () => void }) {
  const [notes, setNotes] = useState(booking.notes ?? "");
  const [saving, setSaving] = useState(false);
  async function save() { setSaving(true); await adminFetch(`/admin/bookings/${booking.id}`, { method: "PATCH", body: JSON.stringify({ notes }) }); setSaving(false); onSaved(); onClose(); }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem" }}>Notes — {booking.firstName} {booking.surname}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} /></button>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} placeholder="Add notes about this booking…"
          style={{ width: "100%", padding: "0.7rem", border: "1px solid #ddd", borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: "1rem" }}>
          <button onClick={onClose} style={{ background: "#f0f0f5", color: "#555", border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ background: "hsl(225,50%,22%)", color: "white", border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>{saving ? "Saving…" : "Save Notes"}</button>
        </div>
      </div>
    </div>
  );
}

// Mobile booking card
function BookingCard({ b, busy, onAction, onDownload, onNotes, onDelete }: {
  b: Booking; busy: boolean;
  onAction: (id: number, endpoint: string) => void;
  onDownload: (id: number) => void;
  onNotes: (b: Booking) => void;
  onDelete: (b: Booking) => void;
  onRefundRequest: (b: Booking) => void;
}) {
  const ss = STATUS_STYLES[b.status];
  const iconBtn = (title: string, bg: string, color: string, icon: React.ReactNode, onClick: () => void, border = "none") => (
    <button title={title} onClick={onClick} disabled={busy} style={{ background: bg, color, border, borderRadius: 8, padding: "9px 11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: busy ? 0.5 : 1 }}>
      {icon}
    </button>
  );
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "1rem", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#aaa" }}>{b.invoiceNumber}</span>
        <span style={{ background: ss.bg, color: ss.text, fontSize: "0.7rem", padding: "3px 10px", borderRadius: 99, fontWeight: 700 }}>{ss.label}</span>
      </div>
      {/* Name + event */}
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>{b.firstName} {b.surname}</div>
      <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: 2 }}>{b.email}</div>
      <ContactButtons email={b.email} phone={b.phone} />
      <div style={{ fontSize: "0.82rem", color: "#555", fontWeight: 500, marginTop: "0.6rem" }}>{b.eventTitle}</div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>{b.eventDate}</div>
      {/* Amount row */}
      <div style={{ display: "flex", gap: 12, marginTop: "0.5rem", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "hsl(225,50%,22%)" }}>{fmtZAR(b.totalAmount)}</span>
        <span style={{ fontSize: "0.75rem", color: "#aaa" }}>· {b.quantity} ticket{b.quantity > 1 ? "s" : ""}</span>
        <span style={{ fontSize: "0.72rem", color: "#bbb", marginLeft: "auto" }}>{fmtDate(b.createdAt)}</span>
      </div>
      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: "0.75rem", flexWrap: "wrap" }}>
        {b.status === "PENDING" && (
          <>
            <button onClick={() => onAction(b.id, `/admin/bookings/${b.id}/approve`)} disabled={busy}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#16a34a", color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
              <Check size={14} /> Approve
            </button>
            <button onClick={() => onAction(b.id, `/admin/bookings/${b.id}/decline`)} disabled={busy}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#dc2626", color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
              <X size={14} /> Decline
            </button>
          </>
        )}
        {(b.status === "APPROVED" || b.status === "OVERDUE") && (
          <button onClick={() => onAction(b.id, `/admin/bookings/${b.id}/paid`)} disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "9px 14px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
            <RandIcon size={14} /> Paid
          </button>
        )}
        {b.status === "APPROVED" && iconBtn("Mark Overdue", "#fee2e2", "#dc2626", <AlertTriangle size={15} />, () => onAction(b.id, `/admin/bookings/${b.id}/overdue`))}
        {b.status === "APPROVED" && iconBtn("Decline", "#fee2e2", "#dc2626", <X size={15} />, () => onAction(b.id, `/admin/bookings/${b.id}/decline`))}
        {b.status === "OVERDUE" && (
          <button
            title="Cancel — No Payment (sends cancellation email, keeps contact)"
            onClick={() => onAction(b.id, `/admin/bookings/${b.id}/cancel-nonpayment`)}
            disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff0e8", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 8, padding: "9px 12px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", opacity: busy ? 0.5 : 1 }}
          >
            <Ban size={14} /> Cancel — No Payment
          </button>
        )}
        {b.status !== "DECLINED" && b.status !== "PENDING" && iconBtn("Send Follow-up", "#f0f4ff", "hsl(225,50%,30%)", <Send size={15} />, () => onAction(b.id, `/admin/bookings/${b.id}/followup`))}
        {iconBtn("Download Invoice", "#f5f0ff", "hsl(270,50%,40%)", <FileText size={15} />, () => onDownload(b.id))}
        {b.status === "PAID" && (
          <button title="Request Refund — sends a secure bank details form to the guest" onClick={() => onRefundRequest(b)} disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 8, padding: "9px 12px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", opacity: busy ? 0.5 : 1 }}>
            <RotateCcw size={14} /> Refund
          </button>
        )}
        {iconBtn("Notes", "#fffbf0", "#a16207", <StickyNote size={15} />, () => onNotes(b))}
        {iconBtn("Delete", "#fff0f0", "#dc2626", <Trash2 size={15} />, () => onDelete(b), "1px solid #fecaca")}
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const { token } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [notesBooking, setNotesBooking] = useState<Booking | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | null>(null);
  const [refundLoading, setRefundLoading] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setRefreshing(true);
    const res = await adminFetch("/admin/bookings");
    const d = await res.json();
    if (d.ok) setBookings(d.bookings);
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showMsg(msg: string) { setStatusMsg(msg); setTimeout(() => setStatusMsg(""), 3000); }

  async function action(id: number, endpoint: string, method = "POST") {
    setActionLoading(id);
    const res = await adminFetch(endpoint, { method });
    const d = await res.json();
    if (d.ok) { await load(); showMsg(d.message ?? "Done."); }
    else showMsg(d.error ?? "Action failed.");
    setActionLoading(null);
  }

  async function deleteBooking(booking: Booking) {
    const confirmed = window.confirm(`Permanently delete booking ${booking.invoiceNumber} for ${booking.firstName} ${booking.surname}?\n\nThis cannot be undone.`);
    if (!confirmed) return;
    setActionLoading(booking.id);
    const res = await adminFetch(`/admin/bookings/${booking.id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { await load(); showMsg(d.message ?? "Booking deleted."); }
    else showMsg(d.error ?? "Delete failed.");
    setActionLoading(null);
  }

  function downloadInvoice(id: number) { window.open(`/api/admin/bookings/${id}/invoice?token=${token}`, "_blank"); }

  async function requestRefund(booking: Booking) {
    if (!window.confirm(`Send a refund bank-details form to ${booking.firstName} ${booking.surname} (${booking.email})?\n\nThis will email them a secure link to submit their banking details.`)) return;
    setRefundLoading(booking.id);
    const res = await adminFetch(`/admin/bookings/${booking.id}/refund-request`, { method: "POST" });
    const d = await res.json();
    if (d.ok) showMsg("Refund form sent to guest ✓");
    else if (res.status === 409) showMsg("A refund request is already active for this booking.");
    else showMsg(d.error ?? "Failed to send refund request.");
    setRefundLoading(null);
  }

  const stats = {
    pending:  bookings.filter(b => b.status === "PENDING").length,
    approved: bookings.filter(b => b.status === "APPROVED").length,
    paid:     bookings.filter(b => b.status === "PAID").length,
    overdue:  bookings.filter(b => b.status === "OVERDUE").length,
    waitlist: bookings.filter(b => b.status === "WAITLIST").length,
    revenue:  bookings.filter(b => b.status === "PAID").reduce((s, b) => s + b.totalAmount, 0),
  };

  const visibleBookings = statusFilter ? bookings.filter(b => b.status === statusFilter) : bookings;

  function toggleFilter(status: BookingStatus) {
    setStatusFilter(prev => prev === status ? null : status);
  }

  if (loading) return <AdminLayout title="Bookings"><div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading bookings…</div></AdminLayout>;

  return (
    <AdminLayout title="Bookings">
      {notesBooking && <NotesModal booking={notesBooking} onClose={() => setNotesBooking(null)} onSaved={load} />}
      {statusMsg && <div style={{ position: "fixed", bottom: "1.5rem", right: "1rem", left: isMobile ? "1rem" : "auto", background: "hsl(225,50%,22%)", color: "white", padding: "0.75rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, zIndex: 300, textAlign: isMobile ? "center" : "left" }}>{statusMsg}</div>}

      {/* Stats strip — click to filter */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.6rem", marginBottom: "1rem" }}>
        {/* All Bookings tile */}
        {(() => {
          const isActive = statusFilter === null;
          return (
            <div
              key="all"
              onClick={() => setStatusFilter(null)}
              style={{ background: isActive ? "hsl(225,50%,22%)" : "white", borderRadius: 10, padding: "0.85rem 1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: isActive ? "2px solid hsl(225,50%,22%)" : "1px solid #eee", cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: isActive ? "white" : "hsl(225,50%,22%)" }}>{bookings.length}</div>
              <div style={{ fontSize: "0.72rem", color: isActive ? "rgba(255,255,255,0.75)" : "#777" }}>All Bookings</div>
            </div>
          );
        })()}
        {([
          { label: "Pending",  value: stats.pending,  color: "#f59e0b", status: "PENDING"  as BookingStatus },
          { label: "Approved", value: stats.approved, color: "#3b82f6", status: "APPROVED" as BookingStatus },
          { label: "Paid",     value: stats.paid,     color: "#10b981", status: "PAID"     as BookingStatus },
          { label: "Overdue",  value: stats.overdue,  color: "#ef4444", status: "OVERDUE"  as BookingStatus },
          { label: "Waitlist", value: stats.waitlist, color: "#7e22ce", status: "WAITLIST" as BookingStatus },
        ] as const).map(s => {
          const isActive = statusFilter === s.status;
          return (
            <div
              key={s.label}
              onClick={() => toggleFilter(s.status)}
              style={{ background: isActive ? s.color : "white", borderRadius: 10, padding: "0.85rem 1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: isActive ? `2px solid ${s.color}` : "1px solid #eee", cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: isActive ? "white" : s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: isActive ? "rgba(255,255,255,0.8)" : "#777" }}>{s.label}</div>
            </div>
          );
        })}
        {/* Revenue tile — display only, not filterable */}
        <div style={{ background: "white", borderRadius: 10, padding: "0.85rem 1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "hsl(225,50%,22%)" }}>{fmtZAR(stats.revenue)}</div>
          <div style={{ fontSize: "0.72rem", color: "#777" }}>Revenue</div>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "hsl(225,50%,22%)" }}>
          {statusFilter ? `${STATUS_STYLES[statusFilter].label} Bookings` : "All Bookings"} ({visibleBookings.length}{statusFilter ? ` of ${bookings.length}` : ""})
        </h3>
        <button onClick={load} disabled={refreshing} style={{ background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 8, padding: "0.5rem 0.85rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} /> Refresh
        </button>
      </div>

      {visibleBookings.length === 0 ? (
        <div style={{ background: "white", borderRadius: 12, padding: "3rem", textAlign: "center", color: "#aaa" }}>
          {statusFilter ? `No ${STATUS_STYLES[statusFilter].label.toLowerCase()} bookings.` : "No bookings yet."}
        </div>
      ) : isMobile ? (
        /* Mobile: card stack */
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {visibleBookings.map(b => (
            <BookingCard
              key={b.id} b={b} busy={actionLoading === b.id || refundLoading === b.id}
              onAction={action} onDownload={downloadInvoice}
              onNotes={setNotesBooking} onDelete={deleteBooking}
              onRefundRequest={requestRefund}
            />
          ))}
        </div>
      ) : (
        /* Desktop: full table */
        <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "#f8f8fc" }}>
                  {["Invoice", "Guest", "Event", "Qty", "Amount", "Status", "Date", "Actions"].map(h => (
                    <th key={h} style={{ padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((b, i) => {
                  const ss = STATUS_STYLES[b.status];
                  const busy = actionLoading === b.id;
                  return (
                    <tr key={b.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5", fontFamily: "monospace", fontSize: "0.77rem", color: "#888" }}>{b.invoiceNumber}</td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5" }}>
                        <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{b.firstName} {b.surname}</div>
                        <div style={{ fontSize: "0.7rem", color: "#888" }}>{b.email}</div>
                        <ContactButtons email={b.email} phone={b.phone} compact />
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 500 }}>{b.eventTitle}</div>
                        <div style={{ fontSize: "0.7rem", color: "#888" }}>{b.eventDate}</div>
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5", textAlign: "center" }}>{b.quantity}</td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtZAR(b.totalAmount)}</td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5" }}>
                        <span style={{ background: ss.bg, color: ss.text, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>{ss.label}</span>
                      </td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5", color: "#888", whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtDate(b.createdAt)}</td>
                      <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                          {b.status === "PENDING" && (
                            <>
                              <button title="Approve" onClick={() => action(b.id, `/admin/bookings/${b.id}/approve`)} disabled={busy} style={{ display: "flex", alignItems: "center", gap: 4, background: "#16a34a", color: "white", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, opacity: busy ? 0.6 : 1 }}><Check size={12} /> Approve</button>
                              <button title="Decline" onClick={() => action(b.id, `/admin/bookings/${b.id}/decline`)} disabled={busy} style={{ display: "flex", alignItems: "center", gap: 4, background: "#dc2626", color: "white", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, opacity: busy ? 0.6 : 1 }}><X size={12} /> Decline</button>
                            </>
                          )}
                          {(b.status === "APPROVED" || b.status === "OVERDUE") && (
                            <button title="Mark as Paid" onClick={() => action(b.id, `/admin/bookings/${b.id}/paid`)} disabled={busy} style={{ display: "flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}><RandIcon size={12} /> Paid</button>
                          )}
                          {b.status === "APPROVED" && (<button title="Mark Overdue" onClick={() => action(b.id, `/admin/bookings/${b.id}/overdue`)} disabled={busy} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem" }}><AlertTriangle size={12} /></button>)}
                          {b.status === "APPROVED" && (<button title="Decline" onClick={() => action(b.id, `/admin/bookings/${b.id}/decline`)} disabled={busy} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem" }}><X size={12} /></button>)}
                          {b.status === "OVERDUE" && (<button title="Cancel — No Payment" onClick={() => action(b.id, `/admin/bookings/${b.id}/cancel-nonpayment`)} disabled={busy} style={{ display: "flex", alignItems: "center", gap: 3, background: "#fff0e8", color: "#c2410c", border: "1px solid #fed7aa", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, opacity: busy ? 0.5 : 1 }}><Ban size={11} /> No Payment</button>)}
                          {b.status !== "DECLINED" && b.status !== "PENDING" && (<button title="Send Follow-up" onClick={() => action(b.id, `/admin/bookings/${b.id}/followup`)} disabled={busy} style={{ background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem" }}><Send size={12} /></button>)}
                          <button title="Download Invoice" onClick={() => downloadInvoice(b.id)} style={{ background: "#f5f0ff", color: "hsl(270,50%,40%)", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem" }}><FileText size={12} /></button>
                          {b.status === "PAID" && (<button title="Request Refund — sends bank details form to guest" onClick={() => requestRefund(b)} disabled={busy || refundLoading === b.id} style={{ display: "flex", alignItems: "center", gap: 3, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600, opacity: (busy || refundLoading === b.id) ? 0.5 : 1 }}><RotateCcw size={11} /> Refund</button>)}
                          <button title="Notes" onClick={() => setNotesBooking(b)} style={{ background: "#fffbf0", color: "#a16207", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem" }}><StickyNote size={12} /></button>
                          <button title="Delete" onClick={() => deleteBooking(b)} disabled={busy} style={{ background: "#fff0f0", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: "0.7rem", opacity: busy ? 0.5 : 1 }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
