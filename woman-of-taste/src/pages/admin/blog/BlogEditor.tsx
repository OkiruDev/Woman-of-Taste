import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Save, Eye, ArrowLeft, Upload, X, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIES = ["Editorial", "Events", "Dining", "Lifestyle", "Womanhood", "Culture", "Hospitality"];
const INPUT = { padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.85rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.6rem 1.1rem", fontSize: "0.8rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif", whiteSpace: "nowrap" as const });
const LABEL = { display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#666", marginBottom: 4 };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function RichTextBar({ onInsert }: { onInsert: (open: string, close: string) => void }) {
  const TOOLS = [
    ["<p>", "</p>", "P"], ["<strong>", "</strong>", "B"], ["<em>", "</em>", "I"],
    ["<h2>", "</h2>", "H2"], ["<h3>", "</h3>", "H3"],
    ["<ul>\n<li>", "</li>\n</ul>", "• List"], ["<blockquote>", "</blockquote>", "Quote"],
    ["<a href=\"\">", "</a>", "Link"],
  ];
  return (
    <div style={{ background: "#f8f8fc", borderBottom: "1px solid #eee", padding: "0.5rem 0.75rem", display: "flex", gap: 4, flexWrap: "wrap" }}>
      {TOOLS.map(([o, c, l]) => (
        <button key={l} type="button" onClick={() => onInsert(o, c)} style={{ background: "white", border: "1px solid #ddd", borderRadius: 5, padding: "3px 10px", fontSize: "0.75rem", cursor: "pointer", fontFamily: l === "B" ? "serif" : "sans-serif", fontWeight: l === "B" || l === "H2" || l === "H3" ? 700 : 400, fontStyle: l === "I" ? "italic" : "normal" }}>{l}</button>
      ))}
    </div>
  );
}

export default function BlogEditor() {
  useAdminAuth();
  const params = useParams<{ id?: string }>();
  const isNew = !params.id || params.id === "new";
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    title: "", slug: "", category: "Editorial", author: "Patience Bwanya",
    excerpt: "", content: "", coverImageUrl: "", readTime: "5 min read",
    metaTitle: "", metaDescription: "", focusKeyword: "", status: "draft", featured: false,
  });
  const [saving, setSaving] = useState(false); const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(!isNew); const [seoOpen, setSeoOpen] = useState(false);
  const [preview, setPreview] = useState(false); const [uploading, setUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autoSlug = useRef(true);

  useEffect(() => {
    if (!isNew && params.id) {
      adminFetch(`/admin/blog/${params.id}`).then(r => r.json()).then(d => {
        if (d.ok) { setForm({ ...d.post, featured: d.post.featured ?? false }); autoSlug.current = false; }
      }).finally(() => setLoading(false));
    }
  }, [params.id]);

  function set(k: string, v: string | boolean) {
    setForm(p => {
      const next = { ...p, [k]: v };
      if (k === "title" && autoSlug.current) next.slug = slugify(v as string);
      return next;
    });
  }

  function insertTag(open: string, close: string) {
    const ta = contentRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = form.content.substring(s, e);
    const newVal = form.content.substring(0, s) + open + sel + close + form.content.substring(e);
    set("content", newVal);
    setTimeout(() => { ta.selectionStart = s + open.length; ta.selectionEnd = s + open.length + sel.length; ta.focus(); }, 0);
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const token = localStorage.getItem("wot_admin_token");
    const fd = new FormData(); fd.append("image", file);
    const res = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    const d = await res.json();
    if (d.ok) set("coverImageUrl", d.url);
    setUploading(false);
  }

  async function saveDraft() {
    setSaving(true); setStatus("Saving…");
    const payload = { ...form, status: "draft" };
    let res;
    if (isNew) res = await adminFetch("/admin/blog", { method: "POST", body: JSON.stringify(payload) });
    else res = await adminFetch(`/admin/blog/${params.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    const d = await res.json();
    if (d.ok) {
      setStatus("Saved ✓");
      if (isNew && d.post?.id) navigate(`/admin/blog/${d.post.id}/edit`);
    } else setStatus(d.error ?? "Save failed.");
    setSaving(false);
  }

  async function publish() {
    setSaving(true); setStatus("Publishing…");
    const payload = { ...form, status: "published" };
    let res;
    if (isNew) res = await adminFetch("/admin/blog", { method: "POST", body: JSON.stringify(payload) });
    else res = await adminFetch(`/admin/blog/${params.id}`, { method: "PATCH", body: JSON.stringify(payload) });
    const d = await res.json();
    if (d.ok) { setStatus("Published ✓"); setForm(p => ({ ...p, status: "published" })); if (isNew && d.post?.id) navigate(`/admin/blog/${d.post.id}/edit`); }
    else setStatus(d.error ?? "Failed.");
    setSaving(false);
  }

  if (loading) return <AdminLayout title="Loading…"><div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading post…</div></AdminLayout>;

  return (
    <AdminLayout title={isNew ? "New Post" : "Edit Post"}>
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 760, maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Preview</h3>
              <button onClick={() => setPreview(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
              {form.coverImageUrl && <img src={form.coverImageUrl} alt="" style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 12, marginBottom: "1.5rem" }} />}
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "hsl(38,45%,50%)" }}>{form.category}</span>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: "hsl(225,50%,22%)", margin: "0.5rem 0 1rem", lineHeight: 1.2 }}>{form.title}</h1>
              <p style={{ fontStyle: "italic", color: "#666", borderLeft: "4px solid hsl(38,45%,60%)", paddingLeft: "1rem", marginBottom: "1.5rem" }}>{form.excerpt}</p>
              <div className="prose-wot" dangerouslySetInnerHTML={{ __html: form.content }} />
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 8 }}>
        <Link href="/admin/blog"><button style={BTN("#f0f4ff", "hsl(225,50%,30%)")}><ArrowLeft size={14} />All Posts</button></Link>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {status && <span style={{ fontSize: "0.82rem", padding: "0.55rem 0.75rem", color: status.includes("✓") ? "#16a34a" : "#dc2626" }}>{status}</span>}
          <button onClick={() => setPreview(true)} style={BTN("#f0f5ff", "hsl(225,50%,30%)")}><Eye size={14} />Preview</button>
          <button onClick={saveDraft} disabled={saving} style={BTN("#f5f0ff", "hsl(270,50%,40%)")}><Save size={14} />{saving ? "Saving…" : "Save Draft"}</button>
          <button onClick={publish} disabled={saving} style={BTN("hsl(225,50%,22%)")}>{form.status === "published" ? "Update" : "Publish"}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem" }}>
        {/* Main editor */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Title */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Post title…"
              style={{ ...INPUT, fontSize: "1.5rem", fontFamily: "Cormorant Garamond, serif", fontWeight: 600, border: "none", padding: "0", outline: "none", color: "hsl(225,50%,22%)" }} />
            <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "0.72rem", color: "#aaa" }}>Slug: /journal/</span>
              <input value={form.slug} onChange={e => { autoSlug.current = false; set("slug", e.target.value); }}
                style={{ ...INPUT, padding: "2px 6px", fontSize: "0.78rem", color: "#555", width: "auto", flex: 1 }} />
            </div>
          </div>

          {/* Excerpt */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <label style={LABEL}>Excerpt</label>
            <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} rows={3} placeholder="A compelling one-paragraph summary shown on the journal index…" style={{ ...INPUT, resize: "vertical" }} />
          </div>

          {/* Body */}
          <div style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <div style={{ padding: "1rem 1.25rem 0.5rem", borderBottom: "1px solid #eee" }}>
              <label style={LABEL}>Article Content</label>
            </div>
            <RichTextBar onInsert={insertTag} />
            <textarea ref={contentRef} value={form.content} onChange={e => set("content", e.target.value)} rows={28}
              placeholder="Write your article content using HTML tags…&#10;&#10;<p>Start writing here...</p>&#10;<h2>Section Heading</h2>&#10;<p>Content...</p>"
              style={{ ...INPUT, border: "none", borderRadius: 0, resize: "vertical", minHeight: 500, fontFamily: "monospace", fontSize: "0.83rem" }} />
          </div>

          {/* SEO section */}
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
            <button onClick={() => setSeoOpen(!seoOpen)} style={{ width: "100%", padding: "1rem 1.25rem", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              SEO Settings {seoOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {seoOpen && (
              <div style={{ padding: "0 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[["metaTitle", "Meta Title"], ["metaDescription", "Meta Description"], ["focusKeyword", "Focus Keyword"]].map(([k, l]) => (
                  <div key={k}>
                    <label style={LABEL}>{l}</label>
                    <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} style={INPUT} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Status */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <label style={LABEL}>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...INPUT, marginBottom: "0.75rem" }}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.82rem", color: "#555" }}>
              <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} />
              Featured post (shown at top of journal)
            </label>
          </div>

          {/* Category & Author */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={LABEL}>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={INPUT}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={LABEL}>Author</label>
              <input value={form.author} onChange={e => set("author", e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Read Time</label>
              <input value={form.readTime} onChange={e => set("readTime", e.target.value)} placeholder="5 min read" style={INPUT} />
            </div>
          </div>

          {/* Cover image */}
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <label style={LABEL}>Cover Image</label>
            {form.coverImageUrl && <img src={form.coverImageUrl} alt="Cover" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8, marginBottom: "0.75rem" }} />}
            <input value={form.coverImageUrl} onChange={e => set("coverImageUrl", e.target.value)} placeholder="https://… or upload below" style={{ ...INPUT, marginBottom: "0.6rem" }} />
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#f0f4ff", border: "1px dashed #c7d0e8", borderRadius: 8, padding: "0.65rem", cursor: uploading ? "not-allowed" : "pointer", fontSize: "0.78rem", color: "hsl(225,50%,40%)", fontWeight: 600 }}>
              <Upload size={14} />{uploading ? "Uploading…" : "Upload Image"}
              <input type="file" accept="image/*" onChange={uploadImage} style={{ display: "none" }} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
