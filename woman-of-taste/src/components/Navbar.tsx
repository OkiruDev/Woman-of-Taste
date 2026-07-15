import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { FaTiktok, FaInstagram, FaPinterest } from "react-icons/fa";
import { socialLinks } from "@/data/social";
import SiteSearch from "@/components/SiteSearch";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Explore", href: "/restaurants" },
  { label: "Journal", href: "/journal" },
  { label: "Events", href: "/events" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md ${
          scrolled
            ? "bg-[hsl(40,25%,96%)]/98 shadow-md border-b border-[hsl(35,15%,84%)]"
            : "bg-[hsl(40,25%,96%)]/85 border-b border-[hsl(35,15%,88%)]"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <motion.img
                  src="/wot-logo.png"
                  alt="Woman of Taste emblem"
                  className="h-16 w-16 sm:h-14 sm:w-14 object-contain"
                  initial={{ opacity: 0, scale: 0.78, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.9, ease: [0.34, 1.26, 0.64, 1] }}
                  whileHover={{ scale: 1.08, rotate: 6 }}
                  style={{ transformOrigin: "center", mixBlendMode: "multiply" }}
                />
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
                >
                  <p
                    className="font-serif text-base sm:text-lg font-semibold leading-none tracking-wide"
                    style={{
                      background: "linear-gradient(90deg, hsl(225,50%,22%) 0%, hsl(38,45%,50%) 40%, hsl(225,50%,22%) 80%, hsl(38,45%,55%) 100%)",
                      backgroundSize: "250% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      animation: "logo-shimmer 5s linear infinite",
                    }}
                  >
                    Woman of Taste
                  </p>
                  <p className="font-sans text-[9px] sm:text-[10px] font-light tracking-[0.2em] text-[hsl(38,45%,50%)] uppercase">
                    Savory & Soulful
                  </p>
                </motion.div>
              </div>
            </Link>
            <style>{`
              @keyframes logo-shimmer {
                0%   { background-position: 200% center; }
                100% { background-position: -50% center; }
              }
            `}</style>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-7">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`font-sans text-[11px] font-medium tracking-widest uppercase cursor-pointer transition-colors duration-200 ${
                      location === item.href
                        ? "text-[hsl(38,45%,50%)]"
                        : "text-[hsl(28,18%,14%)] hover:text-[hsl(225,50%,22%)]"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Social + Login + Mobile Toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3">
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(28,18%,18%)] hover:text-[hsl(225,50%,22%)] transition-colors"
                  aria-label="TikTok"
                >
                  <FaTiktok size={15} />
                </a>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(28,18%,18%)] hover:text-[hsl(225,50%,22%)] transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram size={15} />
                </a>
                <a
                  href={socialLinks.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(28,18%,18%)] hover:text-[hsl(225,50%,22%)] transition-colors"
                  aria-label="Pinterest"
                >
                  <FaPinterest size={15} />
                </a>
              </div>
              {/* Search button — desktop */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(28,18%,35%)] hover:text-[hsl(225,50%,22%)] transition-colors border border-[hsl(35,15%,80%)] hover:border-[hsl(225,50%,22%)] rounded-full px-3 py-1.5"
                aria-label="Search"
              >
                <Search size={11} />
                <span>Search</span>
                <kbd className="font-sans text-[8px] bg-[hsl(40,20%,90%)] border border-[hsl(35,15%,80%)] rounded px-1 py-0.5 leading-none">⌘K</kbd>
              </button>
              {/* Search icon — mobile */}
              <button
                className="lg:hidden text-[hsl(28,18%,22%)] p-1"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                className="lg:hidden text-[hsl(28,18%,22%)] p-1"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[hsl(40,25%,96%)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-7 pt-16">
              <img
                src="/wot-logo.png"
                alt="Woman of Taste"
                className="h-28 w-28 object-contain mb-2"
                style={{ mixBlendMode: "multiply" }}
              />
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link href={item.href}>
                    <span className="font-serif text-2xl font-light text-[hsl(225,50%,22%)] tracking-wide cursor-pointer hover:text-[hsl(38,45%,50%)] transition-colors">
                      {item.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
              <div className="flex items-center gap-6 mt-2">
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-[hsl(28,18%,35%)]">
                  <FaTiktok size={20} />
                </a>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[hsl(28,18%,35%)]">
                  <FaInstagram size={20} />
                </a>
                <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" className="text-[hsl(28,18%,35%)]">
                  <FaPinterest size={20} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Site Search modal */}
      <AnimatePresence>
        {searchOpen && <SiteSearch onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
