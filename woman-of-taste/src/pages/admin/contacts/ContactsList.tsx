import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Search, Plus, Download, RefreshCw, ChevronLeft, ChevronRight, User, Trash2, X } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";

interface Contact {
  id: number; firstName: string; lastName: string; email: string; phone: string;
  company: string; source: string; tags: string; optedOut: boolean;
  emailsReceived: number; lastEmailSentAt: string | null; createdAt: string;
}

const INPUT = { padding: "0.55rem 0.85rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.83rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif", whiteSpace: "nowrap" as const });

function AddContactModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", company: "", tags: "", notes: "" });
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const res = await adminFetch("/admin/contacts", { method: "POST", body: JSON.stringify(form) });
    const d = await res.json();
    if (d.ok) { onAdded(); onClose(); } else setError(d.error ?? "Failed to add contact.");
    setLoading(false);
  }
  const F = (k: keyof typeof form, label: string, type = "text") => (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>{label}</label>
      <input type={type} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={INPUT} />
    </div>
  );
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: "hsl(225,50%,22%)" }}>Add Contact</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", padding: 4 }}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 0.75rem" }}>
            <div>{F("firstName", "First Name")}</div><div>{F("lastName", "Last Name")}</div>
          </div>
          {F("email", "Email", "email")}{F("phone", "Phone", "tel")}{F("company", "Company / Organisation")}
          {F("tags", "Tags (comma separated)")}{F("notes", "Notes")}
          {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", marginBottom: "0.75rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={BTN("#f0f0f5", "#555")}>Cancel</button>
            <button type="submit" disabled={loading} style={BTN("hsl(225,50%,22%)")}>{loading ? "Saving…" : "Add Contact"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContactsList() {
  useAdminAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1);
  const [search, setSearch] = useState(""); const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true); const [syncing, setSyncing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const isMobile = useIsMobile();
  const PER = 50;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: String(PER) });
    if (search) params.set("search", search);
    const res = await adminFetch(`/admin/contacts?${params}`);
    const d = await res.json();
    if (d.ok) { setContacts(d.contacts); setTotal(d.total); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function syncBookings() {
    setSyncing(true);
    await adminFetch("/admin/contacts/sync", { method: "POST" });
    await load(); setSyncing(false);
  }

  async function exportCSV() { window.open(`/api/admin/contacts/export?token=${localStorage.getItem("wot_admin_token")}`, "_blank"); }

  async function deleteContact(id: number) {
    if (!confirm("Delete this contact? This cannot be undone.")) return;
    await adminFetch(`/admin/contacts/${id}`, { method: "DELETE" });
    load();
  }

  function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"; }
  const totalPages = Math.ceil(total / PER);

  return (
    <AdminLayout title="Contacts">
      {showAdd && <AddContactModal onClose={() => setShowAdd(false)} onAdded={load} />}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: isMobile ? "1.2rem" : "1.4rem", color: "hsl(225,50%,22%)" }}>Mailing List</h2>
          <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#888" }}>{total} contacts</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {!isMobile && <button onClick={syncBookings} disabled={syncing} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><RefreshCw size={13} />{syncing ? "Syncing…" : "Sync Bookings"}</button>}
          {!isMobile && <button onClick={exportCSV} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><Download size={13} />Export CSV</button>}
          <button onClick={() => setShowAdd(true)} style={BTN("hsl(225,50%,22%)")}><Plus size={13} />{isMobile ? "Add" : "Add Contact"}</button>
          {isMobile && <button onClick={syncBookings} disabled={syncing} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><RefreshCw size={13} /></button>}
          {isMobile && <button onClick={exportCSV} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><Download size={13} /></button>}
        </div>
      </div>

      {/* Search */}
      <div style={{ background: "white", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "0.85rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", display: "flex", gap: 6 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            placeholder="Search name, email, tag…" style={{ ...INPUT, paddingLeft: 32 }} />
        </div>
        <button onClick={() => { setSearch(searchInput); setPage(1); }} style={BTN("hsl(225,50%,22%)")}>Search</button>
        {search && <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} style={BTN("#f0f0f5", "#555")}><X size={14} /></button>}
      </div>

      {/* Contact list */}
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading contacts…</div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
            <User size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p>{search ? "No contacts match that search." : "Sync your bookings to populate your mailing list."}</p>
          </div>
        ) : isMobile ? (
          /* Mobile: compact list rows */
          <div>
            {contacts.map((c, i) => (
              <div key={c.id} style={{ padding: "0.85rem 1rem", borderBottom: i < contacts.length - 1 ? "1px solid #f0f0f5" : "none", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Link href={`/admin/contacts/${c.id}`}>
                      <span style={{ color: "hsl(225,50%,30%)", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>{c.firstName} {c.lastName}</span>
                    </Link>
                    {c.optedOut && <span style={{ fontSize: "0.62rem", background: "#fee2e2", color: "#dc2626", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>Opted Out</span>}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "#777", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: "0.3rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ background: "#f0f4ff", color: "hsl(225,50%,40%)", fontSize: "0.65rem", padding: "1px 7px", borderRadius: 99, fontWeight: 600 }}>{c.source}</span>
                    {c.tags && c.tags.split(",").slice(0, 2).map(t => (
                      <span key={t} style={{ background: "#f5f5f5", color: "#666", fontSize: "0.65rem", padding: "1px 6px", borderRadius: 99 }}>{t.trim()}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => deleteContact(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", opacity: 0.5, padding: 8, flexShrink: 0 }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: full table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "#f8f8fc" }}>
                  {["Name", "Email", "Phone", "Source", "Tags", "Emails", "Date Added", ""].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#555", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "1px solid #eee" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#f0f4ff"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "white" : "#fafafa"}>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                      <Link href={`/admin/contacts/${c.id}`}>
                        <span style={{ color: "hsl(225,50%,30%)", fontWeight: 600, cursor: "pointer" }}>{c.firstName} {c.lastName}</span>
                      </Link>
                      {c.optedOut && <span style={{ marginLeft: 6, fontSize: "0.65rem", background: "#fee2e2", color: "#dc2626", padding: "1px 6px", borderRadius: 99 }}>Opted Out</span>}
                    </td>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#555" }}>{c.email}</td>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#777" }}>{c.phone || "—"}</td>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                      <span style={{ background: "#f0f4ff", color: "hsl(225,50%,40%)", fontSize: "0.7rem", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{c.source}</span>
                    </td>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#777", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.tags || "—"}</td>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#555", textAlign: "center" }}>{c.emailsReceived}</td>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#888", whiteSpace: "nowrap" }}>{fmtDate(c.createdAt)}</td>
                    <td style={{ padding: "0.7rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                      <button onClick={() => deleteContact(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", opacity: 0.6, padding: 4 }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "0.6"}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#777" }}>Page {page} of {totalPages} · {total}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={BTN("#f0f0f5", "#555")}><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={BTN("#f0f0f5", "#555")}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
