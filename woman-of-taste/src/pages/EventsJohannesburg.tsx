import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { MapPin, CalendarDays, ArrowRight, Users, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getUpcomingEvents } from "@/data/events";

const experienceTypes = [
  { icon: "🎬", title: "Private Screenings", desc: "Exclusive cinema events before the mainstream crowds — curated, intimate, unforgettable." },
  { icon: "🫖", title: "High Tea Experiences", desc: "Seasonal high teas at Johannesburg's most beautiful venues — tiered stands, open fires, long afternoons." },
  { icon: "🍽️", title: "Curated Dining", desc: "Private dining journeys at partner restaurants — behind-the-scenes, chef-led, intimate." },
  { icon: "✊", title: "Women's Celebrations", desc: "Women's Month dinners, spring gatherings, and end-of-year braais that honour the women who build." },
  { icon: "🌸", title: "Seasonal Gatherings", desc: "Outdoor spring events, summer braais, winter warm-ups — every season has its celebration." },
  { icon: "✦", title: "Community Evenings", desc: "Networking evenings and community gatherings for women who are building something meaningful." },
];

export default function EventsJohannesburg() {
  const upcoming = getUpcomingEvents();

  return (
    <Layout title="Women's Events in Johannesburg">
      <Helmet>
        <title>Women's Events in Johannesburg 2026 | Woman of Taste</title>
        <meta name="description" content="Women's events in Johannesburg — private screenings, high tea, curated dining & Women's Month dinners. Book your seat at a Woman of Taste event." />
        <meta property="og:title" content="Women's Events in Johannesburg 2026 | Woman of Taste" />
        <meta property="og:description" content="Discover Johannesburg's most curated women's events — from private screenings to intimate dining experiences." />
        <meta property="og:url" content="https://womanoftaste.co.za/events/johannesburg" />
        <link rel="canonical" href="https://womanoftaste.co.za/events/johannesburg" />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-[hsl(225,50%,22%)] overflow-hidden pt-28 pb-20">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={14} className="text-[hsl(38,45%,65%)]" />
              <span className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)]">Johannesburg, South Africa</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
              Women's Events<br />
              <em className="text-[hsl(38,45%,65%)] not-italic">in Johannesburg.</em>
            </h1>
            <p className="font-sans text-lg text-[hsl(40,25%,78%)] leading-relaxed max-w-2xl mb-10">
              Woman of Taste curates Johannesburg's most intimate and premium events for women — private screenings, high teas, curated dining, seasonal celebrations, and community evenings designed for the woman who chooses how she spends her time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/events">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors duration-300 shadow-md">
                  Book Your Seat
                </button>
              </Link>
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(40,25%,75%)]/40 text-[hsl(40,25%,85%)] rounded-full hover:border-[hsl(38,45%,65%)] hover:text-[hsl(38,45%,65%)] transition-all duration-300">
                  Get Event Updates
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">Why Johannesburg</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-6">The city that knows how to gather.</h2>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-4">
              Johannesburg is South Africa's most dynamic city — a place where ambition, culture, and community intersect in ways unlike anywhere else on the continent. It is a city of women who build, lead, create, and celebrate. And it deserves events that match its energy.
            </p>
            <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed">
              Woman of Taste was born in Johannesburg. Every event we create is designed around the pace, the seasons, and the spirit of this city — from intimate winter high teas in Broadacres to spring garden celebrations under the jacarandas, to exclusive private screenings and end-of-year braais at Farmhouse 58.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experience Types */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">What We Offer</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)]">Event types in Johannesburg.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experienceTypes.map((type, i) => (
              <motion.div key={type.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-[hsl(35,15%,88%)] bg-[hsl(40,25%,98%)] hover:border-[hsl(38,45%,60%)] transition-colors">
                <div className="text-2xl mb-3">{type.icon}</div>
                <h3 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-2">{type.title}</h3>
                <p className="font-sans text-sm text-[hsl(28,18%,35%)] leading-relaxed">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">Limited Seats Available</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)]">Upcoming events in Johannesburg.</h2>
          </motion.div>
          <div className="flex flex-col gap-4">
            {upcoming.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <Link href={`/events/${event.id}`}>
                  <div className="group flex items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-[hsl(35,15%,88%)] hover:border-[hsl(38,45%,60%)] hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[hsl(225,50%,22%)] text-[hsl(38,45%,65%)] flex-shrink-0">
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(38,45%,50%)] block mb-1">{event.date} · {event.location}</span>
                        <p className="font-serif text-xl text-[hsl(225,50%,22%)] font-medium">{event.title}</p>
                        <p className="font-sans text-sm text-[hsl(28,18%,40%)]">{event.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {event.price && <span className="font-sans text-sm font-semibold text-[hsl(225,50%,22%)]">R{event.price}</span>}
                      <ArrowRight size={18} className="text-[hsl(38,45%,55%)] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-8 text-center">
            <Link href="/events">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(225,50%,22%)] text-[hsl(40,25%,96%)] rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-md">
                View All Events & Book
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[hsl(225,50%,22%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Users size={28} className="text-[hsl(38,45%,65%)] mx-auto mb-6" />
            <h2 className="font-serif text-4xl font-light text-[hsl(40,25%,96%)] mb-4">Be the first to know.</h2>
            <p className="font-sans text-base text-[hsl(40,25%,72%)] leading-relaxed mb-8">
              Events sell out fast. Join the Woman of Taste community to receive early access to upcoming Johannesburg events, exclusive invitations, and updates before they go public.
            </p>
            <Link href="/contact">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors shadow-md">
                Join the Community
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
