import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { PlusCircle, Edit, Trash2, Eye, EyeOff, BookOpen, Search } from "lucide-react";

interface Post { id: number; slug: string; title: string; category: string; author: string; status: string; featured: boolean; publishedAt: string | null; createdAt: string; }
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.78rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif", whiteSpace: "nowrap" as const });

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  published: { bg: "#dcfce7", color: "#16a34a" },
  draft: { bg: "#fef9c3", color: "#a16207" },
  archived: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function BlogList() {
  useAdminAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState(""); const [searchInput, setSearchInput] = useState("");

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (search) params.set("search", search);
    const res = await adminFetch(`/admin/blog?${params}`);
    const d = await res.json();
    if (d.ok) setPosts(d.posts);
    setLoading(false);
  }
  useEffect(() => { load(); }, [filter, search]);

  async function toggleStatus(post: Post) {
    const newStatus = post.status === "published" ? "draft" : "published";
    await adminFetch(`/admin/blog/${post.id}`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
    load();
  }

  async function deletePost(id: number, hard = false) {
    const msg = hard ? "Permanently delete this post? This cannot be undone." : "Archive this post? It will be hidden from the public but can be restored.";
    if (!confirm(msg)) return;
    await adminFetch(`/admin/blog/${id}${hard ? "?hard=true" : ""}`, { method: "DELETE" });
    load();
  }

  function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"; }

  return (
    <AdminLayout title="Blog Manager">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "hsl(225,50%,22%)" }}>Blog Posts</h2>
          <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#888" }}>{posts.length} posts</p>
        </div>
        <Link href="/admin/blog/new"><button style={BTN("hsl(225,50%,22%)")}><PlusCircle size={14} />New Post</button></Link>
      </div>

      {/* Filters */}
      <div style={{ background: "white", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "published", "draft", "archived"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ ...BTN(filter === f ? "hsl(225,50%,22%)" : "#f0f0f5", filter === f ? "white" : "#555"), padding: "0.4rem 0.85rem", fontSize: "0.75rem" }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
        <div style={{ display: "flex", flex: 1, gap: 8, minWidth: 200 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#aaa" }} />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") setSearch(searchInput); }} placeholder="Search posts…" style={{ padding: "0.45rem 0.75rem 0.45rem 28px", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.8rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => setSearch(searchInput)} style={BTN("hsl(225,50%,22%)")}>Search</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
        {loading ? <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading posts…</div>
          : posts.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>
              <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 8 }} /><p>No posts found.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
                <thead>
                  <tr style={{ background: "#f8f8fc" }}>
                    {["Title", "Category", "Status", "Published", "Actions"].map(h => (
                      <th key={h} style={{ padding: "0.7rem 1rem", textAlign: "left", fontWeight: 600, color: "#555", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p, i) => {
                    const ss = STATUS_STYLE[p.status] ?? STATUS_STYLE.draft;
                    return (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#f5f6ff"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "white" : "#fafafa"}>
                        <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f5", maxWidth: 320 }}>
                          <div style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                          <div style={{ fontSize: "0.7rem", color: "#aaa" }}>/journal/{p.slug}</div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                          <span style={{ background: "#f0f4ff", color: "hsl(225,50%,40%)", fontSize: "0.7rem", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{p.category}</span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                          <span style={{ background: ss.bg, color: ss.color, fontSize: "0.7rem", padding: "2px 8px", borderRadius: 99, fontWeight: 700, textTransform: "capitalize" }}>{p.status}</span>
                          {p.featured && <span style={{ marginLeft: 4, background: "#fef9c3", color: "#a16207", fontSize: "0.65rem", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>Featured</span>}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f5", color: "#777", whiteSpace: "nowrap" }}>{fmtDate(p.publishedAt)}</td>
                        <td style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link href={`/admin/blog/${p.id}/edit`}>
                              <button title="Edit" style={BTN("#f0f4ff", "hsl(225,50%,30%)")}><Edit size={13} /></button>
                            </Link>
                            <button title={p.status === "published" ? "Unpublish" : "Publish"} onClick={() => toggleStatus(p)} style={BTN(p.status === "published" ? "#fef9c3" : "#dcfce7", p.status === "published" ? "#a16207" : "#16a34a")}>
                              {p.status === "published" ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button title="Archive" onClick={() => deletePost(p.id)} style={BTN("#fef2f2", "#dc2626")}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </AdminLayout>
  );
}
