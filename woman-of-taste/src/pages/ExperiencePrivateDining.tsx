import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";

const benefits = [
  { icon: "🍽️", title: "Exclusive Access", desc: "Behind-the-scenes perspectives at Johannesburg's finest restaurants — including areas guests never normally see." },
  { icon: "👨‍🍳", title: "Chef-Led Experiences", desc: "Direct interaction with the chefs who craft each plate — understanding the philosophy behind the food." },
  { icon: "🥂", title: "Curated Pairings", desc: "Wine, cocktail, and beverage pairings selected specifically for each dining experience." },
  { icon: "✦", title: "Intimate Groups", desc: "Small, curated groups only — never a mass event. Every experience is designed to feel personal." },
  { icon: "📸", title: "Designed Spaces", desc: "Dining settings styled with intention — visually beautiful, atmospherically perfect." },
  { icon: "🎁", title: "WOT Gifting", desc: "Every private dining guest receives a curated Woman of Taste gifting element." },
];

export default function ExperiencePrivateDining() {
  return (
    <Layout title="Private Dining Experiences">
      <Helmet>
        <title>Private Dining Experiences South Africa | Woman of Taste</title>
        <meta name="description" content="Exclusive private dining experiences in South Africa — chef-led evenings & intimate dining journeys in Johannesburg, curated by Woman of Taste." />
        <meta property="og:title" content="Private Dining Experiences South Africa | Woman of Taste" />
        <meta property="og:description" content="Exclusive chef-led private dining experiences in Johannesburg. Curated by Woman of Taste." />
        <meta property="og:url" content="https://womanoftaste.co.za/experiences/private-dining" />
        <link rel="canonical" href="https://womanoftaste.co.za/experiences/private-dining" />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-[hsl(225,50%,22%)] overflow-hidden pt-28 pb-20">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)] mb-6 block">Curated Experiences</span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
              Private dining<br />
              <em className="text-[hsl(38,45%,65%)] not-italic">experiences</em><br />
              South Africa.
            </h1>
            <p className="font-sans text-lg text-[hsl(40,25%,78%)] leading-relaxed max-w-2xl mb-10">
              Woman of Taste curates exclusive private dining experiences for women in Johannesburg and across South Africa — behind-the-scenes restaurant immersions, chef-led evenings, and intimate dining journeys that go far beyond the menu.
            </p>
            <Link href="/events">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors duration-300 shadow-md">
                See Upcoming Dining Events
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What it is */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">What We Create</span>
              <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-6">Dining as an experience, not just a meal.</h2>
              <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-4">
                A private dining experience curated by Woman of Taste is not a restaurant booking. It is an immersive journey into the world of a particular kitchen — the story behind it, the hands that craft it, and the thoughtfulness that elevates it beyond sustenance into art.
              </p>
              <p className="font-sans text-base text-[hsl(28,18%,22%)] leading-relaxed mb-6">
                Our Restaurant Immersion Experience takes a small group of women behind the pass at one of Johannesburg's partner restaurants — where the executive chef guides the evening, courses are explained as they arrive, and the meal becomes a masterclass in hospitality at its finest.
              </p>
              <Link href={`/events/restaurant-immersion-experience`}>
                <button className="flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase text-[hsl(225,50%,22%)] hover:text-[hsl(38,45%,50%)] transition-colors">
                  Express Your Interest <ArrowRight size={14} />
                </button>
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="bg-[hsl(225,50%,22%)] rounded-3xl p-10 text-center">
              <div className="text-6xl mb-6">🍽️</div>
              <p className="font-serif text-2xl font-light text-[hsl(40,25%,96%)] leading-relaxed italic">
                "Every great meal is a story. Woman of Taste ensures you experience the whole narrative — from the first mise en place to the final course."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-12">
            <span className="font-sans text-[10px] font-semibold tracking-[0.25em] uppercase text-[hsl(38,45%,50%)] mb-4 block">The Experience</span>
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)]">What makes it different.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl border border-[hsl(35,15%,88%)] bg-[hsl(40,25%,98%)]">
                <div className="text-2xl mb-3">{b.icon}</div>
                <h3 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-2">{b.title}</h3>
                <p className="font-sans text-sm text-[hsl(28,18%,35%)] leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[hsl(225,50%,22%)]">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-serif text-4xl font-light text-[hsl(40,25%,96%)] mb-4">Reserve your place at the table.</h2>
            <p className="font-sans text-base text-[hsl(40,25%,72%)] leading-relaxed mb-8">
              Private dining experiences are by invitation and strictly limited in numbers. Register your interest to be considered for the next available experience.
            </p>
            <Link href="/contact">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,16%)] rounded-full hover:bg-[hsl(38,45%,72%)] transition-colors shadow-md">
                Register Your Interest
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
