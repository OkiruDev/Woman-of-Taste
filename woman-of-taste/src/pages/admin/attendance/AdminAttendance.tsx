import { useState, useEffect, useRef, useCallback } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Camera, CameraOff, RefreshCw, CheckCircle, XCircle, Users, QrCode, Filter, Search } from "lucide-react";
import jsQR from "jsqr";

interface Guest {
  id: number;
  invoiceNumber: string;
  firstName: string;
  surname: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  eventId: string;
  quantity: number;
  checkedIn: boolean;
  checkedInAt: string | null;
  paidAt: string | null;
}

interface EventOption { id: string; title: string; }

type ScanState = "idle" | "scanning" | "success" | "error" | "already";

interface ScanResult {
  state: ScanState;
  message: string;
  guestName?: string;
  guestCount?: number;
  eventTitle?: string;
}

function fmtTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function QRScanner({ onScan }: { onScan: (token: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number>(0);
  const [active, setActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const lastScannedRef = useRef("");
  const cooldownRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(animRef.current);
    setActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (err) {
      setCameraError("Camera access denied. Please allow camera permissions and try again.");
      console.error("[scanner] Camera error:", err);
    }
  }, []);

  useEffect(() => {
    if (!active) return;

    function scan() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animRef.current = requestAnimationFrame(scan);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) { animRef.current = requestAnimationFrame(scan); return; }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code && !cooldownRef.current) {
        const raw = code.data;
        let token = raw;
        try {
          const url = new URL(raw);
          const parts = url.pathname.split("/");
          const idx = parts.findIndex(p => p === "ticket");
          if (idx !== -1 && parts[idx + 1]) token = parts[idx + 1];
        } catch { /* not a URL, use raw */ }
        if (token && token !== lastScannedRef.current) {
          lastScannedRef.current = token;
          cooldownRef.current = true;
          setTimeout(() => { cooldownRef.current = false; lastScannedRef.current = ""; }, 3000);
          onScan(token);
        }
      }
      animRef.current = requestAnimationFrame(scan);
    }

    animRef.current = requestAnimationFrame(scan);
    return () => cancelAnimationFrame(animRef.current);
  }, [active, onScan]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div style={{ background: "#0d0d0d", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a3a" }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", display: active ? "block" : "none" }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Scanning overlay */}
        {active && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ position: "relative", width: 220, height: 220 }}>
              {/* Corner brackets */}
              {[
                { top: 0, left: 0, borderTop: "3px solid #c9a96e", borderLeft: "3px solid #c9a96e" },
                { top: 0, right: 0, borderTop: "3px solid #c9a96e", borderRight: "3px solid #c9a96e" },
                { bottom: 0, left: 0, borderBottom: "3px solid #c9a96e", borderLeft: "3px solid #c9a96e" },
                { bottom: 0, right: 0, borderBottom: "3px solid #c9a96e", borderRight: "3px solid #c9a96e" },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 24, height: 24, ...s }} />
              ))}
              {/* Scanning line */}
              <div style={{
                position: "absolute", left: 0, right: 0, height: 2,
                background: "linear-gradient(to right, transparent, #c9a96e, transparent)",
                animation: "scanLine 2s ease-in-out infinite",
              }} />
            </div>
          </div>
        )}

        {/* Idle state */}
        {!active && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <QrCode size={48} style={{ color: "#c9a96e", opacity: 0.5 }} />
            <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Raleway, sans-serif", fontSize: "0.85rem" }}>
              {cameraError || "Camera not active"}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "1rem", display: "flex", gap: 10, justifyContent: "center", alignItems: "center" }}>
        {!active ? (
          <button
            onClick={startCamera}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#c9a96e", color: "#0d0d0d", border: "none", borderRadius: 10, padding: "10px 22px", fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
          >
            <Camera size={16} /> Start Scanner
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 10, padding: "10px 22px", fontFamily: "Raleway, sans-serif", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
          >
            <CameraOff size={16} /> Stop Scanner
          </button>
        )}
      </div>

      <style>{`
        @keyframes scanLine {
          0%{top:10px;opacity:0.8} 50%{top:205px;opacity:1} 100%{top:10px;opacity:0.8}
        }
      `}</style>
    </div>
  );
}

