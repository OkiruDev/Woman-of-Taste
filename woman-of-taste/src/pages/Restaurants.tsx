import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { MapPin, ArrowRight, Filter, Play } from "lucide-react";
import Layout from "@/components/Layout";
import FAQ from "@/components/FAQ";
import { faqsByPage } from "@/data/faqData";

const NAVY = "hsl(225,50%,22%)";
const GOLD = "hsl(38,45%,65%)";
const IVORY = "hsl(40,25%,96%)";

const CATEGORY_TABS = [
  { id: "All", label: "All" },
  { id: "Restaurant", label: "Restaurants" },
  { id: "Experience", label: "Experiences" },
  { id: "Stay", label: "Stays" },
];

const CATEGORY_COLOR: Record<string, string> = {
  Restaurant: NAVY,
  Experience: "#7c3aed",
  Stay: "#065f46",
};

const PRICE_LABEL: Record<string, string> = { R: "Budget", RR: "Mid-range", RRR: "Upscale", RRRR: "Fine Dining" };

function fmtViews(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

function ViewBadge({ views }: { views: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.55)", color: "white", padding: "3px 9px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, fontFamily: "Raleway, sans-serif", backdropFilter: "blur(4px)" }}>
      <Play size={9} fill="white" stroke="none" />
      {fmtViews(views)} views
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLOR[category] || NAVY;
  return (
    <span style={{ background: color + "18", color, border: `1px solid ${color}30`, padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, fontFamily: "Raleway, sans-serif" }}>
      {category}
    </span>
  );
}

function filterBtn(active: boolean) {
  return {
    padding: "0.4rem 0.9rem", borderRadius: 99,
    border: `1.5px solid ${active ? NAVY : "#ddd"}`,
    background: active ? NAVY : "white",
    color: active ? "white" : "#555",
    fontSize: "0.78rem", fontWeight: 600, fontFamily: "Raleway, sans-serif",
    cursor: "pointer", transition: "all 0.2s",
  };
}

