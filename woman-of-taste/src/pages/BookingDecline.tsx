import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { ADMIN_URL } from "@/lib/adminUrl";

type State = "loading" | "success" | "already" | "expired" | "invalid" | "error";

export default function BookingDecline() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    fetch(`/api/bookings/decline/${token}`, { method: "GET" })
      .then(async res => {
        const text = await res.text();
        if (res.ok) {
          try {
            const json = JSON.parse(text);
            if (json.ok) { setState("success"); if (json.firstName) setName(json.firstName); }
            else { setState("error"); setMessage(json.error ?? "Something went wrong."); }
          } catch {
            if (res.status === 200) setState("success");
            else if (res.status === 409 || res.status === 410) setState("already");
            else setState("error");
          }
        } else if (res.status === 404) setState("invalid");
        else if (res.status === 409) setState("already");
        else if (res.status === 410) setState("expired");
        else setState("error");
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
          {state === "success" && <SuccessState name={name} countdown={countdown} />}
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
      <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>Processing…</p>
    </div>
  );
}

function SuccessState({ name, countdown }: { name: string; countdown: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.75rem" }}>
        ✕
      </div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: "hsl(225,50%,22%)", margin: "0 0 0.5rem" }}>
        Booking Declined
      </h2>
      <p style={{ color: "#6b7280", fontWeight: 700, fontSize: "0.85rem", margin: "0 0 1.5rem", letterSpacing: "0.05em" }}>
        GUEST NOTIFICATION SENT
      </p>
      <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.7, margin: "0 0 1.25rem" }}>
        {name ? `${name} has` : "The guest has"} been notified with a polite decline email.
        <br />The booking has been marked as <strong>Declined</strong> in your dashboard.
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
        This decline link has expired. Please log in to the admin dashboard to process this booking manually.
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
        This decline link is invalid or has already been used.
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
        {message || "An unexpected error occurred. Please process this booking from the admin dashboard."}
      </p>
    </div>
  );
}
