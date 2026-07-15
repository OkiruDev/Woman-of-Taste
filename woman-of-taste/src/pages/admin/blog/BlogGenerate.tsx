import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Sparkles, ArrowLeft, ChevronDown, ChevronUp, Wand2 } from "lucide-react";

const CATEGORIES = ["Editorial", "Events", "Dining", "Lifestyle", "Womanhood", "Culture", "Hospitality"];
const TONES = [
  { value: "aspirational", label: "Aspirational — elevated, dreamy, inspiring" },
  { value: "editorial", label: "Editorial — journalistic, opinionated, sharp" },
  { value: "intimate", label: "Intimate — warm, personal, confessional" },
  { value: "analytical", label: "Analytical — thoughtful, discerning, insightful" },
];

const INPUT = { padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.85rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const LABEL = { display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#666", marginBottom: 4 };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.65rem 1.2rem", fontSize: "0.82rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif" });

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

interface GeneratedPost {
  title: string; excerpt: string; content: string;
  metaTitle: string; metaDescription: string; focusKeyword: string; readTime: string;
}

export default function BlogGenerate() {
  useAdminAuth();
  const [, navigate] = useLocation();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Editorial");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [expanded, setExpanded] = useState<"content" | "seo" | null>("content");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic."); return; }
    setGenerating(true); setError(""); setResult(null);
    try {
      const res = await adminFetch("/admin/generate/blog", {
        method: "POST",
        body: JSON.stringify({ topic, category, notes }),
      });
      const d = await res.json();
      if (d.ok) { setResult(d.post); }
      else setError(d.error ?? "Generation failed.");
    } catch {
      setError("Network error. Please try again.");
    }
    setGenerating(false);
  }

  async function saveAsDraft() {
    if (!result) return;
    setSaving(true); setSaveStatus("Saving…");
    try {
      const payload = {
        title: result.title, slug: slugify(result.title), category,
        author: "Patience Bwanya", excerpt: result.excerpt, content: result.content,
        metaTitle: result.metaTitle, metaDescription: result.metaDescription,
        focusKeyword: result.focusKeyword, readTime: result.readTime,
        status: "draft", featured: false, coverImageUrl: "",
      };
      const res = await adminFetch("/admin/blog", { method: "POST", body: JSON.stringify(payload) });
      const d = await res.json();
      if (d.ok && d.post?.id) {
        setSaveStatus("Saved ✓");
        setTimeout(() => navigate(`/admin/blog/${d.post.id}/edit`), 900);
      } else setSaveStatus(d.error ?? "Save failed.");
    } catch { setSaveStatus("Save failed."); }
    setSaving(false);
  }

  return (
    <AdminLayout title="Generate Blog Post">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => navigate("/admin/blog")} style={BTN("#f0f4ff", "hsl(225,50%,30%)")}>
            <ArrowLeft size={14} />All Posts
          </button>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {saveStatus && <span style={{ fontSize: "0.82rem", padding: "0.55rem 0.75rem", color: saveStatus.includes("✓") ? "#16a34a" : "#dc2626" }}>{saveStatus}</span>}
            {result && (
              <>
                <button onClick={saveAsDraft} disabled={saving} style={BTN("#f5f0ff", "hsl(270,50%,40%)")}>
                  {saving ? "Saving…" : "Save as Draft"}
                </button>
                <button onClick={() => navigate(`/admin/blog/new`)} style={BTN("hsl(225,50%,22%)")}>
                  Open in Editor
                </button>
              </>
            )}
          </div>
        </div>

        {/* Prompt form */}
        <div style={{ background: "white", borderRadius: 12, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,hsl(225,50%,22%),hsl(38,45%,45%))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.25rem", color: "hsl(225,50%,22%)" }}>AI Blog Generator</h2>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Describe your topic and Aura will draft a complete WOT journal post</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={LABEL}>Topic or Title Idea *</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !generating && generate()}
                placeholder="e.g. The art of dining alone as a woman, or why Sunday lunch is the most elegant meal"
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={INPUT}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={LABEL}>Additional Notes <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — angle, key points, tone)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Focus on Black women's relationship with fine dining spaces. Include a South African restaurant scene reference."
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
            {generating ? "Generating your post…" : "Generate Post"}
          </button>

          {generating && (
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: 10, color: "#888", fontSize: "0.82rem" }}>
              <div style={{ width: 20, height: 20, border: "2px solid #ddd", borderTopColor: "hsl(38,45%,50%)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              Crafting your article — this takes about 10 seconds…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </div>

        {/* Generated result */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Success banner */}
            <div style={{ padding: "0.9rem 1.25rem", background: "linear-gradient(135deg,#f0fff4,#fafff5)", border: "1px solid #bbf7d0", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.1rem" }}>✨</span>
              <span style={{ fontSize: "0.83rem", color: "#15803d", fontWeight: 600 }}>Post generated — review and save as draft below, or open in the editor to refine it.</span>
            </div>

            {/* Title & Meta */}
            <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={LABEL}>Generated Title</label>
                <span style={{ fontSize: "0.72rem", color: "#aaa" }}>{result.readTime}</span>
              </div>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem", lineHeight: 1.2 }}>{result.title}</h2>
              <p style={{ fontSize: "0.88rem", fontStyle: "italic", color: "#555", borderLeft: "3px solid hsl(38,45%,60%)", paddingLeft: "0.85rem", margin: 0 }}>{result.excerpt}</p>
            </div>

            {/* Content preview */}
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(expanded === "content" ? null : "content")}
                style={{ width: "100%", padding: "1rem 1.5rem", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                Article Content Preview {expanded === "content" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expanded === "content" && (
                <div style={{ padding: "1.25rem 1.75rem", borderTop: "1px solid #eee", maxHeight: 480, overflowY: "auto" }}>
                  <div className="prose-wot" dangerouslySetInnerHTML={{ __html: result.content }} style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "#333" }} />
                </div>
              )}
            </div>

            {/* SEO preview */}
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(expanded === "seo" ? null : "seo")}
                style={{ width: "100%", padding: "1rem 1.5rem", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                SEO Fields {expanded === "seo" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expanded === "seo" && (
                <div style={{ padding: "1.25rem", borderTop: "1px solid #eee", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[["Meta Title", result.metaTitle], ["Meta Description", result.metaDescription], ["Focus Keyword", result.focusKeyword]].map(([l, v]) => (
                    <div key={l}>
                      <label style={LABEL}>{l}</label>
                      <div style={{ padding: "0.55rem 0.8rem", background: "#f8f8fc", borderRadius: 6, fontSize: "0.83rem", color: "#444" }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingBottom: "2rem" }}>
              <button onClick={() => { setResult(null); setTopic(""); setNotes(""); }} style={BTN("#f0f0f5", "#555")}>Generate New</button>
              <button onClick={saveAsDraft} disabled={saving} style={BTN("#f5f0ff", "hsl(270,50%,40%)")}>
                {saving ? "Saving…" : "Save as Draft"}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
