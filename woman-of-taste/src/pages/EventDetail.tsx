import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CalendarDays, Clock, ChevronLeft, Loader2, CheckCircle, AlertCircle, Minus, Plus, Users } from "lucide-react";
import Layout from "@/components/Layout";
import { getEventById, isEventPast } from "@/data/events";
import { useUserAuth } from "@/hooks/useUserAuth";
import SignInModal from "@/components/SignInModal";

const API_BASE = "/api";

type BookingStep = "form" | "loading" | "success" | "error";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const event = getEventById(id ?? "");

  const [step, setStep] = useState<BookingStep>("form");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [total, setTotal] = useState(0);
  const [waitlisted, setWaitlisted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ firstName: "", surname: "", email: "", phone: "", quantity: 1, dietary: "" });
  const [confirmedTickets, setConfirmedTickets] = useState<number | null>(null);
  const [reservedTickets, setReservedTickets] = useState<number | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [, navigate] = useLocation();
  const { user, profile } = useUserAuth();

  useEffect(() => {
    if (!event?.totalCapacity) return;
    fetch(`${API_BASE}/events/${event.id}/seats`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setConfirmedTickets(Number(d.confirmedTickets));
          setReservedTickets(Number(d.reservedTickets));
        }
      })
      .catch(() => {});
  }, [event?.id]);

  useEffect(() => {
    if (!event?.startDateIso || isEventPast(event)) return;
    const schema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": `${event.title} — ${event.subtitle}`,
      "description": event.description,
      "startDate": event.startDateIso,
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "Place",
        "name": event.location,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Johannesburg",
          "addressRegion": "Gauteng",
          "addressCountry": "ZA"
        }
      },
      "image": ["https://womanoftaste.co.za/opengraph.jpg"],
      "organizer": {
        "@type": "Organization",
        "name": "Woman of Taste",
        "url": "https://womanoftaste.co.za"
      },
      "url": `https://womanoftaste.co.za/events/${event.id}`
    };
    if (event.price) {
      schema["offers"] = {
        "@type": "Offer",
        "price": String(event.price),
        "priceCurrency": "ZAR",
        "availability": "https://schema.org/InStock",
        "url": `https://womanoftaste.co.za/events/${event.id}`
      };
    }
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "event-schema";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.getElementById("event-schema")?.remove(); };
  }, [event?.id]);

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event?.price) return;
    // Compute sold-out state at submission time from current state
    const _cap = event?.totalCapacity ?? null;
    const _taken = confirmedTickets !== null ? confirmedTickets + (reservedTickets ?? 0) : null;
    const _remaining = _cap !== null && _taken !== null ? Math.max(0, _cap - _taken) : null;
    const isSoldOut = _remaining === 0;
    setStep("loading");
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          eventDate: `${event.date}${event.time ? " · " + event.time : ""}`,
          eventLocation: event.location,
          firstName: form.firstName.trim(),
          surname: form.surname.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          quantity: isSoldOut ? 1 : form.quantity,
          pricePerTicket: event.price,
          dietary: form.dietary.trim() || undefined,
          totalCapacity: event.totalCapacity,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong.");
      setInvoiceNumber(data.invoiceNumber);
      setTotal(data.total);
      setWaitlisted(data.waitlisted === true);
      setStep("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStep("error");
    }
  }

  if (!event) {
    return (
      <Layout title="Event Not Found">
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[hsl(40,25%,96%)]">
          <p className="font-serif text-3xl text-[hsl(225,50%,22%)]">Event not found</p>
          <Link href="/events">
            <button className="font-sans text-xs tracking-widest uppercase px-8 py-3 rounded-full bg-[hsl(225,50%,22%)] text-white">
              Back to Events
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { theme } = event;
  const ticketTotal = (event.price ?? 0) * form.quantity;
  const isPrivate = event.type === "private";
  const isPast = isEventPast(event);
  const bookingLocked = !isPrivate && event.bookingOpen !== true;
  const totalCapacity = event.totalCapacity ?? null;
  const totalTaken = confirmedTickets !== null
    ? confirmedTickets + (reservedTickets ?? 0)
    : null;
  const seatsRemaining = totalCapacity !== null && totalTaken !== null
    ? Math.max(0, totalCapacity - totalTaken)
    : null;
  const isSoldOut = seatsRemaining === 0;
  const maxTickets = isSoldOut ? 1 : (seatsRemaining ?? 10);

  const inputClass =
    "w-full font-sans text-sm bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-all backdrop-blur-sm";

  return (
    <Layout title={event.title}>
      <Helmet>
        <title>{event.title} — {event.subtitle} | Woman of Taste</title>
        <meta name="description" content={event.description} />
        <meta property="og:title" content={`${event.title} — ${event.subtitle}`} />
        <meta property="og:description" content={event.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://womanoftaste.co.za/events/${event.id}`} />
        <link rel="canonical" href={`https://womanoftaste.co.za/events/${event.id}`} />
      </Helmet>

      {/* ── Immersive Hero ── */}
      <section
        className="relative min-h-screen flex flex-col justify-end overflow-hidden"
        style={{ background: theme.gradient }}
      >
        {/* Atmospheric texture overlays */}
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)" }} />

        {/* Back link */}
        <div className="absolute top-28 left-6 lg:left-12 z-20">
          <Link href="/events">
            <motion.button
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase transition-all"
              style={{ color: theme.accent, opacity: 0.8 }}
            >
              <ChevronLeft size={14} />
              All Events
            </motion.button>
          </Link>
        </div>

        {/* WOT logo watermark */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-[0.06] pointer-events-none hidden lg:block">
          <img src="/wot-logo.png" alt="" className="w-80 h-80 object-contain" style={{ mixBlendMode: "screen" }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-20 pt-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="font-sans text-xs font-semibold tracking-[0.35em] uppercase mb-4 block"
              style={{ color: theme.accent }}
            >
              {event.category} · {event.date}
            </span>
            <h1
              className="font-serif font-light leading-[1.05] mb-4"
              style={{ fontSize: "clamp(3rem,7vw,6rem)", color: "rgba(255,255,255,0.96)" }}
            >
              {event.title}
            </h1>
            <p className="font-serif text-xl lg:text-2xl font-light mb-8 max-w-2xl leading-relaxed"
              style={{ color: theme.accent, fontStyle: "italic" }}>
              {event.subtitle}
            </p>
            <div className="flex flex-wrap gap-5 font-sans text-sm" style={{ color: theme.textLight }}>
              <span className="flex items-center gap-2">
                <CalendarDays size={14} style={{ color: theme.accent }} />
                {event.date}
              </span>
              {event.time && (
                <span className="flex items-center gap-2">
                  <Clock size={14} style={{ color: theme.accent }} />
                  {event.time}
                </span>
              )}
              <span className="flex items-center gap-2">
                <MapPin size={14} style={{ color: theme.accent }} />
                {event.location}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
      </section>

      {/* ── Story Section ── */}
      <section className="py-24 relative" style={{ background: theme.gradientDark }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-px h-16 mx-auto mb-10" style={{ background: `linear-gradient(to bottom, transparent, ${theme.accent}, transparent)` }} />

            {event.story.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="font-serif text-lg lg:text-xl leading-[1.9] mb-6"
                style={{ color: i === 0 ? "rgba(255,255,255,0.95)" : theme.textLight }}
              >
                {i === 0 ? <em>{para}</em> : para}
              </p>
            ))}

            {event.storyAct2 && (
              <>
                <div className="my-10 h-px opacity-20" style={{ background: theme.accent }} />
                {event.storyAct2.split("\n\n").map((para, i) => (
                  <p key={i} className="font-serif text-lg leading-[1.9] mb-6" style={{ color: theme.textLight }}>
                    {para}
                  </p>
                ))}
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Highlights ── */}
      {event.highlights.length > 0 && (
        <section
          className="py-24 relative overflow-hidden"
          style={{ background: theme.gradient }}
        >
          {/* Deep atmospheric overlay */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,10,0.52)" }} />

          {/* Blue-tinted radial atmospheric glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(80,110,255,0.18) 0%, transparent 65%)" }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">

            {/* Glassmorphic container */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(12,18,58,0.38)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(120,150,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 40px 80px rgba(0,0,10,0.45)",
              }}
            >
              {/* Top shimmer line */}
              <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}55, transparent)` }} />

              <div className="px-8 lg:px-14 py-16">
                {/* Header */}
                <div className="text-center mb-14">
                  <div className="flex items-center justify-center gap-4 mb-5">
                    <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, transparent, ${theme.accent}60)` }} />
                    <span className="font-sans text-[10px] font-semibold tracking-[0.35em] uppercase" style={{ color: theme.accent }}>
                      The Experience
                    </span>
                    <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to left, transparent, ${theme.accent}60)` }} />
                  </div>
                  <h2 className="font-serif text-3xl lg:text-4xl font-light text-white">What awaits you</h2>
                </div>

                {/* Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {event.highlights.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="group relative rounded-2xl p-7 flex flex-col items-center text-center"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(120,150,255,0.14)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                      }}
                    >
                      {/* Monochrome numeral icon */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center mb-5 flex-shrink-0"
                        style={{
                          border: `1px solid ${theme.accent}55`,
                          background: `radial-gradient(ellipse at 40% 35%, ${theme.accent}18, transparent 70%)`,
                        }}
                      >
                        <span
                          className="font-serif text-sm font-light leading-none"
                          style={{ color: theme.accent, letterSpacing: "0.05em" }}
                        >
                          {["I", "II", "III", "IV", "V", "VI"][i]}
                        </span>
                      </div>

                      {/* Thin divider */}
                      <div className="w-8 h-px mb-5" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}55, transparent)` }} />

                      <h3 className="font-serif text-sm font-medium text-white mb-2.5 leading-snug">{h.title}</h3>
                      <p className="font-sans text-[11px] leading-relaxed" style={{ color: theme.textLight, opacity: 0.82 }}>{h.description}</p>

                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at 50% 0%, ${theme.accent}12, transparent 70%)` }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom shimmer line */}
              <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}33, transparent)` }} />
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Details + Booking ── */}
      <section className="py-24" style={{ background: theme.gradientDark }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Event details card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase mb-4 block" style={{ color: theme.accent }}>
                Event Details
              </span>
              <h2 className="font-serif text-3xl lg:text-4xl font-light text-white mb-10 leading-tight">
                Everything you<br />need to know
              </h2>

              <div className="space-y-6">
                {[
                  { label: "Date", value: event.date, icon: "📅" },
                  ...(event.time ? [{ label: "Time", value: event.time, icon: "🕐" }] : []),
                  { label: "Venue", value: event.location, icon: "📍" },
                  ...(event.locationDetail ? [{ label: "Location Note", value: event.locationDetail, icon: "🗺️" }] : []),
                  ...(event.dressCode ? [{ label: "Dress Code", value: event.dressCode, icon: "✨" }] : []),
                  ...(event.ticketsLeft ? [{ label: "Seats Remaining", value: `${event.ticketsLeft} available`, icon: "🎟️" }] : []),
                ].map((detail) => (
                  <div
                    key={detail.label}
                    className="flex items-start gap-5 p-5 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{detail.icon}</span>
                    <div>
                      <p className="font-sans text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: theme.accent }}>
                        {detail.label}
                      </p>
                      <p className="font-serif text-base text-white leading-relaxed">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Booking form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div
                className="rounded-3xl p-8 lg:p-10"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}
              >
                <AnimatePresence mode="wait">
                  {/* ── EVENT PASSED ── */}
                  {step === "form" && isPast && !isPrivate && (
                    <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
                        🗂️
                      </div>
                      <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase mb-2 block" style={{ color: theme.accent }}>
                        This Event Has Passed
                      </span>
                      <h3 className="font-serif text-2xl text-white mb-4">Thank you to everyone who joined us</h3>
                      <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: theme.textLight }}>
                        Bookings are closed for {event.title}. Take a look at what's coming up next.
                      </p>
                      {totalCapacity !== null && confirmedTickets !== null && (
                        <div className="rounded-2xl p-5 mb-6 text-left"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <p className="font-sans text-[10px] tracking-widest uppercase mb-1" style={{ color: theme.accent }}>Attendance</p>
                          <p className="font-serif text-xl text-white">{confirmedTickets} of {totalCapacity} seats booked</p>
                        </div>
                      )}
                      <Link href="/events">
                        <button className="w-full font-sans text-xs font-semibold tracking-widest uppercase py-4 rounded-full text-white transition-all"
                          style={{ background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`, color: "#1a1008" }}>
                          See Upcoming Events →
                        </button>
                      </Link>
                    </motion.div>
                  )}

                  {/* ── HIGH TEA PROFILE CTA (profile-gated) ── */}
                  {step === "form" && !isPast && event.id === "high-tea-buitengeluk-jun-2026" && event.bookingOpen && (
                    <motion.div key="profile-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase mb-2 block" style={{ color: theme.accent }}>
                        Applications Open
                      </span>
                      <h3 className="font-serif text-2xl text-white mb-4">Reserve Your Place</h3>
                      <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: theme.textLight }}>
                        This is a curated gathering. Create a short profile and our team will confirm your place within 48 hours.
                      </p>

                      {!user ? (
                        <div className="space-y-3">
                          <button onClick={() => setShowSignIn(true)}
                            className="w-full font-sans text-xs font-bold tracking-widest uppercase py-4 rounded-full text-white transition-all"
                            style={{ background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`, color: "#1a0808" }}>
                            Apply to Attend →
                          </button>
                          <p className="text-center font-sans text-xs" style={{ color: theme.textLight }}>
                            Already applied?{" "}
                            <button onClick={() => setShowSignIn(true)} className="underline" style={{ color: theme.accent }}>Sign in</button>
                          </p>
                        </div>
                      ) : profile?.profileStatus === "approved" ? (
                        <div className="space-y-3">
                          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(100,200,120,0.15)", border: "1px solid rgba(100,200,120,0.3)" }}>
                            <CheckCircle size={20} className="inline mr-2 text-green-400" />
                            <span className="font-sans text-sm text-green-300">You're confirmed!</span>
                          </div>
                          <button onClick={() => navigate(`/events/${event.id}/attendees`)}
                            className="w-full flex items-center justify-center gap-2 font-sans text-xs font-bold tracking-widest uppercase py-4 rounded-full text-white transition-all"
                            style={{ background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`, color: "#1a0808" }}>
                            <Users size={14} /> View the Room →
                          </button>
                        </div>
                      ) : profile?.profileStatus === "submitted" ? (
                        <div className="rounded-xl px-4 py-4 text-center" style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${theme.accent}55` }}>
                          <p className="font-sans text-sm text-white/80 mb-1">Application Under Review</p>
                          <p className="font-sans text-xs" style={{ color: theme.textLight }}>We'll confirm within 48 hours.</p>
                        </div>
                      ) : profile?.profileStatus === "waitlisted" ? (
                        <div className="rounded-xl px-4 py-4 text-center" style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${theme.accent}55` }}>
                          <p className="font-sans text-sm text-white/80 mb-1">You're on the Waitlist</p>
                          <p className="font-sans text-xs" style={{ color: theme.textLight }}>We'll reach out if a place opens.</p>
                        </div>
                      ) : (
                        <button onClick={() => navigate("/profile/setup")}
                          className="w-full font-sans text-xs font-bold tracking-widest uppercase py-4 rounded-full text-white transition-all"
                          style={{ background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`, color: "#1a0808" }}>
                          {!profile?.fullName ? "Complete Your Profile →" : "Continue Application →"}
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* ── TICKETS AVAILABLE SOON (locked events) ── */}
                  {step === "form" && !isPast && bookingLocked && event.id !== "high-tea-buitengeluk-jun-2026" && (
                    <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {/* Coming soon banner */}
                      <div className="rounded-2xl p-6 mb-6 text-center" style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${theme.accent}55` }}>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                          style={{ background: `${theme.accent}22`, border: `1px solid ${theme.accent}55` }}>
                          🎟️
                        </div>
                        <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase mb-2 block" style={{ color: theme.accent }}>
                          Reserve Your Place
                        </span>
                        <h3 className="font-serif text-2xl text-white mb-3">Tickets Available Soon</h3>
                        <p className="font-sans text-sm leading-relaxed" style={{ color: theme.textLight }}>
                          Booking for this event will open soon. Join our community to be the first to know when tickets drop.
                        </p>
                      </div>

                      {/* Greyed-out form placeholder */}
                      <div className="relative select-none" style={{ opacity: 0.3, pointerEvents: "none", filter: "blur(1.5px)" }}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div><div className="h-3 rounded mb-2" style={{ background: "rgba(255,255,255,0.15)" }} /><div className="h-11 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} /></div>
                          <div><div className="h-3 rounded mb-2" style={{ background: "rgba(255,255,255,0.15)" }} /><div className="h-11 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} /></div>
                        </div>
                        <div className="mb-4"><div className="h-3 rounded mb-2" style={{ background: "rgba(255,255,255,0.15)" }} /><div className="h-11 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} /></div>
                        <div className="mb-4"><div className="h-3 rounded mb-2" style={{ background: "rgba(255,255,255,0.15)" }} /><div className="h-11 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} /></div>
                        <div className="h-24 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <div className="h-12 rounded-full w-full" style={{ background: "rgba(255,255,255,0.12)" }} />
                      </div>

                      {/* CTA to newsletter */}
                      <div className="mt-6 text-center">
                        <a href="/contact" className="font-sans text-xs font-semibold tracking-widest uppercase px-8 py-3 rounded-full inline-block transition-all"
                          style={{ background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`, color: "#1a0808" }}>
                          Notify Me When Tickets Open →
                        </a>
                      </div>
                    </motion.div>
                  )}

                  {/* ── FORM (public events, booking open) ── */}
                  {step === "form" && !isPast && !isPrivate && !bookingLocked && event.id !== "high-tea-buitengeluk-jun-2026" && (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                    >
                      <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase mb-2 block" style={{ color: theme.accent }}>
                        {isSoldOut ? "Fully Booked" : "Reserve Your Place"}
                      </span>
                      <h3 className="font-serif text-2xl text-white mb-7">
                        {isSoldOut ? "Join the waitlist" : "Secure your seat"}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block font-sans text-[10px] tracking-widest uppercase text-white/50 mb-1.5">First Name *</label>
                          <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputClass} placeholder="First name" />
                        </div>
                        <div>
                          <label className="block font-sans text-[10px] tracking-widest uppercase text-white/50 mb-1.5">Surname *</label>
                          <input required value={form.surname} onChange={(e) => set("surname", e.target.value)} className={inputClass} placeholder="Surname" />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block font-sans text-[10px] tracking-widest uppercase text-white/50 mb-1.5">Email Address *</label>
                        <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} placeholder="your@email.com" />
                      </div>

                      <div className="mb-4">
                        <label className="block font-sans text-[10px] tracking-widest uppercase text-white/50 mb-1.5">Phone Number *</label>
                        <input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} placeholder="+27 82 000 0000" />
                      </div>

                      <div className="mb-4">
                        <label className="block font-sans text-[10px] tracking-widest uppercase text-white/50 mb-1.5">
                          Dietary Requirements <span className="normal-case opacity-60">(optional)</span>
                        </label>
                        <input value={form.dietary} onChange={(e) => set("dietary", e.target.value)} className={inputClass} placeholder="e.g. Vegetarian, Halaal, Gluten-free…" />
                      </div>

                      {/* Ticket counter — hidden when sold out */}
                      {!isSoldOut && (
                        <div
                          className="rounded-2xl p-5 mb-6"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-sans text-[10px] tracking-widest uppercase text-white/50 mb-0.5">Number of Tickets</p>
                              {seatsRemaining !== null ? (
                                <>
                                  <p className="font-sans text-[10px] font-semibold" style={{ color: seatsRemaining <= 5 ? "#f87171" : theme.accent }}>
                                    {`${seatsRemaining} of ${totalCapacity} seats remaining`}
                                  </p>
                                  {reservedTickets !== null && reservedTickets > 0 && (
                                    <p className="font-sans text-[9px] text-white/40 mt-0.5">
                                      {reservedTickets} reserved · {confirmedTickets} booked
                                    </p>
                                  )}
                                </>
                              ) : totalCapacity !== null ? (
                                <p className="font-sans text-[10px]" style={{ color: theme.accent }}>{totalCapacity} seats total</p>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-4">
                              <button type="button" onClick={() => set("quantity", Math.max(1, form.quantity - 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/10 transition-all">
                                <Minus size={14} />
                              </button>
                              <span className="font-serif text-2xl text-white w-6 text-center">{form.quantity}</span>
                              <button type="button" onClick={() => set("quantity", Math.min(maxTickets, form.quantity + 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/10 transition-all">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.1)" }} />
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="font-sans text-[10px] tracking-widest uppercase text-white/50">Per ticket</p>
                              <p className="font-serif text-base text-white">R {(event.price ?? 0).toLocaleString("en-ZA")}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-sans text-[10px] tracking-widest uppercase text-white/50">Total</p>
                              <p className="font-serif text-2xl" style={{ color: theme.accent }}>R {ticketTotal.toLocaleString("en-ZA")}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Waitlist availability notice */}
                      {isSoldOut && (
                        <div className="rounded-2xl p-5 mb-6"
                          style={{ background: "rgba(201,169,110,0.08)", border: "1px solid rgba(201,169,110,0.25)" }}>
                          <p className="font-sans text-[10px] tracking-widest uppercase mb-1.5" style={{ color: theme.accent }}>This event is fully booked</p>
                          <p className="font-sans text-xs leading-relaxed text-white/70">
                            Add yourself to the waitlist and we'll contact you immediately if a seat becomes available. Spots are offered on a first-come, first-served basis.
                          </p>
                          {seatsRemaining !== null && (
                            <p className="font-sans text-[9px] text-white/40 mt-2">
                              {reservedTickets} reserved · {confirmedTickets} booked of {totalCapacity} total
                            </p>
                          )}
                        </div>
                      )}

                      <p className="font-sans text-[11px] leading-relaxed mb-5" style={{ color: theme.textLight, opacity: 0.7 }}>
                        {isSoldOut
                          ? "We'll email you if a seat opens up. You'll have 48 hours to confirm and pay."
                          : "An invoice with banking details will be emailed to you immediately. Your seat is reserved once payment is confirmed."
                        }
                      </p>

                      <button
                        type="submit"
                        className="w-full font-sans text-xs font-semibold tracking-widest uppercase py-4 rounded-full text-white transition-all"
                        style={{ background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`, color: "#1a1008" }}
                      >
                        {isSoldOut ? "Join the Waitlist →" : (event.ctaLabel ?? "Reserve My Seat") + " →"}
                      </button>
                    </motion.form>
                  )}

                  {/* ── PRIVATE EVENT ── */}
                  {step === "form" && isPrivate && (
                    <motion.div key="private" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase mb-2 block" style={{ color: theme.accent }}>
                        By Invitation
                      </span>
                      <h3 className="font-serif text-2xl text-white mb-5">Express your interest</h3>
                      <p className="font-serif text-base leading-relaxed mb-8" style={{ color: theme.textLight }}>
                        This is a private experience. Reach out to our team and someone from Woman of Taste will be in touch.
                      </p>
                      <Link href="/contact">
                        <button className="w-full font-sans text-xs font-semibold tracking-widest uppercase py-4 rounded-full text-white transition-all"
                          style={{ background: `linear-gradient(135deg, ${theme.accentDark}, ${theme.accent})`, color: "#1a1008" }}>
                          Get in Touch →
                        </button>
                      </Link>
                    </motion.div>
                  )}

                  {/* ── LOADING ── */}
                  {step === "loading" && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-4">
                      <Loader2 size={32} className="animate-spin" style={{ color: theme.accent }} />
                      <p className="font-serif text-lg text-white">Processing your reservation…</p>
                      <p className="font-sans text-sm" style={{ color: theme.textLight }}>Generating your invoice</p>
                    </motion.div>
                  )}

                  {/* ── SUCCESS ── */}
                  {step === "success" && (
                    <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center gap-5 py-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: waitlisted ? "rgba(201,169,110,0.2)" : "rgba(100,200,120,0.2)", border: `1px solid ${waitlisted ? "rgba(201,169,110,0.5)" : "rgba(100,200,120,0.5)"}` }}>
                        <CheckCircle size={28} style={{ color: waitlisted ? "#c9a96e" : "#4ade80" }} />
                      </div>
                      <h3 className="font-serif text-2xl text-white">
                        {waitlisted ? "You're on the Waitlist" : "Reservation Confirmed"}
                      </h3>
                      <p className="font-sans text-sm leading-relaxed" style={{ color: theme.textLight }}>
                        {waitlisted
                          ? <>We've added you to the waitlist for <strong className="text-white">{event.title}</strong>. A confirmation email has been sent to <strong className="text-white">{form.email}</strong>.</>
                          : <>Your invoice has been sent to <strong className="text-white">{form.email}</strong>. Please check your inbox — including spam.</>
                        }
                      </p>
                      <div className="w-full rounded-2xl p-5 text-left"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                        <p className="font-sans text-[10px] tracking-widest uppercase mb-1" style={{ color: theme.accent }}>
                          {waitlisted ? "Waitlist Reference" : "Invoice Reference"}
                        </p>
                        <p className="font-serif text-xl text-white mb-3">{invoiceNumber}</p>
                        {!waitlisted && (
                          <>
                            <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.1)" }} />
                            <div className="flex justify-between">
                              <p className="font-sans text-xs" style={{ color: theme.textLight }}>{form.quantity} × {event.title}</p>
                              <p className="font-sans text-xs font-semibold text-white">R {total.toLocaleString("en-ZA")}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="font-sans text-xs leading-relaxed" style={{ color: theme.textLight }}>
                        {waitlisted
                          ? <>If a seat opens up, we'll contact you directly. You'll have <strong className="text-white">48 hours</strong> to confirm.</>
                          : <>Seat reserved for <strong className="text-white">48 hours</strong>. Use <strong className="text-white">{invoiceNumber}</strong> as your payment reference.</>
                        }
                      </p>
                    </motion.div>
                  )}

                  {/* ── ERROR ── */}
                  {step === "error" && (
                    <motion.div key="error" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center gap-4 py-4">
                      <AlertCircle size={40} className="text-red-400" />
                      <h3 className="font-serif text-xl text-white">Something went wrong</h3>
                      <p className="font-sans text-sm leading-relaxed" style={{ color: theme.textLight }}>{errorMsg}</p>
                      <div className="flex gap-3">
                        <button onClick={() => setStep("form")}
                          className="font-sans text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-full text-white border border-white/20 hover:bg-white/10 transition-all">
                          Try Again
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA strip ── */}
      <div
        className="py-8 text-center"
        style={{ background: "rgba(0,0,0,0.3)" }}
      >
        <Link href="/events">
          <button className="font-sans text-xs tracking-widest uppercase flex items-center gap-2 mx-auto transition-opacity hover:opacity-80"
            style={{ color: theme.accent }}>
            <ChevronLeft size={14} />
            Back to all events
          </button>
        </Link>
      </div>
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} onSuccess={() => navigate("/profile/setup")} />
    </Layout>
  );
}
