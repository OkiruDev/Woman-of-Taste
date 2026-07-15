import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getUpcomingEvents } from "@/data/events";

const pillars = [
  { icon: "✊", title: "Community Over Competition", desc: "Events designed to build genuine connections between women — not transactional networking, but real relationships." },
  { icon: "🎤", title: "Curated Voices", desc: "Speakers, leaders, and women of substance sharing insight that moves the room and stays with you." },
  { icon: "🍽️", title: "Beautiful Settings", desc: "Premium venues and dining settings — because the environment shapes the conversation." },
  { icon: "✦", title: "Intimate Numbers", desc: "Small enough to have real conversations. Large enough to make meaningful new connections." },
  { icon: "💛", title: "Intentional Curation", desc: "Every guest is there for a reason. The room is curated as carefully as the menu." },
  { icon: "🎁", title: "WOT Experience", desc: "Every element — from welcome drinks to gifting — is designed to honour the women in the room." },
];

export default function ExperienceNetworking() {
  const networkingEvents = getUpcomingEvents().filter(e =>
    e.category?.toLowerCase().includes("women") || e.category?.toLowerCase().includes("community")
  );
  const allEvents = getUpcomingEvents();

  return (
    <Layout title="Women's Networking Events South Africa">
      <Helmet>
        <title>Women's Networking Events South Africa | Woman of Taste</title>
        <meta name="description" content="Premium women's networking events in South Africa — intimate gatherings, keynote speakers & community evenings for women who lead, build & inspire." />
        <meta property="og:title" content="Women's Networking Events South Africa | Woman of Taste" />
        <meta property="og:description" content="Premium women's networking events curated by Woman of Taste — Johannesburg and beyond." />
        <meta property="og:url" content="https://womanoftaste.co.za/experiences/networking" />
        <link rel="canonical" href="https://womanoftaste.co.za/experiences/networking" />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-[hsl(225,50%,22%)] overflow-hidden pt-28 pb-20">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)] mb-6 block">Community Experiences</span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
              Women's networking<br />
              <em className="text-[hsl(38,45%,65%)] not-italic">events</em><br />
              South Africa.
            </h1>
            <p className="font-sans text-lg text-[hsl(40,25%,78%)] leading-relaxed max-w-2xl mb-10">
              Woman of Taste creates community gatherings that feel nothing like traditional networking — no name badges, no elevator pitches. Just intentionally curated evenings where remarkable women meet, connect, and leave knowing they were in the right room.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/events">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors duration-300 shadow-md">
                  See Upcoming Events
                </button>
              </Link>
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(40,25%,75%)]/40 text-[hsl(40,25%,85%)] rounded-full hover:border-[hsl(38,45%,65%)] hover:text-[hsl(38,45%,65%)] transition-all duration-300">
                  Get Invitations
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">Our Philosophy</span>
              <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-6">Networking that feels like belonging.</h2>
              <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-4">
                The best connections happen not when people are trying to connect, but when they are sharing something meaningful — a beautiful space, a delicious meal, a conversation about something that matters. That is the Woman of Taste approach to community.
              </p>
              <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-6">
                Our community evenings, Women's Month celebrations, and gathering events are designed to create the conditions for genuine connection — where the women in the room are selected for their energy and ambition as much as their industry.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="bg-[hsl(225,50%,22%)] rounded-3xl p-10">
              <p className="font-serif text-xl font-light text-[hsl(40,25%,96%)] leading-relaxed italic mb-6">
                "She Who Gathers is not just an event. It is a declaration that the most powerful thing a woman can do is pull other women toward their best selves."
              </p>
              <div className="flex items-center gap-2">
                <img src="/wot-logo.png" alt="WOT" className="w-8 h-8 object-contain" style={{ mixBlendMode: "screen" }} />
                <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(38,45%,65%)]">Woman of Taste</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">The WOT Difference</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)]">What makes our gatherings different.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-[hsl(35,15%,88%)] bg-[hsl(40,25%,98%)]">
                <div className="text-2xl mb-3">{p.icon}</div>
                <h3 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-2">{p.title}</h3>
                <p className="font-sans text-sm text-[hsl(28,18%,35%)] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Women's Month event spotlight */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-8">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">Upcoming</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)]">Community events to book now.</h2>
          </motion.div>
          <div className="flex flex-col gap-4">
            {allEvents.slice(0, 3).map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                <Link href={`/events/${event.id}`}>
                  <div className="group flex items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-[hsl(35,15%,88%)] hover:border-[hsl(38,45%,60%)] hover:shadow-md transition-all cursor-pointer">
                    <div>
                      <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(38,45%,50%)] block mb-1">{event.date}</span>
                      <p className="font-serif text-xl text-[hsl(225,50%,22%)] font-medium">{event.title}</p>
                      <p className="font-sans text-sm text-[hsl(28,18%,40%)]">{event.subtitle}</p>
                    </div>
                    <ArrowRight size={18} className="text-[hsl(38,45%,55%)] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(225,50%,22%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-serif text-4xl font-light text-[hsl(40,25%,96%)] mb-4">Join a room that elevates you.</h2>
            <p className="font-sans text-base text-[hsl(40,25%,72%)] leading-relaxed mb-8">
              Our community events sell out. Get on the list for early invitations, priority access, and updates on upcoming gatherings.
            </p>
            <Link href="/contact">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors shadow-md">
                Get Early Access
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
