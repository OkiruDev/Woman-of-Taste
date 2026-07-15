import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { ArrowLeft, Save, Mail, Phone, Building, Tag, FileText, ToggleLeft, ToggleRight } from "lucide-react";

interface Contact {
  id: number; firstName: string; lastName: string; email: string; phone: string;
  company: string; source: string; tags: string; notes: string; optedOut: boolean;
  emailsReceived: number; lastEmailSentAt: string | null; createdAt: string;
}
interface Booking { id: number; invoiceNumber: string; eventTitle: string; eventDate: string; status: string; totalAmount: number; createdAt: string; }

const INPUT = { padding: "0.6rem 0.85rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.85rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.78rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif" });

const STATUS_COLORS: Record<string, string> = { PENDING: "#f59e0b", APPROVED: "#3b82f6", PAID: "#10b981", OVERDUE: "#ef4444", DECLINED: "#9ca3af" };

export default function ContactProfile() {
  useAdminAuth();
  const params = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState<Partial<Contact>>({});
  const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    adminFetch(`/admin/contacts/${params.id}`).then(r => r.json()).then(d => {
      if (d.ok) { setContact(d.contact); setForm(d.contact); setBookings(d.bookings ?? []); }
    }).finally(() => setLoading(false));
  }, [params.id]);

  async function save() {
    setSaving(true);
    await adminFetch(`/admin/contacts/${params.id}`, { method: "PATCH", body: JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "—"; }
  function fmtZAR(v: number) { return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`; }

  if (loading) return <AdminLayout title="Contact"><div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading…</div></AdminLayout>;
  if (!contact) return <AdminLayout title="Contact"><div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Contact not found.</div></AdminLayout>;

  return (
    <AdminLayout title={`${contact.firstName} ${contact.lastName}`}>
      <div style={{ marginBottom: "1rem" }}>
        <Link href="/admin/contacts">
          <button style={{ ...BTN("#f0f4ff", "hsl(225,50%,30%)"), marginBottom: "1rem" }}><ArrowLeft size={14} />All Contacts</button>
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.25rem" }}>
        {/* Edit form */}
        <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "hsl(225,50%,22%)" }}>Contact Details</h3>
            <button onClick={save} disabled={saving} style={BTN("hsl(225,50%,22%)")}><Save size={14} />{saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[["firstName", "First Name"], ["lastName", "Last Name"]].map(([k, l]) => (
              <div key={k}>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>{l}</label>
                <input value={(form as any)[k] ?? ""} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={INPUT} />
              </div>
            ))}
          </div>

          {[
            ["email", "Email", Mail],["phone", "Phone", Phone],["company", "Company", Building],
          ].map(([k, l, Icon]) => (
            <div key={k as string} style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>{l as string}</label>
              <div style={{ position: "relative" }}>
                <Icon size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
                <input value={(form as any)[k as string] ?? ""} onChange={e => setForm(p => ({ ...p, [k as string]: e.target.value }))} style={{ ...INPUT, paddingLeft: 30 }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: "0.75rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Tags</label>
            <div style={{ position: "relative" }}>
              <Tag size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
              <input value={form.tags ?? ""} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="cooking class, VIP, corporate…" style={{ ...INPUT, paddingLeft: 30 }} />
            </div>
          </div>

          <div style={{ marginTop: "0.75rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Notes</label>
            <div style={{ position: "relative" }}>
              <FileText size={14} style={{ position: "absolute", left: 10, top: 10, color: "#aaa" }} />
              <textarea value={form.notes ?? ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={4} style={{ ...INPUT, paddingLeft: 30, resize: "vertical" }} />
            </div>
          </div>

          <div style={{ marginTop: "1rem", padding: "0.85rem 1rem", background: form.optedOut ? "#fef2f2" : "#f0fdf4", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.83rem", fontWeight: 600, color: form.optedOut ? "#dc2626" : "#16a34a" }}>
              {form.optedOut ? "Opted Out of Marketing Emails" : "Receiving Marketing Emails"}
            </span>
            <button onClick={() => setForm(p => ({ ...p, optedOut: !p.optedOut }))} style={{ background: "none", border: "none", cursor: "pointer", color: form.optedOut ? "#dc2626" : "#16a34a" }}>
              {form.optedOut ? <ToggleLeft size={28} /> : <ToggleRight size={28} />}
            </button>
          </div>
        </div>

        {/* Right sidebar — stats + bookings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <h4 style={{ margin: "0 0 0.75rem", fontFamily: "Cormorant Garamond, serif", fontSize: "1rem", color: "hsl(225,50%,22%)" }}>Contact Info</h4>
            {[["Source", contact.source], ["Date Added", fmtDate(contact.createdAt)], ["Emails Received", String(contact.emailsReceived)], ["Last Email", fmtDate(contact.lastEmailSentAt)]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.8rem" }}>
                <span style={{ color: "#888" }}>{l}</span><span style={{ fontWeight: 600, color: "#333" }}>{v}</span>
              </div>
            ))}
          </div>

          {bookings.length > 0 && (
            <div style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
              <h4 style={{ margin: "0 0 0.75rem", fontFamily: "Cormorant Garamond, serif", fontSize: "1rem", color: "hsl(225,50%,22%)" }}>Booking History</h4>
              {bookings.map(b => (
                <div key={b.id} style={{ padding: "0.6rem 0", borderBottom: "1px solid #f0f0f5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#333" }}>{b.eventTitle}</div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: (STATUS_COLORS[b.status] ?? "#6b7280") + "22", color: STATUS_COLORS[b.status] ?? "#6b7280" }}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#888" }}>{b.eventDate} · {fmtZAR(b.totalAmount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
