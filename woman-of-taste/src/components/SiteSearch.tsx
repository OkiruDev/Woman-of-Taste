import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const API_BASE = "/api";

const QUICK_LINKS = [
  { label: "Explore Places", href: "/restaurants", icon: "map" },
  { label: "Journal", href: "/journal", icon: "book" },
  { label: "Upcoming Events", href: "/events", icon: "cal" },
  { label: "Partnerships", href: "/partnerships", icon: "arrow" },
];

interface Result {
  type: "place" | "journal" | "page";
  title: string;
  desc?: string;
  href: string;
  category?: string;
}

const STATIC_PAGES: Result[] = [
  { type: "page", title: "Home", desc: "Woman of Taste homepage", href: "/" },
  { type: "page", title: "About PashieB", desc: "The story of Patience Bwanya and Woman of Taste", href: "/about" },
  { type: "page", title: "Explore", desc: "Restaurants, stays, and experiences reviewed by PashieB", href: "/restaurants" },
  { type: "page", title: "Journal", desc: "Stories, guides, and reflections from Woman of Taste", href: "/journal" },
  { type: "page", title: "Events", desc: "Upcoming women's events and curated experiences", href: "/events" },
  { type: "page", title: "Partnerships", desc: "Partner with Woman of Taste to grow your restaurant or venue", href: "/partnerships" },
  { type: "page", title: "Contact", desc: "Get in touch with the Woman of Taste team", href: "/contact" },
];

function TypeIcon({ type }: { type: string }) {
  if (type === "place") return <MapPin size={14} />;
  if (type === "journal") return <BookOpen size={14} />;
  if (type === "cal") return <Calendar size={14} />;
  return <ArrowRight size={14} />;
}

function QuickIcon({ icon }: { icon: string }) {
  if (icon === "map") return <MapPin size={13} />;
  if (icon === "book") return <BookOpen size={13} />;
  if (icon === "cal") return <Calendar size={13} />;
  return <ArrowRight size={13} />;
}

export default function SiteSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/places?limit=100`).then((r) => r.json()).catch(() => ({})),
      fetch(`${API_BASE}/blog?limit=100`).then((r) => r.json()).catch(() => ({})),
    ]).then(([placesData, postsData]) => {
      setPlaces(placesData.places || []);
      setPosts(postsData.posts || postsData || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.toLowerCase().trim();

  const results: Result[] = q === ""
    ? []
    : [
        ...STATIC_PAGES.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.desc ?? "").toLowerCase().includes(q)
        ),
        ...places
          .filter(
            (p: any) =>
              p.name?.toLowerCase().includes(q) ||
              p.neighborhood?.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q) ||
              p.cuisine?.toLowerCase().includes(q) ||
              p.city?.toLowerCase().includes(q) ||
              p.excerpt?.toLowerCase().includes(q)
          )
          .map((p: any) => ({
            type: "place" as const,
            title: p.name,
            desc: p.tagline || p.excerpt,
            href: `/restaurants/${p.slug}`,
            category: p.category || p.neighborhood,
          })),
        ...posts
          .filter(
            (p: any) =>
              p.title?.toLowerCase().includes(q) ||
              p.excerpt?.toLowerCase().includes(q) ||
              p.category?.toLowerCase().includes(q)
          )
          .map((p: any) => ({
            type: "journal" as const,
            title: p.title,
            desc: p.excerpt,
            href: `/journal/${p.slug}`,
            category: p.category,
          })),
      ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh] px-4"
        style={{ background: "rgba(20,14,8,0.68)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.97 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-3xl overflow-hidden"
          style={{
            background: "hsl(40,25%,97%)",
            boxShadow: "0 32px 80px rgba(20,14,8,0.38), 0 0 0 1px rgba(180,145,80,0.18)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input row */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[hsl(35,15%,88%)]">
            <Search size={18} className="text-[hsl(38,45%,50%)] flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search places, journal posts, pages…"
              className="flex-1 font-sans text-[15px] bg-transparent text-[hsl(28,18%,10%)] placeholder:text-[hsl(28,18%,50%)] focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-[hsl(28,18%,45%)] hover:text-[hsl(28,18%,20%)] transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(28,18%,40%)] hover:text-[hsl(28,18%,15%)] border border-[hsl(35,15%,82%)] rounded-lg px-3 py-1.5 transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[62vh] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {/* Loading */}
            {loading && (
              <div className="px-6 py-10 text-center font-sans text-sm text-[hsl(28,18%,45%)]">
                Loading…
              </div>
            )}

            {/* Empty query — show quick links */}
            {!loading && q === "" && (
              <div className="px-6 py-6">
                <p className="font-sans text-[10px] font-semibold tracking-[0.18em] uppercase text-[hsl(38,45%,52%)] mb-4">
                  Quick Links
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_LINKS.map((item) => (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-[hsl(35,15%,88%)] hover:border-[hsl(225,50%,35%)] hover:bg-[hsl(225,50%,97%)] transition-all group cursor-pointer">
                        <span className="text-[hsl(38,45%,52%)] group-hover:text-[hsl(225,50%,35%)] transition-colors">
                          <QuickIcon icon={item.icon} />
                        </span>
                        <span className="font-sans text-sm font-medium text-[hsl(28,18%,18%)] group-hover:text-[hsl(225,50%,22%)] transition-colors">
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!loading && q !== "" && results.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="font-serif text-lg font-light text-[hsl(28,18%,28%)] mb-2">
                  No results for "{query}"
                </p>
                <p className="font-sans text-sm text-[hsl(28,18%,50%)]">
                  Try a restaurant name, topic, or page.
                </p>
              </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map((r, i) => (
                  <Link key={i} href={r.href} onClick={onClose}>
                    <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-[hsl(40,25%,93%)] transition-colors group cursor-pointer">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: "hsl(40,30%,90%)",
                          color: "hsl(38,45%,52%)",
                        }}
                      >
                        <TypeIcon type={r.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-sans text-sm font-semibold text-[hsl(28,18%,15%)] group-hover:text-[hsl(225,50%,22%)] transition-colors truncate">
                            {r.title}
                          </p>
                          {(r.category || r.type) && (
                            <span
                              className="font-sans text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                background: "hsl(38,45%,92%)",
                                color: "hsl(38,45%,38%)",
                              }}
                            >
                              {r.category ||
                                (r.type === "place"
                                  ? "Place"
                                  : r.type === "journal"
                                  ? "Journal"
                                  : "Page")}
                            </span>
                          )}
                        </div>
                        {r.desc && (
                          <p className="font-sans text-xs text-[hsl(28,18%,42%)] truncate">
                            {r.desc}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        size={14}
                        className="flex-shrink-0 text-[hsl(28,18%,60%)] group-hover:text-[hsl(225,50%,35%)] transition-colors"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[hsl(35,15%,88%)] flex items-center justify-between">
            <p className="font-sans text-[10px] text-[hsl(28,18%,48%)]">
              {results.length > 0
                ? `${results.length} result${results.length !== 1 ? "s" : ""}`
                : "Places · Journal · Pages"}
            </p>
            <div className="flex items-center gap-1.5">
              <kbd
                className="font-sans text-[10px] rounded px-1.5 py-0.5 border"
                style={{
                  background: "hsl(40,20%,91%)",
                  borderColor: "hsl(35,15%,82%)",
                  color: "hsl(28,18%,35%)",
                }}
              >
                ⌘K
              </kbd>
              <span className="font-sans text-[10px] text-[hsl(28,18%,48%)]">to search anywhere</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
