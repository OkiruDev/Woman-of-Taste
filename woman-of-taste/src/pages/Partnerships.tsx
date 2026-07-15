import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { ExternalLink, TrendingUp, Search, Share2, BarChart3, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import FAQ from "@/components/FAQ";
import { faqsByPage } from "@/data/faqData";
import AnimatedBackground from "@/components/AnimatedBackground";
import { partnerLinks } from "@/data/social";

const benefits = [
  { icon: "◈", title: "Digital Exposure", desc: "Your venue featured through premium, editorial-quality content that reaches a highly engaged audience of discerning women who trust our voice and act on our recommendations." },
  { icon: "✦", title: "Experience Marketing", desc: "A content-led marketing strategy built around your unique identity — storytelling that sells the feeling of being there before a guest even arrives." },
  { icon: "❋", title: "Guest Experience Training", desc: "Hospitality standards training that helps your team deliver the kind of service women return for, talk about, and bring their circles back to." },
  { icon: "⟡", title: "Hospitality Strategy", desc: "Systemic support for designing the full experience — from the welcome to the farewell — so that every touchpoint leaves a lasting impression." },
  { icon: "◌", title: "Service Culture Development", desc: "Building the human dimension of hospitality: the warmth, the attentiveness, the care that makes every woman feel genuinely received and safe." },
  { icon: "✧", title: "TikTok Audience Reach", desc: "Direct access to an active, lifestyle-engaged TikTok community with an authentic voice that women trust to guide their next dining, stay, or event experience." },
];

const services = [
  {
    icon: <TrendingUp size={22} />,
    label: "Marketing Presence",
    headline: "Make your venue impossible to ignore.",
    desc: "We build your brand's digital footprint through premium, editorial-quality storytelling — the kind that sells the experience before a guest even walks through the door. Your restaurant, stay, or event is featured across our platforms, reaching a curated audience of discerning women who trust our voice.",
    bullets: [
      "Feature placement on womanoftaste.co.za with SEO-indexed place page",
      "Editorial content written in PashieB's authentic first-person voice",
      "TikTok and Instagram exposure to an engaged lifestyle audience",
      "Branded photography and video content direction",
      "Inclusion in Woman of Taste event and experiential programming",
    ],
    accent: "hsl(225,50%,22%)",
    light: "hsl(225,50%,97%)",
  },
  {
    icon: <Search size={22} />,
    label: "SEO Optimisation",
    headline: "Be found when it matters most.",
    desc: "When someone searches 'best restaurants in Johannesburg', 'places to stay near Sandton', or 'women's events this weekend', your venue needs to appear. We run a structured local SEO strategy that positions your establishment for the searches your future guests are already making — backed by keyword data and real search intent.",
    bullets: [
      "Local SEO audit and Google Business Profile optimisation",
      "Keyword strategy targeting high-intent searches (dining, stays, events — Gauteng & beyond)",
      "Backlink building through womanoftaste.co.za domain authority",
      "On-page optimisation guidance for your own website",
      "Monthly ranking report with actionable next steps",
    ],
    accent: "hsl(38,45%,42%)",
    light: "hsl(38,45%,97%)",
  },
  {
    icon: <Share2 size={22} />,
    label: "Social Media Marketing",
    headline: "A social strategy built for your experience, not generalists.",
    desc: "Restaurants, stays, and events live and die by social. We design a platform-specific marketing plan tailored to your identity — what to post, when to post it, and how to speak to the women most likely to book, attend, or share. This is not a generic content calendar. It is an experience-native social strategy grounded in what actually drives traffic through your doors.",
    bullets: [
      "Tailored monthly content calendar for TikTok, Instagram, and Pinterest",
      "Platform-specific strategy: short-form video direction, grid aesthetics, story formats",
      "Hashtag and trend strategy mapped to Johannesburg's women's lifestyle community",
      "Influencer and creator collaboration recommendations",
      "Caption and brand voice guidelines so your team can post consistently",
    ],
    accent: "hsl(200,55%,28%)",
    light: "hsl(200,55%,97%)",
  },
  {
    icon: <BarChart3 size={22} />,
    label: "Customer Analytics & Intelligence",
    headline: "Know exactly who your guests are and what makes them spend.",
    desc: "The venues that scale are the ones that stop guessing. Our analytics consulting turns your guest data into a clear picture of who is walking through your door, what brings them back, and what makes them open their wallets. We translate data into decisions — from menu engineering and event programming to peak-time staffing and targeted marketing spend.",
    bullets: [
      "Customer profile analysis: demographics, visit patterns, average spend",
      "Diner and guest motivation mapping — what drives the decision to book and return",
      "Peak vs off-peak traffic analysis with revenue optimisation recommendations",
      "Menu and event performance data: what drives spend and what creates loyalty",
      "Monthly insight report with specific, actionable consulting recommendations",
    ],
    accent: "hsl(270,35%,30%)",
    light: "hsl(270,35%,97%)",
  },
];

const pillars = [
  {
    term: "Visibility",
    detail: "Marketing presence + SEO so your restaurant, stay, or event is seen, found, and remembered by the right women.",
    bg: "hsl(225,50%,22%)",
    icon: "◈",
  },
  {
    term: "Experience",
    detail: "Curated guest experience design and social strategy that turns a booking into a memory worth sharing.",
    bg: "hsl(38,45%,48%)",
    icon: "✦",
  },
  {
    term: "Intelligence",
    detail: "Data analytics and customer consulting that turns guest behaviour into profitable, repeatable revenue.",
    bg: "hsl(225,40%,32%)",
    icon: "⟡",
  },
];

const steps = [
  { step: "01", title: "Apply for Partnership", desc: "Submit an expression of interest through our contact form. Tell us about your restaurant, stay, or event — your vision and what you hope your guests feel when they are with you." },
  { step: "02", title: "Discovery Conversation", desc: "We arrange a call to understand your venue's identity, the experience you want women to have, and what is currently holding your traffic or bookings back." },
  { step: "03", title: "Data-Led Strategy", desc: "We audit your current digital presence, SEO position, and social performance. From there, we design a partnership plan backed by numbers, not assumptions." },
  { step: "04", title: "Partnership Launch", desc: "We activate your marketing presence, SEO strategy, social plan, and analytics dashboard — then meet monthly to review the data, refine the approach, and grow." },
];

const stats = [
  { value: "10K–191K", label: "TikTok views per venue feature" },
  { value: "21+", label: "SEO place pages live on womanoftaste.co.za" },
  { value: "Data-led", label: "Every recommendation backed by analytics" },
  { value: "Bespoke", label: "Strategy built per restaurant, stay, or event" },
];

export default function Partnerships() {
  return (
    <Layout title="Curated Experience Partnerships">
      <Helmet>
        <title>Curated Experience Partnerships | Woman of Taste</title>
        <meta name="description" content="Partner with Woman of Taste to market your restaurant, stay or event to women who spend intentionally. SEO, social strategy & customer analytics." />
        <meta property="og:title" content="Curated Experience Partnerships | Woman of Taste" />
        <meta property="og:description" content="We curate the guest experience and drive traffic to restaurants, stays, and events — creating a safe, pleasurable space for women and a profitable outcome for partners." />
        <meta property="og:url" content="https://womanoftaste.co.za/partnerships" />
        <link rel="canonical" href="https://womanoftaste.co.za/partnerships" />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative bg-[hsl(225,50%,22%)] min-h-[65vh] flex items-center overflow-hidden">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-16 w-full">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,65%)] mb-4 block">
                Curated Experience Partnerships
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] leading-tight mb-6">
                We curate the experience.<br />
                <em className="text-[hsl(38,45%,65%)] not-italic">We drive the traffic.</em>
              </h1>
              <p className="font-sans text-lg font-light text-[hsl(40,25%,75%)] leading-relaxed max-w-xl mb-10">
                Woman of Taste partners with restaurants, places to stay, and events to curate extraordinary experiences for women — and to make sure the right women find you. Pleasurable for your guests. Profitable for your business. Backed by data every step of the way.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(38,45%,58%)] text-white rounded-full hover:bg-[hsl(38,45%,50%)] transition-colors shadow-lg">
                    Apply for Partnership
                  </button>
                </Link>
                <a
                  href={partnerLinks.dinexpWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(40,25%,75%)] text-[hsl(40,25%,80%)] rounded-full hover:border-white hover:text-white transition-all"
                >
                  <img src="/dinexp-logo-new.png" alt="DineXP" className="h-5 object-contain" style={{ filter: "brightness(0) invert(1) opacity(0.8)" }} />
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[hsl(40,25%,96%)] to-transparent" />
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-[hsl(38,45%,58%)] py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <p className="font-serif text-2xl sm:text-3xl font-light text-white mb-1">{s.value}</p>
                <p className="font-sans text-[11px] font-semibold tracking-widest uppercase text-white/75">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Strategy Equation ── */}
      <section className="py-20 bg-[hsl(40,25%,96%)]">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">
              The Partnership Model
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-4 leading-tight">
              Three pillars. One outcome.
            </h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,20%)] max-w-lg mx-auto">
              Every partnership combines visibility, curated experience, and data intelligence — because none of the three delivers results without the other two.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {pillars.map((pillar, i) => (
              <div key={pillar.term} className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <motion.div
                  className="flex-1 sm:w-52 rounded-3xl p-8 text-white flex flex-col text-center"
                  style={{ background: pillar.bg }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                >
                  <span className="text-2xl mb-3 opacity-80">{pillar.icon}</span>
                  <h3 className="font-serif text-2xl font-medium text-white mb-3">{pillar.term}</h3>
                  <p className="font-sans text-xs font-light leading-relaxed opacity-80">{pillar.detail}</p>
                </motion.div>
                {i < 2 && (
                  <span className="font-serif text-3xl font-light text-[hsl(38,45%,55%)] flex-shrink-0 hidden sm:block">+</span>
                )}
              </div>
            ))}

            <span className="font-serif text-3xl font-light text-[hsl(38,45%,55%)] flex-shrink-0 hidden sm:block">=</span>

            <motion.div
              className="flex-1 sm:w-52 rounded-3xl p-8 text-center shadow-xl"
              style={{ background: "linear-gradient(135deg, hsl(225,50%,22%) 0%, hsl(38,45%,52%) 100%)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span className="text-2xl mb-3 opacity-80 block text-white">✦</span>
              <h3 className="font-serif text-2xl font-medium text-white mb-3">Growth</h3>
              <p className="font-sans text-xs font-light leading-relaxed text-white/80">
                More covers, higher average spend, guests who return and bring others with them.
              </p>
            </motion.div>
          </motion.div>

          <div className="flex sm:hidden justify-center gap-6 text-[hsl(38,45%,55%)] font-serif text-2xl mb-10">
            <span>+</span><span>+</span><span>=</span>
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/contact">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-10 py-4 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-lg">
                Apply for Partnership
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Services Detail ── */}
      <section className="py-24 bg-[hsl(35,12%,91%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">What We Do</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-4">
              The services, in detail.
            </h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] max-w-2xl mx-auto leading-relaxed">
              No vague promises. Each service is a structured offering with clear deliverables, measurable outcomes, and monthly reporting you can actually act on.
            </p>
          </motion.div>

          <div className="space-y-8">
            {services.map((svc, i) => (
              <motion.div
                key={svc.label}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
                className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-3xl overflow-hidden"
              >
                <div className="grid lg:grid-cols-[1fr_1.4fr] divide-y lg:divide-y-0 lg:divide-x divide-[hsl(35,15%,88%)]">
                  {/* Left — identity */}
                  <div className="p-10 lg:p-12 flex flex-col justify-between" style={{ background: svc.light }}>
                    <div>
                      <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6 text-white"
                        style={{ background: svc.accent }}
                      >
                        {svc.icon}
                      </div>
                      <p className="font-sans text-[11px] font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: svc.accent }}>
                        Service 0{i + 1}
                      </p>
                      <h3 className="font-serif text-3xl font-light text-[hsl(225,50%,22%)] mb-4 leading-snug">
                        {svc.label}
                      </h3>
                      <p className="font-serif text-lg font-light italic text-[hsl(225,50%,30%)] leading-relaxed">
                        "{svc.headline}"
                      </p>
                    </div>
                  </div>
                  {/* Right — detail */}
                  <div className="p-10 lg:p-12">
                    <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-8">
                      {svc.desc}
                    </p>
                    <ul className="space-y-3">
                      {svc.bullets.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <ChevronRight
                            size={14}
                            className="mt-1 flex-shrink-0"
                            style={{ color: svc.accent }}
                          />
                          <span className="font-sans text-sm font-normal text-[hsl(28,18%,20%)] leading-relaxed">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partnership Benefits ── */}
      <section className="py-24 bg-[hsl(40,25%,96%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">What Partners Gain</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-4">
              Every partnership includes.
            </h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,20%)] max-w-xl mx-auto leading-relaxed">
              Whether you run a restaurant, a boutique stay, or an event — these are the foundations of every Woman of Taste collaboration.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-2xl p-9 group"
                whileHover={{ y: -5, boxShadow: "0 18px 36px rgba(28,20,12,0.12)" }}
              >
                <div className="text-2xl text-[hsl(38,45%,55%)] mb-4">{b.icon}</div>
                <h3 className="font-serif text-xl font-medium text-[hsl(225,50%,22%)] mb-3 group-hover:text-[hsl(38,45%,45%)] transition-colors">{b.title}</h3>
                <p className="font-sans text-sm font-normal text-[hsl(28,18%,20%)] leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Market Challenge ── */}
      <section className="py-24 bg-[hsl(35,12%,91%)] relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-4 block">The Market Reality</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-6 leading-tight">
                Women are the most powerful dining audience. Are you speaking to them?
              </h2>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-5">
                Women are the primary decision-makers for where to dine, where to stay, and which events to attend. They research before they book, they share when they love something, and they return to the places that make them feel genuinely welcomed — not just served.
              </p>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-5">
                A woman deciding where to eat decides before she leaves home. She scrolls TikTok, checks Instagram, reads reviews. If you don't show up — or show up poorly — she goes somewhere else. Not because your offering is inferior. Because your digital presence didn't do the work.
              </p>
              <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed">
                That is the gap we close. We create a safe, pleasurable space for women to discover your venue — and an analytically driven strategy that makes it profitable for you.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-3xl p-10 shadow-sm"
            >
              <p className="font-serif text-2xl font-light italic text-[hsl(225,50%,28%)] leading-relaxed mb-6">
                "A pleasurable experience for your guests. A profitable outcome for your business. That is what a Woman of Taste partnership delivers."
              </p>
              <div className="border-t border-[hsl(35,15%,88%)] pt-6 space-y-4">
                {[
                  { label: "Safe space", value: "A curated environment where women feel welcomed and genuinely received" },
                  { label: "Social reach", value: "10K–191K views per TikTok venue feature" },
                  { label: "Analytics", value: "Monthly data reports on who your guests really are" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-[hsl(38,45%,50%)] w-24 flex-shrink-0">{item.label}</span>
                    <span className="font-sans text-sm font-normal text-[hsl(28,18%,20%)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Strategic Partners ── */}
      <section className="py-24 bg-[hsl(35,12%,91%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">The Alliance</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-4">
              Our Strategic Partners
            </h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] max-w-2xl mx-auto leading-relaxed">
              Three distinct forces — storytelling, hospitality systems, and artificial intelligence — united to power your restaurant's growth.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {[
              {
                label: "Woman of Taste",
                tagline: "Marketing & content",
                points: [
                  "SEO-indexed place pages on womanoftaste.co.za",
                  "TikTok and Instagram audience exposure",
                  "Social media marketing plans for restaurants",
                  "Customer analytics and diner intelligence consulting",
                ],
                gradient: "from-[hsl(225,50%,22%)] to-[hsl(225,40%,35%)]",
                accent: "hsl(38,45%,65%)",
                logo: "/wot-logo.png",
                logoBlend: "screen" as const,
              },
              {
                label: "DineXP",
                tagline: "Hospitality systems",
                points: [
                  "Hospitality standards training and tools",
                  "Guest experience management systems",
                  "Service culture development programmes",
                  "Operational insight into what modern diners want",
                ],
                gradient: "from-[hsl(38,45%,48%)] to-[hsl(38,35%,60%)]",
                accent: "hsl(40,25%,96%)",
                link: partnerLinks.dinexpWebsite,
              },
              {
                label: "Okiru",
                tagline: "AI & data intelligence",
                points: [
                  "AI-powered customer behaviour analysis",
                  "Smart recommendation and guest insight systems",
                  "Data-driven analytics to sharpen restaurant strategy",
                  "Next-generation tools for the modern restaurant",
                ],
                gradient: "from-[hsl(200,60%,20%)] to-[hsl(270,40%,28%)]",
                accent: "hsl(180,80%,68%)",
                link: partnerLinks.okiruWebsite,
                logo: "/okiru-logo.png",
              },
            ].map((arm, i) => (
              <motion.div
                key={arm.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`rounded-3xl p-10 text-white bg-gradient-to-br ${arm.gradient}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {"logo" in arm && arm.logo ? (
                      "logoBlend" in arm && arm.logoBlend ? (
                        <img src={arm.logo} alt={arm.label} className="h-16 w-16 object-contain mb-1" style={{ mixBlendMode: arm.logoBlend }} />
                      ) : (
                        <img src={arm.logo} alt={arm.label} className="h-8 object-contain mb-2" style={{ filter: "brightness(1.1)" }} />
                      )
                    ) : (
                      <h3 className="font-serif text-2xl font-medium mb-1" style={{ color: arm.accent }}>{arm.label}</h3>
                    )}
                    <p className="font-sans text-sm font-light opacity-70">{arm.tagline}</p>
                  </div>
                  {arm.link && (
                    <a href={arm.link} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
                <ul className="space-y-3">
                  {arm.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 font-sans text-sm font-light opacity-85">
                      <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border border-current opacity-60 flex items-center justify-center text-[9px]">✓</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap justify-center gap-4">
              <a href={partnerLinks.dinexpPlatform} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-lg">
                <img src="/dinexp-logo-new.png" alt="DineXP Platform" className="h-5 object-contain" style={{ filter: "brightness(0) invert(1)" }} />
                <span>Platform</span>
                <ExternalLink size={13} />
              </a>
              <a href={partnerLinks.dinexpWebsite} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all">
                <img src="/dinexp-logo-new.png" alt="DineXP" className="h-5 object-contain group-hover:[filter:brightness(0)_invert(1)] transition-all" style={{ filter: "brightness(0) sepia(1) hue-rotate(200deg) saturate(5)" }} />
                <span>Website</span>
                <ExternalLink size={13} />
              </a>
              <a href={partnerLinks.okiruWebsite} target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 font-sans text-[11px] font-semibold tracking-widest uppercase px-8 py-4 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all">
                <img src="/okiru-logo.png" alt="Okiru" className="h-4 object-contain group-hover:[filter:brightness(0)_invert(1)] transition-all" style={{ filter: "brightness(0)" }} />
                Okiru AI <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-[hsl(40,25%,96%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-3 block">The Process</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)]">How It Works</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-2xl p-8"
              >
                <p className="font-serif text-4xl font-light text-[hsl(38,45%,70%)] mb-4">{step.step}</p>
                <h3 className="font-serif text-lg font-medium text-[hsl(225,50%,22%)] mb-3">{step.title}</h3>
                <p className="font-sans text-sm font-normal text-[hsl(28,18%,20%)] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics callout ── */}
      <section className="py-20 bg-[hsl(225,50%,22%)] relative overflow-hidden">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,65%)] mb-4 block">Data Analytics</span>
              <h2 className="font-serif text-4xl font-light text-[hsl(40,25%,96%)] mb-6 leading-tight">
                Know your guests better than they know themselves.
              </h2>
              <p className="font-sans text-base font-light text-[hsl(40,25%,78%)] leading-relaxed mb-6">
                Our analytics consulting service goes beyond vanity metrics. We track the data that actually moves revenue — visit frequency, average spend, peak hours, most-ordered dishes, what triggers a return visit, and what causes a diner to choose a competitor instead.
              </p>
              <p className="font-sans text-base font-light text-[hsl(40,25%,78%)] leading-relaxed">
                Every month, you receive a plain-language report with specific recommendations. Not a dashboard full of numbers — a consulting document you can act on immediately.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {[
                { label: "Customer Demographics", desc: "Who is your diner? Age, lifestyle, how they found you, what they ordered first." },
                { label: "Spend Drivers", desc: "What makes your guests order the extra course, upgrade the wine, or bring a group?" },
                { label: "Return Rate Analysis", desc: "What brings someone back — and what's causing the ones who don't return to go elsewhere." },
                { label: "Peak & Off-Peak Intelligence", desc: "Where the revenue is hiding in your calendar, and how to activate it." },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white/8 border border-white/15 rounded-2xl p-6"
                >
                  <h4 className="font-sans text-sm font-semibold text-[hsl(38,45%,65%)] mb-1 tracking-wide">{item.label}</h4>
                  <p className="font-sans text-sm font-light text-[hsl(40,25%,80%)] leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Apply CTA ── */}
      <section className="py-24 bg-[hsl(38,45%,94%)] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <img src="/wot-logo.png" alt="Woman of Taste" className="object-contain mx-auto mb-8" style={{ width: 100, height: 100 }} />
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,50%)] mb-4 block">
              Ready to grow?
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-5">
              Apply for Partnership
            </h2>
            <p className="font-sans text-base font-light text-[hsl(28,18%,25%)] leading-relaxed mb-10 max-w-lg mx-auto">
              We work with a curated selection of restaurants ready to take their marketing, online presence, and guest intelligence seriously. If that sounds like you, let's talk.
            </p>
            <Link href="/contact">
              <button className="font-sans text-[11px] font-semibold tracking-widest uppercase px-12 py-5 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-xl">
                Get in Touch
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      {faqsByPage.partnerships?.length > 0 && (
        <section className="py-20 bg-[hsl(40,25%,96%)]">
          <div className="max-w-3xl mx-auto px-6">
            <FAQ items={faqsByPage.partnerships} title="Partnership Questions" />
          </div>
        </section>
      )}
    </Layout>
  );
}