export default function Restaurants() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCity, setActiveCity] = useState("All");

  useEffect(() => {
    fetch("/api/places")
      .then(r => r.json())
      .then(d => setPlaces(d.places || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = places.filter(p => {
    const catMatch = activeCategory === "All" || p.category === activeCategory;
    const cityMatch = activeCity === "All" || p.city === activeCity;
    return catMatch && cityMatch;
  });

  const featured = places[0];
  const cities = ["All", ...Array.from(new Set(places.map(p => p.city)))];

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Restaurants, Experiences & Stays | Woman of Taste",
    "description": "PashieB's (Patience Bwanya) curated guide to South African restaurants, experiences and stays — only featuring content with 10K+ TikTok views from @pashieb_the_wot.",
    "url": "https://womanoftaste.co.za/restaurants",
    "creator": { "@type": "Person", "name": "Patience Bwanya", "alternateName": "PashieB", "sameAs": ["https://www.tiktok.com/@pashieb_the_wot"] },
  };

  return (
    <Layout title="Restaurants, Experiences & Stays">
      <Helmet>
        <title>Restaurants, Experiences & Stays | Woman of Taste</title>
        <meta name="description" content="PashieB's curated guide to restaurants, experiences & stays in Johannesburg — only places featured on @pashieb_the_wot TikTok. Real places, real insight." />
        <meta property="og:title" content="Restaurants, Experiences & Stays | Woman of Taste" />
        <meta property="og:description" content="South African dining, experiences and stays as featured by PashieB of Woman of Taste on TikTok — only the places that resonated most." />
        <meta property="og:url" content="https://womanoftaste.co.za/restaurants" />
        {featured && <meta property="og:image" content={featured.coverImage} />}
        <link rel="canonical" href="https://womanoftaste.co.za/restaurants" />
        <meta name="keywords" content="restaurants near me Johannesburg, restaurants near me Pretoria, cute date spots Johannesburg, cute date spots Pretoria, cute date spots Cape Town, date night restaurants Johannesburg, date night restaurants South Africa, best restaurants Johannesburg 2025, best restaurants Joburg, best restaurants Pretoria, best places to eat Joburg, where to eat in Johannesburg, where to eat in Pretoria, romantic restaurants Johannesburg, romantic restaurants South Africa, Woman of Taste restaurant guide, PashieB TikTok restaurants, restaurants South Africa, best restaurants South Africa, date night ideas Johannesburg, date spots near me Joburg, Sandton restaurants, Rosebank restaurants, Parkhurst restaurants, Pretoria restaurants, weekend getaway Johannesburg, things to do Johannesburg, places to eat near me South Africa, Marble Rosebank, La Madeleine Pretoria, The Saxon Hotel Sandton, SAINT Sandton, Farmhouse 58 Muldersdrift" />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>

      {/* Hero */}
      <section style={{ paddingTop: "6rem", paddingBottom: "3.5rem", background: NAVY, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ maxWidth: 700, margin: "0 auto", padding: "0 1.5rem" }}>
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: "1rem" }}>
            Reviewed for your insight
          </p>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.4rem, 6vw, 3.8rem)", fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: "1.25rem" }}>
            Restaurants, Experiences<br />& Stays
          </h1>
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 1.75rem" }}>
            Only the places PashieB has featured on TikTok with 10K+ views. Real visits, honest insight — so you know exactly what to expect before you go.
          </p>
          <a href="https://www.tiktok.com/@pashieb_the_wot" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.65rem 1.5rem", background: GOLD, color: NAVY, borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none" }}>
            <Play size={13} fill={NAVY} stroke="none" />
            Watch on TikTok @pashieb_the_wot
          </a>
        </motion.div>
      </section>

      {/* Featured */}
      {!loading && featured && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
            <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD, margin: 0 }}>Most Watched</p>
            <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
          </div>
          <Link href={`/restaurants/${featured.slug}`} style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ y: -4 }} className="explore-featured"
              style={{ borderRadius: 20, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", background: "white", boxShadow: "0 4px 32px rgba(0,0,0,0.1)", cursor: "pointer" }}>
              <div style={{ position: "relative", minHeight: 360 }}>
                {featured.coverImage && <img src={featured.coverImage} alt={featured.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, display: "block" }} />}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(25,35,80,0.25) 0%, transparent 60%)" }} />
                <div style={{ position: "absolute", top: 16, left: 16 }}><CategoryBadge category={featured.category} /></div>
                <div style={{ position: "absolute", bottom: 16, left: 16 }}><ViewBadge views={featured.tiktokViews} /></div>
              </div>
              <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                  <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#aaa" }}>{featured.cuisine || featured.category}</span>
                  {featured.cuisine && <><span style={{ color: "#ddd" }}>·</span><span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", fontWeight: 700, color: GOLD }}>{featured.priceRange}</span></>}
                </div>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2.2rem", color: NAVY, margin: "0 0 0.5rem", lineHeight: 1.1 }}>{featured.name}</h2>
                <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", color: GOLD, marginBottom: "1rem", fontStyle: "italic" }}>{featured.tagline}</p>
                <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: "#555", lineHeight: 1.75, marginBottom: "1.5rem" }}>{featured.excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={13} color={GOLD} />
                  <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#888" }}>{featured.neighborhood}, {featured.city}</span>
                </div>
                <div style={{ marginTop: "1.5rem", display: "inline-flex", alignItems: "center", gap: 6, color: NAVY, fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", fontWeight: 700 }}>
                  See the insight <ArrowRight size={14} />
                </div>
              </div>
            </motion.div>
          </Link>
        </section>
      )}

      {/* Filters */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem 0" }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem 0.75rem" }}>
          <Filter size={14} color="#aaa" />
          {CATEGORY_TABS.map(t => (
            <button key={t.id} onClick={() => setActiveCategory(t.id)} style={filterBtn(activeCategory === t.id)}>{t.label}</button>
          ))}
          {cities.length > 2 && (
            <>
              <span style={{ width: 1, height: 20, background: "#e5e5e5", margin: "0 0.25rem" }} />
              {cities.map(c => (
                <button key={c} onClick={() => setActiveCity(c)} style={filterBtn(activeCity === c)}>{c === "All" ? "All Cities" : c}</button>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Grid */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem", fontFamily: "Raleway, sans-serif", color: "#aaa" }}>Loading places…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "1.5rem" }}>
            {filtered.filter(p => p.slug !== featured?.slug).map((place, i) => (
              <motion.div key={place.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45 }}>
                <Link href={`/restaurants/${place.slug}`} style={{ textDecoration: "none" }}>
                  <motion.article whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}
                    style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.07)", cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ position: "relative", height: 220 }}>
                      {place.coverImage && <img src={place.coverImage} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.6))" }} />
                      <div style={{ position: "absolute", top: 12, left: 14 }}><CategoryBadge category={place.category} /></div>
                      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: "white", fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{place.name}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                            <MapPin size={10} color="rgba(255,255,255,0.7)" />
                            <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.8)" }}>{place.neighborhood}, {place.city}</span>
                          </div>
                        </div>
                        <ViewBadge views={place.tiktokViews} />
                      </div>
                    </div>
                    <div style={{ padding: "1.1rem 1.15rem", flex: 1, display: "flex", flexDirection: "column" }}>
                      <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.83rem", color: "#555", lineHeight: 1.65, margin: "0 0 0.85rem", flex: 1 }}>
                        {place.excerpt?.length > 130 ? place.excerpt.slice(0, 130) + "…" : place.excerpt}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", fontWeight: 700, color: GOLD }}>{place.priceRange} · {PRICE_LABEL[place.priceRange] || ""}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, color: NAVY, fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", fontWeight: 700 }}>
                          Get insight <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#aaa", fontFamily: "Raleway, sans-serif" }}>
            No places match your filter. Try a different category or city.
          </div>
        )}
      </section>

      {/* About the content */}
      <section style={{ background: NAVY, padding: "3.5rem 1.5rem" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: "white", marginBottom: "1rem", fontWeight: 600 }}>Only the places that earned it</p>
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.92rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, marginBottom: "1.75rem" }}>
            Every place on this page has been personally visited by Patience Bwanya (PashieB) and featured on <strong style={{ color: "rgba(255,255,255,0.9)" }}>@pashieb_the_wot</strong> on TikTok. Only content with 10,000+ views makes it here.
          </p>
          <a href="https://www.tiktok.com/@pashieb_the_wot" target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: GOLD, color: NAVY, padding: "0.75rem 1.75rem", borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
            <Play size={14} fill={NAVY} stroke="none" />
            Follow on TikTok
          </a>
        </div>
      </section>

      {faqsByPage["restaurants"] && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "4rem 1.5rem" }}>
          <FAQ items={faqsByPage["restaurants"]} />
        </div>
      )}

      <style>{`.explore-featured { @media (max-width: 700px) { grid-template-columns: 1fr !important; } }`}</style>
    </Layout>
  );
}
