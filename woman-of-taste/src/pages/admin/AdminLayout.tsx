import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAdminAuth } from "./AdminLogin";
import {
  LayoutDashboard, Users, Mail, BookOpen, BarChart2, Settings,
  CalendarCheck, Menu, X, LogOut, ChevronRight, HelpCircle, ScanLine, Share2, MapPin, RotateCcw, TrendingUp, UserCheck, Clipboard,
} from "lucide-react";
import AdminGuide, { useGuide } from "./AdminGuide";
import { useIsMobile } from "../../hooks/use-mobile";

interface NavItem { label: string; icon: React.ReactNode; href: string; children?: { label: string; href: string }[] }

const NAV: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={16} />, href: "/admin" },
  { label: "Members", icon: <UserCheck size={16} />, href: "/admin/profiles" },
  { label: "Events", icon: <CalendarCheck size={16} />, href: "/admin/events" },
  { label: "Contacts", icon: <Users size={16} />, href: "/admin/contacts" },
  {
    label: "Email", icon: <Mail size={16} />, href: "/admin/email",
    children: [
      { label: "Compose", href: "/admin/email/compose" },
      { label: "History", href: "/admin/email/history" },
      { label: "Drafts", href: "/admin/email/drafts" },
      { label: "Templates", href: "/admin/email/templates" },
      { label: "✨ Generate", href: "/admin/email/generate" },
    ],
  },
  {
    label: "Blog", icon: <BookOpen size={16} />, href: "/admin/blog",
    children: [
      { label: "All Posts", href: "/admin/blog" },
      { label: "New Post", href: "/admin/blog/new" },
      { label: "✨ Generate", href: "/admin/blog/generate" },
    ],
  },
  {
    label: "Places", icon: <MapPin size={16} />, href: "/admin/places",
    children: [
      { label: "All Places", href: "/admin/places" },
      { label: "Add New Place", href: "/admin/places/new" },
    ],
  },
  { label: "Social Media", icon: <Share2 size={16} />, href: "/admin/social" },
  {
    label: "✨ Content Engine", icon: <TrendingUp size={16} />, href: "/admin/content-engine",
    children: [
      { label: "Direction Settings", href: "/admin/content-engine" },
      { label: "Weekly Pipeline", href: "/admin/content-engine/pipeline" },
      { label: "SEO Ideas", href: "/admin/content-engine/seo" },
    ],
  },
  {
    label: "Project Management", icon: <Clipboard size={16} />, href: "/admin/bookings",
    children: [
      { label: "Bookings", href: "/admin/bookings" },
      { label: "Attendance", href: "/admin/attendance" },
      { label: "Refunds", href: "/admin/refunds" },
      { label: "Finance", href: "/admin/finance" },
    ],
  },
  { label: "Analytics", icon: <BarChart2 size={16} />, href: "/admin/analytics" },
  { label: "Settings", icon: <Settings size={16} />, href: "/admin/settings" },
];

const SIDEBAR_W = 240;

