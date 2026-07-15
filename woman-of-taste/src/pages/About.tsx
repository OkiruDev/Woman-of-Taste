import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { FaTiktok, FaInstagram } from "react-icons/fa";
import Layout from "@/components/Layout";
import AnimatedBackground from "@/components/AnimatedBackground";
import FAQ from "@/components/FAQ";
import { socialLinks, brandInfo } from "@/data/social";
import { faqsByPage } from "@/data/faqData";

const values = [
  { icon: "✦", title: "Elegance", desc: "Elegance is not a dress size or a price tag, it is a posture, a perspective, a quiet confidence that cannot be bought or performed." },
  { icon: "◈", title: "Presence", desc: "To be fully present is a radical act in a distracted world. We celebrate the woman who inhabits her life completely, with awareness and grace." },
  { icon: "❋", title: "Culture", desc: "Food is culture. The table is where stories are passed down, identities affirmed, and communities nourished. We honour this with every piece of content we create." },
  { icon: "⟡", title: "Intentionality", desc: "Every choice, where you eat, how you host, what you consume, is an act of intention. We champion conscious, deliberate living." },
  { icon: "◌", title: "Transformation", desc: "Like the butterfly, the Woman of Taste philosophy represents transformation, the slow, beautiful process of becoming who you are meant to be." },
];

