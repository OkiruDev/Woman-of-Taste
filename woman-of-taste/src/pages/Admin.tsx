import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const API = "/api";
const TOKEN_KEY = "wot_admin_token";

type BookingStatus = "PENDING" | "APPROVED" | "PAID" | "OVERDUE" | "DECLINED" | "WAITLIST";

interface Booking {
  id: number;
  invoiceNumber: string;
  status: BookingStatus;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  eventTitle: string;
  eventDate: string;
  quantity: number;
  totalAmount: number;
  notes: string | null;
  lastFollowupSentAt: string | null;
  invoiceSentAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "#e5e7eb", text: "#374151", label: "Pending" },
  APPROVED: { bg: "#dbeafe", text: "#1e40af", label: "Approved" },
  PAID: { bg: "#d1fae5", text: "#065f46", label: "Paid" },
  OVERDUE: { bg: "#fee2e2", text: "#991b1b", label: "Overdue" },
  DECLINED: { bg: "#f3f4f6", text: "#6b7280", label: "Declined" },
  WAITLIST: { bg: "#fdf4ff", text: "#7e22ce", label: "Waitlist" },
};

function formatZAR(v: number) {
  return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Login failed.");
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "hsl(40,25%,96%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-3xl overflow-hidden shadow-xl border border-[hsl(35,15%,86%)]"
          style={{ background: "#fff" }}
        >
          <div
            className="px-8 py-8 text-center"
            style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,30%))" }}
          >
            <p className="font-serif text-xl text-[hsl(38,45%,65%)] mb-1">Woman of Taste</p>
            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-white/50">Admin Dashboard</p>
          </div>
          <form onSubmit={submit} className="px-8 py-8">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,38%)] mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full font-sans text-sm border border-[hsl(35,15%,86%)] rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-[hsl(225,50%,40%)]"
              placeholder="Enter password"
            />
            {error && (
              <p className="font-sans text-xs text-red-600 mb-3">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans text-xs font-semibold tracking-widest uppercase py-3 rounded-full text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,32%))" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [flash, setFlash] = useState<{ id: number; msg: string } | null>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/bookings`, { headers });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  function showFlash(id: number, msg: string) {
    setFlash({ id, msg });
    setTimeout(() => setFlash(null), 3000);
  }

  async function action(key: string, fn: () => Promise<void>) {
    setActionLoading((p) => ({ ...p, [key]: true }));
    try { await fn(); await fetchBookings(); } catch { /* silent */ }
    setActionLoading((p) => ({ ...p, [key]: false }));
  }

  async function markPaid(b: Booking) {
    await action(`paid-${b.id}`, async () => {
      await fetch(`${API}/admin/bookings/${b.id}/paid`, { method: "POST", headers });
      showFlash(b.id, "Marked as PAID");
    });
  }

  async function markOverdue(b: Booking) {
    await action(`overdue-${b.id}`, async () => {
      await fetch(`${API}/admin/bookings/${b.id}/overdue`, { method: "POST", headers });
      showFlash(b.id, "Marked as OVERDUE");
    });
  }

  async function sendFollowup(b: Booking) {
    await action(`fu-${b.id}`, async () => {
      const res = await fetch(`${API}/admin/bookings/${b.id}/followup`, { method: "POST", headers });
      const data = await res.json();
      showFlash(b.id, data.ok ? "Follow-up sent ✓" : data.error ?? "Error");
    });
  }

  async function saveNotes(b: Booking) {
    const notes = editingNotes[b.id] ?? b.notes ?? "";
    await action(`notes-${b.id}`, async () => {
      await fetch(`${API}/admin/bookings/${b.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ notes }),
      });
      setEditingNotes((p) => { const n = { ...p }; delete n[b.id]; return n; });
      showFlash(b.id, "Notes saved ✓");
    });
  }

  function downloadInvoice(b: Booking) {
    window.open(`${API}/admin/bookings/${b.id}/invoice?token=${token}`, "_blank");
  }

  // Summary stats
  const approved = bookings.filter((b) => b.status === "APPROVED");
  const paid = bookings.filter((b) => b.status === "PAID");
  const totalApprovedValue = approved.reduce((s, b) => s + b.totalAmount, 0);
  const totalCollected = paid.reduce((s, b) => s + b.totalAmount, 0);
  const totalOutstanding = approved.reduce((s, b) => s + b.totalAmount, 0);

  const stats = [
    { label: "Total Bookings", value: bookings.length.toString() },
    { label: "Approved Value", value: formatZAR(totalApprovedValue) },
    { label: "Collected", value: formatZAR(totalCollected) },
    { label: "Outstanding", value: formatZAR(totalOutstanding) },
    { label: "Needs Follow-Up", value: approved.filter((b) => !b.lastFollowupSentAt).length.toString() },
  ];

  return (
    <div className="min-h-screen" style={{ background: "hsl(40,20%,97%)" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-4"
        style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,30%))" }}
      >
        <div>
          <p className="font-serif text-base text-[hsl(38,45%,65%)]">Woman of Taste</p>
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/50">Admin Dashboard</p>
        </div>
        <button
          onClick={onLogout}
          className="font-sans text-[10px] tracking-widest uppercase text-white/60 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 border border-[hsl(35,15%,88%)]"
              style={{ background: "#fff" }}
            >
              <p className="font-sans text-[9px] tracking-widest uppercase text-[hsl(28,18%,48%)] mb-1">{s.label}</p>
              <p className="font-serif text-xl text-[hsl(225,50%,22%)]">{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 font-sans text-sm text-[hsl(28,18%,42%)]">Loading bookings…</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 font-sans text-sm text-[hsl(28,18%,42%)]">No bookings yet.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-[hsl(35,15%,88%)] shadow-sm">
              <table className="w-full text-left border-collapse" style={{ background: "#fff" }}>
                <thead>
                  <tr style={{ background: "hsl(225,50%,22%)" }}>
                    {["Invoice", "Booker", "Event", "Date", "Guests", "Total", "Status", "Last Follow-Up", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="font-sans text-[9px] font-bold tracking-widest uppercase text-white/70 px-4 py-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => {
                    const st = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
                    const isFlash = flash?.id === b.id;
                    return (
                      <tr
                        key={b.id}
                        className="border-t border-[hsl(35,15%,91%)] hover:bg-[hsl(40,20%,98%)] transition-colors"
                        style={isFlash ? { background: "#d1fae5" } : i % 2 === 0 ? {} : { background: "hsl(40,15%,99%)" }}
                      >
                        <td className="px-4 py-3 font-sans text-xs font-bold text-[hsl(225,50%,22%)] whitespace-nowrap">{b.invoiceNumber}</td>
                        <td className="px-4 py-3">
                          <p className="font-sans text-xs font-semibold text-[hsl(28,18%,15%)]">{b.firstName} {b.surname}</p>
                          <p className="font-sans text-[10px] text-[hsl(28,18%,42%)]">{b.email}</p>
                          <p className="font-sans text-[10px] text-[hsl(28,18%,42%)]">{b.phone}</p>
                        </td>
                        <td className="px-4 py-3 font-sans text-xs text-[hsl(28,18%,22%)] max-w-[160px]">{b.eventTitle}</td>
                        <td className="px-4 py-3 font-sans text-xs text-[hsl(28,18%,38%)] whitespace-nowrap">{b.eventDate}</td>
                        <td className="px-4 py-3 font-sans text-xs text-center text-[hsl(28,18%,22%)]">{b.quantity}</td>
                        <td className="px-4 py-3 font-sans text-xs font-bold text-[hsl(225,50%,22%)] whitespace-nowrap">{formatZAR(b.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span
                            className="font-sans text-[9px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
                            style={{ background: st.bg, color: st.text }}
                          >
                            {st.label}
                          </span>
                          {isFlash && (
                            <p className="font-sans text-[9px] text-green-700 mt-1">{flash.msg}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-sans text-[10px] text-[hsl(28,18%,38%)] whitespace-nowrap">
                          {formatDate(b.lastFollowupSentAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5 min-w-[200px]">
                            {/* Notes row */}
                            <div className="flex gap-1">
                              <input
                                className="flex-1 font-sans text-[10px] border border-[hsl(35,15%,86%)] rounded-lg px-2 py-1 focus:outline-none focus:border-[hsl(225,50%,40%)]"
                                placeholder="Notes…"
                                value={editingNotes[b.id] ?? b.notes ?? ""}
                                onChange={(e) => setEditingNotes((p) => ({ ...p, [b.id]: e.target.value }))}
                              />
                              <button
                                onClick={() => saveNotes(b)}
                                disabled={actionLoading[`notes-${b.id}`]}
                                className="font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-lg text-white disabled:opacity-60"
                                style={{ background: "hsl(225,50%,30%)" }}
                              >
                                Save
                              </button>
                            </div>
                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-1">
                              {b.status !== "PAID" && b.status !== "DECLINED" && (
                                <button
                                  onClick={() => markPaid(b)}
                                  disabled={actionLoading[`paid-${b.id}`]}
                                  className="font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-lg text-white disabled:opacity-60"
                                  style={{ background: "#16a34a" }}
                                >
                                  Mark Paid
                                </button>
                              )}
                              {b.status === "APPROVED" && (
                                <button
                                  onClick={() => markOverdue(b)}
                                  disabled={actionLoading[`overdue-${b.id}`]}
                                  className="font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-lg text-white disabled:opacity-60"
                                  style={{ background: "#dc2626" }}
                                >
                                  Overdue
                                </button>
                              )}
                              {(b.status === "APPROVED" || b.status === "OVERDUE") && (
                                <button
                                  onClick={() => sendFollowup(b)}
                                  disabled={actionLoading[`fu-${b.id}`]}
                                  className="font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-lg disabled:opacity-60"
                                  style={{ background: "hsl(38,70%,88%)", color: "hsl(38,45%,30%)" }}
                                >
                                  Follow-Up
                                </button>
                              )}
                              {b.status !== "PENDING" && b.status !== "DECLINED" && (
                                <button
                                  onClick={() => downloadInvoice(b)}
                                  className="font-sans text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-lg"
                                  style={{ background: "hsl(35,15%,90%)", color: "hsl(28,18%,22%)" }}
                                >
                                  Invoice ↓
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {bookings.map((b) => {
                const st = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
                const isFlash = flash?.id === b.id;
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-[hsl(35,15%,88%)] p-4"
                    style={{ background: isFlash ? "#d1fae5" : "#fff" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-sans text-xs font-bold text-[hsl(225,50%,22%)]">{b.invoiceNumber}</p>
                      <span
                        className="font-sans text-[9px] font-bold tracking-wider uppercase rounded-full px-2.5 py-1"
                        style={{ background: st.bg, color: st.text }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className="font-sans text-sm font-semibold text-[hsl(28,18%,15%)] mb-0.5">{b.firstName} {b.surname}</p>
                    <p className="font-sans text-[10px] text-[hsl(28,18%,42%)] mb-0.5">{b.email} · {b.phone}</p>
                    <p className="font-sans text-xs text-[hsl(28,18%,22%)] mb-0.5">{b.eventTitle}</p>
                    <p className="font-sans text-[10px] text-[hsl(28,18%,42%)] mb-2">{b.eventDate} · {b.quantity} guest{b.quantity > 1 ? "s" : ""} · <strong>{formatZAR(b.totalAmount)}</strong></p>

                    {isFlash && <p className="font-sans text-[10px] text-green-700 mb-2">{flash.msg}</p>}

                    <div className="flex gap-1 mb-2">
                      <input
                        className="flex-1 font-sans text-[10px] border border-[hsl(35,15%,86%)] rounded-lg px-2 py-1.5 focus:outline-none"
                        placeholder="Notes…"
                        value={editingNotes[b.id] ?? b.notes ?? ""}
                        onChange={(e) => setEditingNotes((p) => ({ ...p, [b.id]: e.target.value }))}
                      />
                      <button
                        onClick={() => saveNotes(b)}
                        className="font-sans text-[9px] font-bold uppercase px-2 py-1 rounded-lg text-white"
                        style={{ background: "hsl(225,50%,30%)" }}
                      >
                        Save
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {b.status !== "PAID" && b.status !== "DECLINED" && (
                        <button
                          onClick={() => markPaid(b)}
                          className="font-sans text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg text-white"
                          style={{ background: "#16a34a" }}
                        >
                          Mark Paid
                        </button>
                      )}
                      {b.status === "APPROVED" && (
                        <button
                          onClick={() => markOverdue(b)}
                          className="font-sans text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg text-white"
                          style={{ background: "#dc2626" }}
                        >
                          Overdue
                        </button>
                      )}
                      {(b.status === "APPROVED" || b.status === "OVERDUE") && (
                        <button
                          onClick={() => sendFollowup(b)}
                          className="font-sans text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg"
                          style={{ background: "hsl(38,70%,88%)", color: "hsl(38,45%,30%)" }}
                        >
                          Follow-Up
                        </button>
                      )}
                      {b.status !== "PENDING" && b.status !== "DECLINED" && (
                        <button
                          onClick={() => downloadInvoice(b)}
                          className="font-sans text-[9px] font-bold uppercase px-3 py-1.5 rounded-lg"
                          style={{ background: "hsl(35,15%,90%)", color: "hsl(28,18%,22%)" }}
                        >
                          Invoice ↓
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  function onLogin(t: string) { setToken(t); }
  function onLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!token) return <LoginPage onLogin={onLogin} />;
  return <Dashboard token={token} onLogout={onLogout} />;
}
