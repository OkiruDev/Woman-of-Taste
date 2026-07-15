import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import {
  Save, Sparkles, Check, X, ExternalLink, RefreshCw, AlertCircle,
  TrendingUp, Target, Zap, BookOpen, Mail, Clock, ChevronRight,
  ThumbsUp, ThumbsDown, Eye, Edit3, Instagram, Play,
} from "lucide-react";

const FONT = "Raleway, sans-serif";
const SERIF = "Cormorant Garamond, serif";
const INPUT = { padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.83rem", fontFamily: FONT, outline: "none", width: "100%", boxSizing: "border-box" as const };
const TEXTAREA = { ...{ padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.83rem", fontFamily: FONT, outline: "none", width: "100%", boxSizing: "border-box" as const, resize: "vertical" as const } };
const BTN = (bg: string, color = "white", sm = false) => ({
  background: bg, color, border: "none", borderRadius: 8,
  padding: sm ? "0.42rem 0.85rem" : "0.6rem 1.2rem",
  fontSize: sm ? "0.74rem" : "0.82rem", fontWeight: 600 as const,
  cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT,
});
const LABEL = { display: "block" as const, fontSize: "0.67rem", fontWeight: 700 as const, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 5, fontFamily: FONT };
const CARD = { background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" };

const FOCUS_AREAS = [
  { key: "trending_movies", label: "🎬 Trending Movies & Series" },
  { key: "jhb_events", label: "🥂 JHB Events & Experiences" },
  { key: "food_culture", label: "🍽️ Food & Restaurant Culture" },
  { key: "women_empowerment", label: "✨ Women Empowerment" },
  { key: "travel", label: "✈️ Travel & Hospitality" },
  { key: "beauty_wellness", label: "🌿 Beauty & Wellness" },
  { key: "sa_entertainment", label: "🎭 SA Entertainment & Pop Culture" },
  { key: "luxury_lifestyle", label: "💫 Luxury Lifestyle" },
];
const CONTENT_PILLARS = [
  "Dining & Restaurant Reviews", "Lifestyle & Intentional Living", "Events & Experiences",
  "Food Culture & Travel", "Women Empowerment", "Beauty & Wellness", "SA Culture & Entertainment",
];
const DIFF_META: Record<string, { label: string; bg: string; color: string }> = {
  easy:   { label: "Quick Win",  bg: "#dcfce7", color: "#166534" },
  medium: { label: "Moderate",   bg: "#fef9c3", color: "#a16207" },
  hard:   { label: "Competitive",bg: "#fee2e2", color: "#991b1b" },
};
const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  pending_approval: { label: "Awaiting Approval", bg: "#fef9c3", color: "#a16207" },
  approved:         { label: "Approved & Live",    bg: "#dcfce7", color: "#166534" },
  rejected:         { label: "Rejected",           bg: "#fee2e2", color: "#991b1b" },
};

function fmtWeek(d: string) {
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

// ── Tab: Direction ────────────────────────────────────────────────────────────
function DirectionTab() {
  const [form, setForm] = useState({
    focusAreas: [] as string[], tiktokThemes: "", trendingTopics: "",
    contentPillars: CONTENT_PILLARS, targetKeywords: "",
    locationFocus: "Johannesburg", seoAudience: "affluent South African women aged 28–45", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/admin/content-direction").then(r => r.json()).then(d => {
      if (d.ok && d.direction) {
        const dir = d.direction;
        setForm({
          focusAreas: dir.focus_areas ?? [],
          tiktokThemes: dir.tiktok_themes ?? "",
          trendingTopics: dir.trending_topics ?? "",
          contentPillars: dir.content_pillars ?? CONTENT_PILLARS,
          targetKeywords: dir.target_keywords ?? "",
          locationFocus: dir.location_focus ?? "Johannesburg",
          seoAudience: dir.seo_audience ?? "affluent South African women aged 28–45",
          notes: dir.notes ?? "",
        });
      }
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    await adminFetch("/admin/content-direction", { method: "PATCH", body: JSON.stringify(form) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleFocus(key: string) {
    setForm(f => ({ ...f, focusAreas: f.focusAreas.includes(key) ? f.focusAreas.filter(k => k !== key) : [...f.focusAreas, key] }));
  }
  function togglePillar(p: string) {
    setForm(f => ({ ...f, contentPillars: f.contentPillars.includes(p) ? f.contentPillars.filter(x => x !== p) : [...f.contentPillars, p] }));
  }

  if (loading) return <div style={{ color: "#aaa", fontFamily: FONT, padding: "2rem" }}>Loading…</div>;

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Focus Areas */}
      <div style={CARD}>
        <h3 style={{ margin: "0 0 0.25rem", fontFamily: SERIF, fontSize: "1.15rem", color: "hsl(225,50%,22%)" }}>Content Direction</h3>
        <p style={{ margin: "0 0 1.25rem", fontFamily: FONT, fontSize: "0.8rem", color: "#888" }}>
          Set Patience's content strategy. The AI uses this to generate weekly blog posts, emails, and SEO topics that align with her TikTok themes and drive cross-platform engagement.
        </p>

        <label style={LABEL}>Focus Areas — what to target for traffic</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem" }}>
          {FOCUS_AREAS.map(fa => (
            <button key={fa.key} onClick={() => toggleFocus(fa.key)} style={{
              padding: "6px 14px", borderRadius: 20, border: "1.5px solid",
              borderColor: form.focusAreas.includes(fa.key) ? "hsl(225,50%,35%)" : "#ddd",
              background: form.focusAreas.includes(fa.key) ? "hsl(225,50%,35%)" : "white",
              color: form.focusAreas.includes(fa.key) ? "white" : "#555",
              fontFamily: FONT, fontSize: "0.78rem", fontWeight: 500, cursor: "pointer",
            }}>{fa.label}</button>
          ))}
        </div>

        <label style={LABEL}>Content Pillars</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem" }}>
          {CONTENT_PILLARS.map(p => (
            <button key={p} onClick={() => togglePillar(p)} style={{
              padding: "5px 12px", borderRadius: 20, border: "1.5px solid",
              borderColor: form.contentPillars.includes(p) ? "hsl(38,45%,55%)" : "#ddd",
              background: form.contentPillars.includes(p) ? "hsl(38,45%,55%)" : "white",
              color: form.contentPillars.includes(p) ? "white" : "#555",
              fontFamily: FONT, fontSize: "0.75rem", cursor: "pointer",
            }}>{p}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={LABEL}>Location Focus</label>
            <input value={form.locationFocus} onChange={e => setForm(f => ({ ...f, locationFocus: e.target.value }))} style={INPUT} placeholder="Johannesburg" />
          </div>
          <div>
            <label style={LABEL}>Target Audience</label>
            <input value={form.seoAudience} onChange={e => setForm(f => ({ ...f, seoAudience: e.target.value }))} style={INPUT} placeholder="e.g. affluent SA women aged 28–45" />
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={LABEL}>Target SEO Keywords (comma-separated)</label>
          <input value={form.targetKeywords} onChange={e => setForm(f => ({ ...f, targetKeywords: e.target.value }))} style={INPUT} placeholder="e.g. fine dining Johannesburg, lifestyle blogger SA, high tea JHB" />
        </div>
      </div>

      {/* TikTok & Trends */}
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.25rem" }}>
          <Play size={16} style={{ color: "#ff0050" }} />
          <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.15rem", color: "hsl(225,50%,22%)" }}>TikTok & Trending Context</h3>
        </div>
        <p style={{ margin: "0 0 1.25rem", fontFamily: FONT, fontSize: "0.8rem", color: "#888" }}>
          Tell the AI what Patience is currently posting on TikTok and what's trending in SA. This shapes the content so it feels native to her audience.
        </p>
        <div style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label style={LABEL}>Patience's Current TikTok Themes & Hooks</label>
            <textarea rows={4} value={form.tiktokThemes} onChange={e => setForm(f => ({ ...f, tiktokThemes: e.target.value }))} style={TEXTAREA}
              placeholder="e.g. restaurant POV videos, GRWM for events, 'a day in my life as a WOT founder', high tea aesthetics, outfit checks before events, SA celeb sightings..." />
            <div style={{ fontFamily: FONT, fontSize: "0.72rem", color: "#aaa", marginTop: 4 }}>Update this weekly with what's performing on @pashieb_the_wot</div>
          </div>
          <div>
            <label style={LABEL}>What's Trending in SA Right Now</label>
            <textarea rows={4} value={form.trendingTopics} onChange={e => setForm(f => ({ ...f, trendingTopics: e.target.value }))} style={TEXTAREA}
              placeholder="e.g. The Notebook musical at The Market Theatre, Idols SA finale, new Sandton restaurant openings, trending SA film or Netflix series, Fashion Week, Women's Month..." />
            <div style={{ fontFamily: FONT, fontSize: "0.72rem", color: "#aaa", marginTop: 4 }}>Update when new trends emerge to keep content fresh and timely</div>
          </div>
          <div>
            <label style={LABEL}>Additional Notes for AI</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={TEXTAREA}
              placeholder="Any other context — upcoming events Patience is attending, partnerships, seasonal themes, things to avoid…" />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={save} disabled={saving} style={BTN("hsl(225,50%,22%)")}>
          {saved ? <><Check size={15} />Saved!</> : saving ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />Saving…</> : <><Save size={15} />Save Direction</>}
        </button>
      </div>
    </div>
  );
}

// ── Tab: Weekly Pipeline ──────────────────────────────────────────────────────
function PipelineTab() {
  const [weeks, setWeeks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    const d = await adminFetch("/admin/content-pipeline/weeks").then(r => r.json());
    if (d.ok) setWeeks(d.weeks);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function generate() {
    setGenerating(true);
    setGenMsg("Analysing your content direction…");
    setTimeout(() => setGenMsg("Crafting this week's blog post…"), 3000);
    setTimeout(() => setGenMsg("Drafting your weekly email…"), 8000);
    setTimeout(() => setGenMsg("Saving drafts for your approval…"), 13000);
    try {
      const d = await adminFetch("/admin/content-pipeline/generate", { method: "POST", body: "{}" }).then(r => r.json());
      if (d.ok) { setStatus("✓ Content generated! Review below and approve to publish."); load(); }
      else setStatus("Error: " + (d.error ?? "Generation failed."));
    } catch { setStatus("Generation failed. Try again."); }
    setGenerating(false); setGenMsg("");
  }

  async function approve(id: number) {
    const d = await adminFetch(`/admin/content-pipeline/${id}/approve`, { method: "PATCH", body: "{}" }).then(r => r.json());
    if (d.ok) { setStatus("✓ Blog published! Email is in Drafts, ready to send."); load(); }
    else setStatus("Error: " + (d.error ?? "Approval failed."));
  }

  async function reject(id: number) {
    const reason = prompt("Why are you rejecting this? (optional)");
    await adminFetch(`/admin/content-pipeline/${id}/reject`, { method: "PATCH", body: JSON.stringify({ notes: reason }) });
    load();
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Generate card */}
      <div style={{ ...CARD, background: "linear-gradient(135deg, hsl(225,50%,22%) 0%, hsl(225,50%,30%) 100%)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem", fontFamily: SERIF, fontSize: "1.25rem", color: "white" }}>Weekly Content Generator</h3>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", maxWidth: 420 }}>
              Generate this week's blog post + email newsletter in one click. AI uses your direction settings and TikTok context to create on-brand drafts for Patience to review.
            </p>
            {generating && (
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.85)", fontFamily: FONT, fontSize: "0.78rem" }}>
                <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />{genMsg}
              </div>
            )}
            {status && !generating && (
              <div style={{ marginTop: "0.75rem", fontFamily: FONT, fontSize: "0.78rem", color: status.startsWith("✓") ? "#86efac" : "#fca5a5" }}>{status}</div>
            )}
          </div>
          <button onClick={generate} disabled={generating} style={{ ...BTN("hsl(38,45%,55%)"), flexShrink: 0 }}>
            <Sparkles size={15} />{generating ? "Generating…" : "Generate This Week"}
          </button>
        </div>
        <div style={{ marginTop: "1.25rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {[
            { icon: <BookOpen size={14} />, text: "AI writes a full blog post draft" },
            { icon: <Mail size={14} />, text: "AI writes a matching email draft" },
            { icon: <Check size={14} />, text: "You approve → blog goes live, email goes to Drafts" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontFamily: FONT, fontSize: "0.75rem" }}>
              {item.icon}{item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Queue */}
      <div>
        <h3 style={{ margin: "0 0 0.85rem", fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Content Queue ({weeks.length})
        </h3>
        {loading && <div style={{ color: "#aaa", fontFamily: FONT, fontSize: "0.85rem" }}>Loading…</div>}
        {!loading && weeks.length === 0 && (
          <div style={{ ...CARD, textAlign: "center", padding: "2.5rem" }}>
            <Sparkles size={28} style={{ color: "#e5e7eb", marginBottom: 10 }} />
            <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "#bbb", marginBottom: 6 }}>No content generated yet</div>
            <p style={{ fontFamily: FONT, fontSize: "0.8rem", color: "#ccc", margin: 0 }}>Set your direction above, then generate your first week's content.</p>
          </div>
        )}
        <div style={{ display: "grid", gap: "0.85rem" }}>
          {weeks.map((w: any) => {
            const sm = STATUS_META[w.status] ?? STATUS_META.pending_approval;
            return (
              <div key={w.id} style={CARD}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: FONT, fontSize: "0.68rem", color: "#aaa", marginBottom: 3 }}>Week of {fmtWeek(w.week_of)}</div>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, background: sm.bg, color: sm.color, fontSize: "0.68rem", fontWeight: 700, fontFamily: FONT }}>{sm.label}</span>
                  </div>
                  {w.status === "pending_approval" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => approve(w.id)} style={BTN("#dcfce7", "#166534", true)}><ThumbsUp size={13} />Approve & Publish</button>
                      <button onClick={() => reject(w.id)} style={BTN("#fee2e2", "#991b1b", true)}><ThumbsDown size={13} />Reject</button>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "#f8faff", borderRadius: 10, padding: "0.9rem 1rem", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <BookOpen size={13} style={{ color: "hsl(225,50%,35%)" }} />
                      <span style={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 700, color: "hsl(225,50%,35%)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Blog Post</span>
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: "0.95rem", fontWeight: 600, color: "hsl(225,50%,22%)", marginBottom: 4, lineHeight: 1.3 }}>{w.blog_title ?? w.blog_topic}</div>
                    {w.seo_keyword && <div style={{ fontFamily: FONT, fontSize: "0.7rem", color: "#9ca3af" }}>Keyword: {w.seo_keyword}</div>}
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      {w.blog_post_id && (
                        <Link href={`/admin/blog/${w.blog_post_id}/edit`}>
                          <button style={BTN("#f0f4ff", "hsl(225,50%,30%)", true)}><Edit3 size={12} />Edit</button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div style={{ background: "#fdf4ff", borderRadius: 10, padding: "0.9rem 1rem", border: "1px solid #e9d5ff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Mail size={13} style={{ color: "#6d28d9" }} />
                      <span style={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email Newsletter</span>
                    </div>
                    <div style={{ fontFamily: SERIF, fontSize: "0.95rem", fontWeight: 600, color: "#1a1a2e", marginBottom: 4, lineHeight: 1.3 }}>{w.email_subject ?? w.email_topic}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      {w.email_campaign_id && (
                        <Link href={`/admin/email/compose?template=${w.email_campaign_id}`}>
                          <button style={BTN("#fdf4ff", "#6d28d9", true)}><Edit3 size={12} />Edit & Send</button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {w.notes && (
                  <div style={{ marginTop: "0.75rem", fontFamily: FONT, fontSize: "0.75rem", color: "#9ca3af", padding: "0.5rem 0.75rem", background: "#fef9c3", borderRadius: 6 }}>
                    <strong>Notes:</strong> {w.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab: SEO Ideas ────────────────────────────────────────────────────────────
interface SeoSuggestion { title: string; keyword: string; trendReason: string; tiktokAngle: string; difficulty: string; category: string; }

function SeoTab() {
  const [suggestions, setSuggestions] = useState<SeoSuggestion[]>([]);
  const [quickWins, setQuickWins] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [customContext, setCustomContext] = useState("");
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [createdIds, setCreatedIds] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState("");

  async function generate() {
    setLoading(true); setStatus(""); setSuggestions([]); setQuickWins([]);
    const d = await adminFetch("/admin/seo/suggestions", { method: "POST", body: JSON.stringify({ customContext }) }).then(r => r.json());
    if (d.ok) { setSuggestions(d.suggestions ?? []); setQuickWins(d.quickWins ?? []); }
    else setStatus("Error: " + (d.error ?? "Generation failed."));
    setLoading(false);
  }

  async function createDraft(suggestion: SeoSuggestion, idx: number) {
    setCreatingId(idx);
    const d = await adminFetch("/admin/seo/create-draft", {
      method: "POST",
      body: JSON.stringify({ title: suggestion.title, keyword: suggestion.keyword, category: suggestion.category, trendReason: suggestion.trendReason }),
    }).then(r => r.json());
    setCreatingId(null);
    if (d.ok) {
      setCreatedIds(s => new Set([...s, idx]));
      setStatus(`✓ "${d.title}" saved as a draft. Find it in Blog → All Posts.`);
    } else setStatus("Error: " + (d.error ?? "Draft creation failed."));
  }

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {/* Generate panel */}
      <div style={CARD}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem", fontFamily: SERIF, fontSize: "1.2rem", color: "hsl(225,50%,22%)" }}>SEO Topic Intelligence</h3>
            <p style={{ margin: 0, fontFamily: FONT, fontSize: "0.8rem", color: "#888" }}>
              AI analyses your direction settings and generates high-traffic blog topic ideas targeting trending topics in your space. One click to create a full draft.
            </p>
          </div>
          <button onClick={generate} disabled={loading} style={BTN("hsl(225,50%,22%)")}>
            {loading
              ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />Analysing…</>
              : <><TrendingUp size={14} />Generate SEO Ideas</>}
          </button>
        </div>
        <div>
          <label style={LABEL}>Custom Context (optional)</label>
          <input value={customContext} onChange={e => setCustomContext(e.target.value)} style={INPUT} placeholder="e.g. Focus on upcoming Women's Month events, or target people searching for high tea venues in JHB…" />
        </div>
        {status && <div style={{ marginTop: "0.75rem", fontFamily: FONT, fontSize: "0.78rem", color: status.startsWith("✓") ? "#166534" : "#dc2626", padding: "0.5rem 0.75rem", background: status.startsWith("✓") ? "#dcfce7" : "#fee2e2", borderRadius: 6 }}>{status}</div>}
      </div>

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div style={CARD}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
            <Zap size={16} style={{ color: "#f59e0b" }} />
            <h3 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.1rem", color: "hsl(225,50%,22%)" }}>Quick SEO Wins</h3>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {quickWins.map((win, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0.65rem 0.9rem", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                <Check size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: FONT, fontSize: "0.82rem", color: "#374151", lineHeight: 1.5 }}>{win}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3 style={{ margin: "0 0 0.85rem", fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {suggestions.length} Blog Topic Ideas
          </h3>
          <div style={{ display: "grid", gap: "0.85rem" }}>
            {suggestions.map((s, i) => {
              const diff = DIFF_META[s.difficulty] ?? DIFF_META.medium;
              const isDone = createdIds.has(i);
              return (
                <div key={i} style={{ ...CARD, borderLeft: "3px solid hsl(225,50%,35%)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ fontFamily: SERIF, fontSize: "1.05rem", fontWeight: 600, color: "hsl(225,50%,22%)" }}>{s.title}</span>
                        <span style={{ padding: "2px 8px", borderRadius: 20, background: diff.bg, color: diff.color, fontSize: "0.65rem", fontWeight: 700, fontFamily: FONT, whiteSpace: "nowrap" as const }}>{diff.label}</span>
                      </div>
                      <div style={{ fontFamily: FONT, fontSize: "0.73rem", color: "#6d28d9", fontWeight: 600, marginBottom: 6 }}>🔑 {s.keyword}</div>
                      <div style={{ fontFamily: FONT, fontSize: "0.78rem", color: "#6b7280", marginBottom: 5, lineHeight: 1.5 }}>
                        <strong style={{ color: "#374151" }}>Why now: </strong>{s.trendReason}
                      </div>
                      {s.tiktokAngle && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontFamily: FONT, fontSize: "0.75rem", color: "#6b7280", lineHeight: 1.5 }}>
                          <Play size={12} style={{ color: "#ff0050", flexShrink: 0, marginTop: 1 }} />
                          <span><strong style={{ color: "#374151" }}>TikTok angle: </strong>{s.tiktokAngle}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => createDraft(s, i)}
                      disabled={isDone || creatingId === i}
                      style={{ ...BTN(isDone ? "#dcfce7" : "hsl(225,50%,22%)", isDone ? "#166534" : "white", true), flexShrink: 0, whiteSpace: "nowrap" as const }}
                    >
                      {isDone ? <><Check size={13} />Draft Created</> : creatingId === i ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />Creating…</> : <><BookOpen size={13} />Create Draft</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && suggestions.length === 0 && quickWins.length === 0 && (
        <div style={{ ...CARD, textAlign: "center", padding: "3rem" }}>
          <Target size={30} style={{ color: "#e5e7eb", marginBottom: 10 }} />
          <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "#bbb", marginBottom: 6 }}>No suggestions generated yet</div>
          <p style={{ fontFamily: FONT, fontSize: "0.8rem", color: "#ccc", margin: "0 0 1.25rem" }}>
            Make sure your Direction settings are filled in, then hit "Generate SEO Ideas".
          </p>
          <button onClick={generate} style={{ ...BTN("hsl(225,50%,22%)"), margin: "0 auto" }}><TrendingUp size={14} />Generate SEO Ideas</button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const TABS = ["Direction", "Weekly Pipeline", "SEO Ideas"] as const;
type Tab = typeof TABS[number];

export default function ContentEngine() {
  useAdminAuth();
  const { tab: tabParam } = useParams<{ tab?: string }>();
  const initTab: Tab = tabParam === "pipeline" ? "Weekly Pipeline" : tabParam === "seo" ? "SEO Ideas" : "Direction";
  const [tab, setTab] = useState<Tab>(initTab);
  useEffect(() => {
    const t: Tab = tabParam === "pipeline" ? "Weekly Pipeline" : tabParam === "seo" ? "SEO Ideas" : "Direction";
    setTab(t);
  }, [tabParam]);

  return (
    <AdminLayout title="Content Engine">
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Sparkles size={20} style={{ color: "hsl(38,45%,55%)" }} />
            <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: "1.6rem", color: "hsl(225,50%,22%)" }}>Content Engine</h2>
          </div>
          <p style={{ margin: 0, fontFamily: FONT, fontSize: "0.82rem", color: "#888" }}>
            Set Patience's content direction, auto-generate weekly blog + email drafts, and get AI-powered SEO topic ideas — all tied to her TikTok strategy.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e5e7eb", marginBottom: "1.5rem", paddingBottom: 1 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: FONT, fontSize: "0.82rem",
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "hsl(225,50%,22%)" : "#9ca3af",
              padding: "0.55rem 1rem",
              borderBottom: `2px solid ${tab === t ? "hsl(225,50%,22%)" : "transparent"}`,
              marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {tab === "Direction" && <DirectionTab />}
        {tab === "Weekly Pipeline" && <PipelineTab />}
        {tab === "SEO Ideas" && <SeoTab />}
      </div>
    </AdminLayout>
  );
}