export default function About() {
  return (
    <Layout title="About Us">
      <Helmet>
        <title>About Patience Bwanya | Woman of Taste</title>
        <meta name="description" content="Meet Patience Bwanya (PashieB), founder of Woman of Taste — Johannesburg's lifestyle brand for savory dining, feminine elegance & the art of presence." />
        <meta property="og:title" content="About Patience Bwanya | Woman of Taste" />
        <meta property="og:description" content="The story behind Woman of Taste — founded by Patience Bwanya (PashieB)." />
        <meta property="og:url" content="https://womanoftaste.co.za/about" />
        <link rel="canonical" href="https://womanoftaste.co.za/about" />
      </Helmet>
      {/* ── Hero ── */}
      <section className="relative min-h-[65vh] flex items-center bg-[hsl(225,50%,22%)] overflow-hidden">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,65%)] mb-4 block">
                Our Story
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
                About Woman<br />
                <em className="text-[hsl(38,45%,65%)] not-italic">of Taste.</em>
              </h1>
              <p className="font-sans text-lg font-light text-[hsl(40,25%,75%)] leading-relaxed max-w-xl">
                A premium lifestyle and hospitality storytelling platform built on the belief that dining, culture, and intentional living deserve to be celebrated with elegance and depth.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-6 rounded-full opacity-20"
                  style={{ background: "radial-gradient(circle, hsl(38,45%,65%), transparent)" }}
                />
                <img
                  src="/butterfly-art.png"
                  alt="Transformation, Woman of Taste"
                  className="w-full max-w-sm mx-auto object-contain drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(40,25%,96%)] to-transparent" />
      </section>

      {/* ── About the Founder ── */}
      <section className="py-24 bg-[hsl(40,25%,96%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-4 block">
                The Founder
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-6 leading-tight">
                {brandInfo.founder}<br />
                <span className="text-[hsl(38,45%,52%)]">{brandInfo.founderAlias}</span>
              </h2>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-5">
                {brandInfo.founder}, known as {brandInfo.founderAlias}, is the creator, voice, and vision behind Woman of Taste. She is a storyteller, a food enthusiast, and a firm believer that taste is not simply a sensory experience. It is a way of moving through the world.
              </p>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-5">
                Through her platform, she celebrates the intersection of food, culture, hospitality, and refined living. Her content, which began on TikTok and has grown to inspire a devoted community, is built on a single conviction: that every woman deserves to experience life at its most beautifully realised.
              </p>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed">
                She believes taste is not just about flavour, it is about presence, elegance, and intention. It is about knowing what you value and building a life that reflects that knowledge.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Portrait frame */}
              <div className="relative w-full max-w-sm mx-auto">
                {/* Decorative gold glow */}
                <div className="absolute -inset-1 rounded-3xl opacity-40"
                  style={{ background: "linear-gradient(135deg, hsl(38,45%,65%), hsl(225,50%,40%), hsl(38,45%,65%))" }} />
                <div className="relative rounded-3xl overflow-hidden border-2 border-[hsl(38,45%,65%)]"
                  style={{ boxShadow: "0 20px 60px rgba(28,20,12,0.18), 0 0 0 1px rgba(180,145,80,0.2)" }}>
                  <img
                    src="/founder-patience.jpeg"
                    alt="Patience Bwanya — Founder of Woman of Taste"
                    className="w-full object-cover object-top"
                    style={{ aspectRatio: "3/4", maxHeight: "520px" }}
                  />
                  {/* Subtle gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[hsl(225,50%,14%)]/70 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(38,45%,72%)] mb-0.5">
                      {brandInfo.founderAlias}
                    </p>
                    <p className="font-sans text-sm text-white/80 font-light">
                      Founder, Woman of Taste
                    </p>
                  </div>
                </div>
              </div>

              {/* Quote beneath photo */}
              <div className="mt-8 max-w-sm mx-auto text-center px-2">
                <p className="font-serif text-lg font-light italic text-[hsl(225,50%,28%)] leading-relaxed">
                  "Taste is a lifestyle. It is the transformation of everyday moments into meaningful experiences."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="py-24 bg-[hsl(225,50%,22%)] relative overflow-hidden">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,65%)] mb-3 block">Our Philosophy</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(40,25%,96%)] mb-4">Taste Is a Lifestyle</h2>
            <p className="font-sans text-base font-light text-[hsl(40,25%,72%)] max-w-2xl mx-auto leading-relaxed">
              Like the butterfly, the Woman of Taste philosophy represents transformation, beauty, and intention, the slow, deliberate journey of becoming someone who experiences life fully.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              { title: "The Philosophy", body: "Taste is not what you consume. It is how you consume it. It is the capacity to pause in a saturated world and ask: does this deserve my attention? Does this nourish the life I am choosing to build?" },
              { title: "The Mission", body: "To inspire audiences to slow down, savour experiences, and appreciate the art of dining and living well, one story, one table, one experience at a time." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border border-[hsl(225,35%,32%)] rounded-2xl p-10"
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
              >
                <h3 className="font-serif text-xl font-medium text-[hsl(38,45%,65%)] mb-3">{item.title}</h3>
                <p className="font-sans text-sm font-light text-[hsl(40,25%,72%)] leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 bg-[hsl(35,15%,93%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">Our Pillars</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)]">What We Stand For</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: "0 16px 32px rgba(28,20,12,0.11)" }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-2xl p-8 group"
              >
                <div className="text-2xl text-[hsl(38,45%,55%)] mb-4">{v.icon}</div>
                <h3 className="font-serif text-xl font-medium text-[hsl(225,50%,22%)] mb-3 group-hover:text-[hsl(38,45%,45%)] transition-colors">{v.title}</h3>
                <p className="font-sans text-sm font-normal text-[hsl(28,18%,20%)] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="py-24 bg-[hsl(40,25%,96%)] relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-6">
              Let's Connect
            </h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-10">
              Follow the journey on social media, explore restaurant partnerships, or reach out for collaborations and media enquiries.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors">
                <FaTiktok /> TikTok
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all">
                <FaInstagram /> Instagram
              </a>
              <Link href="/contact">
                <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(35,15%,88%)] text-[hsl(28,18%,20%)] rounded-full hover:bg-[hsl(35,15%,82%)] transition-all">
                  Work with Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <div id="faq" />
      <FAQ items={faqsByPage.about} title="Questions About Woman of Taste & Our Story" />
    </Layout>
  );
}
