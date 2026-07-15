import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "": "Home",
  about: "About",
  journal: "Journal",
  events: "Events",
  partnerships: "Partnerships",
  contact: "Contact",
  blog: "Blog",
  "devil-wears-prada-screening-apr-2026": "Devil Wears Prada II — May 2026",
};

export default function Breadcrumb() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setScrolled(false);
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location]);

  const segments = location.split("/").filter(Boolean);

  const crumbs = [
    { label: "Home", href: "/" },
    ...segments.map((seg, i) => ({
      label: routeLabels[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <AnimatePresence>
      {scrolled && (
        <motion.nav
          key="breadcrumb"
          aria-label="Breadcrumb"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full px-6 lg:px-10 py-3 flex items-center gap-1.5 font-sans text-[11px] flex-wrap"
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid hsl(35,15%,90%)",
          }}
        >
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i === 0 && <Home size={11} style={{ color: "hsl(38,45%,52%)" }} />}
              {i < crumbs.length - 1 ? (
                <>
                  <Link href={crumb.href}>
                    <span
                      className="cursor-pointer transition-colors hover:underline"
                      style={{ color: "hsl(225,50%,32%)" }}
                    >
                      {crumb.label}
                    </span>
                  </Link>
                  <ChevronRight size={11} style={{ color: "hsl(35,15%,70%)" }} />
                </>
              ) : (
                <span style={{ color: "hsl(28,18%,35%)" }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
