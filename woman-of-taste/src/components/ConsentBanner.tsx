import { useState, useEffect } from "react";

type ConsentPrefs = { analytics: boolean; decided: boolean };

function getStoredConsent(): ConsentPrefs | null {
  try {
    const raw = localStorage.getItem("wot_consent");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveConsent(analytics: boolean) {
  const prefs: ConsentPrefs = { analytics, decided: true };
  try {
    localStorage.setItem("wot_consent", JSON.stringify(prefs));
  } catch {}
  return prefs;
}

function updateGtag(analytics: boolean) {
  if (typeof window === "undefined") return;
  const dl = (window as any).dataLayer;
  if (!dl) return;
  const state = analytics ? "granted" : "denied";
  dl.push(["consent", "update", {
    ad_storage:         state,
    ad_user_data:       state,
    ad_personalization: state,
    analytics_storage:  state,
  }]);
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored?.decided) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (analytics: boolean) => {
    saveConsent(analytics);
    updateGtag(analytics);
    setLeaving(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: leaving ? "translateY(100%)" : "translateY(0)",
        transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
        willChange: "transform",
      }}
    >
      <div
        style={{
          background: "hsl(28 18% 9%)",
          borderTop: "1px solid hsl(38 45% 45% / 0.35)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          flexWrap: "wrap",
          fontFamily: "inherit",
        }}
      >
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: "1.6",
              color: "hsl(40 25% 82%)",
              letterSpacing: "0.01em",
            }}
          >
            We use cookies to understand how visitors engage with our site and
            to improve your experience. You can accept or decline analytics
            tracking — essential cookies are always active.{" "}
            <a
              href="/contact"
              style={{
                color: "hsl(38 55% 62%)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Learn more
            </a>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          <button
            onClick={() => dismiss(false)}
            style={{
              padding: "9px 20px",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: "1px solid hsl(40 25% 82% / 0.25)",
              borderRadius: "2px",
              background: "transparent",
              color: "hsl(40 25% 75%)",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(40 25% 82% / 0.6)";
              (e.currentTarget as HTMLButtonElement).style.color = "hsl(40 25% 95%)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(40 25% 82% / 0.25)";
              (e.currentTarget as HTMLButtonElement).style.color = "hsl(40 25% 75%)";
            }}
          >
            Decline
          </button>

          <button
            onClick={() => dismiss(true)}
            style={{
              padding: "9px 20px",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              border: "1px solid hsl(38 55% 55%)",
              borderRadius: "2px",
              background: "hsl(38 55% 55%)",
              color: "hsl(28 18% 9%)",
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "hsl(38 55% 62%)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 55% 62%)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "hsl(38 55% 55%)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(38 55% 55%)";
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
