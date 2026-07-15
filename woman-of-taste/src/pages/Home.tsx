import { useState, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { motion, useAnimation, type Variants } from "framer-motion";
import { ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { FaTiktok, FaInstagram } from "react-icons/fa";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";
import EventCalendarWidget from "@/components/EventCalendarWidget";
import { socialLinks, partnerLinks } from "@/data/social";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.12, ease: "easeOut" },
  }),
};


const TOTAL_SPREADS = 3;

function mapHomePost(p: any) {
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    readTime: p.readTime ?? "5 min read",
    date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "",
    excerpt: p.excerpt ?? "",
    featured: p.featured ?? false,
    coverImageUrl: p.coverImageUrl ?? null,
  };
}

export default function Home() {
  const [spread, setSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [journalEntries, setJournalEntries] = useState<ReturnType<typeof mapHomePost>[]>([]);

  useEffect(() => {
    fetch("/api/blog")
      .then(r => r.json())
      .then(d => {
        if (d.ok && d.posts) setJournalEntries(d.posts.slice(0, 6).map(mapHomePost));
      })
      .catch(() => {});
  }, []);
  const pageControls = useAnimation();

  const turnForward = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isFlipping || spread >= TOTAL_SPREADS - 1) return;
    setIsFlipping(true);
    /* Phase 1: page lifts and swings to vertical — accelerating */
    await pageControls.start({ rotateY: -90,  transition: { duration: 0.40, ease: [0.36, 0, 0.66, 0] } });
    /* Phase 2: page descends onto left side — decelerating with organic spring */
    await pageControls.start({ rotateY: -180, transition: { duration: 0.52, ease: [0.34, 1.15, 0.64, 1] } });
    setSpread((s) => s + 1);
    pageControls.set({ rotateY: 0 });
    setIsFlipping(false);
  }, [isFlipping, spread, pageControls]);

  const turnBack = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isFlipping || spread <= 0) return;
    setIsFlipping(true);
    await pageControls.start({ rotateY: -90,  transition: { duration: 0.40, ease: [0.36, 0, 0.66, 0] } });
    await pageControls.start({ rotateY: -180, transition: { duration: 0.52, ease: [0.34, 1.15, 0.64, 1] } });
    setSpread((s) => s - 1);
    pageControls.set({ rotateY: 0 });
    setIsFlipping(false);
  }, [isFlipping, spread, pageControls]);

  return (
    <Layout>
      <Helmet>
        <title>Women's Events & Experiences in South Africa | Woman of Taste</title>
        <meta name="description" content="South Africa's premium women's events — private screenings, high tea, dining & Women's Month celebrations in Johannesburg. Curated by Woman of Taste." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://womanoftaste.co.za/" />
        <meta property="og:title" content="Women's Events & Experiences in South Africa | Woman of Taste" />
        <meta property="og:description" content="South Africa's premium curated events and lifestyle experiences for women. Book your seat in Johannesburg." />
        <meta property="og:image" content="https://womanoftaste.co.za/opengraph.jpg" />
        <meta property="og:image:alt" content="Woman of Taste — curated experiences for women in South Africa" />
        <meta property="og:site_name" content="Woman of Taste" />
        <meta property="og:locale" content="en_ZA" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@pashieb_the_wot" />
        <meta name="twitter:title" content="Women's Events & Experiences in South Africa | Woman of Taste" />
        <meta name="twitter:description" content="South Africa's premium curated events and lifestyle experiences for women. Book your seat in Johannesburg." />
        <meta name="twitter:image" content="https://womanoftaste.co.za/opengraph.jpg" />
        <link rel="canonical" href="https://womanoftaste.co.za/" />
      </Helmet>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[hsl(40,25%,96%)]">
        <AnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center pt-24 pb-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)]">
                  Premium Events & Experiences · South Africa
                </span>
              </motion.div>

              <motion.h1
                className="font-serif text-5xl sm:text-6xl lg:text-[4.5rem] font-light text-[hsl(225,50%,22%)] leading-[1.06] mb-8"
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                Curated events
                <em className="block text-[hsl(38,45%,52%)] not-italic"> & experiences</em>
                for women in South Africa.
              </motion.h1>

              <motion.p
                className="font-sans text-base sm:text-lg font-normal text-[hsl(28,18%,15%)] leading-relaxed max-w-lg mb-10"
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                From private screenings and intimate dining to seasonal gatherings and Women's Month celebrations — Woman of Taste creates premium experiences for women who choose how they live.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Link href="/events">
                  <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(225,50%,22%)] text-[hsl(40,25%,96%)] rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors duration-300 shadow-md">
                    Book Your Experience
                  </button>
                </Link>
                <Link href="/events/johannesburg">
                  <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all duration-300">
                    Events in Johannesburg
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* Right: Butterfly visual */}
            <motion.div
              className="relative hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
            >
              <div className="absolute w-[460px] h-[460px] rounded-full border border-[hsl(38,45%,65%)]/30" />
              <div className="absolute w-[400px] h-[400px] rounded-full border border-[hsl(38,45%,65%)]/15" />
              <div className="relative z-10 w-[380px] h-[380px] rounded-full overflow-hidden shadow-2xl bg-[hsl(40,30%,98%)]"
                style={{ border: "1px solid hsl(38,45%,72%)", boxShadow: "0 0 60px 10px rgba(180,145,80,0.12), 0 20px 60px rgba(28,20,12,0.15)" }}>
                <img
                  src="/butterfly.jpeg"
                  alt="Woman of Taste, Transformation and Elegance"
                  className="w-full h-full object-contain p-8"
                />
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[hsl(40,25%,96%)] to-transparent" />
      </section>

      {/* ── DineXP Partnership — sits high to signal credibility immediately ── */}
      <section className="py-20 bg-[hsl(35,12%,91%)] border-b border-[hsl(35,15%,86%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            className="flex flex-col lg:flex-row items-center justify-between gap-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Left: Partnership label */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <span className="font-sans text-[10px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-2 block">
                Strategic Partnership
              </span>
              <p className="font-serif text-2xl font-light text-[hsl(225,50%,22%)]">
                Woman of Taste <span className="text-[hsl(38,45%,55%)]">×</span> DineXP
              </p>
            </div>

            {/* Centre: Equation — 2×2 grid on mobile, horizontal on desktop */}

            {/* Mobile grid — 3 columns: tile | symbol | tile */}
            <div className="grid grid-cols-[1fr,28px,1fr] gap-x-1 gap-y-5 w-full max-w-[300px] sm:hidden mx-auto">
              {/* Row 1 */}
              <div className="text-center">
                <div className="w-full h-24 rounded-2xl flex items-center justify-center mb-2 shadow-md" style={{ background: "hsl(225,50%,22%)" }}>
                  <span className="font-serif text-base font-medium text-white">Exposure</span>
                </div>
                <p className="font-sans text-[8px] font-medium tracking-wide uppercase text-[hsl(28,18%,26%)]">Digital reach & storytelling</p>
              </div>
              <div className="flex items-center justify-center pb-5">
                <span className="font-serif text-xl text-[hsl(38,45%,55%)] font-light">+</span>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-2xl flex items-center justify-center mb-2 shadow-md" style={{ background: "hsl(38,45%,55%)" }}>
                  <span className="font-serif text-base font-medium text-white">Training</span>
                </div>
                <p className="font-sans text-[8px] font-medium tracking-wide uppercase text-[hsl(28,18%,26%)]">Hospitality standards</p>
              </div>
              {/* Row 2 */}
              <div className="text-center">
                <div className="w-full h-24 rounded-2xl flex items-center justify-center mb-2 shadow-md" style={{ background: "hsl(225,40%,34%)" }}>
                  <span className="font-serif text-base font-medium text-white">Platform</span>
                </div>
                <p className="font-sans text-[8px] font-medium tracking-wide uppercase text-[hsl(28,18%,26%)]">DineXP tools & systems</p>
              </div>
              <div className="flex items-center justify-center pb-5">
                <span className="font-serif text-xl text-[hsl(38,45%,55%)] font-light">=</span>
              </div>
              <div className="text-center">
                <div className="w-full h-24 rounded-2xl flex items-center justify-center mb-2 shadow-md" style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(38,45%,52%))" }}>
                  <span className="font-serif text-base font-semibold text-white">Value</span>
                </div>
                <p className="font-sans text-[8px] font-medium tracking-wide uppercase text-[hsl(28,18%,26%)]">Restaurant growth</p>
              </div>
            </div>

            {/* Desktop equation row */}
            <div className="hidden sm:flex items-center gap-5">
              {[
                { label: "Exposure", sub: "Digital reach & storytelling" },
                { label: "Training", sub: "Hospitality standards" },
                { label: "Platform", sub: "DineXP tools & systems" },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-5">
                  <div className="text-center">
                    <div
                      className="w-32 h-24 rounded-2xl flex items-center justify-center mb-2"
                      style={{ background: i === 0 ? "hsl(225,50%,22%)" : i === 1 ? "hsl(38,45%,55%)" : "hsl(225,40%,34%)" }}
                    >
                      <span className="font-serif text-xl font-medium text-white leading-tight">{item.label}</span>
                    </div>
                    <p className="font-sans text-[9px] font-medium tracking-wide uppercase text-[hsl(28,18%,26%)]">{item.sub}</p>
                  </div>
                  {i < 2 && (
                    <span className="font-serif text-2xl text-[hsl(38,45%,55%)] font-light mb-6">+</span>
                  )}
                </div>
              ))}
              <span className="font-serif text-2xl text-[hsl(38,45%,55%)] font-light mb-6">=</span>
              <div className="text-center">
                <div
                  className="w-36 h-24 rounded-2xl flex items-center justify-center mb-2 shadow-lg"
                  style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(38,45%,52%))" }}
                >
                  <span className="font-serif text-xl font-semibold text-white leading-tight">Value</span>
                </div>
                <p className="font-sans text-[9px] font-medium tracking-wide uppercase text-[hsl(28,18%,26%)]">Restaurant growth</p>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 items-center">
              <Link href="/partnerships">
                <button className="font-sans text-[10px] font-semibold tracking-widest uppercase px-6 py-3 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-md whitespace-nowrap">
                  Partner with Us
                </button>
              </Link>
              <a
                href={partnerLinks.dinexpWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 font-sans text-[10px] font-semibold tracking-widest uppercase px-6 py-3 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all whitespace-nowrap"
              >
                <img src="/dinexp-logo-new.png" alt="DineXP" className="h-4 object-contain group-hover:[filter:brightness(0)_invert(1)] transition-all" style={{ filter: "brightness(0) sepia(1) hue-rotate(200deg) saturate(5)" }} />
                <ExternalLink size={11} />
              </a>
              <a
                href={partnerLinks.okiruWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 font-sans text-[10px] font-semibold tracking-widest uppercase px-6 py-3 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all whitespace-nowrap"
              >
                <img src="/okiru-logo.png" alt="Okiru" className="h-3.5 object-contain group-hover:[filter:brightness(0)_invert(1)] transition-all" style={{ filter: "brightness(0)" }} />
                Powered by Okiru <ExternalLink size={11} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ── Savory & Soulful Strategy ── */}
      <section className="py-24 bg-[hsl(40,25%,96%)] relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-4 block">
                The Strategy
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-6 leading-tight">
                The Savory &<br />Soulful Strategy
              </h2>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-5">
                Modern diners are no longer looking for a meal alone. They are looking for <em className="font-medium text-[hsl(225,50%,28%)] not-italic">emotional return on investment</em>. They want to feel something. To be received well. To leave with a memory.
              </p>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-5">
                Restaurants that understand this are moving beyond transactional service and creating <em className="font-medium text-[hsl(225,50%,28%)] not-italic">transformational hospitality</em>.
              </p>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed">
                Woman of Taste serves as the bridge connecting digital storytelling and restaurant visibility, guest expectation and dining experience, a meal and a memory.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              {[
                { label: "Digital Storytelling", desc: "Crafting narratives around the restaurant experience that resonate and spread." },
                { label: "Restaurant Visibility", desc: "Putting the right restaurants in front of the right audiences through editorial content." },
                { label: "Guest Experience", desc: "Elevating service culture so that every guest feels genuinely received." },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-2xl p-7 flex gap-5 items-start"
                >
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-serif"
                    style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(38,45%,55%))" }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-1">{item.label}</h4>
                    <p className="font-sans text-sm font-normal text-[hsl(28,18%,20%)] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Journal Open Book ── */}
      <section className="py-20 bg-[hsl(35,15%,93%)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">
              From the Journal
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)]">
              The WOT Journal
            </h2>
          </motion.div>

          {/* ── DESKTOP: Open Book (hidden on mobile) ── */}
          <motion.div
            className="hidden sm:flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="select-none" style={{ perspective: "1600px", perspectiveOrigin: "50% 42%" }}>
              {/* Book body */}
              <div
                className="relative flex"
                style={{
                  width: "min(680px, 94vw)",
                  height: "clamp(320px, 46vw, 440px)",
                  borderRadius: "4px 12px 12px 4px",
                  /* Deep layered shadow — book sitting on a surface */
                  boxShadow: "0 40px 100px rgba(28,20,12,0.38), 0 12px 32px rgba(28,20,12,0.22), 0 2px 6px rgba(28,20,12,0.14)",
                  overflow: "visible",
                }}
              >
                {/* Book spine thickness — left edge depth illusion */}
                <div style={{
                  position: "absolute",
                  left: -7,
                  top: 3,
                  bottom: -4,
                  width: 8,
                  borderRadius: "3px 0 0 3px",
                  background: "linear-gradient(90deg, hsl(35,18%,70%) 0%, hsl(35,22%,78%) 100%)",
                  zIndex: 0,
                  boxShadow: "-3px 4px 12px rgba(0,0,0,0.18)",
                }} />
                {/* Left page — content changes per spread; click turns back */}
                <div
                  className="w-1/2 h-full flex-shrink-0 relative overflow-hidden"
                  onClick={spread > 0 ? turnBack : undefined}
                  style={{
                    background: "linear-gradient(170deg, hsl(40,32%,97%) 0%, hsl(38,20%,92%) 100%)",
                    borderRadius: "4px 0 0 4px",
                    borderRight: "1px solid hsl(35,15%,82%)",
                    cursor: spread > 0 ? "pointer" : "default",
                  }}
                >
                  {/* Ruled-line texture */}
                  <div className="absolute inset-0 opacity-[0.033]" style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 22px, hsl(28,18%,20%) 22px, hsl(28,18%,20%) 23px)",
                  }} />
                  {/* Inner-spine shadow */}
                  <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none z-10"
                    style={{ background: "linear-gradient(to right, transparent, rgba(28,20,12,0.07))" }} />

                  {/* Left page: Spread 0 — Intro */}
                  {spread === 0 && (
                    <div className="relative z-10 h-full flex flex-col justify-between px-8 py-7">
                      <div>
                        <span className="font-sans text-[8px] font-bold tracking-[0.3em] uppercase text-[hsl(38,45%,48%)]">
                          Woman of Taste · The Journal
                        </span>
                        <div className="w-8 h-px bg-[hsl(38,45%,58%)] mt-2.5" />
                      </div>
                      <div>
                        <p className="font-serif text-xl font-light text-[hsl(225,50%,22%)] leading-[1.5] mb-4 italic">
                          "Taste is not what you consume. It is how you consume it."
                        </p>
                        <p className="font-sans text-[11px] font-light text-[hsl(28,18%,40%)] leading-relaxed">
                          Essays on dining, culture, and the beautifully lived life — stories from the tables that matter.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[8px] tracking-[0.22em] uppercase text-[hsl(28,18%,50%)]">Issue 01</span>
                        <span className="text-[hsl(38,45%,55%)] text-xs">·</span>
                        <span className="font-sans text-[8px] tracking-[0.22em] uppercase text-[hsl(28,18%,50%)]">2026</span>
                      </div>
                    </div>
                  )}

                  {/* Left page: Spread 1 — Entries 1–3 */}
                  {spread === 1 && (
                    <div className="relative z-10 h-full flex flex-col justify-between px-7 py-6">
                      <div>
                        <span className="font-sans text-[8px] font-bold tracking-[0.3em] uppercase text-[hsl(38,45%,48%)] block mb-3">
                          In This Issue
                        </span>
                        <div className="w-8 h-px bg-[hsl(38,45%,58%)] mb-4" />
                      </div>
                      <div className="flex-1 flex flex-col justify-around gap-1">
                        {journalEntries.slice(0, 3).map((entry, i) => (
                          <Link key={entry.slug} href={`/journal/${entry.slug}`} onClick={(e) => e.stopPropagation()}>
                            <div className="group py-2 border-b border-[hsl(35,15%,85%)] last:border-0 cursor-pointer hover:bg-[hsl(40,20%,94%)] px-2 -mx-2 rounded transition-colors">
                              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                <span className="font-sans text-[7px] tracking-[0.2em] uppercase text-[hsl(38,45%,48%)]">{entry.category}</span>
                                <span className="font-sans text-[7px] text-[hsl(28,18%,55%)]">{entry.readTime}</span>
                              </div>
                              <p className="font-serif text-[13px] font-medium text-[hsl(225,50%,22%)] leading-snug group-hover:text-[hsl(38,45%,42%)] transition-colors">
                                {entry.title}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <span className="font-sans text-[7px] tracking-[0.2em] uppercase text-[hsl(28,18%,50%)]">Page 1 of 2</span>
                    </div>
                  )}

                  {/* Left page: Spread 2 — See all CTA */}
                  {spread === 2 && (
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
                      <img src="/wot-logo.png" alt="" className="object-contain mb-5 opacity-20"
                        style={{ width: 64, height: 64, mixBlendMode: "multiply" }} />
                      <p className="font-serif text-xl font-light text-[hsl(225,50%,22%)] leading-snug mb-3">
                        Six stories.<br />One journal.
                      </p>
                      <p className="font-sans text-[11px] font-light text-[hsl(28,18%,40%)] leading-relaxed mb-6">
                        Essays, restaurant stories, and conversations about the beautifully lived life.
                      </p>
                      <Link href="/journal" onClick={(e) => e.stopPropagation()}>
                        <button className="font-sans text-[10px] font-semibold tracking-widest uppercase px-6 py-2.5 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all">
                          View All Stories →
                        </button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Left-page shadow — grows during flip to simulate the turning page casting a shadow */}
                <motion.div
                  className="absolute top-0 left-0 w-1/2 h-full pointer-events-none"
                  style={{ zIndex: 9, borderRadius: "4px 0 0 4px" }}
                  animate={{ opacity: isFlipping ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div style={{
                    width: "100%", height: "100%",
                    background: "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.22) 100%)",
                    borderRadius: "4px 0 0 4px",
                  }} />
                </motion.div>

                {/* Spine */}
                <div className="absolute left-1/2 top-0 bottom-0 w-3 -translate-x-1/2 z-20 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.22) 0%, rgba(255,255,255,0.08) 50%, rgba(0,0,0,0.18) 100%)" }} />

                {/* Turning right page */}
                <motion.div
                  className="absolute top-0 right-0 bottom-0 w-1/2 z-10 cursor-pointer"
                  animate={pageControls}
                  style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
                  onClick={turnForward}
                >
                  {/* Front face */}
                  <div className="absolute inset-0 overflow-hidden" style={{ backfaceVisibility: "hidden", borderRadius: "0 12px 12px 0" }}>
                    {/* Spread 0 right: Cover image */}
                    {spread === 0 && (
                      <>
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(160deg, hsl(40,30%,97%) 0%, hsl(38,22%,93%) 100%)" }}>
                          <img src="/journal-cover.jpeg" alt="Woman of Taste Journal Cover"
                            className="w-full h-full object-contain" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-16"
                          style={{ background: "linear-gradient(to top, rgba(38,28,10,0.45), transparent)" }} />
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <span className="font-sans text-[8px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,48%)]">The Journal</span>
                          <div className="flex items-center gap-1">
                            <span className="font-sans text-[7px] tracking-widest uppercase text-[hsl(28,18%,50%)]">turn</span>
                            <ArrowRight size={8} className="text-[hsl(38,45%,55%)]" />
                          </div>
                        </div>
                        <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
                          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.15), transparent)" }} />
                      </>
                    )}
                    {/* Spread 1 right: Entries 4–6 */}
                    {spread === 1 && (
                      <div className="h-full flex flex-col justify-between px-7 py-6"
                        style={{ background: "linear-gradient(170deg, hsl(40,32%,97%) 0%, hsl(38,20%,92%) 100%)" }}>
                        <div className="absolute inset-0 opacity-[0.033]" style={{
                          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 22px, hsl(28,18%,20%) 22px, hsl(28,18%,20%) 23px)",
                        }} />
                        <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10"
                          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.10), transparent)" }} />
                        <div className="relative z-10">
                          <span className="font-sans text-[8px] font-bold tracking-[0.3em] uppercase text-[hsl(38,45%,48%)] block mb-3">
                            Continued
                          </span>
                          <div className="w-8 h-px bg-[hsl(38,45%,58%)] mb-4" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col justify-around gap-1">
                          {journalEntries.slice(3, 6).map((entry) => (
                            <Link key={entry.slug} href={`/journal/${entry.slug}`} onClick={(e) => e.stopPropagation()}>
                              <div className="group py-2 border-b border-[hsl(35,15%,85%)] last:border-0 cursor-pointer hover:bg-[hsl(40,20%,94%)] px-2 -mx-2 rounded transition-colors">
                                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                  <span className="font-sans text-[7px] tracking-[0.2em] uppercase text-[hsl(38,45%,48%)]">{entry.category}</span>
                                  <span className="font-sans text-[7px] text-[hsl(28,18%,55%)]">{entry.readTime}</span>
                                </div>
                                <p className="font-serif text-[13px] font-medium text-[hsl(225,50%,22%)] leading-snug group-hover:text-[hsl(38,45%,42%)] transition-colors">
                                  {entry.title}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <span className="relative z-10 font-sans text-[7px] tracking-[0.2em] uppercase text-[hsl(28,18%,50%)]">Page 2 of 2</span>
                      </div>
                    )}
                    {/* Spread 2 right: Navy back cover */}
                    {spread === 2 && (
                      <div className="h-full flex flex-col items-center justify-center px-7 text-center"
                        style={{ background: "linear-gradient(160deg, hsl(225,50%,22%) 0%, hsl(225,42%,18%) 100%)" }}>
                        <img src="/wot-logo.png" alt="Woman of Taste" className="object-contain mb-5"
                          style={{ width: 56, height: 56, mixBlendMode: "screen", opacity: 0.7 }} />
                        <p className="font-sans text-[9px] font-bold tracking-[0.28em] uppercase text-[hsl(38,45%,65%)] mb-3">Stories Worth Reading</p>
                        <p className="font-serif text-lg font-light text-[hsl(40,25%,94%)] leading-snug mb-4">
                          Reflections on dining,<br />culture & the art of<br />living well.
                        </p>
                        <div className="w-10 h-px bg-[hsl(38,45%,58%)] mb-4" />
                        <Link href="/journal" onClick={(e) => e.stopPropagation()}>
                          <button className="font-sans text-[10px] font-semibold tracking-widest uppercase px-6 py-2.5 bg-[hsl(38,45%,58%)] text-white rounded-full hover:bg-[hsl(38,45%,50%)] transition-colors shadow-lg">
                            Read the Journal
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                  {/* ── Page sheen — gradient sweeps across front face as page turns ── */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ borderRadius: "0 12px 12px 0", zIndex: 15 }}
                    animate={{ opacity: isFlipping ? 1 : 0 }}
                    transition={{ duration: 0.92 }}
                  >
                    <div style={{
                      position: "absolute", inset: 0, borderRadius: "0 12px 12px 0",
                      background: "linear-gradient(115deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 28%, transparent 55%, rgba(0,0,0,0.06) 100%)",
                    }} />
                  </motion.div>

                  {/* ── Dog-ear corner fold — visible hint that this page can be turned ── */}
                  {!isFlipping && spread < TOTAL_SPREADS - 1 && (
                    <div
                      className="group absolute bottom-0 right-0 z-20 cursor-pointer"
                      onClick={turnForward}
                      style={{ width: 36, height: 36 }}
                    >
                      {/* The folded triangle */}
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: "100%", height: "100%",
                        background: "linear-gradient(225deg, hsl(35,24%,82%) 50%, transparent 50%)",
                        borderRadius: "0 0 12px 0",
                        boxShadow: "-2px -2px 6px rgba(0,0,0,0.12)",
                        transition: "all 0.22s ease",
                      }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.width = "48px"; el.style.height = "48px"; el.style.bottom = "0"; el.style.right = "0"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.width = "100%"; el.style.height = "100%"; }}
                      />
                    </div>
                  )}

                  {/* Back face — neutral inner-page shown during flip */}
                  <div className="absolute inset-0 overflow-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: "linear-gradient(170deg, hsl(40,30%,95%) 0%, hsl(38,18%,90%) 100%)",
                      borderRadius: "0 12px 12px 0",
                    }}>
                    <div className="absolute inset-0 opacity-[0.033]" style={{
                      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 22px, hsl(28,18%,20%) 22px, hsl(28,18%,20%) 23px)",
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src="/wot-logo.png" alt="" className="object-contain opacity-[0.07]"
                        style={{ width: 100, height: 100, mixBlendMode: "multiply" }} />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Book base shadow */}
              <div style={{ height: "10px", marginTop: "-2px", borderRadius: "0 0 12px 12px", background: "linear-gradient(to bottom, rgba(28,20,12,0.22), transparent)" }} />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-5 px-2">
                <button
                  onClick={turnBack}
                  disabled={spread === 0 || isFlipping}
                  className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,48%)] hover:text-[hsl(225,50%,22%)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors"
                      style={{ background: i === spread ? "hsl(38,45%,55%)" : "hsl(35,15%,74%)" }} />
                  ))}
                </div>
                <button
                  onClick={turnForward}
                  disabled={spread === TOTAL_SPREADS - 1 || isFlipping}
                  className="flex items-center gap-1.5 font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,48%)] hover:text-[hsl(225,50%,22%)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── MOBILE: Journal index (shown on mobile only) ── */}
          <div className="sm:hidden">
            {/* Cover card */}
            <motion.div
              className="rounded-2xl overflow-hidden mb-6 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ background: "linear-gradient(160deg, hsl(40,30%,97%) 0%, hsl(38,22%,93%) 100%)" }}
            >
              <div className="flex items-center gap-4 p-5">
                <img src="/journal-cover.jpeg" alt="Journal Cover"
                  className="w-24 h-28 object-contain flex-shrink-0 rounded-lg border border-[hsl(35,15%,85%)]"
                  style={{ background: "hsl(40,28%,96%)" }} />
                <div>
                  <span className="font-sans text-[8px] font-bold tracking-[0.3em] uppercase text-[hsl(38,45%,48%)] block mb-1">Issue 01 · 2026</span>
                  <p className="font-serif text-base font-light text-[hsl(225,50%,22%)] leading-snug italic mb-2">
                    "Taste is not what you consume."
                  </p>
                  <p className="font-sans text-[10px] font-light text-[hsl(28,18%,40%)]">6 stories inside</p>
                </div>
              </div>
            </motion.div>

            {/* Entry list */}
            <div className="space-y-3 mb-6">
              {journalEntries.map((entry, i) => (
                <motion.div
                  key={entry.slug}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/journal/${entry.slug}`}>
                    <div className="group flex items-center justify-between gap-3 bg-[hsl(40,28%,97%)] border border-[hsl(35,15%,87%)] rounded-xl px-4 py-3.5 hover:border-[hsl(38,45%,62%)] hover:shadow-sm transition-all cursor-pointer">
                      <div className="min-w-0">
                        <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-[hsl(38,45%,48%)] block mb-0.5">{entry.category} · {entry.readTime}</span>
                        <p className="font-serif text-[13px] font-medium text-[hsl(225,50%,22%)] leading-snug group-hover:text-[hsl(38,45%,42%)] transition-colors truncate">
                          {entry.title}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-[hsl(38,45%,55%)] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link href="/journal">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-3.5 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-md">
                  Visit the Journal
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ── Calendar Widget ── */}
      <EventCalendarWidget />

      {/* ── Social ── */}
      <section className="py-24 bg-[hsl(225,50%,22%)] relative overflow-hidden">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <img src="/wot-logo.png" alt="Woman of Taste" className="object-contain mx-auto mb-8" style={{ width: 120, height: 120, mixBlendMode: "screen", opacity: 0.88 }} />
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(40,25%,96%)] mb-4">Follow the Journey</h2>
            <p className="font-sans text-base font-light text-[hsl(40,25%,75%)] leading-relaxed mb-10">
              Join the Woman of Taste community on TikTok and Instagram for daily elegance, dining storytelling, and a glimpse into the art of refined living.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-white text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(40,25%,94%)] transition-colors shadow-lg">
                <FaTiktok size={16} /> TikTok
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(38,45%,65%)] text-[hsl(38,45%,65%)] rounded-full hover:bg-[hsl(38,45%,65%)] hover:text-[hsl(225,50%,22%)] transition-all">
                <FaInstagram size={16} /> Instagram
              </a>
              {/* Facebook: Add button here when ready */}
              {/* Pinterest: Add button here when ready */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-[hsl(40,25%,96%)] relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            {/* 🦋 Got Questions? sticker — links to About FAQ */}
            <div className="flex justify-center mb-10">
              <Link href="/about#faq">
                <div
                  className="font-sans text-[11px] font-bold tracking-[0.22em] uppercase px-6 py-3 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                  style={{
                    background: "hsl(40,65%,93%)",
                    border: "2px solid hsl(38,45%,62%)",
                    color: "hsl(225,50%,22%)",
                    transform: "rotate(-2.5deg)",
                    boxShadow: "2px 4px 14px rgba(28,20,12,0.13)",
                  }}
                >
                  🦋 &nbsp;Got Questions?&nbsp; ✦
                </div>
              </Link>
            </div>
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-[hsl(38,45%,60%)] to-transparent mx-auto mb-10" />
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[hsl(225,50%,22%)] mb-6 leading-tight">
              Step into the world of<br /><em className="text-[hsl(38,45%,52%)] not-italic">Woman of Taste.</em>
            </h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-10 max-w-xl mx-auto">
              Whether you are a diner, a restaurant owner, or a brand that believes in the power of beautiful experiences — there is a place for you here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-lg">
                  Get in Touch
                </button>
              </Link>
              <Link href="/partnerships">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 text-[hsl(225,50%,22%)] border border-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all">
                  Restaurant Partnerships →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </Layout>
  );
}
