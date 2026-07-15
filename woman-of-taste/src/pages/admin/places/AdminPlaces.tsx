import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, TrendingUp, Play, Globe, EyeOff,
  Clock, CheckCircle, AlertTriangle, ExternalLink, RefreshCw,
} from "lucide-react";
import { getAdminToken } from "@/pages/admin/AdminLogin";

const API = "/api";
const NAVY = "hsl(225,50%,22%)";
const GOLD = "hsl(38,45%,65%)";
const IVORY = "hsl(40,25%,96%)";
const AMBER = "#92400e";
const AMBER_BG = "#fef3c7";
const AMBER_BORDER = "#fcd34d";

const CATEGORY_COLOR: Record<string, string> = {
  Restaurant: NAVY,
  Experience: "#7c3aed",
  Stay: "#065f46",
};

function fmtViews(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    published: { bg: "#dcfce7", color: "#166534", label: "Published" },
    draft:     { bg: "#f3f4f6", color: "#6b7280", label: "Draft" },
    pending:   { bg: AMBER_BG, color: AMBER,      label: "Pending Approval" },
  };
  const s = styles[status] ?? styles.draft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, fontFamily: "Raleway, sans-serif" }}>
      {status === "pending" && <Clock size={10} />}
      {status === "published" && <Globe size={10} />}
      {status === "draft" && <EyeOff size={10} />}
      {s.label}
    </span>
  );
}

