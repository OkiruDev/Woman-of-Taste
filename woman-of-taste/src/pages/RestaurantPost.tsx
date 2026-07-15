import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { MapPin, Clock, ExternalLink, ArrowLeft, ArrowRight, Play, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";

const priceLabel: Record<string, string> = { R: "Budget", RR: "Mid-range", RRR: "Upscale", RRRR: "Fine Dining" };
const priceFull: Record<string, string> = { R: "Under R200pp", RR: "R200–R400pp", RRR: "R400–R800pp", RRRR: "R800+pp" };

function fmtViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

const NAVY = "hsl(225,50%,22%)";
const GOLD = "hsl(38,45%,65%)";
const IVORY = "hsl(40,25%,96%)";

const CATEGORY_COLOR = { Restaurant: NAVY, Experience: "#7c3aed", Stay: "#065f46" };

export default function RestaurantPost() {
  const params = useParams<{ slug: string }>();
  const [place, setPlace] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/places/${params.slug}`).then(r => r.json()).catch(() => ({})),
      fetch("/api/places").then(r => r.json()).catch(() => ({ places: [] })),
    ]).then(([single, all]) => {
      const p = single.place || null;
      setPlace(p);
      if (p && all.places) {
        const others = (all.places as any[]).filter(x => x.slug !== p.slug);
        const scored = others.map(x => {
          let score = 0;
          if (x.city === p.city) score += 2;
          if (x.category === p.category) score += 1;
          if (x.neighborhood === p.neighborhood) score += 1;
          return { ...x, _score: score };
        });
        scored.sort((a, b) => b._score - a._score);
        setRelated(scored.slice(0, 3));
      }
    }).finally(() => setLoading(false));
  }, [params.slug]);

  useEffect(() => {
    if (!place) return;

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": place.category === "Stay" ? "LodgingBusiness" : place.category === "Experience" ? "TouristAttraction" : "FoodEstablishment",
      "name": place.name,
      "description": place.excerpt,
      "address": { "@type": "PostalAddress", "streetAddress": place.address, "addressLocality": place.city, "addressCountry": "ZA" },
      "priceRange": place.priceRange,
      ...(place.openingHours ? { "openingHours": place.openingHours } : {}),
      ...(place.website ? { "url": place.website } : {}),
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://womanoftaste.co.za" },
        { "@type": "ListItem", "position": 2, "name": "Restaurants, Experiences & Stays", "item": "https://womanoftaste.co.za/restaurants" },
        { "@type": "ListItem", "position": 3, "name": place.name, "item": `https://womanoftaste.co.za/restaurants/${place.slug}` },
      ]
    };

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${place.name} — ${place.city} ${place.category} Insight | Woman of Taste`,
      "description": place.excerpt,
      "author": { "@type": "Person", "name": "Patience Bwanya", "alternateName": "PashieB", "sameAs": ["https://www.tiktok.com/@pashieb_the_wot"] },
      "publisher": { "@type": "Organization", "name": "Woman of Taste", "url": "https://womanoftaste.co.za" },
      "url": `https://womanoftaste.co.za/restaurants/${place.slug}`,
      "datePublished": place.datePosted,
      "image": place.coverImage,
    };

    const scripts = [
      { id: "place-local-schema", data: baseSchema },
      { id: "place-breadcrumb-schema", data: breadcrumbSchema },
      { id: "place-article-schema", data: articleSchema },
    ];

    scripts.forEach(({ id, data }) => {
      const el = document.createElement("script");
      el.type = "application/ld+json"; el.id = id;
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
    });

    return () => { scripts.forEach(({ id }) => document.getElementById(id)?.remove()); };
  }, [place?.slug]);

  if (loading) {
    return (
      <Layout title="Loading…">
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Raleway, sans-serif", color: "#aaa", fontSize: "0.95rem" }}>
          Loading…
        </div>
      </Layout>
    );
  }

  if (!place) {
    return (
      <Layout title="Not Found">
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "4rem 1.5rem" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", color: NAVY }}>Place not found</h1>
          <Link href="/restaurants" style={{ color: GOLD, fontFamily: "Raleway, sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={16} /> Back to all places
          </Link>
        </div>
      </Layout>
    );
  }

  const catColor = CATEGORY_COLOR[place.category];

  return (
    <Layout title={place.name}>
      <Helmet>
        <title>{place.name} — {place.city} {place.category} | Woman of Taste</title>
        <meta name="description" content={place.excerpt} />
        <meta property="og:title" content={`${place.name} — ${place.city} ${place.category} | Woman of Taste`} />
        <meta property="og:description" content={place.excerpt} />
        <meta property="og:url" content={`https://womanoftaste.co.za/restaurants/${place.slug}`} />
        <meta property="og:image" content={place.coverImage} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`https://womanoftaste.co.za/restaurants/${place.slug}`} />
        <meta name="keywords" content={[
          ...place.seoKeywords,
          `${place.name} ${place.city}`,
          `Woman of Taste ${place.category.toLowerCase()}`,
          `restaurants near me ${place.neighborhood}`,
          `restaurants near me ${place.city}`,
          `${place.city} restaurants near me`,
          `best restaurants ${place.neighborhood}`,
          `best restaurants ${place.city}`,
          `cute date spots ${place.city}`,
          `date night ${place.city}`,
          `date night restaurants ${place.city}`,
          `${place.city} restaurant guide`,
          `romantic restaurants ${place.city}`,
          `where to eat ${place.city}`,
          `best places to eat ${place.city}`,
          ...(place.category === "Stay" ? [
            `best hotels ${place.city}`,
            `where to stay ${place.city}`,
            `weekend getaway ${place.city}`,
            `hotel near me ${place.city}`,
            `luxury stay ${place.city}`,
          ] : []),
          ...(place.category === "Experience" ? [
            `things to do in ${place.city}`,
            `weekend activities ${place.city}`,
            `fun things to do ${place.city}`,
            `experiences near me ${place.city}`,
          ] : []),
          ...(place.category === "Restaurant" && place.cuisine ? [
            `${place.cuisine} restaurant ${place.city}`,
            `${place.cuisine} near me`,
          ] : []),
          "PashieB TikTok restaurant",
          "Woman of Taste places",
          "restaurants South Africa",
          "best restaurants Johannesburg",
          "best restaurants Pretoria",
          "cute date spots Johannesburg",
          "cute date spots Cape Town",
          "date night restaurants South Africa",
          "restaurants near me South Africa",
        ].filter(Boolean).join(", ")} />
      </Helmet>

      {/* Hero */}
      <div style={{ position: "relative", height: "clamp(300px, 50vh, 500px)", overflow: "hidden" }}>
        <img src={place.coverImage} alt={place.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.72) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "2.5rem 2rem" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
            <Link href="/restaurants" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", textDecoration: "none", marginBottom: "1rem" }}>
              <ArrowLeft size={13} /> Restaurants, Experiences & Stays
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.65rem" }}>
              <span style={{ background: catColor, color: "white", padding: "3px 11px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, fontFamily: "Raleway, sans-serif" }}>{place.category}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", color: "white", padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontFamily: "Raleway, sans-serif", backdropFilter: "blur(4px)" }}>
                <Play size={9} fill="white" stroke="none" /> {fmtViews(place.tiktokViews)} TikTok views
              </span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "white", fontWeight: 700, margin: "0 0 0.4rem", lineHeight: 1.1 }}
            >
              {place.name}
            </motion.h1>
            <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.75)", fontStyle: "italic", margin: "0 0 1rem" }}>{place.tagline}</p>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.65rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <MapPin size={12} color="rgba(255,255,255,0.6)" />
                <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.75)" }}>{place.neighborhood}, {place.city}</span>
              </div>
              {place.cuisine && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
                  <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{place.cuisine}</span>
                </>
              )}
              <span style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
              <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: GOLD }}>{place.priceRange} · {priceLabel[place.priceRange]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.5rem 2rem" }}>

        {/* Quick facts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.85rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Location", value: `${place.neighborhood}, ${place.city}` },
            ...(place.cuisine ? [{ label: "Cuisine / Type", value: place.cuisine }] : []),
            { label: "Price Range", value: `${place.priceRange} · ${priceFull[place.priceRange]}` },
            { label: "Reservations", value: place.reservations ? "Recommended" : "Walk-ins welcome" },
            ...(place.openingHours ? [{ label: "Hours", value: place.openingHours }] : []),
          ].map(f => (
            <div key={f.label} style={{ background: IVORY, borderRadius: 11, padding: "0.85rem 1rem" }}>
              <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.63rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#bbb", marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", color: NAVY, fontWeight: 600 }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* TikTok callout */}
        <div style={{ background: NAVY, borderRadius: 14, padding: "1.1rem 1.25rem", marginBottom: "2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 3 }}>Featured by PashieB</div>
            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.8)" }}>
              @pashieb_the_wot · <strong style={{ color: "white" }}>{fmtViews(place.tiktokViews)} views</strong> on TikTok
            </div>
          </div>
          <a
            href={place.tiktokUrl}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, background: GOLD, color: NAVY, padding: "0.55rem 1.1rem", borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.78rem", textDecoration: "none" }}
          >
            <Play size={11} fill={NAVY} stroke="none" />
            Watch on TikTok
          </a>
        </div>

        {/* Description */}
        <article>
          {place.description.split("\n\n").filter(Boolean).map((para, i) => (
            <p key={i} style={{ fontFamily: "Raleway, sans-serif", fontSize: "1rem", color: "#444", lineHeight: 1.85, marginBottom: "1.5rem" }}>{para}</p>
          ))}
        </article>

        {/* Highlights */}
        {place.highlights.length > 0 && (
          <section style={{ margin: "2.5rem 0" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: NAVY, marginBottom: "1rem" }}>What to Know</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {place.highlights.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: IVORY, borderRadius: 10, padding: "0.75rem 1rem" }}>
                  <CheckCircle size={15} color={GOLD} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: NAVY }}>{h}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Must try */}
        {place.mustTry.length > 0 && (
          <section style={{ margin: "2.5rem 0" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: NAVY, marginBottom: "1rem" }}>
              {place.category === "Stay" ? "Must-Do Moments" : place.category === "Experience" ? "What to Do" : "Must-Try"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {place.mustTry.map((item, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: "1rem" }}>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", fontWeight: 700, color: NAVY, marginBottom: 3 }}>{item.name}</div>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: "#666", fontStyle: "italic", lineHeight: 1.6 }}>{item.note}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vibe + Perfect for */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", margin: "2.5rem 0" }}>
          <div style={{ background: NAVY, borderRadius: 16, padding: "1.4rem 1.5rem" }}>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.15rem", color: GOLD, marginBottom: "0.65rem" }}>The Vibe</h3>
            <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.65, margin: 0 }}>{place.vibe}</p>
          </div>
          <div style={{ background: IVORY, borderRadius: 16, padding: "1.4rem 1.5rem" }}>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.15rem", color: NAVY, marginBottom: "0.65rem" }}>Perfect For</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {place.perfectFor.map((p, i) => (
                <li key={i} style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", color: "#555", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, flexShrink: 0, display: "inline-block" }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "2rem" }}>
          {place.tags.map(tag => (
            <span key={tag} style={{ background: IVORY, borderRadius: 99, padding: "4px 12px", fontFamily: "Raleway, sans-serif", fontSize: "0.74rem", fontWeight: 600, color: "#666" }}>{tag}</span>
          ))}
        </div>

        {/* Visit info */}
        <div style={{ background: IVORY, borderRadius: 16, padding: "1.5rem", marginBottom: "3rem" }}>
          <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.3rem", color: NAVY, marginBottom: "0.85rem" }}>
            {place.category === "Stay" ? "Plan Your Stay" : place.category === "Experience" ? "Plan Your Visit" : "Plan Your Visit"}
          </h3>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: "0.75rem" }}>
            <MapPin size={14} color={GOLD} style={{ marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: "#555" }}>{place.address}</span>
          </div>
          {place.openingHours && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: "0.75rem" }}>
              <Clock size={14} color={GOLD} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: "#555" }}>{place.openingHours}</span>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, background: NAVY, color: "white", padding: "0.6rem 1.25rem", borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none" }}>
                Visit Website <ExternalLink size={12} />
              </a>
            )}
            <a href={place.tiktokUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: GOLD, color: NAVY, padding: "0.6rem 1.25rem", borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none" }}>
              <Play size={11} fill={NAVY} stroke="none" /> Watch TikTok Feature
            </a>
          </div>
        </div>
      </div>

      {/* Related places */}
      {related.length > 0 && (
        <section style={{ background: IVORY, padding: "3.5rem 1.5rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: NAVY, textAlign: "center", marginBottom: "2rem" }}>More to Explore</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.25rem" }}>
              {related.map(r => (
                <Link key={r.slug} href={`/restaurants/${r.slug}`} style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ y: -4 }} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer" }}>
                    <div style={{ position: "relative", height: 170 }}>
                      <img src={r.coverImage} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))" }} />
                      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.25rem", color: "white", fontWeight: 700, margin: 0 }}>{r.name}</p>
                          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.75)", margin: "3px 0 0" }}>{r.neighborhood}, {r.city}</p>
                        </div>
                        <ViewBadge views={r.tiktokViews} />
                      </div>
                    </div>
                    <div style={{ padding: "0.9rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ background: CATEGORY_COLOR[r.category] + "18", color: CATEGORY_COLOR[r.category], border: `1px solid ${CATEGORY_COLOR[r.category]}30`, padding: "2px 9px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, fontFamily: "Raleway, sans-serif" }}>{r.category}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: NAVY, fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", fontWeight: 700 }}>
                        See insight <ArrowRight size={12} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link href="/restaurants" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: NAVY, color: "white", padding: "0.75rem 1.75rem", borderRadius: 99, fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

function ViewBadge({ views }: { views: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.5)", color: "white", padding: "3px 9px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, fontFamily: "Raleway, sans-serif", backdropFilter: "blur(4px)", flexShrink: 0 }}>
      <Play size={8} fill="white" stroke="none" />
      {fmtViews(views)}
    </span>
  );
}
