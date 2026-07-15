import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Calendar, MapPin, ArrowLeft, Users, CheckCircle, XCircle, Phone, Mail, MessageCircle } from "lucide-react";
import RandIcon from "../../../components/RandIcon";
import { useIsMobile } from "../../../hooks/use-mobile";

type BookingStatus = "PENDING" | "APPROVED" | "PAID" | "OVERDUE" | "DECLINED" | "WAITLIST";
interface Booking {
  id: number; invoiceNumber: string; status: BookingStatus;
  firstName: string; surname: string; email: string; phone: string;
  eventTitle: string; eventDate: string; eventLocation: string;
  quantity: number; totalAmount: number; paidAt: string | null;
  checkedIn: boolean; checkedInAt: string | null; createdAt: string;
}
interface FinanceEvent {
  eventId: string; eventTitle: string;
  revenue: number; ticketCount: number;
  expenses: number; expenseCount: number;
  profit: number; margin: number | null;
}
interface Expense {
  id: number; category: string; description: string;
  amount: number; date: string; notes: string | null;
}

const STATUS_STYLES: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING:  { bg: "#fef9c3", text: "#a16207",  label: "Pending" },
  APPROVED: { bg: "#dbeafe", text: "#1e40af",  label: "Approved" },
  PAID:     { bg: "#dcfce7", text: "#166534",  label: "Paid" },
  OVERDUE:  { bg: "#fee2e2", text: "#991b1b",  label: "Overdue" },
  DECLINED: { bg: "#f3f4f6", text: "#6b7280",  label: "Declined" },
  WAITLIST: { bg: "#fdf4ff", text: "#7e22ce",  label: "Waitlist" },
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}
function fmtZAR(v: number) {
  return `R\u202f${Number(v).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}
function waLink(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `https://wa.me/${d.startsWith("0") ? "27" + d.slice(1) : d}`;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 10, padding: "0.9rem 1.1rem", border: "1px solid #eee", flex: "1 1 120px" }}>
      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "1.4rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.65rem", color: "#bbb", marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

export default function EventDetail() {
  useAdminAuth();
  const { eventTitle: slugParam } = useParams<{ eventTitle: string }>();
  const eventTitle = decodeURIComponent(slugParam ?? "");
  const isMobile = useIsMobile();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [finance, setFinance] = useState<FinanceEvent | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"guests" | "attendance" | "finance">("guests");

  useEffect(() => {
    if (!eventTitle) return;
    Promise.all([
      adminFetch(`/admin/events/${encodeURIComponent(eventTitle)}/bookings`).then(r => r.json()),
      adminFetch("/admin/finance").then(r => r.json()),
    ]).then(([bd, fd]) => {
      if (bd.ok) setBookings(bd.bookings);
      if (fd.ok) {
        const match = (fd.summary?.events ?? []).find((e: FinanceEvent) =>
          e.eventTitle.toLowerCase() === eventTitle.toLowerCase()
        );
        setFinance(match ?? null);
        const allExpenses: Expense[] = fd.expenses ?? [];
        setExpenses(allExpenses.filter((ex: any) => ex.eventTitle?.toLowerCase() === eventTitle.toLowerCase()));
      }
    }).finally(() => setLoading(false));
  }, [eventTitle]);

  const paid = bookings.filter(b => b.status === "PAID");
  const confirmed = bookings.filter(b => ["PAID", "APPROVED"].includes(b.status));
  const checkedIn = bookings.filter(b => b.checkedIn);
  const pending = bookings.filter(b => b.status === "PENDING");
  const revenue = paid.reduce((s, b) => s + b.totalAmount, 0);

  const firstBooking = bookings[0];
  const eventDate = firstBooking?.eventDate ?? null;
  const eventLocation = firstBooking?.eventLocation ?? null;

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px", border: "none", background: "none", cursor: "pointer",
    fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: active ? 700 : 400,
    color: active ? "hsl(225,50%,22%)" : "#999",
    borderBottom: active ? "2px solid hsl(225,50%,22%)" : "2px solid transparent",
    transition: "all 0.15s",
  });

  return (
    <AdminLayout title={eventTitle || "Event"}>
      <div style={{ maxWidth: 1000 }}>
        {/* Back */}
        <Link href="/admin/events">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#888", cursor: "pointer", marginBottom: "1.25rem", textDecoration: "none" }}>
            <ArrowLeft size={13} /> All Events
          </div>
        </Link>

        {/* Event header */}
        <div style={{ background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.25rem", border: "1px solid #eee" }}>
          <h2 style={{ margin: "0 0 8px", fontFamily: "Cormorant Garamond, serif", fontSize: "1.55rem", color: "hsl(225,50%,22%)" }}>
            {eventTitle}
          </h2>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {eventDate && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "#666" }}>
                <Calendar size={13} /> {fmtDate(eventDate)}
              </span>
            )}
            {eventLocation && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "#666" }}>
                <MapPin size={13} /> {eventLocation}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          <StatCard label="Bookings" value={bookings.length} color="#1a1a2e" />
          <StatCard label="Confirmed" value={confirmed.length} color="#1e40af" />
          <StatCard label="Paid" value={paid.length} color="#166534" />
          <StatCard label="Pending" value={pending.length} color="#a16207" />
          <StatCard label="Attended" value={checkedIn.length} sub={confirmed.length ? `${Math.round(checkedIn.length / confirmed.length * 100)}% show rate` : undefined} color="#7c3aed" />
          <StatCard label="Revenue" value={fmtZAR(revenue)} color="#b45309" />
        </div>

        {/* Tabs */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #eee", padding: "0 0.5rem" }}>
            <button style={TAB_STYLE(tab === "guests")} onClick={() => setTab("guests")}>Guests</button>
            <button style={TAB_STYLE(tab === "attendance")} onClick={() => setTab("attendance")}>Attendance</button>
            <button style={TAB_STYLE(tab === "finance")} onClick={() => setTab("finance")}>Finance</button>
          </div>

          <div style={{ padding: "1rem 1.25rem" }}>
            {loading && <div style={{ fontFamily: "Raleway, sans-serif", color: "#aaa", fontSize: "0.85rem", padding: "1rem 0" }}>Loading…</div>}

            {/* GUESTS TAB */}
            {!loading && tab === "guests" && (
              <div>
                {bookings.length === 0 && (
                  <p style={{ fontFamily: "Raleway, sans-serif", color: "#aaa", fontSize: "0.85rem" }}>No bookings for this event yet.</p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {bookings.map(b => {
                    const s = STATUS_STYLES[b.status] ?? STATUS_STYLES.PENDING;
                    return (
                      <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0.9rem", background: "#fafafa", borderRadius: 8, gap: "0.75rem", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", fontWeight: 600, color: "#1a1a2e" }}>
                            {b.firstName} {b.surname}
                          </div>
                          <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.74rem", color: "#888", marginTop: 2 }}>
                            {b.invoiceNumber} · {b.quantity} ticket{b.quantity !== 1 ? "s" : ""} · {fmtZAR(b.totalAmount)}
                          </div>
                          <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                            {b.phone && (
                              <>
                                <a href={`tel:${b.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#f0f9ff", color: "#0369a1", borderRadius: 5, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 600, textDecoration: "none" }}><Phone size={10} /> Call</a>
                                <a href={waLink(b.phone)} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#f0fdf4", color: "#15803d", borderRadius: 5, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 600, textDecoration: "none" }}><MessageCircle size={10} /> WhatsApp</a>
                              </>
                            )}
                            <a href={`mailto:${b.email}`} style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#fdf4ff", color: "#7e22ce", borderRadius: 5, padding: "2px 8px", fontSize: "0.68rem", fontWeight: 600, textDecoration: "none" }}><Mail size={10} /> Email</a>
                          </div>
                        </div>
                        <span style={{ background: s.bg, color: s.text, fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap", flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ATTENDANCE TAB */}
            {!loading && tab === "attendance" && (
              <div>
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <div style={{ background: "#dcfce7", borderRadius: 8, padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle size={16} color="#166534" />
                    <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#166534" }}>{checkedIn.length} checked in</span>
                  </div>
                  <div style={{ background: "#fee2e2", borderRadius: 8, padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: 6 }}>
                    <XCircle size={16} color="#991b1b" />
                    <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#991b1b" }}>{confirmed.length - checkedIn.length} not checked in</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {confirmed.map(b => (
                    <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.9rem", background: b.checkedIn ? "#f0fdf4" : "#fafafa", borderRadius: 8, borderLeft: `3px solid ${b.checkedIn ? "#16a34a" : "#e5e7eb"}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e" }}>
                          {b.firstName} {b.surname}
                        </div>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#888", marginTop: 1 }}>
                          {b.quantity} ticket{b.quantity !== 1 ? "s" : ""}
                          {b.checkedIn && b.checkedInAt ? ` · Checked in at ${new Date(b.checkedInAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}` : ""}
                        </div>
                      </div>
                      {b.checkedIn
                        ? <CheckCircle size={18} color="#16a34a" />
                        : <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #d1d5db" }} />}
                    </div>
                  ))}
                  {confirmed.length === 0 && <p style={{ fontFamily: "Raleway, sans-serif", color: "#aaa", fontSize: "0.85rem" }}>No confirmed bookings yet.</p>}
                </div>
              </div>
            )}

            {/* FINANCE TAB */}
            {!loading && tab === "finance" && (
              <div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "0.9rem 1.1rem", flex: "1 1 140px" }}>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#166534" }}>{fmtZAR(finance?.revenue ?? revenue)}</div>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#888", marginTop: 2 }}>Revenue (paid tickets)</div>
                  </div>
                  <div style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 10, padding: "0.9rem 1.1rem", flex: "1 1 140px" }}>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#a16207" }}>{fmtZAR(finance?.expenses ?? 0)}</div>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#888", marginTop: 2 }}>Expenses ({expenses.length} items)</div>
                  </div>
                  <div style={{ background: finance?.profit != null && finance.profit < 0 ? "#fee2e2" : "#f0f9ff", border: `1px solid ${finance?.profit != null && finance.profit < 0 ? "#fecaca" : "#bfdbfe"}`, borderRadius: 10, padding: "0.9rem 1.1rem", flex: "1 1 140px" }}>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: finance?.profit != null && finance.profit < 0 ? "#991b1b" : "#1e40af" }}>
                      {fmtZAR(finance?.profit ?? (finance?.revenue ?? revenue))}
                    </div>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#888", marginTop: 2 }}>Net Profit</div>
                  </div>
                </div>

                {expenses.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: "0.6rem" }}>Expenses</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {expenses.map(ex => (
                        <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.9rem", background: "#fafafa", borderRadius: 8 }}>
                          <div>
                            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#1a1a2e" }}>{ex.description}</div>
                            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#999", marginTop: 1 }}>{ex.category} · {fmtDate(ex.date)}</div>
                          </div>
                          <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "#b45309" }}>{fmtZAR(ex.amount)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {expenses.length === 0 && (
                  <p style={{ fontFamily: "Raleway, sans-serif", color: "#bbb", fontSize: "0.82rem" }}>
                    No expenses recorded. Add them in <Link href="/admin/finance" style={{ color: "hsl(225,50%,40%)" }}>Finance</Link>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