function NavLink({ item, currentPath, onClose }: { item: NavItem; currentPath: string; onClose: () => void }) {
  const [expanded, setExpanded] = useState(currentPath.startsWith(item.href) && item.href !== "/admin");
  const isActive = currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(item.href));

  return (
    <div>
      {item.children ? (
        <button onClick={() => setExpanded(!expanded)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
          background: isActive ? "rgba(255,255,255,0.1)" : "transparent", border: "none",
          color: isActive ? "#fff" : "rgba(255,255,255,0.65)", cursor: "pointer",
          fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: isActive ? 600 : 400,
          textAlign: "left", borderRadius: 0,
        }}>
          {item.icon}
          <span style={{ flex: 1 }}>{item.label}</span>
          <ChevronRight size={13} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      ) : (
        <Link href={item.href} onClick={onClose}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
            background: currentPath === item.href ? "rgba(255,255,255,0.12)" : "transparent",
            color: currentPath === item.href ? "#fff" : "rgba(255,255,255,0.65)",
            fontFamily: "Raleway, sans-serif", fontSize: "0.85rem",
            fontWeight: currentPath === item.href ? 600 : 400, cursor: "pointer",
            borderLeft: currentPath === item.href ? "3px solid hsl(38,45%,65%)" : "3px solid transparent",
          }}>
            {item.icon} {item.label}
          </div>
        </Link>
      )}
      {item.children && expanded && (
        <div style={{ background: "rgba(0,0,0,0.15)" }}>
          {item.children.map(c => (
            <Link key={c.href} href={c.href} onClick={onClose}>
              <div style={{
                padding: "10px 20px 10px 46px",
                color: currentPath === c.href ? "#fff" : "rgba(255,255,255,0.55)",
                fontFamily: "Raleway, sans-serif", fontSize: "0.82rem",
                fontWeight: currentPath === c.href ? 600 : 400, cursor: "pointer",
                borderLeft: currentPath === c.href ? "3px solid hsl(38,45%,65%)" : "3px solid transparent",
                background: currentPath === c.href ? "rgba(255,255,255,0.08)" : "transparent",
              }}>
                {c.label}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAdminAuth();
  const { open: guideOpen, setOpen: setGuideOpen, guide } = useGuide();
  const [currentPath] = useLocation();
  const isMobile = useIsMobile();
  const pinned = !isMobile;

  // Close sidebar when navigating on mobile
  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [currentPath, isMobile]);

  return (
    <div style={{ fontFamily: "Raleway, sans-serif" }}>
      {/* Overlay */}
      <div
        style={{ display: !pinned && sidebarOpen ? "block" : "none", position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div style={{
        position: "fixed", top: 0, left: (pinned || sidebarOpen) ? 0 : -SIDEBAR_W,
        width: SIDEBAR_W, height: "100vh", background: "hsl(225,45%,18%)",
        display: "flex", flexDirection: "column", zIndex: 100,
        transition: "left 0.25s ease", boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/wot-logo.png" alt="WOT" style={{ height: 32, opacity: 0.9, mixBlendMode: "screen" }} />
              <div>
                <div style={{ color: "#fff", fontFamily: "Cormorant Garamond, serif", fontSize: "0.95rem", fontWeight: 600 }}>Woman of Taste</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin Portal</div>
              </div>
            </div>
            {!pinned && (
              <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 8 }}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {NAV.map(item => <NavLink key={item.href} item={item} currentPath={currentPath} onClose={() => setSidebarOpen(false)} />)}
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: 8, background: "none", border: "none",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "Raleway, sans-serif",
            fontSize: "0.82rem", padding: "8px 0", width: "100%",
          }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: pinned ? SIDEBAR_W : 0, minHeight: "100vh",
        background: "#f5f6fa", transition: "margin-left 0.25s ease",
        display: "flex", flexDirection: "column",
      }}>
        {/* Top bar */}
        <header style={{
          background: "white", borderBottom: "1px solid #e8e8ed",
          padding: "0 1rem", height: 56, display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            {!pinned && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: 8, display: "flex", flexShrink: 0 }}>
                <Menu size={22} />
              </button>
            )}
            <h1 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: isMobile ? "1.05rem" : "1.2rem", color: "hsl(225,50%,22%)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {title ?? "Admin"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Link href="/" style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, border: "1px solid #e0e0e8", borderRadius: 20, padding: isMobile ? "4px 10px" : "4px 12px", whiteSpace: "nowrap" }}>
              {isMobile ? "← Site" : "View Site ↗"}
            </Link>
            {guide && (
              <button
                onClick={() => setGuideOpen(true)}
                title="Open page guide"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "hsl(38,45%,65%,0.15)", border: "1px solid hsl(38,45%,65%)",
                  borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                  color: "hsl(225,50%,22%)", fontFamily: "Raleway, sans-serif",
                  fontSize: "0.72rem", fontWeight: 600,
                }}
              >
                <HelpCircle size={13} />
                {!isMobile && "Guide"}
              </button>
            )}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "hsl(225,50%,22%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>WOT</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: isMobile ? "0.85rem 0.75rem" : "1.5rem", maxWidth: 1400, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {children}
        </main>
      </div>

      <AdminGuide open={guideOpen} onClose={() => setGuideOpen(false)} guide={guide} />
    </div>
  );
}
