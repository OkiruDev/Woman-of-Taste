import { useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Send, Save, Eye, X } from "lucide-react";

const INPUT = { padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.85rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.6rem 1.1rem", fontSize: "0.8rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif" });

interface EventOption { eventId: string; eventTitle: string; eventDate: string; }

const ALL_STATUSES = ["PENDING", "APPROVED", "PAID", "OVERDUE", "WAITLIST"] as const;
type BookingStatus = typeof ALL_STATUSES[number];

const STATUS_META: Record<BookingStatus, { label: string; bg: string; text: string; activeBg: string }> = {
  PENDING:  { label: "Pending",  bg: "#fef9c3", text: "#a16207", activeBg: "#f59e0b" },
  APPROVED: { label: "Approved", bg: "#dbeafe", text: "#1e40af", activeBg: "#3b82f6" },
  PAID:     { label: "Paid",     bg: "#dcfce7", text: "#166534", activeBg: "#10b981" },
  OVERDUE:  { label: "Overdue",  bg: "#fee2e2", text: "#991b1b", activeBg: "#ef4444" },
  WAITLIST: { label: "Waitlist", bg: "#fdf4ff", text: "#7e22ce", activeBg: "#7e22ce" },
};

export default function EmailCompose() {
  useAdminAuth();
  const searchStr = useSearch();
  const searchParams = new URLSearchParams(searchStr);
  const templateId = searchParams.get("template");

  const [form, setForm] = useState({
    name: "", subject: "", previewText: "", body: "", recipientType: "all",
    recipientFilter: "", manualEmails: "", isTemplate: false, templateName: "",
  });
  const [recipientStatuses, setRecipientStatuses] = useState<BookingStatus[]>([...ALL_STATUSES]);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false); const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState(""); const [showTest, setShowTest] = useState(false);
  const [status, setStatus] = useState(""); const [preview, setPreview] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [eventBreakdown, setEventBreakdown] = useState<Partial<Record<BookingStatus, number>>>({});
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    adminFetch("/admin/email/event-list").then(r => r.json()).then(d => {
      if (d.ok) setEvents(d.events ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (templateId) {
      adminFetch(`/admin/email/${templateId}`).then(r => r.json()).then(d => {
        if (d.ok) {
          const c = d.campaign;
          const isActualDraft = c.status === "draft";
          setForm({
            name: c.name, subject: c.subject, previewText: c.previewText ?? "",
            body: c.body,
            recipientType: isActualDraft ? (c.recipientType ?? "all") : "all",
            recipientFilter: isActualDraft ? (c.recipientFilter ?? "") : "",
            manualEmails: isActualDraft ? (c.manualEmails ?? "") : "",
            isTemplate: false, templateName: "",
          });
          if (isActualDraft) setCampaignId(c.id);
        }
      });
    }
  }, [templateId]);

  // Live count when event or statuses change
  useEffect(() => {
    if (form.recipientType !== "event" || !form.recipientFilter) { setEventCount(null); setEventBreakdown({}); return; }
    if (recipientStatuses.length === 0) { setEventCount(0); setEventBreakdown({}); return; }
    const params = new URLSearchParams({ eventId: form.recipientFilter, statuses: recipientStatuses.join(",") });
    adminFetch(`/admin/email/event-count?${params}`).then(r => r.json()).then(d => {
      if (d.ok) { setEventCount(d.count); setEventBreakdown(d.breakdown ?? {}); }
    }).catch(() => {});
  }, [form.recipientType, form.recipientFilter, recipientStatuses]);

  function buildPayload() {
    if (form.recipientType === "event" && form.recipientFilter) {
      return { ...form, recipientFilter: JSON.stringify({ eventId: form.recipientFilter, statuses: recipientStatuses }) };
    }
    return { ...form };
  }

  async function save() {
    setSaving(true); setStatus("Saving…");
    const payload = buildPayload();
    let res;
    if (campaignId) res = await adminFetch(`/admin/email/${campaignId}`, { method: "PATCH", body: JSON.stringify(payload) });
    else res = await adminFetch("/admin/email", { method: "POST", body: JSON.stringify(payload) });
    const d = await res.json();
    if (d.ok) { if (!campaignId) setCampaignId(d.campaign.id); setStatus("Saved as draft ✓"); }
    else setStatus("Save failed.");
    setSaving(false);
  }

  function scheduleAutoSave() {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(save, 60000);
  }

  async function sendTest() {
    if (!testEmail) return;
    setSending(true); setStatus("");
    let id = campaignId;
    if (!id) { const res = await adminFetch("/admin/email", { method: "POST", body: JSON.stringify(buildPayload()) }); const d = await res.json(); if (d.ok) { id = d.campaign.id; setCampaignId(id); } }
    if (id) {
      const res = await adminFetch(`/admin/email/${id}/send`, { method: "POST", body: JSON.stringify({ testEmail }) });
      const d = await res.json();
      setStatus(d.ok ? `Test sent to ${testEmail} ✓` : d.error ?? "Failed.");
    }
    setSending(false); setShowTest(false);
  }

  async function broadcast() {
    if (form.recipientType === "event" && !form.recipientFilter) {
      setStatus("Please select an event before sending."); return;
    }
    if (form.recipientType === "event" && recipientStatuses.length === 0) {
      setStatus("Please select at least one booking status to send to."); return;
    }
    const selectedEvent = form.recipientType === "event" ? events.find(e => e.eventId === form.recipientFilter) : null;
    const statusLabels = recipientStatuses.map(s => STATUS_META[s].label).join(", ");
    const confirmMsg = selectedEvent
      ? `Send to ${eventCount ?? "?"} ${statusLabels} booker(s) of "${selectedEvent.eventTitle}"?\n\nThis cannot be undone.`
      : `Send this email to ALL opted-in contacts? This cannot be undone.`;
    if (!confirm(confirmMsg)) return;
    setSending(true); setStatus("Sending…");
    let id = campaignId;
    if (!id) { const res = await adminFetch("/admin/email", { method: "POST", body: JSON.stringify(buildPayload()) }); const d = await res.json(); if (d.ok) { id = d.campaign.id; setCampaignId(id); } }
    else { await adminFetch(`/admin/email/${id}`, { method: "PATCH", body: JSON.stringify(buildPayload()) }); }
    if (id) {
      const res = await adminFetch(`/admin/email/${id}/send`, { method: "POST", body: JSON.stringify({}) });
      const d = await res.json();
      if (d.ok) { setStatus(`Sent to ${d.sent} recipients ✓`); setTimeout(() => navigate("/admin/email/history"), 2000); }
      else setStatus(d.error ?? "Send failed.");
    }
    setSending(false);
  }

  async function saveAsTemplate() {
    const tplName = prompt("Template name:", form.subject);
    if (!tplName) return;
    await adminFetch("/admin/email", { method: "POST", body: JSON.stringify({ ...buildPayload(), isTemplate: true, templateName: tplName }) });
    setStatus("Saved as template ✓");
  }

  function set(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })); scheduleAutoSave(); }

  function toggleStatus(s: BookingStatus) {
    setRecipientStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  return (
    <AdminLayout title="Compose Email">
      {/* Test email modal */}
      {showTest && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem" }}>Send Test Email</h3>
              <button onClick={() => setShowTest(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com" style={{ ...INPUT, marginBottom: "1rem" }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowTest(false)} style={BTN("#f0f0f5", "#555")}>Cancel</button>
              <button onClick={sendTest} disabled={sending} style={BTN("#3b82f6")}>{sending ? "Sending…" : "Send Test"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Email Preview</h3>
              <button onClick={() => setPreview(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee", background: "#f8f8fc" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#555" }}><strong>Subject:</strong> {form.subject}</p>
              {form.previewText && <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#888" }}><strong>Preview:</strong> {form.previewText}</p>}
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
              <div dangerouslySetInnerHTML={{ __html: form.body }} style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#333" }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Status bar */}
        {status && <div style={{ marginBottom: "1rem", padding: "0.6rem 1rem", background: status.includes("✓") ? "#f0fdf4" : status.includes("failed") || status.includes("Failed") ? "#fef2f2" : "#f0f4ff", borderRadius: 8, fontSize: "0.82rem", color: status.includes("✓") ? "#16a34a" : status.includes("failed") || status.includes("Failed") ? "#dc2626" : "#333" }}>{status}</div>}

        <div style={{ background: "white", borderRadius: 12, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <button onClick={save} disabled={saving} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><Save size={14} />{saving ? "Saving…" : "Save Draft"}</button>
            <button onClick={saveAsTemplate} style={BTN("#f5f0ff", "hsl(270,50%,40%)")}>Save as Template</button>
            <button onClick={() => setPreview(true)} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><Eye size={14} />Preview</button>
            <button onClick={() => setShowTest(true)} style={BTN("#fffbf0", "hsl(38,60%,35%)")}>Test Send</button>
            <button onClick={broadcast} disabled={sending} style={BTN("hsl(225,50%,22%)")}><Send size={14} />{sending ? "Sending…" : "Send"}</button>
          </div>

          {/* Campaign name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Campaign Name (internal)</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. June Newsletter 2026" style={INPUT} />
          </div>

          {/* Recipients */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Send To</label>
            <select value={form.recipientType} onChange={e => set("recipientType", e.target.value)} style={{ ...INPUT, width: "auto" }}>
              <option value="all">All opted-in contacts</option>
              <option value="event">Bookers of a specific event</option>
              <option value="manual">Specific email addresses</option>
            </select>
          </div>

          {/* Event recipient segment */}
          {form.recipientType === "event" && (
            <div style={{ marginBottom: "1.25rem", background: "#f8f8fc", borderRadius: 10, padding: "1rem 1.1rem", border: "1px solid #e8e3f0" }}>
              {/* Event picker */}
              <div style={{ marginBottom: "0.85rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Event</label>
                {events.length === 0 ? (
                  <p style={{ fontSize: "0.82rem", color: "#aaa", margin: 0 }}>No events with bookings found.</p>
                ) : (
                  <select value={form.recipientFilter} onChange={e => set("recipientFilter", e.target.value)} style={INPUT}>
                    <option value="">— Choose an event —</option>
                    {events.map(ev => (
                      <option key={ev.eventId} value={ev.eventId}>
                        {ev.eventTitle}{ev.eventDate ? ` · ${ev.eventDate}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status checkboxes */}
              {form.recipientFilter && (
                <>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>
                    Include booking statuses
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "0.9rem" }}>
                    {ALL_STATUSES.map(s => {
                      const m = STATUS_META[s];
                      const checked = recipientStatuses.includes(s);
                      const count = eventBreakdown[s] ?? 0;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleStatus(s)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: checked ? m.activeBg : "#fff",
                            color: checked ? "white" : m.text,
                            border: `2px solid ${checked ? m.activeBg : m.activeBg + "55"}`,
                            borderRadius: 8, padding: "6px 12px",
                            fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                            transition: "all 0.13s",
                          }}
                        >
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 16, height: 16, borderRadius: 4,
                            background: checked ? "rgba(255,255,255,0.25)" : m.bg,
                            fontSize: "0.65rem", fontWeight: 800,
                          }}>{checked ? "✓" : ""}</span>
                          {m.label}
                          {count > 0 && (
                            <span style={{
                              background: checked ? "rgba(255,255,255,0.25)" : m.bg,
                              color: checked ? "white" : m.text,
                              borderRadius: 99, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700,
                            }}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live recipient count */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: eventCount === 0 ? "#fef2f2" : "#f0fdf4",
                    border: `1px solid ${eventCount === 0 ? "#fecaca" : "#bbf7d0"}`,
                    borderRadius: 8, padding: "0.6rem 0.9rem",
                  }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: eventCount === 0 ? "#dc2626" : "#16a34a" }}>
                      {eventCount ?? "…"}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#555" }}>
                      {eventCount === null ? "Counting recipients…"
                        : eventCount === 0 ? "No recipients match — adjust status selection"
                        : `recipient${eventCount === 1 ? "" : "s"} will receive this email`}
                    </span>
                    {recipientStatuses.length === 0 && (
                      <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>Select at least one status</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {form.recipientType === "manual" && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Email Addresses (comma separated)</label>
              <textarea value={form.manualEmails} onChange={e => set("manualEmails", e.target.value)} rows={2} placeholder="alice@example.com, bob@example.com" style={{ ...INPUT, resize: "vertical" }} />
            </div>
          )}

          {/* Subject */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Subject Line *</label>
            <input value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="Your email subject…" style={{ ...INPUT, fontSize: "1rem", fontWeight: 600 }} />
          </div>

          {/* Preview text */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Preview Text <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(shown in inbox before opening)</span></label>
            <input value={form.previewText} onChange={e => set("previewText", e.target.value)} placeholder="Brief preview that appears in the inbox…" style={INPUT} />
          </div>

          {/* Body */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 4 }}>Email Body *</label>
            <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ background: "#f8f8fc", borderBottom: "1px solid #eee", padding: "0.4rem 0.75rem", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["<strong>", "</strong>", "B"], ["<em>", "</em>", "I"], ["<h2>", "</h2>", "H2"], ["<h3>", "</h3>", "H3"], ["<ul><li>", "</li></ul>", "• List"], ["<a href=\"\">", "</a>", "Link"]].map(([open, close, label]) => (
                  <button key={label} type="button" onClick={() => {
                    const ta = document.getElementById("email-body") as HTMLTextAreaElement;
                    if (!ta) return;
                    const s = ta.selectionStart, e = ta.selectionEnd;
                    const selected = form.body.substring(s, e);
                    const newVal = form.body.substring(0, s) + open + selected + close + form.body.substring(e);
                    set("body", newVal);
                  }} style={{ background: "white", border: "1px solid #ddd", borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "monospace", fontWeight: label === "B" ? 700 : 400 }}>{label}</button>
                ))}
              </div>
              <textarea id="email-body" value={form.body} onChange={e => set("body", e.target.value)} rows={18}
                placeholder="Write your email content here using HTML tags…&#10;&#10;e.g. <p>Dear reader,</p><p>Here is our latest update…</p>"
                style={{ ...INPUT, border: "none", borderRadius: 0, resize: "vertical", minHeight: 320, fontFamily: "monospace", fontSize: "0.83rem" }} />
            </div>
            <p style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 4 }}>
              A branded header, your email signature, and an unsubscribe link are automatically appended.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
