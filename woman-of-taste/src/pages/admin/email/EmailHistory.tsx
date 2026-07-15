import { useEffect, useState } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Mail, ChevronDown, ChevronUp, Users, Eye, MousePointer } from "lucide-react";

interface Campaign {
  id: number; name: string; subject: string; sentAt: string; recipientsCount: number;
  opensCount: number; clicksCount: number; optOutsCount: number; status: string;
}
interface Send { id: number; email: string; sentAt: string; status: string; }
interface Event { id: number; sendId: number; eventType: string; occurredAt: string; }

export default function EmailHistory() {
  useAdminAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [details, setDetails] = useState<{ sends: Send[]; events: Event[] } | null>(null);

  useEffect(() => {
    adminFetch("/admin/email/campaigns").then(r => r.json()).then(d => {
      if (d.ok) setCampaigns(d.campaigns.filter((c: Campaign) => c.status === "sent"));
    }).finally(() => setLoading(false));
  }, []);

  async function loadDetails(id: number) {
    if (expanded === id) { setExpanded(null); setDetails(null); return; }
    setExpanded(id); setDetails(null);
    const res = await adminFetch(`/admin/email/${id}/recipients`);
    const d = await res.json();
    if (d.ok) setDetails({ sends: d.sends, events: d.events });
  }

  function pct(n: number, d: number) { return d > 0 ? Math.round((n / d) * 100) + "%" : "—"; }
  function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }

  return (
    <AdminLayout title="Email History">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "hsl(225,50%,22%)" }}>Campaign History</h2>
      </div>

      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
        {loading ? <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading…</div>
          : campaigns.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
              <Mail size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
              <p>No sent campaigns yet. Compose and send your first email to see it here.</p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 40px", padding: "0.6rem 1.25rem", background: "#f8f8fc", borderBottom: "1px solid #eee", fontSize: "0.7rem", fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <span>Campaign</span><span>Sent</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={12} />Sent</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={12} />Opens</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MousePointer size={12} />Clicks</span>
                <span>Opt-outs</span><span></span>
              </div>
              {campaigns.map((c, i) => (
                <div key={c.id}>
                  <div onClick={() => loadDetails(c.id)} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 40px", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f0f0f5", cursor: "pointer", alignItems: "center", background: expanded === c.id ? "#f0f4ff" : i % 2 === 0 ? "white" : "#fafafa" }}
                    onMouseEnter={e => { if (expanded !== c.id) (e.currentTarget as HTMLDivElement).style.background = "#f8f8fc"; }}
                    onMouseLeave={e => { if (expanded !== c.id) (e.currentTarget as HTMLDivElement).style.background = i % 2 === 0 ? "white" : "#fafafa"; }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a1a2e" }}>{c.subject}</div>
                      {c.name !== c.subject && <div style={{ fontSize: "0.72rem", color: "#888" }}>{c.name}</div>}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#777" }}>{c.sentAt ? fmtDate(c.sentAt) : "—"}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{c.recipientsCount}</div>
                    <div style={{ fontSize: "0.85rem" }}><span style={{ fontWeight: 600 }}>{pct(c.opensCount, c.recipientsCount)}</span><span style={{ fontSize: "0.7rem", color: "#aaa", marginLeft: 4 }}>({c.opensCount})</span></div>
                    <div style={{ fontSize: "0.85rem" }}><span style={{ fontWeight: 600 }}>{pct(c.clicksCount, c.recipientsCount)}</span><span style={{ fontSize: "0.7rem", color: "#aaa", marginLeft: 4 }}>({c.clicksCount})</span></div>
                    <div style={{ fontSize: "0.85rem" }}>{c.optOutsCount}</div>
                    <div style={{ color: "#aaa" }}>{expanded === c.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                  </div>
                  {expanded === c.id && (
                    <div style={{ background: "#f8f9ff", borderBottom: "1px solid #e8eaf6", padding: "1rem 1.5rem" }}>
                      {!details ? <div style={{ color: "#aaa", fontSize: "0.82rem" }}>Loading recipient details…</div> : (
                        <div>
                          <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recipients ({details.sends.length})</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.4rem" }}>
                            {details.sends.slice(0, 50).map(s => {
                              const opened = details.events.some(ev => ev.sendId === s.id && ev.eventType === "open");
                              const clicked = details.events.some(ev => ev.sendId === s.id && ev.eventType === "click");
                              return (
                                <div key={s.id} style={{ padding: "0.4rem 0.75rem", background: "white", borderRadius: 6, fontSize: "0.78rem", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e8eaf6" }}>
                                  <span style={{ color: "#333" }}>{s.email}</span>
                                  <div style={{ display: "flex", gap: 4 }}>
                                    {opened && <span style={{ fontSize: "0.65rem", background: "#dbeafe", color: "#1d4ed8", padding: "1px 5px", borderRadius: 99 }}>Opened</span>}
                                    {clicked && <span style={{ fontSize: "0.65rem", background: "#dcfce7", color: "#15803d", padding: "1px 5px", borderRadius: 99 }}>Clicked</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {details.sends.length > 50 && <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "0.5rem" }}>Showing 50 of {details.sends.length} recipients.</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </AdminLayout>
  );
}