function ScanResultBanner({ result }: { result: ScanResult }) {
  if (result.state === "idle") return null;

  const configs = {
    scanning: { bg: "#fffbf0", border: "#fcd34d", text: "#92400e", icon: <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} /> },
    success: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", icon: <CheckCircle size={20} /> },
    already: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", icon: <CheckCircle size={20} /> },
    error: { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", icon: <XCircle size={20} /> },
  };

  const cfg = configs[result.state as keyof typeof configs] ?? configs.scanning;

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 12, marginBottom: "1rem" }}>
      <div style={{ color: cfg.text, flexShrink: 0, marginTop: 1 }}>{cfg.icon}</div>
      <div>
        <div style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: cfg.text, marginBottom: 2 }}>{result.message}</div>
        {result.guestName && (
          <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: cfg.text, opacity: 0.8 }}>
            {result.guestName} · {result.guestCount} guest{(result.guestCount ?? 1) > 1 ? "s" : ""} · {result.eventTitle}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function AdminAttendance() {
  const { token } = useAdminAuth();
  const [tab, setTab] = useState<"scanner" | "register">("scanner");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [search, setSearch] = useState("");
  const [loadingGuests, setLoadingGuests] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult>({ state: "idle", message: "" });
  const [manualToken, setManualToken] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadGuests = useCallback(async () => {
    setLoadingGuests(true);
    const url = selectedEvent ? `/admin/attendance?eventId=${encodeURIComponent(selectedEvent)}` : "/admin/attendance";
    const res = await adminFetch(url);
    const d = await res.json();
    if (d.ok) { setGuests(d.guests); setEvents(d.events); }
    setLoadingGuests(false);
  }, [selectedEvent]);

  useEffect(() => { loadGuests(); }, [loadGuests]);

  const doCheckIn = useCallback(async (rawToken: string) => {
    const tok = rawToken.trim();
    if (!tok) return;
    setScanResult({ state: "scanning", message: "Verifying ticket…" });
    setProcessing(true);
    try {
      const res = await adminFetch(`/admin/check-in/${encodeURIComponent(tok)}`, { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        const guest = d.guest;
        if (d.alreadyCheckedIn) {
          setScanResult({ state: "already", message: "Already checked in!", guestName: `${guest.firstName} ${guest.surname}`, guestCount: guest.quantity, eventTitle: guest.eventTitle });
        } else {
          setScanResult({ state: "success", message: "✓ Check-in successful!", guestName: `${guest.firstName} ${guest.surname}`, guestCount: guest.quantity, eventTitle: guest.eventTitle });
          loadGuests();
        }
      } else {
        setScanResult({ state: "error", message: d.error ?? "Ticket not found or invalid." });
      }
    } catch {
      setScanResult({ state: "error", message: "Network error. Please try again." });
    }
    setProcessing(false);
    setTimeout(() => setScanResult({ state: "idle", message: "" }), 5000);
  }, [loadGuests]);

  const doCheckInById = useCallback(async (bookingId: number, guestLabel: string) => {
    setScanResult({ state: "scanning", message: `Checking in ${guestLabel}…` });
    try {
      const res = await adminFetch(`/admin/bookings/${bookingId}/check-in`, { method: "POST" });
      const d = await res.json();
      if (d.ok) {
        const guest = d.guest;
        if (d.alreadyCheckedIn) {
          setScanResult({ state: "already", message: "Already checked in!", guestName: `${guest.firstName} ${guest.surname}`, guestCount: guest.quantity, eventTitle: guest.eventTitle });
        } else {
          setScanResult({ state: "success", message: "✓ Check-in successful!", guestName: `${guest.firstName} ${guest.surname}`, guestCount: guest.quantity, eventTitle: guest.eventTitle });
          loadGuests();
        }
      } else {
        setScanResult({ state: "error", message: d.error ?? "Check-in failed." });
      }
    } catch {
      setScanResult({ state: "error", message: "Network error. Please try again." });
    }
    setTimeout(() => setScanResult({ state: "idle", message: "" }), 5000);
  }, [loadGuests]);

  const filteredGuests = guests.filter(g => {
    if (!search) return true;
    const s = search.toLowerCase();
    return g.firstName.toLowerCase().includes(s) || g.surname.toLowerCase().includes(s) || g.email.toLowerCase().includes(s) || g.invoiceNumber.toLowerCase().includes(s);
  });

  const checkedInCount = guests.filter(g => g.checkedIn).length;
  const totalCount = guests.length;

  return (
    <AdminLayout title="Attendance">
      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "0.6rem", marginBottom: "1rem" }}>
        {[
          { label: "Paid Guests", value: totalCount, color: "hsl(225,50%,22%)" },
          { label: "Checked In", value: checkedInCount, color: "#16a34a" },
          { label: "Not Arrived", value: totalCount - checkedInCount, color: "#f59e0b" },
          { label: "Attendance", value: totalCount > 0 ? `${Math.round((checkedInCount / totalCount) * 100)}%` : "—", color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 10, padding: "0.85rem 1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#777" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1rem", background: "#f0f4ff", borderRadius: 10, padding: 4 }}>
        {([["scanner", <QrCode size={14} />, "QR Scanner"], ["register", <Users size={14} />, "Attendance Register"]] as [string, React.ReactNode, string][]).map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as "scanner" | "register")}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: tab === key ? "hsl(225,50%,22%)" : "transparent",
              color: tab === key ? "white" : "hsl(225,50%,40%)",
              border: "none", borderRadius: 7, padding: "8px 12px",
              fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── SCANNER TAB ── */}
      {tab === "scanner" && (
        <div>
          <ScanResultBanner result={scanResult} />
          <QRScanner onScan={doCheckIn} />

          {/* Manual token input */}
          <div style={{ marginTop: "1rem", background: "white", borderRadius: 12, padding: "1rem", border: "1px solid #eee" }}>
            <div style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: 8 }}>Manual Check-In</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                placeholder="Paste ticket URL or token…"
                style={{ flex: 1, padding: "9px 12px", border: "1px solid #ddd", borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.83rem", outline: "none" }}
                onKeyDown={e => e.key === "Enter" && !processing && doCheckIn(manualToken)}
              />
              <button
                onClick={() => doCheckIn(manualToken)}
                disabled={!manualToken.trim() || processing}
                style={{ background: "hsl(225,50%,22%)", color: "white", border: "none", borderRadius: 8, padding: "9px 16px", fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", opacity: (!manualToken.trim() || processing) ? 0.5 : 1 }}
              >
                Check In
              </button>
            </div>
            <div style={{ marginTop: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#aaa" }}>
              Supports full ticket URLs (https://…/ticket/TOKEN) or raw tokens.
            </div>
          </div>
        </div>
      )}

      {/* ── REGISTER TAB ── */}
      {tab === "register" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #ddd", borderRadius: 8, padding: "0 10px" }}>
              <Search size={14} style={{ color: "#aaa", flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search guests…"
                style={{ flex: 1, border: "none", outline: "none", fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", padding: "9px 0" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #ddd", borderRadius: 8, padding: "0 10px" }}>
              <Filter size={14} style={{ color: "#aaa", flexShrink: 0 }} />
              <select
                value={selectedEvent}
                onChange={e => setSelectedEvent(e.target.value)}
                style={{ border: "none", outline: "none", fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", padding: "9px 0", background: "transparent", cursor: "pointer", maxWidth: 220 }}
              >
                <option value="">All Events</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={loadGuests}
              disabled={loadingGuests}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 8, padding: "9px 14px", fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}
            >
              <RefreshCw size={13} style={{ animation: loadingGuests ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
          </div>

          {/* Guest list */}
          {loadingGuests ? (
            <div style={{ background: "white", borderRadius: 12, padding: "2.5rem", textAlign: "center", color: "#aaa" }}>Loading guests…</div>
          ) : filteredGuests.length === 0 ? (
            <div style={{ background: "white", borderRadius: 12, padding: "2.5rem", textAlign: "center", color: "#aaa" }}>No guests found.</div>
          ) : (
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "#f8f8fc" }}>
                      {["Status", "Guest", "Event", "Tickets", "Checked In At", "Actions"].map(h => (
                        <th key={h} style={{ padding: "0.7rem 0.85rem", textAlign: "left", fontWeight: 700, color: "#555", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGuests.map((g, i) => (
                      <tr key={g.id} style={{ background: g.checkedIn ? "#f0fdf4" : (i % 2 === 0 ? "white" : "#fafafa") }}>
                        <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5" }}>
                          {g.checkedIn
                            ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#16a34a", borderRadius: 99, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700 }}><CheckCircle size={10} /> In</span>
                            : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef9c3", color: "#a16207", borderRadius: 99, padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700 }}>Pending</span>
                          }
                        </td>
                        <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5" }}>
                          <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{g.firstName} {g.surname}</div>
                          <div style={{ fontSize: "0.7rem", color: "#888" }}>{g.email}</div>
                          <div style={{ fontSize: "0.67rem", color: "#ccc", fontFamily: "monospace" }}>{g.invoiceNumber}</div>
                        </td>
                        <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5" }}>
                          <div style={{ fontWeight: 500, fontSize: "0.82rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.eventTitle}</div>
                          <div style={{ fontSize: "0.7rem", color: "#888" }}>{g.eventDate}</div>
                        </td>
                        <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5", textAlign: "center", fontWeight: 600 }}>{g.quantity}</td>
                        <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5", color: g.checkedIn ? "#16a34a" : "#ccc", fontWeight: g.checkedIn ? 600 : 400, fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                          {g.checkedIn ? `${fmtDate(g.checkedInAt)} ${fmtTime(g.checkedInAt)}` : "—"}
                        </td>
                        <td style={{ padding: "0.7rem 0.85rem", borderBottom: "1px solid #f0f0f5" }}>
                          {!g.checkedIn && (
                            <button
                              onClick={() => doCheckInById(g.id, `${g.firstName} ${g.surname}`)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#dcfce7", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 7, padding: "5px 10px", fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                              title="Mark as checked in"
                            >
                              <CheckCircle size={12} /> Check In
                            </button>
                          )}
                          {/* View ticket */}
                          <a
                            href={`/api/admin/bookings/${g.id}/invoice?token=${token}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f5f0ff", color: "hsl(270,50%,40%)", borderRadius: 7, padding: "5px 10px", fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", fontWeight: 600, textDecoration: "none", marginLeft: 4 }}
                            title="View Invoice"
                          >
                            Invoice
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Live stats footer */}
          <div style={{ marginTop: "0.75rem", textAlign: "right", fontFamily: "Raleway, sans-serif", fontSize: "0.72rem", color: "#aaa" }}>
            Showing {filteredGuests.length} of {guests.length} paid guests · {checkedInCount} checked in
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
