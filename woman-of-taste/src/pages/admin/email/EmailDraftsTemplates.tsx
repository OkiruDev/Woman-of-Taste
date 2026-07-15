import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { PlusCircle, FileText, Trash2, Edit, Copy } from "lucide-react";

interface Campaign { id: number; name: string; subject: string; updatedAt: string; status: string; isTemplate: boolean; templateName: string; recipientType?: string; manualEmails?: string; }
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.78rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif" });

function recipientLabel(item: Campaign): string | null {
  if (item.recipientType === "manual" && item.manualEmails) return `To: ${item.manualEmails}`;
  if (item.recipientType === "all") return "To: all contacts";
  if (item.recipientType === "event") return "To: event attendees";
  return null;
}

function CampaignCard({ item, onDelete, basePath }: { item: Campaign; onDelete: () => void; basePath: string }) {
  function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }); }
  const toLabel = recipientLabel(item);
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <FileText size={16} style={{ color: "#8b5cf6", flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.isTemplate ? item.templateName || item.name : item.name}
          </span>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#777", marginLeft: 24 }}>{item.subject}</div>
        {toLabel && <div style={{ fontSize: "0.72rem", color: "#6d28d9", marginLeft: 24, marginTop: 3, fontWeight: 600 }}>{toLabel}</div>}
        <div style={{ fontSize: "0.72rem", color: "#aaa", marginLeft: 24, marginTop: 2 }}>Last saved: {fmtDate(item.updatedAt)}</div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <Link href={`${basePath}?template=${item.id}`}>
          <button title={item.isTemplate ? "Use template" : "Continue editing"} style={BTN("#f0f4ff", "hsl(225,50%,30%)")}>{item.isTemplate ? <Copy size={14} /> : <Edit size={14} />}</button>
        </Link>
        <button onClick={onDelete} title="Delete" style={BTN("#fef2f2", "#dc2626")}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export function EmailDrafts() {
  useAdminAuth();
  const [drafts, setDrafts] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() { adminFetch("/admin/email/drafts").then(r => r.json()).then(d => { if (d.ok) setDrafts(d.drafts); }).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function del(id: number) {
    if (!confirm("Delete this draft?")) return;
    await adminFetch(`/admin/email/${id}`, { method: "DELETE" }); load();
  }

  return (
    <AdminLayout title="Email Drafts">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "hsl(225,50%,22%)" }}>Saved Drafts</h2>
        <Link href="/admin/email/compose"><button style={BTN("hsl(225,50%,22%)")}><PlusCircle size={14} />New Email</button></Link>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>Loading…</div>
        : drafts.length === 0 ? <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}><FileText size={32} style={{ opacity: 0.3, marginBottom: 8 }} /><p>No drafts. Start composing an email to auto-save a draft.</p></div>
        : <div style={{ display: "grid", gap: "0.75rem" }}>{drafts.map(d => <CampaignCard key={d.id} item={d} onDelete={() => del(d.id)} basePath="/admin/email/compose" />)}</div>}
    </AdminLayout>
  );
}

export function EmailTemplates() {
  useAdminAuth();
  const [templates, setTemplates] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() { adminFetch("/admin/email/templates").then(r => r.json()).then(d => { if (d.ok) setTemplates(d.templates); }).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function del(id: number) {
    if (!confirm("Delete this template?")) return;
    await adminFetch(`/admin/email/${id}`, { method: "DELETE" }); load();
  }

  const PREBUILT = [
    { id: -1, name: "Event Announcement", subject: "You're invited — [Event Name]", isTemplate: true, templateName: "Event Announcement", status: "template", updatedAt: new Date().toISOString() },
    { id: -2, name: "Monthly Newsletter", subject: "Woman of Taste — [Month] Edition", isTemplate: true, templateName: "Monthly Newsletter", status: "template", updatedAt: new Date().toISOString() },
    { id: -3, name: "Payment Reminder", subject: "Friendly reminder — your WOT booking payment", isTemplate: true, templateName: "Payment Reminder", status: "template", updatedAt: new Date().toISOString() },
    { id: -4, name: "General Update", subject: "An update from Woman of Taste", isTemplate: true, templateName: "General Update", status: "template", updatedAt: new Date().toISOString() },
  ];

  return (
    <AdminLayout title="Email Templates">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <h2 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "hsl(225,50%,22%)" }}>Email Templates</h2>
        <Link href="/admin/email/compose"><button style={BTN("hsl(225,50%,22%)")}><PlusCircle size={14} />New from Scratch</button></Link>
      </div>
      {templates.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Your Templates</h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {templates.map(t => <CampaignCard key={t.id} item={t} onDelete={() => del(t.id)} basePath="/admin/email/compose" />)}
          </div>
        </div>
      )}
      <div>
        <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#777", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Pre-built Templates</h3>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {PREBUILT.map(t => <CampaignCard key={t.id} item={t as any} onDelete={() => {}} basePath="/admin/email/compose" />)}
        </div>
      </div>
    </AdminLayout>
  );
}
