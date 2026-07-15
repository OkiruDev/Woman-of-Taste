import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import FAQ from "@/components/FAQ";
import { faqsByPage } from "@/data/faqData";
import AnimatedBackground from "@/components/AnimatedBackground";
import { getUpcomingEvents, getPastEvents, getPrivateEvents, Event } from "@/data/events";

const API_BASE = "/api";

interface SeatData {
  confirmedTickets: number;
  reservedTickets: number;
}

const MONTH_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTH_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function parseDayMonth(dateStr: string): { day: string; monthAbbr: string } {
  const parts = dateStr.split(" ");
  if (parts.length === 3) {
    const monthIdx = MONTH_FULL.indexOf(parts[1]);
    return { day: parts[0], monthAbbr: monthIdx >= 0 ? MONTH_ABBR[monthIdx] : parts[1].slice(0, 3).toUpperCase() };
  }
  return { day: "—", monthAbbr: "—" };
}

function EventAgendaStrip({ events }: { events: Event[] }) {
  return (
    <section className="bg-[hsl(225,50%,22%)] border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex overflow-x-auto scrollbar-hide divide-x divide-[rgba(255,255,255,0.07)]">
          {events.map((event, i) => {
            const { day, monthAbbr } = parseDayMonth(event.date);
            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <motion.div
                  className="group flex-shrink-0 flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-[rgba(255,255,255,0.04)] transition-colors duration-200 min-w-[200px] lg:min-w-0 lg:flex-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  {/* Date block */}
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center"
                    style={{
                      background: `${event.theme.accent}18`,
                      border: `1px solid ${event.theme.accent}35`,
                    }}
                  >
                    <span className="font-serif text-sm leading-none font-light" style={{ color: event.theme.accent }}>{day}</span>
                    <span className="font-sans text-[7px] font-bold tracking-widest uppercase" style={{ color: event.theme.accent, opacity: 0.7 }}>{monthAbbr}</span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="font-serif text-sm text-white leading-snug group-hover:text-[hsl(38,45%,75%)] transition-colors truncate">
                      {event.title}
                    </p>
                    <p className="font-sans text-[10px] text-[rgba(255,255,255,0.38)] truncate mt-0.5">
                      {event.location.split(",")[0]}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={12}
                    className="flex-shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: event.theme.accent }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Events() {
  const upcoming = getUpcomingEvents();
  const past = getPastEvents();
  const privateEvents = getPrivateEvents();
  const [seatMap, setSeatMap] = useState<Record<string, SeatData>>({});

  useEffect(() => {
    [...upcoming, ...past]
      .filter((e) => e.totalCapacity)
      .forEach((e) => {
        fetch(`${API_BASE}/events/${e.id}/seats`)
          .then((r) => r.json())
          .then((d) => {
            if (d.ok) {
              setSeatMap((prev) => ({
                ...prev,
                [e.id]: {
                  confirmedTickets: Number(d.confirmedTickets),
                  reservedTickets: Number(d.reservedTickets),
                },
              }));
            }
          })
          .catch(() => {});
      });
  }, []);

  return (
    <Layout title="Events">
      <Helmet>
        <title>Events | Woman of Taste — Johannesburg</title>
        <meta name="description" content="Curated events in Johannesburg — private screenings, high tea, Women's Month dinners, spring soirées & more. Book your seat at a Woman of Taste experience." />
        <meta property="og:title" content="Events | Woman of Taste" />
        <meta property="og:description" content="Exclusive curated events in Johannesburg. Private screenings, high teas, and more." />
        <meta property="og:url" content="https://womanoftaste.co.za/events" />
        <link rel="canonical" href="https://womanoftaste.co.za/events" />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative bg-[hsl(225,50%,22%)] overflow-hidden pt-28 pb-20">
        <AnimatedBackground variant="dark" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,65%)] mb-4 block">
              Gather with Us
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light text-[hsl(40,25%,96%)] mb-6 leading-tight">
              Events &<br />
              <em className="text-[hsl(38,45%,65%)] not-italic">Experiences.</em>
            </h1>
            <p className="font-sans text-base font-light text-[hsl(40,25%,75%)] max-w-xl mx-auto leading-relaxed">
              We create spaces where women gather, connect, and celebrate the beauty of intentional living — from intimate high teas to curated evenings of culture and conversation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Agenda Quick-View Strip ── */}
      <EventAgendaStrip events={upcoming} />

      {/* ── Upcoming Events ── */}
      <section className="py-20 bg-[hsl(40,25%,96%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div className="mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,55%)] mb-2 block">
              Coming Soon
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)]">
              Upcoming Events
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {upcoming.map((event, i) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group overflow-hidden rounded-3xl shadow-sm border border-[hsl(35,15%,88%)] bg-[hsl(40,30%,98%)] hover:shadow-xl transition-all duration-500 cursor-pointer"
              >
                <Link href={`/events/${event.id}`} className="block">
                  {/* Seasonal gradient banner */}
                  <div className="h-52 relative overflow-hidden" style={{ background: event.theme.gradient }}>
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                      <img src="/wot-logo.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "screen" }} />
                    </div>

                    {/* Season label */}
                    <div className="absolute top-5 left-6">
                      <span
                        className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                        style={{ background: "rgba(255,255,255,0.12)", color: event.theme.accent, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
                      >
                        {event.category}
                      </span>
                    </div>

                    {/* Tagline overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="font-serif text-lg lg:text-xl text-white leading-snug" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
                        {event.cardTagline}
                      </p>
                    </div>

                    {/* Seats remaining badge — live from API */}
                    {(() => {
                      const seats = seatMap[event.id];
                      const capacity = event.totalCapacity;
                      if (!capacity) return null;
                      const taken = seats
                        ? seats.confirmedTickets + seats.reservedTickets
                        : 0;
                      const remaining = Math.max(0, capacity - taken);
                      const reserved = seats?.reservedTickets ?? 0;
                      const isUrgent = remaining <= 5;
                      const isSoldOut = remaining === 0;
                      return (
                        <div className="absolute top-5 right-6 flex flex-col items-end gap-1">
                          <span
                            className="font-sans text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
                            style={{
                              background: isSoldOut ? "rgba(220,50,50,0.9)" : isUrgent ? "rgba(220,80,60,0.85)" : "rgba(0,0,0,0.45)",
                              color: "white",
                              backdropFilter: "blur(8px)",
                            }}
                          >
                            {isSoldOut ? "Sold out" : `${remaining} of ${capacity} left`}
                          </span>
                          {reserved > 0 && !isSoldOut && (
                            <span
                              className="font-sans text-[9px] px-2.5 py-0.5 rounded-full"
                              style={{ background: "rgba(0,0,0,0.35)", color: "rgba(255,255,255,0.65)", backdropFilter: "blur(6px)" }}
                            >
                              {reserved} reserved
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Card body */}
                  <div className="p-8">
                    <h3 className="font-serif text-2xl font-medium text-[hsl(225,50%,22%)] mb-1 leading-snug group-hover:text-[hsl(38,45%,42%)] transition-colors duration-300">
                      {event.title}
                    </h3>
                    <p className="font-serif text-sm text-[hsl(28,18%,40%)] italic mb-5">{event.subtitle}</p>

                    <div className="flex flex-wrap gap-4 mb-6">
                      <span className="flex items-center gap-1.5 font-sans text-xs text-[hsl(28,18%,28%)]">
                        <CalendarDays size={12} className="text-[hsl(38,45%,55%)]" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-sans text-xs text-[hsl(28,18%,28%)]">
                        <MapPin size={12} className="text-[hsl(38,45%,55%)]" />
                        {event.location}
                      </span>
                    </div>

                    <p className="font-sans text-sm text-[hsl(28,18%,20%)] leading-relaxed mb-7">{event.description}</p>

                    <div className="flex items-center gap-2 font-sans text-xs font-semibold tracking-widest uppercase text-[hsl(225,50%,22%)] group-hover:text-[hsl(38,45%,45%)] transition-colors">
                      {event.ctaLabel ?? "Discover More"}
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Past Events ── */}
      {past.length > 0 && (
        <section className="py-20 bg-[hsl(225,50%,22%)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div className="mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,65%)] mb-2 block">
                Look Back
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(40,25%,96%)]">
                Past Events
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {past.map((event, i) => {
                const seats = seatMap[event.id];
                const attended = seats?.confirmedTickets ?? 0;
                return (
                  <motion.article
                    key={event.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="group overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)] transition-all duration-500 cursor-pointer"
                  >
                    <Link href={`/events/${event.id}`} className="block">
                      <div className="h-40 relative overflow-hidden" style={{ background: event.theme.gradient, filter: "grayscale(0.4) brightness(0.7)" }}>
                        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                          <img src="/wot-logo.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: "screen" }} />
                        </div>
                        <div className="absolute top-5 left-6">
                          <span
                            className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                            style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)" }}
                          >
                            Event Passed
                          </span>
                        </div>
                        {event.totalCapacity != null && (
                          <div className="absolute top-5 right-6">
                            <span
                              className="font-sans text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
                              style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)" }}
                            >
                              {attended} of {event.totalCapacity} seats booked
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-8">
                        <h3 className="font-serif text-2xl font-medium text-[hsl(40,25%,90%)] mb-1 leading-snug">
                          {event.title}
                        </h3>
                        <p className="font-serif text-sm text-[hsl(38,45%,65%)] italic mb-5">{event.subtitle}</p>

                        <div className="flex flex-wrap gap-4 mb-6">
                          <span className="flex items-center gap-1.5 font-sans text-xs text-[rgba(255,255,255,0.6)]">
                            <CalendarDays size={12} className="text-[hsl(38,45%,55%)]" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1.5 font-sans text-xs text-[rgba(255,255,255,0.6)]">
                            <MapPin size={12} className="text-[hsl(38,45%,55%)]" />
                            {event.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-sans text-xs font-semibold tracking-widest uppercase text-[hsl(38,45%,65%)] group-hover:text-[hsl(38,45%,80%)] transition-colors">
                          View Recap
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Private Experiences ── */}
      <section className="py-20 bg-[hsl(35,15%,93%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div className="mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,55%)] mb-2 block">
              By Invitation Only
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(225,50%,22%)] mb-4">
              Private Experiences
            </h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,20%)] max-w-xl leading-relaxed">
              Our most intimate gatherings — designed for depth, connection, and the kind of conversation that stays with you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {privateEvents.map((event, i) => (
              <motion.article
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-2xl group hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <Link href="/contact" className="block p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-serif text-lg"
                      style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(38,45%,55%))" }}>
                      ✦
                    </div>
                    <div>
                      {event.category && (
                        <span className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-[hsl(38,45%,55%)] mb-1 block">
                          {event.category}
                        </span>
                      )}
                      <h3 className="font-serif text-xl font-medium text-[hsl(225,50%,22%)] leading-snug group-hover:text-[hsl(38,45%,45%)] transition-colors">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-sans text-xs text-[hsl(28,18%,26%)] mb-5">
                    <CalendarDays size={13} className="text-[hsl(38,45%,55%)]" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 font-sans text-xs text-[hsl(28,18%,26%)] mb-5">
                    <MapPin size={13} className="text-[hsl(38,45%,55%)]" />
                    {event.location}
                  </div>

                  <p className="font-sans text-sm font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-8">
                    {event.description}
                  </p>

                  <span className="inline-block font-sans text-xs font-semibold tracking-widest uppercase px-6 py-3 border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] rounded-full group-hover:bg-[hsl(225,50%,22%)] group-hover:text-white transition-all duration-300">
                    {event.ctaLabel ?? "Express Your Interest"}
                  </span>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Host with Us CTA ── */}
      <section className="py-20 bg-[hsl(40,25%,96%)] relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="w-px h-14 bg-gradient-to-b from-transparent via-[hsl(38,45%,60%)] to-transparent mx-auto mb-8" />
            <h2 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-5">Want to Host with Us?</h2>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-8">
              We collaborate with venues, brands, and individuals who share our commitment to quality, elegance, and meaningful experiences.
            </p>
            <Link href="/contact">
              <button className="font-sans text-sm font-medium tracking-widest uppercase px-10 py-4 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors shadow-lg">
                Get in Touch
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      <FAQ items={faqsByPage.events} title="Questions About Our Dining Events & Experiences" />
    </Layout>
  );
}
