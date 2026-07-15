import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { MapPin, Mail } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";

const comingTypes = [
  { icon: "🍷", title: "Wine & Dining Events", desc: "Curated evenings at Cape Town's finest restaurants and wine estates." },
  { icon: "🌊", title: "Coastal Experiences", desc: "Oceanfront gatherings, sunset events, and experiences that only the Cape can offer." },
  { icon: "🌸", title: "Garden Celebrations", desc: "Seasonal outdoor events at Cape Town's most beautiful garden venues." },
  { icon: "✊", title: "Women's Gatherings", desc: "Community evenings celebrating women who build, lead, and inspire in the Cape." },
  { icon: "🫖", title: "High Tea Experiences", desc: "Intimate afternoon teas at Cape Town's most elegant settings." },
  { icon: "🎬", title: "Cultural Events", desc: "Private screenings, gallery evenings, and curated cultural experiences." },
];

export default function EventsCapeTown() {
  return (
    <Layout title="Women's Events in Cape Town">
      <Helmet>
        <title>Women's Events in Cape Town | Woman of Taste — Coming Soon</title>
        <meta name="description" content="Woman of Taste is expanding to Cape Town with curated women's events — wine experiences, coastal gatherings & dining events. Join the waitlist." />
        <meta property="og:title" content="Women's Events in Cape Town | Woman of Taste" />
        <meta property="og:description" content="Premium curated events for women coming to Cape Town. Join the waitlist for early access." />
        <meta property="og:url" content="https://womanoftaste.co.za/events/cape-town" />
        <link rel="canonical" href="https://womanoftaste.co.za/events/cape-town" />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-[hsl(225,50%,22%)] overflow-hidden pt-28 pb-20">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={14} className="text-[hsl(38,45%,65%)]" />
              <span className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)]">Cape Town, South Africa</span>
            </div>
            <span className="inline-block font-sans text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 bg-white/10 px-4 py-2 rounded-full mb-6">Coming to Cape Town</span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
              Women's Events<br />
              <em className="text-[hsl(38,45%,65%)] not-italic">in Cape Town.</em>
            </h1>
            <p className="font-sans text-lg text-[hsl(40,25%,78%)] leading-relaxed max-w-2xl mb-10">
              Cape Town is one of the most beautiful cities in the world — and it deserves events to match. Woman of Taste is bringing its curated experiences to the Cape. Be among the first to know when we arrive.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors duration-300 shadow-md">
                  Join the Cape Town Waitlist
                </button>
              </Link>
              <Link href="/events">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(40,25%,75%)]/40 text-[hsl(40,25%,85%)] rounded-full hover:border-[hsl(38,45%,65%)] hover:text-[hsl(38,45%,65%)] transition-all duration-300">
                  View Johannesburg Events
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
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">The Cape is next</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-6">The Mother City deserves curated experiences.</h2>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-4">
              Cape Town is a city of incredible beauty, world-class cuisine, and a community of women who understand the art of living well. From the Winelands to the Waterfront, the Cape offers a backdrop for events unlike anywhere else in South Africa.
            </p>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed">
              Woman of Taste is planning its Cape Town expansion — bringing the same premium curation, intimate atmosphere, and community spirit that has made our Johannesburg events sell out consistently. Register your interest now to be among the first invited when we launch.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coming Types */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">What's planned</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)]">Experience types coming to Cape Town.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingTypes.map((type, i) => (
              <motion.div key={type.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-[hsl(35,15%,88%)] bg-[hsl(40,25%,98%)]">
                <div className="text-2xl mb-3">{type.icon}</div>
                <h3 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-2">{type.title}</h3>
                <p className="font-sans text-sm text-[hsl(28,18%,35%)] leading-relaxed">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="py-16 bg-[hsl(225,50%,22%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Mail size={28} className="text-[hsl(38,45%,65%)] mx-auto mb-6" />
            <h2 className="font-serif text-4xl font-light text-[hsl(40,25%,96%)] mb-4">Be first on the Cape Town list.</h2>
            <p className="font-sans text-base text-[hsl(40,25%,72%)] leading-relaxed mb-8">
              Register your interest and we'll contact you before Cape Town events are listed publicly. Priority access for waitlist members.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors shadow-md">
                  Join Waitlist
                </button>
              </Link>
              <Link href="/events">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 border border-[hsl(40,25%,75%)]/40 text-[hsl(40,25%,85%)] rounded-full hover:border-[hsl(38,45%,65%)] hover:text-[hsl(38,45%,65%)] transition-all duration-300">
                  Johannesburg Events
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
