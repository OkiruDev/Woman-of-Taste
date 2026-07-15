import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, MapPin, Calendar, Users, AlertCircle } from "lucide-react";

interface TicketInfo {
  invoiceNumber: string;
  firstName: string;
  surname: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  pricePerTicket: number;
  totalAmount: number;
  checkedIn: boolean;
  checkedInAt: string | null;
}

function SparkleParticle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.div
      style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 20 }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], y: -40 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5Z" fill="#c9a96e" />
      </svg>
    </motion.div>
  );
}

export default function TicketPage() {
  const [, params] = useRoute("/ticket/:qrToken");
  const qrToken = params?.qrToken ?? "";

  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [torn, setTorn] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const [shakeDone, setShakeDone] = useState(false);
  const autoTornRef = useRef(false);

  useEffect(() => {
    if (!qrToken) return;
    fetch(`/api/ticket/${qrToken}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) setTicket(d.ticket);
        else setError("Ticket not found or no longer valid.");
      })
      .catch(() => setError("Unable to load ticket. Please check your connection."))
      .finally(() => setLoading(false));
  }, [qrToken]);

  useEffect(() => {
    if (!ticket || autoTornRef.current) return;
    autoTornRef.current = true;
    const t1 = setTimeout(() => setShakeDone(true), 1200);
    const t2 = setTimeout(() => { setTorn(true); setShowSparks(true); }, 2200);
    const t3 = setTimeout(() => setShowSparks(false), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [ticket]);

  const sparks = Array.from({ length: 12 }, (_, i) => ({
    x: 60 + Math.random() * 200,
    y: 20 + Math.random() * 300,
    delay: i * 0.04,
  }));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0209", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid #c9a96e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "#c9a96e", fontFamily: "Georgia, serif", fontSize: "1rem", letterSpacing: "0.15em" }}>Loading your ticket…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0d0209", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <AlertCircle size={48} style={{ color: "#ef4444", marginBottom: 16 }} />
        <div style={{ color: "#c9a96e", fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: 8 }}>Ticket Not Found</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Arial, sans-serif", fontSize: "0.875rem", lineHeight: 1.6 }}>{error}</div>
        <div style={{ marginTop: 24, color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
          Contact us: <a href="mailto:info@womanoftaste.co.za" style={{ color: "#c9a96e" }}>info@womanoftaste.co.za</a>
        </div>
      </div>
    </div>
  );

  if (!ticket) return null;

  const qrImgSrc = `/api/ticket/${qrToken}/qr.png`;

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at center, #1a0a0a 0%, #0d0209 60%, #000 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", fontFamily: "Georgia, serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Raleway:wght@400;600;700&display=swap');
        @keyframes shimmer { 0%,100%{opacity:0.85} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(201,169,110,0.2)} 50%{box-shadow:0 0 40px rgba(201,169,110,0.45)} }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.7rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(201,169,110,0.65)", marginBottom: 8 }}>
          Woman of Taste · Exclusive Event
        </div>
        {ticket.checkedIn && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.4)", borderRadius: 24, padding: "6px 16px" }}>
            <CheckCircle size={14} style={{ color: "#22c55e" }} />
            <span style={{ color: "#22c55e", fontFamily: "Raleway, sans-serif", fontSize: "0.75rem", fontWeight: 600 }}>Checked In</span>
          </div>
        )}
      </motion.div>

      {/* Ticket container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
        style={{ position: "relative", maxWidth: 680, width: "100%" }}
      >
        {/* Sparkles */}
        <AnimatePresence>
          {showSparks && sparks.map((s, i) => (
            <SparkleParticle key={i} x={s.x} y={s.y} delay={s.delay} />
          ))}
        </AnimatePresence>

        {/* Main ticket (horizontal layout on desktop, vertical on mobile) */}
        <div style={{ display: "flex", background: "#0d0d0d", borderRadius: 20, border: "2px solid #7a1c1c", overflow: "hidden", boxShadow: "0 0 60px rgba(122,28,28,0.4), 0 20px 60px rgba(0,0,0,0.8)", animation: "glow 3s ease-in-out infinite" }}>

          {/* Left admit strip */}
          <div style={{ width: 38, minWidth: 38, background: "#1a0808", borderRight: "2px solid #7a1c1c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "#c9a96e", fontFamily: "Raleway, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", padding: "20px 0", whiteSpace: "nowrap", animation: "shimmer 3s ease-in-out infinite" }}>
              ★ ADMIT ONE ★
            </div>
          </div>

          {/* Main body */}
          <div style={{ flex: 1, padding: "28px 24px", textAlign: "center", minWidth: 0 }}>
            {/* Invoice ref */}
            <div style={{ display: "inline-block", background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 20, padding: "4px 14px", fontFamily: "Raleway, sans-serif", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 16 }}>
              {ticket.invoiceNumber}
            </div>

            {/* Logo area */}
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.3)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/wot-logo.png" alt="WOT" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>

            {/* CINEMA TICKET */}
            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(201,169,110,0.6)", marginBottom: 6 }}>
              CINEMA TICKET
            </div>
            <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 700, color: "#c9a96e", letterSpacing: "0.05em", textTransform: "uppercase", lineHeight: 1.2, marginBottom: 8 }}>
              {ticket.eventTitle}
            </div>
            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 20 }}>
              EVENT BY WOMAN OF TASTE
            </div>

            {/* Details strip */}
            <div style={{ borderTop: "1px dashed rgba(201,169,110,0.2)", paddingTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              <div style={{ textAlign: "center" }}>
                <Calendar size={14} style={{ color: "rgba(201,169,110,0.6)", marginBottom: 4, display: "block", margin: "0 auto 5px" }} />
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>DATE</div>
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "11px", fontWeight: 600, color: "#c9a96e" }}>{ticket.eventDate}</div>
              </div>
              <div style={{ textAlign: "center", borderLeft: "1px solid rgba(201,169,110,0.15)", borderRight: "1px solid rgba(201,169,110,0.15)" }}>
                <Users size={14} style={{ color: "rgba(201,169,110,0.6)", marginBottom: 4, display: "block", margin: "0 auto 5px" }} />
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>GUESTS</div>
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "11px", fontWeight: 600, color: "#c9a96e" }}>{ticket.quantity}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <MapPin size={14} style={{ color: "rgba(201,169,110,0.6)", marginBottom: 4, display: "block", margin: "0 auto 5px" }} />
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>VENUE</div>
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "11px", fontWeight: 600, color: "#c9a96e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.eventLocation}</div>
              </div>
            </div>
          </div>

          {/* Perforated line */}
          <div style={{ width: 0, borderLeft: "3px dashed rgba(122,28,28,0.8)", margin: "12px 0", flexShrink: 0 }} />

          {/* Right stub — tears off */}
          <motion.div
            animate={
              !shakeDone
                ? {}
                : torn
                  ? { x: 240, rotate: 18, opacity: 0 }
                  : { x: [0, -4, 4, -3, 3, 0], rotate: [0, -1, 1, -0.5, 0.5, 0] }
            }
            transition={
              torn
                ? { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }
                : { duration: 0.6, ease: "easeInOut" }
            }
            style={{ width: 160, minWidth: 160, padding: "20px 14px", background: "#110808", textAlign: "center", flexShrink: 0, cursor: torn ? "default" : "pointer", position: "relative" }}
            onClick={() => { if (!torn) { setTorn(true); setShowSparks(true); setTimeout(() => setShowSparks(false), 1200); } }}
            title={torn ? "" : "Tap to tear"}
          >
            {!torn && !shakeDone && (
              <div style={{ position: "absolute", top: 6, right: 6, fontFamily: "Raleway, sans-serif", fontSize: "7px", letterSpacing: "0.15em", color: "rgba(201,169,110,0.4)", textTransform: "uppercase" }}>
                tap to tear
              </div>
            )}

            {/* Guest name */}
            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "8px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,169,110,0.5)", marginBottom: 4 }}>GUEST</div>
            <div style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "15px", fontWeight: 700, color: "#c9a96e", letterSpacing: "0.05em", marginBottom: 16, wordBreak: "break-word" }}>
              {ticket.firstName} {ticket.surname}
            </div>

            {/* Price */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "7px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>TICKET PRICE</div>
              <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "13px", fontWeight: 700, color: "#c9a96e" }}>R {ticket.pricePerTicket.toLocaleString("en-ZA")}</div>
            </div>

            {/* QR code */}
            <div style={{ borderTop: "1px dashed rgba(201,169,110,0.2)", paddingTop: 14 }}>
              <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "7px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>SCAN TO CHECK IN</div>
              <img
                src={qrImgSrc}
                alt="Entry QR Code"
                style={{ width: 110, height: 110, display: "block", margin: "0 auto", borderRadius: 6, background: "#fff", padding: 4 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Torn state reveal */}
        <AnimatePresence>
          {torn && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ textAlign: "center", marginTop: "1.5rem" }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(22,163,74,0.12)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: 30, padding: "10px 22px" }}>
                <CheckCircle size={18} style={{ color: "#22c55e" }} />
                <span style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", color: "#22c55e", fontWeight: 600 }}>Present your QR code at the door</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Full-screen QR on mobile tap */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        style={{ marginTop: "2rem", textAlign: "center" }}
      >
        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
          Save this page for entry
        </div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Raleway, sans-serif", fontSize: "0.65rem" }}>
          {ticket.invoiceNumber} · {ticket.quantity} guest{ticket.quantity !== 1 ? "s" : ""}
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{ marginTop: "3rem", textAlign: "center", fontFamily: "Raleway, sans-serif", fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
        Woman of Taste · womanoftaste.co.za ·{" "}
        <a href="mailto:info@womanoftaste.co.za" style={{ color: "rgba(201,169,110,0.5)", textDecoration: "none" }}>info@womanoftaste.co.za</a>
      </div>
    </div>
  );
}
