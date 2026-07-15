import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getUpcomingEvents } from "@/data/events";

const categories = [
  { icon: "🎬", title: "Cultural Experiences", desc: "Private screenings, gallery evenings, and curated cultural moments in premium settings.", href: "/events" },
  { icon: "🍽️", title: "Dining Experiences", desc: "Chef-led private dining, restaurant immersions, and curated tasting menus.", href: "/experiences/private-dining" },
  { icon: "🍷", title: "Wine & Beverage", desc: "Wine tasting evenings, cocktail masterclasses, and beverage-led experiences.", href: "/experiences/wine-tasting" },
  { icon: "✊", title: "Women's Community", desc: "Networking dinners, Women's Month celebrations, and community gatherings.", href: "/experiences/networking" },
  { icon: "🌸", title: "Seasonal Celebrations", desc: "Spring gardens, winter high teas, summer braais — every season celebrated intentionally.", href: "/events" },
  { icon: "🫖", title: "Afternoon Experiences", desc: "Intimate high teas, brunch gatherings, and daytime experiences designed for the unhurried woman.", href: "/events" },
];

export default function ExperienceLifestyle() {
  const upcoming = getUpcomingEvents().slice(0, 3);

  return (
    <Layout title="Lifestyle Experiences South Africa">
      <Helmet>
        <title>Lifestyle Experiences South Africa | Woman of Taste</title>
        <meta name="description" content="Curated lifestyle experiences for women in South Africa — private dining, wine evenings, seasonal celebrations & community gatherings in Johannesburg." />
        <meta property="og:title" content="Lifestyle Experiences South Africa | Woman of Taste" />
        <meta property="og:description" content="Premium curated lifestyle experiences for women across South Africa. Discover WOT events." />
        <meta property="og:url" content="https://womanoftaste.co.za/experiences/lifestyle" />
        <link rel="canonical" href="https://womanoftaste.co.za/experiences/lifestyle" />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-[hsl(225,50%,22%)] overflow-hidden pt-28 pb-20">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)] mb-6 block">All Experiences</span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
              Lifestyle experiences<br />
              <em className="text-[hsl(38,45%,65%)] not-italic">for women</em><br />
              in South Africa.
            </h1>
            <p className="font-sans text-lg text-[hsl(40,25%,78%)] leading-relaxed max-w-2xl mb-10">
              Woman of Taste curates South Africa's most premium lifestyle experiences for women — from private cinema screenings and intimate dining to seasonal outdoor celebrations and community evenings. Every experience is thoughtfully designed for women who choose how they spend their time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/events">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors duration-300 shadow-md">
                  Book Your Experience
                </button>
              </Link>
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(40,25%,75%)]/40 text-[hsl(40,25%,85%)] rounded-full hover:border-[hsl(38,45%,65%)] hover:text-[hsl(38,45%,65%)] transition-all duration-300">
                  Get Updates
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mb-12">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">The WOT Standard</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-6">Premium experiences. Intentionally curated.</h2>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-4">
              Woman of Taste is South Africa's premium lifestyle experiences brand for women. Every event, gathering, and experience we create is held to a single standard: does it honour the women in the room?
            </p>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed">
              That means beautiful settings. Thoughtful programming. Intimate numbers that allow real connection. Food and drink chosen with care. And the specific feeling — when you walk out — that the evening was worth every rand and every minute.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <Link href={cat.href}>
                  <div className="group p-6 rounded-2xl border border-[hsl(35,15%,88%)] bg-white hover:border-[hsl(38,45%,60%)] hover:shadow-md transition-all cursor-pointer h-full">
                    <div className="text-2xl mb-3">{cat.icon}</div>
                    <h3 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-2">{cat.title}</h3>
                    <p className="font-sans text-sm text-[hsl(28,18%,35%)] leading-relaxed mb-4">{cat.desc}</p>
                    <span className="flex items-center gap-1 font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(38,45%,50%)] group-hover:text-[hsl(38,45%,40%)] transition-colors">
                      Explore <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-16 bg-[hsl(225,50%,22%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)] mb-4 block">Limited Seats Available</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(40,25%,96%)]">Experiences available to book now.</h2>
          </motion.div>
          <div className="flex flex-col gap-4 mb-8">
            {upcoming.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <Link href={`/events/${event.id}`}>
                  <div className="group flex items-center justify-between gap-6 p-6 rounded-2xl bg-white/8 border border-white/15 hover:bg-white/15 hover:border-[hsl(38,45%,65%)]/50 transition-all cursor-pointer">
                    <div>
                      <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(38,45%,65%)] block mb-1">{event.date} · {event.category}</span>
                      <p className="font-serif text-xl text-[hsl(40,25%,96%)] font-medium">{event.title}</p>
                      <p className="font-sans text-sm text-[hsl(40,25%,72%)]">{event.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {event.price && <span className="font-sans text-sm font-semibold text-[hsl(38,45%,65%)]">R{event.price}</span>}
                      <ArrowRight size={18} className="text-[hsl(38,45%,65%)] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <Link href="/events">
            <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors shadow-md">
              View All Upcoming Events
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
