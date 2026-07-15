import { useState } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Sparkles, Wand2, Copy, Check, Instagram, RefreshCw } from "lucide-react";

const TONES = [
  { value: "aspirational", label: "Aspirational" },
  { value: "bold and energetic", label: "Bold & Energetic" },
  { value: "intimate and personal", label: "Intimate & Personal" },
  { value: "educational and informative", label: "Educational" },
  { value: "celebratory", label: "Celebratory" },
  { value: "mysterious and intriguing", label: "Mysterious" },
];

const PLATFORMS = [
  { value: "both", label: "Instagram + TikTok" },
  { value: "instagram", label: "Instagram Only" },
  { value: "tiktok", label: "TikTok Only" },
];

const INPUT = { padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.85rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const LABEL = { display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#666", marginBottom: 4 };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.65rem 1.2rem", fontSize: "0.82rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif" });

interface GeneratedPosts { instagram: string; tiktok: string; pinterest?: string; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function doCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={doCopy} style={{ ...BTN(copied ? "#f0fff4" : "#f8f8fc", copied ? "#15803d" : "#555"), padding: "0.45rem 0.85rem", fontSize: "0.75rem", border: "1px solid #e5e7eb" }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PostCard({ platform, icon, color, accent, caption, charLimit }: {
  platform: string; icon: React.ReactNode; color: string; accent: string;
  caption: string; charLimit: number;
}) {
  const chars = caption.length;
  const over = chars > charLimit;
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #eee", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      {/* Platform header */}
      <div style={{ padding: "0.9rem 1.25rem", background: color, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "white", fontFamily: "Raleway, sans-serif" }}>{platform}</span>
        </div>
        <CopyButton text={caption} />
      </div>
      {/* Caption */}
      <div style={{ padding: "1.25rem" }}>
        <pre style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.84rem", lineHeight: 1.7, color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
          {caption}
        </pre>
        <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: "0.72rem", color: over ? "#dc2626" : "#aaa" }}>
            {chars.toLocaleString()} / {charLimit.toLocaleString()} chars {over ? "⚠️ over limit" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
    </svg>
  );
}

export default function SocialGenerator() {
  useAdminAuth();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("both");
  const [tone, setTone] = useState("aspirational");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratedPosts | null>(null);

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic or occasion."); return; }
    setGenerating(true); setError(""); setResult(null);
    try {
      const res = await adminFetch("/admin/generate/social", {
        method: "POST",
        body: JSON.stringify({ topic, platform, tone, notes }),
      });
      const d = await res.json();
      if (d.ok) setResult(d.posts);
      else setError(d.error ?? "Generation failed.");
    } catch {
      setError("Network error. Please try again.");
    }
    setGenerating(false);
  }

  return (
    <AdminLayout title="Social Media Generator">
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Hero header */}
        <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)" }}>Social Media Generator</h1>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "#888" }}>Generate polished Instagram and TikTok captions for @pashieb_the_wot</p>
          </div>
        </div>

        {/* Prompt form */}
        <div style={{ background: "white", borderRadius: 14, padding: "1.75rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", marginBottom: "1.25rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={LABEL}>Topic or Occasion *</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !generating && generate()}
              placeholder="e.g. Our Women's Day dinner in Johannesburg, a new restaurant review, an inspiring quote on elegance…"
              style={INPUT}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={LABEL}>Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={INPUT}>
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)} style={INPUT}>
                {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={LABEL}>Extra Context <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Link in bio for tickets, venue is The Saxon Johannesburg, limited to 30 guests, wearing emerald green"
              style={{ ...INPUT, resize: "vertical" }}
            />
          </div>

          {error && <div style={{ padding: "0.65rem 1rem", background: "#fef2f2", borderRadius: 8, color: "#dc2626", fontSize: "0.82rem", marginBottom: "1rem" }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={generate}
              disabled={generating}
              style={{
                ...BTN(generating ? "#999" : "linear-gradient(135deg,#833ab4,#c9517a,#e8834e)"),
                padding: "0.75rem 1.75rem",
                fontSize: "0.85rem",
                opacity: generating ? 0.7 : 1,
                cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              <Wand2 size={16} />
              {generating ? "Writing your captions…" : "Generate Captions"}
            </button>
            {result && (
              <button onClick={() => { setResult(null); }} style={BTN("#f8f8fc", "#666")}>
                <RefreshCw size={14} /> New Generation
              </button>
            )}
          </div>

          {generating && (
            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: 10, color: "#888", fontSize: "0.82rem" }}>
              <div style={{ width: 20, height: 20, border: "2px solid #ddd", borderTopColor: "#c9517a", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
              Crafting your captions — this takes about 8 seconds…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
        </div>

        {/* Generated captions */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", paddingBottom: "2rem" }}>
            {/* Success banner */}
            <div style={{ padding: "0.9rem 1.25rem", background: "linear-gradient(135deg,#fdf4ff,#fef9ff)", border: "1px solid #e9d5ff", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.1rem" }}>✨</span>
              <span style={{ fontSize: "0.83rem", color: "#7e22ce", fontWeight: 600 }}>Captions generated — click Copy to use them directly. Tip: add your photo/video before posting.</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              {(platform === "both" || platform === "instagram") && result.instagram && (
                <PostCard
                  platform="Instagram"
                  icon={<Instagram size={16} color="white" />}
                  color="linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)"
                  accent="#833ab4"
                  caption={result.instagram}
                  charLimit={2200}
                />
              )}
              {(platform === "both" || platform === "tiktok") && result.tiktok && (
                <PostCard
                  platform="TikTok"
                  icon={<TikTokIcon />}
                  color="linear-gradient(135deg,#010101,#69C9D0)"
                  accent="#010101"
                  caption={result.tiktok}
                  charLimit={2200}
                />
              )}
              {result.pinterest && (
                <PostCard
                  platform="Pinterest"
                  icon={<span style={{ fontSize: 14, color: "white", fontWeight: 900 }}>P</span>}
                  color="linear-gradient(135deg,#E60023,#ad081b)"
                  accent="#E60023"
                  caption={result.pinterest}
                  charLimit={500}
                />
              )}
            </div>

            {/* Hashtag tip */}
            <div style={{ padding: "1rem 1.25rem", background: "#fffbf0", border: "1px solid #fde68a", borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#92400e" }}>
                <strong>Pro tip:</strong> For maximum reach, post your Instagram and TikTok within 30 minutes of each other. 
                Add 3–5 location hashtags specific to your city (e.g. #Johannesburg #Sandton #GautengDining) to boost local discovery.
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
