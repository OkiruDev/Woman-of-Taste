import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { ADMIN_URL } from "@/lib/adminUrl";

type State = "loading" | "success" | "already" | "expired" | "invalid" | "error";

interface BookingInfo {
  invoiceNumber: string;
  firstName: string;
  surname: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  quantity: number;
  totalAmount: number;
}

export default function BookingApprove() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>("loading");
  const [info, setInfo] = useState<BookingInfo | null>(null);
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    fetch(`/api/bookings/approve/${token}`, { method: "GET" })
      .then(async res => {
        const text = await res.text();
        if (res.ok) {
          try {
            const json = JSON.parse(text);
            if (json.ok) { setState("success"); setInfo(json.booking ?? null); }
            else { setState("error"); setMessage(json.error ?? "Something went wrong."); }
          } catch {
            if (res.status === 200) setState("success");
            else if (res.status === 409 || res.status === 410) setState("already");
            else setState("error");
          }
        } else if (res.status === 404) setState("invalid");
        else if (res.status === 409) setState("already");
        else if (res.status === 410) setState("expired");
        else { setState("error"); }
      })
      .catch(() => setState("error"));
  }, [token]);

  useEffect(() => {
    if (state !== "success") return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); window.location.href = `${ADMIN_URL}/admin/bookings`; return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  return (
    <div style={{
      minHeight: "100vh", background: "hsl(40,25%,96%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Raleway, sans-serif", padding: "2rem",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <style>{`
            @keyframes wotFloat {
              0%,100%{transform:translateY(0) scale(1);filter:drop-shadow(0 0 10px rgba(201,169,110,0.4));}
              50%{transform:translateY(-7px) scale(1.05);filter:drop-shadow(0 0 22px rgba(201,169,110,0.75));}
            }
            .wot-logo-float{animation:wotFloat 3.5s ease-in-out infinite;}
          `}</style>
          <img src="/wot-logo.png" alt="Woman of Taste" className="wot-logo-float" style={{ height: 72, marginBottom: "0.75rem" }} />
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.15rem", color: "hsl(225,50%,22%)", fontWeight: 600 }}>Woman of Taste</div>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "hsl(38,45%,55%)" }}>Savory & Soulful</div>
        </div>

        <div style={{
          background: "white", borderRadius: 20, padding: "2.25rem 2rem",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {state === "loading" && <LoadingState />}
          {state === "success" && <SuccessState info={info} countdown={countdown} />}
          {state === "already" && <AlreadyState />}
          {state === "expired" && <ExpiredState />}
          {state === "invalid" && <InvalidState />}
          {state === "error" && <ErrorState message={message} />}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href={`${ADMIN_URL}/admin/bookings`} style={{ fontSize: "0.75rem", color: "hsl(225,50%,40%)", textDecoration: "none" }}>
            → Go to Admin Bookings
          </a>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid hsl(40,25%,90%)", borderTopColor: "hsl(38,45%,65%)", animation: "spin 0.8s linear infinite", margin: "0 auto 1.25rem" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>Processing approval…</p>
    </div>
  );
}

function SuccessState({ info, countdown }: { info: BookingInfo | null; countdown: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.75rem" }}>
        ✓
      </div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: "hsl(225,50%,22%)", margin: "0 0 0.5rem" }}>
        Booking Approved
      </h2>
      <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.85rem", margin: "0 0 1.5rem", letterSpacing: "0.05em" }}>
        CONFIRMATION SENT TO GUEST
      </p>

      {info && (
        <div style={{ background: "hsl(40,25%,98%)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem", textAlign: "left", border: "1px solid hsl(40,25%,88%)" }}>
          <Row label="Guest" value={`${info.firstName} ${info.surname}`} />
          <Row label="Email" value={info.email} />
          <Row label="Event" value={info.eventTitle} />
          <Row label="Date" value={info.eventDate} />
          <Row label="Tickets" value={String(info.quantity)} />
          <Row label="Invoice" value={info.invoiceNumber} last />
        </div>
      )}

      <p style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.7, margin: "0 0 1.25rem" }}>
        A PDF invoice with banking details has been emailed to the guest.
        Payment is due within <strong>7 days</strong>. You'll receive a confirmation at{" "}
        <strong>info@womanoftaste.co.za</strong>.
      </p>

      <p style={{ fontSize: "0.78rem", color: "hsl(225,50%,45%)", margin: 0 }}>
        Redirecting to Admin Bookings in <strong>{countdown}</strong>s…
      </p>
    </div>
  );
}

function AlreadyState() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>ℹ️</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem" }}>Already Processed</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.7 }}>
        This booking has already been approved or declined. No changes were made.
        <br />Check the admin dashboard for the current booking status.
      </p>
    </div>
  );
}

function ExpiredState() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏰</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem" }}>Link Expired</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.7 }}>
        This approval link has expired (approval links are valid for 72 hours).
        <br />Please log in to the admin dashboard to process this booking manually.
      </p>
    </div>
  );
}

function InvalidState() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔗</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem" }}>Invalid Link</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.7 }}>
        This approval link is invalid or has already been used.
        <br />If you believe this is an error, please check the admin dashboard.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem" }}>Something Went Wrong</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.7 }}>
        {message || "An unexpected error occurred. Please try again or process this booking from the admin dashboard."}
      </p>
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: last ? 0 : "0.6rem", marginBottom: last ? 0 : "0.6rem", borderBottom: last ? "none" : "1px solid hsl(40,25%,90%)" }}>
      <span style={{ fontSize: "0.72rem", color: "#999", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: "0.83rem", color: "hsl(225,50%,22%)", fontWeight: 600, textAlign: "right", maxWidth: "65%" }}>{value}</span>
    </div>
  );
}