export default function AdminPlaces() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [approving, setApproving] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      // Fetch all statuses and filter client-side so counts stay accurate
      const resp = await fetch(`${API}/admin/places?${params}`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      const data = await resp.json();
      setPlaces(data.places ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPlaces(); }, [search]);

  const pending   = places.filter(p => p.status === "pending");
  const published = places.filter(p => p.status === "published");
  const drafts    = places.filter(p => p.status === "draft");
  const totalViews = places.reduce((s, p) => s + (p.tiktokViews || 0), 0);

  const filtered = places.filter(p => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const approve = async (place: any) => {
    setApproving(place.id);
    try {
      await fetch(`${API}/admin/places/${place.id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      await fetchPlaces();
    } catch {}
    setApproving(null);
  };

  const toggleStatus = async (place: any) => {
    setToggling(place.id);
    const newStatus = place.status === "published" ? "draft" : "published";
    try {
      await fetch(`${API}/admin/places/${place.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAdminToken()}` },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchPlaces();
    } catch {}
    setToggling(null);
  };

  const deletePlace = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`${API}/admin/places/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      await fetchPlaces();
    } catch {}
    setDeleting(null);
  };

  const tabBtn = (id: string, label: string, count?: number) => {
    const active = statusFilter === id;
    const isPending = id === "pending";
    return (
      <button key={id} onClick={() => setStatusFilter(id)} style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "0.45rem 1rem", borderRadius: 99,
        border: `1.5px solid ${active ? (isPending ? AMBER_BORDER : NAVY) : "#e5e5e5"}`,
        background: active ? (isPending ? AMBER_BG : NAVY) : "white",
        color: active ? (isPending ? AMBER : "white") : "#666",
        fontSize: "0.78rem", fontWeight: 600, fontFamily: "Raleway, sans-serif",
        cursor: "pointer", transition: "all 0.2s",
      }}>
        {isPending && <Clock size={12} />}
        {label}
        {count !== undefined && count > 0 && (
          <span style={{ background: active ? (isPending ? AMBER : GOLD) : (isPending ? AMBER_BG : "#f3f4f6"), color: active ? (isPending ? "#fff" : NAVY) : (isPending ? AMBER : "#666"), padding: "0 6px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700 }}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: NAVY, margin: 0 }}>Explore Manager</h1>
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", color: "#888", margin: "4px 0 0" }}>
            Restaurants, Experiences & Stays — only places with 10K+ TikTok views
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={fetchPlaces} style={{ display: "flex", alignItems: "center", gap: 6, background: IVORY, border: "1.5px solid #e5e5e5", borderRadius: 8, padding: "0.5rem 0.9rem", fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "#666", cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <Link href="/admin/places/new">
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: GOLD, color: NAVY, border: "none", padding: "0.6rem 1.2rem", borderRadius: 10, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              <Plus size={15} /> Add New Place
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: <Globe size={18} style={{ color: "#16a34a" }} />, value: places.length, label: "TOTAL PLACES" },
          { icon: <CheckCircle size={18} style={{ color: "#16a34a" }} />, value: published.length, label: "PUBLISHED" },
          { icon: <Clock size={18} style={{ color: AMBER }} />, value: pending.length, label: "PENDING APPROVAL", alert: pending.length > 0 },
          { icon: <TrendingUp size={18} style={{ color: "#7c3aed" }} />, value: `${fmtViews(totalViews)}`, label: "TOTAL TIKTOK VIEWS" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.alert ? AMBER_BG : "white", border: `1.5px solid ${s.alert ? AMBER_BORDER : "#f0f0f0"}`, borderRadius: 14, padding: "1.2rem 1.4rem", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            {s.icon}
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 700, color: s.alert ? AMBER : NAVY, lineHeight: 1, marginTop: 8 }}>{s.value}</div>
            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", color: s.alert ? AMBER : "#aaa", marginTop: 4, fontWeight: 700 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending banner */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: AMBER_BG, border: `1.5px solid ${AMBER_BORDER}`, borderRadius: 14, padding: "1rem 1.4rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={18} color={AMBER} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: AMBER, margin: 0 }}>
                {pending.length} place{pending.length > 1 ? "s" : ""} awaiting approval
              </p>
              <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#a16207", margin: "2px 0 0" }}>
                An approval email was sent to info@womanoftaste.co.za — review and approve below.
              </p>
            </div>
            <button onClick={() => setStatusFilter("pending")}
              style={{ marginLeft: "auto", background: AMBER, color: "white", border: "none", padding: "0.45rem 1rem", borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
              View Pending
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places…"
            style={{ width: "100%", boxSizing: "border-box", paddingLeft: 36, padding: "0.55rem 0.85rem 0.55rem 36px", border: "1.5px solid #e5e5e5", borderRadius: 10, fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {tabBtn("all", "All", places.length)}
          {tabBtn("pending", "Pending", pending.length)}
          {tabBtn("published", "Published", published.length)}
          {tabBtn("draft", "Draft", drafts.length)}
        </div>
      </div>

      {/* Places list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#bbb", fontFamily: "Raleway, sans-serif" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, color: "#bbb", fontFamily: "Raleway, sans-serif" }}>
          {statusFilter === "pending" ? "No places pending approval." : <>No places found. <Link href="/admin/places/new" style={{ color: GOLD, textDecoration: "none", fontWeight: 700 }}>Add the first one →</Link></>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(place => (
            <motion.div key={place.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: place.status === "pending" ? "#fffbeb" : "white", border: `1.5px solid ${place.status === "pending" ? AMBER_BORDER : "#f0f0f0"}`, borderRadius: 14, padding: "1.1rem 1.4rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>

              {/* Cover thumbnail */}
              {place.coverImage ? (
                <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                  <img src={place.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: 10, background: IVORY, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "#ccc" }}>{place.name[0]}</span>
                </div>
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                  <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.15rem", fontWeight: 700, color: NAVY, whiteSpace: "nowrap" }}>{place.name}</span>
                  <span style={{ background: (CATEGORY_COLOR[place.category] || NAVY) + "18", color: CATEGORY_COLOR[place.category] || NAVY, padding: "1px 8px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 700, fontFamily: "Raleway, sans-serif" }}>{place.category}</span>
                  <StatusPill status={place.status} />
                </div>
                <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#888", margin: 0 }}>
                  {place.neighborhood}{place.neighborhood && place.city ? ", " : ""}{place.city}
                  {place.tiktokViews > 0 && (
                    <span style={{ marginLeft: 10, display: "inline-flex", alignItems: "center", gap: 4, color: AMBER, fontWeight: 700 }}>
                      <Play size={10} fill={AMBER} stroke="none" />{fmtViews(place.tiktokViews)} views
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                {/* Approve button for pending */}
                {place.status === "pending" && (
                  <button onClick={() => approve(place)} disabled={approving === place.id}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "#16a34a", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 700, cursor: approving === place.id ? "not-allowed" : "pointer", opacity: approving === place.id ? 0.6 : 1 }}>
                    <CheckCircle size={13} />
                    {approving === place.id ? "Approving…" : "Approve & Publish"}
                  </button>
                )}

                {/* Toggle Published / Draft (for non-pending) */}
                {place.status !== "pending" && (
                  <button onClick={() => toggleStatus(place)} disabled={toggling === place.id}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: IVORY, border: "1.5px solid #e5e5e5", borderRadius: 8, padding: "0.45rem 0.85rem", fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#555", cursor: toggling === place.id ? "not-allowed" : "pointer", opacity: toggling === place.id ? 0.6 : 1 }}>
                    {place.status === "published" ? <EyeOff size={12} /> : <Globe size={12} />}
                    {place.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                )}

                {/* View live page */}
                {place.status === "published" && (
                  <a href={`/restaurants/${place.slug}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 5, background: IVORY, border: "1.5px solid #e5e5e5", borderRadius: 8, padding: "0.45rem 0.7rem", color: "#555", textDecoration: "none" }}>
                    <ExternalLink size={12} />
                  </a>
                )}

                {/* Delete */}
                <button onClick={() => deletePlace(place.id, place.name)} disabled={deleting === place.id}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: 8, padding: "0.45rem 0.7rem", color: "#dc2626", cursor: deleting === place.id ? "not-allowed" : "pointer", opacity: deleting === place.id ? 0.5 : 1 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
