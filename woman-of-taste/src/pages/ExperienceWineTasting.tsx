import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";

const highlights = [
  { icon: "🍷", title: "Curated Wine Selection", desc: "South African wines selected with intention — from the Cape Winelands to emerging producers." },
  { icon: "👩‍🍳", title: "Expert Guidance", desc: "Wine educators and sommeliers guiding the experience — from nose to finish." },
  { icon: "🧀", title: "Food Pairings", desc: "Artisan cheese boards, charcuterie, and small plates curated to complement each wine." },
  { icon: "✦", title: "Intimate Groups", desc: "Small, curated groups only — an experience that feels personal, not commercial." },
  { icon: "🌿", title: "Setting Matters", desc: "Beautiful venues — gardens, loft spaces, heritage estates — because atmosphere is half the experience." },
  { icon: "📚", title: "Wine Education", desc: "Leave with more than just a good evening — leave knowing more about the wines you love." },
];

export default function ExperienceWineTasting() {
  return (
    <Layout title="Wine Tasting Events South Africa">
      <Helmet>
        <title>Wine Tasting Events South Africa | Woman of Taste</title>
        <meta name="description" content="Curated wine tasting events for women in South Africa — intimate evenings, expert-guided tastings & food pairings at premium Johannesburg venues." />
        <meta property="og:title" content="Wine Tasting Events South Africa | Woman of Taste" />
        <meta property="og:description" content="Intimate curated wine tasting experiences for women in South Africa. Join the waitlist." />
        <meta property="og:url" content="https://womanoftaste.co.za/experiences/wine-tasting" />
        <link rel="canonical" href="https://womanoftaste.co.za/experiences/wine-tasting" />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-[hsl(225,50%,22%)] overflow-hidden pt-28 pb-20">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)] mb-6 block">Wine & Dining Experiences</span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
              Wine tasting events<br />
              <em className="text-[hsl(38,45%,65%)] not-italic">South Africa.</em>
            </h1>
            <p className="font-sans text-lg text-[hsl(40,25%,78%)] leading-relaxed max-w-2xl mb-10">
              South Africa produces some of the world's most remarkable wines — and Woman of Taste is creating intimate, expert-guided tasting events that honour them. Curated evenings where the glass tells a story and the company makes it unforgettable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors duration-300 shadow-md">
                  Join the Wine Waitlist
                </button>
              </Link>
              <Link href="/events">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(40,25%,75%)]/40 text-[hsl(40,25%,85%)] rounded-full hover:border-[hsl(38,45%,65%)] hover:text-[hsl(38,45%,65%)] transition-all duration-300">
                  See All Events
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">South Africa's Wine Story</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-6">Wine is not just a drink. It is a culture.</h2>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-4">
              South Africa has one of the world's oldest and most distinguished wine cultures — a 350-year tradition rooted in the Cape Winelands, and now expanding to include bold new producers across the country. For the woman of taste, exploring South African wine is exploring the country itself.
            </p>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed">
              Woman of Taste is developing a programme of intimate wine tasting events — evenings designed not as education but as experience. Where the conversation is as rich as the Syrah, and the company transforms a good wine into a great memory.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">The Experience</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)]">What every WOT wine evening includes.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((h, i) => (
              <motion.div key={h.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-[hsl(35,15%,88%)] bg-[hsl(40,25%,98%)]">
                <div className="text-2xl mb-3">{h.icon}</div>
                <h3 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-2">{h.title}</h3>
                <p className="font-sans text-sm text-[hsl(28,18%,35%)] leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(225,50%,22%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="text-5xl mb-6">🍷</div>
            <h2 className="font-serif text-4xl font-light text-[hsl(40,25%,96%)] mb-4">Be first to the cellar.</h2>
            <p className="font-sans text-base text-[hsl(40,25%,72%)] leading-relaxed mb-8">
              Wine tasting evenings are in development. Join the waitlist and receive priority access when dates are announced — with early-bird pricing for registered members.
            </p>
            <Link href="/contact">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors shadow-md">
                Join the Waitlist
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
