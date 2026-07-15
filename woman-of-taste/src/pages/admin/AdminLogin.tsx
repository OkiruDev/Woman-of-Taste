import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { setStoredToken } from "@/hooks/useUserAuth";

const API = "/api";
const TOKEN_KEY = "wot_admin_token";

export function getAdminToken() { return localStorage.getItem(TOKEN_KEY); }
export function setAdminToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
export function clearAdminToken() { localStorage.removeItem(TOKEN_KEY); }
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch { return false; }
}

export function useAdminAuth() {
  const [, navigate] = useLocation();
  const token = getAdminToken();
  const valid = isTokenValid(token);
  useEffect(() => {
    if (!valid) { clearAdminToken(); navigate("/admin/login"); }
  }, [valid]);
  return { token: valid ? token! : null, logout: () => { clearAdminToken(); navigate("/admin/login"); } };
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  return res;
}

function isWotEmail(email: string) {
  return email.trim().toLowerCase().endsWith("@womanoftaste.co.za");
}

const LABEL: React.CSSProperties = {
  display: "block", fontFamily: "Raleway, sans-serif", fontSize: "0.72rem",
  fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
  color: "#555", marginBottom: 6,
};
const INP: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "0.7rem 1rem",
  border: "1.5px solid #ddd", borderRadius: 8,
  fontFamily: "Raleway, sans-serif", fontSize: "0.95rem", outline: "none",
  transition: "border-color 0.2s",
};
const BTN: React.CSSProperties = {
  width: "100%", padding: "0.75rem",
  background: "hsl(225,50%,22%)", color: "white", border: "none",
  borderRadius: 8, fontFamily: "Raleway, sans-serif", fontSize: "0.8rem",
  fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
  cursor: "pointer",
};
const LINK: React.CSSProperties = {
  background: "none", border: "none", color: "hsl(225,50%,40%)",
  cursor: "pointer", fontFamily: "Raleway, sans-serif", fontSize: "0.78rem",
  textDecoration: "underline", padding: 0,
};

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isTokenValid(getAdminToken())) { navigate("/admin"); return; }
    const ut = localStorage.getItem("wot_user_token");
    if (ut) {
      try {
        const p = JSON.parse(atob(ut.split(".")[1]));
        if (p.exp * 1000 > Date.now()) { navigate("/profile/setup"); return; }
      } catch {}
    }
  }, []);

  function focus(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "hsl(225,50%,22%)"; }
  function blur(e: React.FocusEvent<HTMLInputElement>) { e.target.style.borderColor = "#ddd"; }

  function switchMode(m: "signin" | "register") {
    setMode(m); setError(""); setPw(""); setPw2("");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const identifier = usePhone ? phone.trim() : email.trim();

    if (isWotEmail(identifier)) {
      try {
        const res = await fetch(`${API}/admin/auth`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: identifier, password: pw }),
        });
        const data = await res.json();
        if (data.ok) { setAdminToken(data.token); navigate("/admin"); }
        else setError(data.error ?? "Sign-in failed.");
      } catch { setError("Could not connect. Please try again."); }
      finally { setLoading(false); }
      return;
    }

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password: pw }),
      });
      const data = await res.json();
      if (data.ok) { setStoredToken(data.token); navigate("/profile/setup"); }
      else setError(data.error ?? "Sign-in failed.");
    } catch { setError("Could not connect. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) { setError("Passwords do not match."); return; }
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    try {
      const body: Record<string, string> = { password: pw };
      if (usePhone) body.phone = phone.trim(); else body.email = email.trim().toLowerCase();
      const res = await fetch(`${API}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) { setStoredToken(data.token); navigate("/profile/setup"); }
      else setError(data.error ?? "Registration failed.");
    } catch { setError("Could not connect. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "hsl(225,50%,15%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "white", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img src="/wot-logo.png" alt="Woman of Taste" style={{ height: 52, objectFit: "contain", marginBottom: "0.75rem", mixBlendMode: "multiply" }} />
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: "hsl(225,50%,22%)", margin: 0 }}>
            {mode === "signin" ? "Sign In" : "Create Your Profile"}
          </h1>
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.8rem", color: "#888", marginTop: 4 }}>
            Woman of Taste
          </p>
        </div>

        <form onSubmit={mode === "signin" ? handleSignIn : handleRegister}>
          <div style={{ marginBottom: "0.25rem", display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => { setUsePhone(v => !v); setError(""); }}
              style={{ ...LINK, fontSize: "0.72rem" }}>
              {usePhone ? "Use email instead" : "Use phone number instead"}
            </button>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={LABEL}>{usePhone ? "Mobile Number" : "Email Address"}</label>
            {usePhone
              ? <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                  placeholder="+27 82 000 0000" style={INP} onFocus={focus} onBlur={blur} />
              : <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  placeholder="you@email.com" style={INP} onFocus={focus} onBlur={blur} />
            }
          </div>

          <div style={{ marginBottom: mode === "register" ? "1rem" : "1.5rem" }}>
            <label style={LABEL}>Password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} required
              style={INP} onFocus={focus} onBlur={blur} />
          </div>

          {mode === "register" && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={LABEL}>Confirm Password</label>
              <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} required
                style={INP} onFocus={focus} onBlur={blur} />
            </div>
          )}

          {error && (
            <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.82rem", color: "#dc2626", marginBottom: "1rem", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            style={{ ...BTN, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading
              ? (mode === "signin" ? "Signing in…" : "Creating profile…")
              : (mode === "signin" ? "Sign In" : "Create Profile")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          {mode === "signin" ? (
            <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#888", margin: 0 }}>
              Don't have a profile yet?{" "}
              <button onClick={() => switchMode("register")} style={LINK}>Sign up</button>
            </p>
          ) : (
            <p style={{ fontFamily: "Raleway, sans-serif", fontSize: "0.78rem", color: "#888", margin: 0 }}>
              Already have a profile?{" "}
              <button onClick={() => switchMode("signin")} style={LINK}>Sign in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
