import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Save, Loader, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { getAdminToken } from "@/pages/admin/AdminLogin";

const API = "/api";
const NAVY = "hsl(225,50%,22%)";
const GOLD = "hsl(38,45%,65%)";
const IVORY = "hsl(40,25%,96%)";

const inputStyle = { width: "100%", boxSizing: "border-box" as const, padding: "0.6rem 0.85rem", border: "1.5px solid #e5e5e5", borderRadius: 10, fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: NAVY, outline: "none", background: "white" };
const labelStyle = { fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#999", display: "block", marginBottom: 5 };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "1.25rem" }}>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: NAVY, marginBottom: "1.1rem", paddingBottom: "0.6rem", borderBottom: "1.5px solid #f0f0f0" }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function NewPlace() {
  const [, navigate] = useLocation();
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [generatedAt, setGeneratedAt] = useState(false);

  const [form, setForm] = useState({
    name: "", category: "Restaurant", cuisine: "", neighborhood: "", city: "Johannesburg",
    address: "", priceRange: "RR", tiktokViews: "", tiktokUrl: "https://www.tiktok.com/@pashieb_the_wot",
    coverImage: "", website: "", openingHours: "", reservations: false, instagramHandle: "",
    notes: "", status: "published",
    tagline: "", excerpt: "", description: "",
    highlights: ["", "", "", ""],
    mustTry: [{ name: "", note: "" }, { name: "", note: "" }, { name: "", note: "" }],
    vibe: "",
    perfectFor: ["", "", "", ""],
    tags: ["", "", "", "", ""],
    seoKeywords: ["", "", "", "", ""],
  });

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleGenerate = async () => {
    if (!form.name.trim()) { setError("Enter the place name before generating."); return; }
    setError("");
    setGenerating(true);
    try {
      const resp = await fetch(`${API}/admin/places/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify({
          name: form.name, category: form.category, cuisine: form.cuisine,
          neighborhood: form.neighborhood, city: form.city, priceRange: form.priceRange,
          tiktokViews: Number(form.tiktokViews) || 0, notes: form.notes,
        }),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error);
      const c = data.content;

      setForm(f => ({
        ...f,
        tagline: c.tagline || f.tagline,
        excerpt: c.excerpt || f.excerpt,
        description: c.description || f.description,
        vibe: c.vibe || f.vibe,
        highlights: (c.highlights?.slice(0, 4) || []).concat(["", "", "", ""]).slice(0, 4),
        mustTry: (c.mustTry?.slice(0, 3) || []).concat([{ name: "", note: "" }, { name: "", note: "" }]).slice(0, 3),
        perfectFor: (c.perfectFor?.slice(0, 4) || []).concat(["", "", "", ""]).slice(0, 4),
        tags: (c.tags?.slice(0, 5) || []).concat(["", "", "", "", ""]).slice(0, 5),
        seoKeywords: (c.seoKeywords?.slice(0, 5) || []).concat(["", "", "", "", ""]).slice(0, 5),
      }));
      setGeneratedAt(true);
    } catch (e: any) {
      setError(e?.message || "AI generation failed. Fill in the fields manually.");
    }
    setGenerating(false);
  };

  const views = Number(form.tiktokViews) || 0;
  const willBePending = views >= 10000;

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        tiktokViews: views,
        reservations: form.reservations,
        highlights: form.highlights.filter(Boolean),
        mustTry: form.mustTry.filter(m => m.name.trim()),
        perfectFor: form.perfectFor.filter(Boolean),
        tags: form.tags.filter(Boolean),
        seoKeywords: form.seoKeywords.filter(Boolean),
        datePosted: new Date().toISOString().slice(0, 10),
      };
      const resp = await fetch(`${API}/admin/places`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error);
      navigate("/admin/places");
    } catch (e: any) {
      setError(e?.message || "Failed to save place.");
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <Link href="/admin/places">
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: IVORY, border: "none", padding: "0.5rem 1rem", borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", color: NAVY, cursor: "pointer" }}>
            <ArrowLeft size={14} /> Back
          </button>
        </Link>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.9rem", color: NAVY, margin: 0 }}>Add New Place</h1>
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "#aaa", margin: 0 }}>For TikTok posts that hit 10K+ views</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem", fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", color: "#dc2626" }}>{error}</div>
      )}

      {/* Step 1 — Basic Info */}
      <Section title="1. Basic Information">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
          <Field label="Place Name *">
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Marble" style={inputStyle} />
          </Field>
          <Field label="Category *">
            <select value={form.category} onChange={e => set("category", e.target.value)} style={inputStyle}>
              <option>Restaurant</option>
              <option>Experience</option>
              <option>Stay</option>
            </select>
          </Field>
          <Field label="Cuisine / Type">
            <input value={form.cuisine} onChange={e => set("cuisine", e.target.value)} placeholder="e.g. Wood-fired contemporary South African" style={inputStyle} />
          </Field>
          <Field label="Price Range">
            <select value={form.priceRange} onChange={e => set("priceRange", e.target.value)} style={inputStyle}>
              <option value="R">R — Budget (under R200pp)</option>
              <option value="RR">RR — Mid-range (R200–R400pp)</option>
              <option value="RRR">RRR — Upscale (R400–R800pp)</option>
              <option value="RRRR">RRRR — Fine Dining (R800+pp)</option>
            </select>
          </Field>
          <Field label="Neighbourhood">
            <input value={form.neighborhood} onChange={e => set("neighborhood", e.target.value)} placeholder="e.g. Rosebank" style={inputStyle} />
          </Field>
          <Field label="City">
            <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Johannesburg" style={inputStyle} />
          </Field>
          <Field label="TikTok Views (number) *">
            <input type="number" value={form.tiktokViews} onChange={e => set("tiktokViews", e.target.value)} placeholder="e.g. 25300" style={inputStyle} />
          </Field>
          <Field label="TikTok URL">
            <input value={form.tiktokUrl} onChange={e => set("tiktokUrl", e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Cover Image URL">
            <input value={form.coverImage} onChange={e => set("coverImage", e.target.value)} placeholder="https://images.unsplash.com/..." style={inputStyle} />
          </Field>
          <Field label="Address">
            <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Full street address" style={inputStyle} />
          </Field>
          <Field label="Opening Hours">
            <input value={form.openingHours} onChange={e => set("openingHours", e.target.value)} placeholder="Mon–Sat 12:00–22:00" style={inputStyle} />
          </Field>
          <Field label="Website URL (optional)">
            <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." style={inputStyle} />
          </Field>
        </div>
        <Field label="Reservations">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: NAVY }}>
            <input type="checkbox" checked={form.reservations} onChange={e => set("reservations", e.target.checked)} style={{ width: 16, height: 16 }} />
            Reservations recommended
          </label>
        </Field>
        <Field label="Notes for AI (optional — PashieB's personal context)">
          <textarea
            value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
            placeholder="e.g. 'The outdoor seating was stunning, we had the braai platter and cocktails. Great for birthdays.'"
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>
      </Section>

      {/* AI Generate button */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <motion.button
          onClick={handleGenerate} disabled={generating}
          whileHover={{ scale: generating ? 1 : 1.03 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 10, background: generating ? "#e5e7eb" : NAVY, color: generating ? "#aaa" : "white", border: "none", padding: "0.85rem 2rem", borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.92rem", cursor: generating ? "not-allowed" : "pointer" }}
        >
          {generating ? <Loader size={16} className="spin" /> : <Sparkles size={16} />}
          {generating ? "Generating SEO content…" : generatedAt ? "Regenerate with AI" : "Generate SEO Content with AI"}
        </motion.button>
        {!generatedAt && (
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#aaa", marginTop: 8 }}>
            AI will write the insight text, highlights, must-try items, vibe, SEO keywords and tags from the basic info above.
          </p>
        )}
        {generatedAt && (
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#16a34a", marginTop: 8 }}>
            ✓ Content generated — review below and edit as needed before saving.
          </p>
        )}
      </div>

      {/* Step 2 — Content (editable, pre-filled by AI) */}
      <Section title="2. Content (AI-generated, editable)">
        <Field label="Tagline">
          <input value={form.tagline} onChange={e => set("tagline", e.target.value)} placeholder="Short punchy tagline with view count" style={inputStyle} />
        </Field>
        <Field label="Excerpt (2–3 sentence hook)">
          <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="The opening hook — shown on listing page cards" />
        </Field>
        <Field label="Insight text (full description — 4 paragraphs)">
          <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={10} style={{ ...inputStyle, resize: "vertical" }} placeholder="4 paragraphs of SEO-rich insight text. Separate paragraphs with a blank line." />
        </Field>
        <Field label="Vibe (one sentence)">
          <input value={form.vibe} onChange={e => set("vibe", e.target.value)} placeholder="e.g. Fire-lit, energetic and romantic. Dress to match the room." style={inputStyle} />
        </Field>
      </Section>

      <Section title="3. Highlights (what to know)">
        {form.highlights.map((h, i) => (
          <div key={i} style={{ marginBottom: "0.6rem" }}>
            <input value={h} onChange={e => { const a = [...form.highlights]; a[i] = e.target.value; set("highlights", a); }} placeholder={`Highlight ${i + 1}`} style={inputStyle} />
          </div>
        ))}
      </Section>

      <Section title="4. Must-Try / What To Do">
        {form.mustTry.map((m, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.6rem", marginBottom: "0.6rem" }}>
            <input value={m.name} onChange={e => { const a = [...form.mustTry]; a[i] = { ...a[i], name: e.target.value }; set("mustTry", a); }} placeholder="Item name" style={inputStyle} />
            <input value={m.note} onChange={e => { const a = [...form.mustTry]; a[i] = { ...a[i], note: e.target.value }; set("mustTry", a); }} placeholder="Why this, what it delivers" style={inputStyle} />
          </div>
        ))}
      </Section>

      <Section title="5. Perfect For">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
          {form.perfectFor.map((p, i) => (
            <input key={i} value={p} onChange={e => { const a = [...form.perfectFor]; a[i] = e.target.value; set("perfectFor", a); }} placeholder={`Use case ${i + 1} e.g. Date nights`} style={inputStyle} />
          ))}
        </div>
      </Section>

      <Section title="6. Tags & SEO Keywords">
        <Field label="Tags (shown as pills on the page)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
            {form.tags.map((t, i) => (
              <input key={i} value={t} onChange={e => { const a = [...form.tags]; a[i] = e.target.value; set("tags", a); }} placeholder={`Tag ${i + 1}`} style={inputStyle} />
            ))}
          </div>
        </Field>
        <Field label="SEO Keywords (for Google search)">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {form.seoKeywords.map((k, i) => (
              <input key={i} value={k} onChange={e => { const a = [...form.seoKeywords]; a[i] = e.target.value; set("seoKeywords", a); }} placeholder={`e.g. best restaurants Rosebank Johannesburg 2025`} style={inputStyle} />
            ))}
          </div>
        </Field>
      </Section>

      {/* Pending notice — shown when TikTok views ≥ 10K */}
      <AnimatePresence>
        {willBePending && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: "#fef3c7", border: "1.5px solid #fcd34d", borderRadius: 14, padding: "1rem 1.4rem", marginBottom: "1rem", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <Clock size={18} color="#92400e" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#92400e", margin: "0 0 4px" }}>
                This place will be saved as <em>Pending Approval</em>
              </p>
              <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "#a16207", margin: 0, lineHeight: 1.6 }}>
                Because the TikTok view count is 10K+, this will not go live immediately.
                An approval email will be sent to <strong>info@womanoftaste.co.za</strong> — approve it from the Explore Manager to publish.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status + Save */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", padding: "1.25rem", background: "white", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {!willBePending && (
            <>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                <option value="published">Published (live immediately)</option>
                <option value="draft">Draft (hidden)</option>
              </select>
            </>
          )}
          {willBePending && (
            <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={14} /> Will be saved as <strong>Pending Approval</strong>
            </span>
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 8, background: saving ? "#e5e7eb" : (willBePending ? "#92400e" : GOLD), color: saving ? "#aaa" : (willBePending ? "white" : NAVY), border: "none", padding: "0.8rem 2rem", borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? <Loader size={15} /> : willBePending ? <Clock size={15} /> : <Save size={15} />}
          {saving ? "Submitting…" : willBePending ? "Submit for Approval" : "Publish Place"}
        </button>
      </div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
