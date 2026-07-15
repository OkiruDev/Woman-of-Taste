import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { getUpcomingEvents } from "@/data/events";

const MONTH_ABBR = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const MONTH_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function parseDateParts(dateStr: string): { day: number; month: number; year: number } | null {
  const parts = dateStr.split(" ");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = MONTH_FULL.indexOf(parts[1]);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || month === -1 || isNaN(year)) return null;
  return { day, month, year };
}

export default function EventCalendarWidget() {
  const events = getUpcomingEvents();

  return (
    <section className="py-24 relative overflow-hidden bg-[hsl(225,50%,22%)]">
      {/* Subtle navy texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(38,45%,65%) 0%, transparent 55%), radial-gradient(circle at 80% 20%, hsl(225,60%,45%) 0%, transparent 50%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-8 bg-[hsl(38,45%,65%)] opacity-60" />
              <span className="font-sans text-[10px] font-semibold tracking-[0.35em] uppercase text-[hsl(38,45%,65%)]">
                The Season Ahead
              </span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(40,25%,96%)]">
              Mark Your Calendar
            </h2>
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Butterfly CTA */}
            <Link href="/events">
              <motion.div
                className="flex items-center gap-2 cursor-pointer group"
                whileHover={{ scale: 1.05, x: -3 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(38,45%,65%)] backdrop-blur-sm"
                  style={{ background: "rgba(180,145,80,0.12)" }}
                >
                  <span className="text-lg leading-none" role="img" aria-label="butterfly">🦋</span>
                  <span className="font-sans text-[9px] font-bold tracking-[0.25em] uppercase text-[hsl(38,45%,65%)] group-hover:text-white transition-colors whitespace-nowrap">
                    Upcoming Events
                  </span>
                  <ArrowRight size={10} className="text-[hsl(38,45%,65%)] group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            </Link>

            <Link href="/events">
              <motion.button
                className="hidden sm:flex items-center gap-2 font-sans text-xs font-semibold tracking-widest uppercase text-[hsl(38,45%,65%)] hover:text-white transition-colors"
                whileHover={{ x: 3 }}
              >
                All Events <ArrowRight size={13} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Calendar tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {events.map((event, i) => {
            const parsed = parseDateParts(event.date);
            const day = parsed?.day;
            const monthIdx = parsed?.month;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
              >
                <Link href={`/events/${event.id}`}>
                  <motion.div
                    className="group relative rounded-2xl overflow-hidden cursor-pointer h-full"
                    whileHover={{ y: -5, scale: 1.015 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Themed gradient bar */}
                    <div className="h-1" style={{ background: event.theme.gradient }} />

                    {/* Hover glow overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
                      style={{ background: `radial-gradient(ellipse at 50% 0%, ${event.theme.accent}18, transparent 65%)` }}
                    />

                    <div className="p-5 flex flex-col items-center text-center">
                      {/* Month label */}
                      <span
                        className="font-sans text-[9px] font-bold tracking-[0.3em] uppercase mb-2"
                        style={{ color: event.theme.accent }}
                      >
                        {monthIdx !== undefined ? MONTH_ABBR[monthIdx] : "—"}
                      </span>

                      {/* Day number */}
                      <span
                        className="font-serif leading-none mb-1"
                        style={{
                          fontSize: "clamp(2.6rem, 5vw, 3.5rem)",
                          color: "rgba(255,255,255,0.92)",
                          fontWeight: 300,
                        }}
                      >
                        {day ?? "—"}
                      </span>

                      {/* Year */}
                      <span className="font-sans text-[9px] tracking-widest text-[rgba(255,255,255,0.28)] mb-4">
                        {parsed?.year ?? "—"}
                      </span>

                      {/* Accent divider */}
                      <div
                        className="w-6 h-px mb-4 group-hover:w-10 transition-all duration-300"
                        style={{ background: `linear-gradient(90deg, transparent, ${event.theme.accent}, transparent)` }}
                      />

                      {/* Category */}
                      {event.category && (
                        <span
                          className="font-sans text-[8px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full mb-3"
                          style={{
                            background: `${event.theme.accent}20`,
                            color: event.theme.accent,
                            border: `1px solid ${event.theme.accent}35`,
                          }}
                        >
                          {event.category}
                        </span>
                      )}

                      {/* Title */}
                      <h3
                        className="font-serif text-sm font-light leading-snug text-white mb-1.5"
                        style={{ lineHeight: 1.3 }}
                      >
                        {event.title}
                      </h3>

                      {/* Location */}
                      <p className="font-sans text-[10px] text-[rgba(255,255,255,0.38)] leading-snug">
                        {event.location.split(",")[0]}
                      </p>

                      {/* Arrow on hover */}
                      <motion.div
                        className="mt-4 flex items-center gap-1 text-[9px] font-sans font-semibold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ color: event.theme.accent }}
                      >
                        Discover <ArrowRight size={9} />
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile "All Events" */}
        <div className="mt-10 flex sm:hidden justify-center">
          <Link href="/events">
            <button className="font-sans text-xs font-semibold tracking-widest uppercase px-8 py-3.5 border border-[hsl(38,45%,65%)] text-[hsl(38,45%,65%)] rounded-full hover:bg-[hsl(38,45%,65%)] hover:text-[hsl(225,50%,22%)] transition-all">
              View All Events
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
