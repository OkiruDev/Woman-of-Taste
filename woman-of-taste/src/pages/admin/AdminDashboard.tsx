import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAdminAuth, adminFetch } from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import { Users, Mail, CalendarCheck, BookOpen, Clock, ArrowRight, PlusCircle, Send, Eye } from "lucide-react";
import RandIcon from "../../components/RandIcon";
import { useIsMobile } from "../../hooks/use-mobile";

interface Stats {
  totalContacts: number; emailsThisMonth: number; activeBookings: number;
  outstandingPayments: number; totalPosts: number; optedOutContacts: number;
  latestBooking: { firstName: string; surname: string; eventTitle: string; eventDate: string } | null;
}
interface Activity { id: number; actionType: string; description: string; createdAt: string; }

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "1rem 1.1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14, border: "1px solid #eee" }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: "0.75rem", color: "#777", marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ActionType({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string }> = {
    email_sent: { label: "Email", color: "#3b82f6" },
    blog_post_published: { label: "Blog", color: "#8b5cf6" },
    blog_post_created: { label: "Blog Draft", color: "#a78bfa" },
    contact_added: { label: "Contact", color: "#10b981" },
    contacts_imported: { label: "Import", color: "#059669" },
    blog_post_deleted: { label: "Archive", color: "#f59e0b" },
    default: { label: "Action", color: "#6b7280" },
  };
  const m = map[type] ?? map.default;
  return <span style={{ background: m.color + "22", color: m.color, fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>{m.label}</span>;
}

export default function AdminDashboard() {
  useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    Promise.all([adminFetch("/admin/stats"), adminFetch("/admin/activity")])
      .then(async ([sr, ar]) => {
        const sd = await sr.json(); const ad = await ar.json();
        if (sd.ok) setStats(sd.stats);
        if (ad.ok) setActivity(ad.activity);
      }).finally(() => setLoading(false));
  }, []);

  function fmtDate(d: string) {
    return new Date(d).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  const STAT_CARDS = stats ? [
    { icon: <Users size={20} />, label: "Total Contacts", value: stats.totalContacts, color: "#3b82f6", sub: `${stats.optedOutContacts} opted out` },
    { icon: <Mail size={20} />, label: "Emails Sent This Month", value: stats.emailsThisMonth, color: "#8b5cf6" },
    { icon: <CalendarCheck size={20} />, label: "Active Bookings", value: stats.activeBookings, color: "#f59e0b" },
    { icon: <RandIcon size={20} />, label: "Outstanding Payments", value: stats.outstandingPayments, color: "#ef4444" },
    { icon: <BookOpen size={20} />, label: "Blog Posts Published", value: stats.totalPosts, color: "#10b981" },
    { icon: <Clock size={20} />, label: "Latest Booking", value: stats.latestBooking ? stats.latestBooking.firstName : "—", color: "#6b7280", sub: stats.latestBooking ? `${stats.latestBooking.eventTitle}` : undefined },
  ] : [];

  const QUICK_ACTIONS = [
    { label: "Compose Email", icon: <Send size={18} />, href: "/admin/email/compose", color: "#3b82f6" },
    { label: "New Blog Post", icon: <PlusCircle size={18} />, href: "/admin/blog/new", color: "#8b5cf6" },
    { label: "View Contacts", icon: <Users size={18} />, href: "/admin/contacts", color: "#10b981" },
    { label: "View Bookings", icon: <Eye size={18} />, href: "/admin/bookings", color: "#f59e0b" },
  ];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#888" }}>Loading dashboard…</div>
      ) : (
        <>
          {/* Stats row */}
          <section style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.05rem", color: "#333", marginBottom: "0.65rem", fontWeight: 600 }}>Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.65rem" }}>
              {STAT_CARDS.map((s, i) => <StatCard key={i} {...s} />)}
            </div>
          </section>

          {/* Quick actions */}
          <section style={{ marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.05rem", color: "#333", marginBottom: "0.65rem", fontWeight: 600 }}>Quick Actions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.65rem" }}>
              {QUICK_ACTIONS.map(a => (
                <Link key={a.href} href={a.href}>
                  <div style={{ background: "white", borderRadius: 12, padding: isMobile ? "1rem 0.85rem" : "1.25rem 1rem", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333" }}>{a.label}</div>
                    </div>
                    <ArrowRight size={14} style={{ color: "#aaa", flexShrink: 0 }} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Activity feed */}
          <section>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.05rem", color: "#333", marginBottom: "0.65rem", fontWeight: 600 }}>Recent Activity</h2>
            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee", overflow: "hidden" }}>
              {activity.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#aaa", fontSize: "0.85rem" }}>No activity logged yet.</div>
              ) : (
                activity.map((a, i) => (
                  <div key={a.id} style={{ padding: "0.85rem 1rem", borderBottom: i < activity.length - 1 ? "1px solid #f0f0f5" : "none", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <ActionType type={a.actionType} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", color: "#333", lineHeight: 1.4 }}>{a.description}</div>
                      <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 2 }}>{fmtDate(a.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
