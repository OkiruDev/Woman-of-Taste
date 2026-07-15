import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Sparkles, ArrowLeft, ChevronDown, ChevronUp, Wand2, Eye, X } from "lucide-react";

const NEWSLETTER_TYPES = [
  "Newsletter", "Event Announcement", "Event Recap", "Lifestyle Feature",
  "Dining Guide", "Brand Update", "Exclusive Invite", "Monthly Digest",
];

const INPUT = { padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.85rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const LABEL = { display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#666", marginBottom: 4 };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.65rem 1.2rem", fontSize: "0.82rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif" });

interface GeneratedCampaign {
  name: string; subject: string; previewText: string; body: string;
}

export default function EmailGenerate() {
  useAdminAuth();
  const [, navigate] = useLocation();
  const [topic, setTopic] = useState("");
  const [newsletterType, setNewsletterType] = useState("Newsletter");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedCampaign | null>(null);
  const [preview, setPreview] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [opening, setOpening] = useState(false);

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic."); return; }
    setGenerating(true); setError(""); setResult(null);
    try {
      const res = await adminFetch("/admin/generate/newsletter", {
        method: "POST",
        body: JSON.stringify({ topic, newsletterType, notes }),
      });
      const d = await res.json();
      if (d.ok) setResult(d.campaign);
      else setError(d.error ?? "Generation failed.");
    } catch {
      setError("Network error. Please try again.");
    }
    setGenerating(false);
  }

  async function openInComposer() {
    if (!result) return;
    setOpening(true);
    // Save as draft first then redirect to edit it
    const res = await adminFetch("/admin/email", {
      method: "POST",
      body: JSON.stringify({
        name: result.name, subject: result.subject,
        previewText: result.previewText, body: result.body,
        recipientType: "all", manualEmails: "", isTemplate: false, templateName: "",
      }),
    });
    const d = await res.json();
    if (d.ok && d.campaign?.id) navigate(`/admin/email/compose?template=${d.campaign.id}`);
    setOpening(false);
  }

  return (
    <AdminLayout title="Generate Newsletter">
      {/* Preview modal */}
      {preview && result && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif" }}>Email Preview</h3>
              <button onClick={() => setPreview(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #eee", background: "#f8f8fc" }}>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#555" }}><strong>Subject:</strong> {result.subject}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#888" }}><strong>Preview:</strong> {result.previewText}</p>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "1.5rem" }}>
              <div dangerouslySetInnerHTML={{ __html: result.body }} style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#333" }} />
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => navigate("/admin/email")} style={BTN("#f0f4ff", "hsl(225,50%,30%)")}>
            <ArrowLeft size={14} />Back to Email
          </button>
          {result && (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPreview(true)} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><Eye size={14} />Preview</button>
              <button onClick={openInComposer} disabled={opening} style={BTN("hsl(225,50%,22%)")}>
                {opening ? "Opening…" : "Open in Composer"}
              </button>
            </div>
          )}
        </div>

        {/* Prompt form */}
        <div style={{ background: "white", borderRadius: 12, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,hsl(225,50%,22%),hsl(38,45%,45%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.25rem", color: "hsl(225,50%,22%)" }}>AI Newsletter Generator</h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Describe your newsletter and Aura will draft a complete WOT email with animated graphics and signature</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={LABEL}>Topic *</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !generating && generate()}
                placeholder="e.g. Our upcoming women's dinner series in Sandton, February edition"
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>Newsletter Type</label>
              <select value={newsletterType} onChange={e => setNewsletterType(e.target.value)} style={INPUT}>
                {NEWSLETTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={LABEL}>Additional Details <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Date: 14 March, Venue: The Saxon, Tickets: R850, Dress code: All white"
              style={{ ...INPUT, resize: "vertical" }}
            />
          </div>

          {error && <div style={{ padding: "0.65rem 1rem", background: "#fef2f2", borderRadius: 8, color: "#dc2626", fontSize: "0.82rem", marginBottom: "1rem" }}>{error}</div>}

          <button
            onClick={generate}
            disabled={generating}
            style={{
              ...BTN(generating ? "#999" : "linear-gradient(135deg,hsl(225,50%,22%),hsl(38,45%,40%))"),
              padding: "0.75rem 1.75rem",
              fontSize: "0.85rem",
              opacity: generating ? 0.7 : 1,
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            <Wand2 size={16} />
            {generating ? "Writing your newsletter…" : "Generate Newsletter"}
          </button>

          {generating && (
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: 10, color: "#888", fontSize: "0.82rem" }}>
              <div style={{ width: 20, height: 20, border: "2px solid #ddd", borderTopColor: "hsl(38,45%,50%)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              Composing your newsletter — this takes about 10 seconds…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </div>

        {/* Generated result */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Success banner */}
            <div style={{ padding: "0.9rem 1.25rem", background: "linear-gradient(135deg,#f0fff4,#fafff5)", border: "1px solid #bbf7d0", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.1rem" }}>✉️</span>
              <span style={{ fontSize: "0.83rem", color: "#15803d", fontWeight: 600 }}>Newsletter drafted — preview it or open in the composer to send.</span>
            </div>

            {/* Subject & meta */}
            <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={LABEL}>Campaign Name</label>
                  <div style={{ padding: "0.55rem 0.8rem", background: "#f8f8fc", borderRadius: 6, fontSize: "0.85rem" }}>{result.name}</div>
                </div>
                <div>
                  <label style={LABEL}>Subject Line</label>
                  <div style={{ padding: "0.55rem 0.8rem", background: "#f8f8fc", borderRadius: 6, fontSize: "0.88rem", fontWeight: 600, color: "hsl(225,50%,22%)" }}>{result.subject}</div>
                </div>
                <div>
                  <label style={LABEL}>Preview Text</label>
                  <div style={{ padding: "0.55rem 0.8rem", background: "#f8f8fc", borderRadius: 6, fontSize: "0.82rem", color: "#555", fontStyle: "italic" }}>{result.previewText}</div>
                </div>
              </div>
            </div>

            {/* Body preview */}
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ width: "100%", padding: "1rem 1.5rem", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                Email Body Preview {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expanded && (
                <div style={{ padding: "1.5rem", borderTop: "1px solid #eee", maxHeight: 500, overflowY: "auto" }}>
                  <div dangerouslySetInnerHTML={{ __html: result.body }} style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#333" }} />
                  <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fafaf5", borderRadius: 8, fontSize: "0.78rem", color: "#888", textAlign: "center" }}>
                    — Branded WOT header, Patience signature, and unsubscribe link will be added automatically when sending —
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingBottom: "2rem" }}>
              <button onClick={() => { setResult(null); setTopic(""); setNotes(""); }} style={BTN("#f0f0f5", "#555")}>Generate New</button>
              <button onClick={() => setPreview(true)} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><Eye size={14} />Preview</button>
              <button onClick={openInComposer} disabled={opening} style={BTN("hsl(225,50%,22%)")}>
                {opening ? "Opening…" : "Open in Composer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
