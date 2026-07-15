import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Loader, Mail, Phone } from "lucide-react";
import { useUserAuth } from "@/hooks/useUserAuth";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
          prompt: () => void;
        };
      };
    };
    _wotGoogleClientId?: string;
  }
}

type Method = "email" | "phone" | "google";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: "login" | "register";
}

const inputCls =
  "w-full font-sans text-sm bg-white border border-[hsl(35,15%,85%)] rounded-xl px-4 py-3 focus:outline-none focus:border-[hsl(225,50%,40%)] transition-colors placeholder:text-[hsl(28,18%,60%)]";

function GoogleButton({ onToken }: { onToken: (credential: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const clientId = (document.querySelector('meta[name="google-client-id"]') as HTMLMetaElement)?.content;
      if (window.google?.accounts?.id && clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp: { credential: string }) => onToken(resp.credential),
          ux_mode: "popup",
        });
        setReady(true);
        clearInterval(interval);
      } else if (attempts > 30) {
        setUnavailable(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [onToken]);

  useEffect(() => {
    if (ready && ref.current && window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: ref.current.offsetWidth || 320,
        text: "continue_with",
      });
    }
  }, [ready]);

  if (unavailable) {
    return (
      <p className="font-sans text-xs text-center text-[hsl(28,18%,45%)] py-3 px-4 bg-[hsl(35,15%,92%)] rounded-xl">
        Google sign-in is not configured yet. Please use email or mobile number.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {!ready && (
        <div className="flex items-center gap-2 text-[hsl(28,18%,40%)]">
          <Loader size={14} className="animate-spin" />
          <span className="font-sans text-xs">Loading Google sign-in…</span>
        </div>
      )}
      <div ref={ref} className="w-full" />
    </div>
  );
}

export default function SignInModal({ open, onClose, onSuccess, defaultMode = "login" }: Props) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [method, setMethod] = useState<Method>("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register, loginWithGoogle } = useUserAuth();

  useEffect(() => {
    if (!open) {
      setError("");
      setIdentifier("");
      setPassword("");
      setConfirmPassword("");
      setShowPw(false);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    try {
      const fn = mode === "login" ? login : register;
      const d = await fn(identifier.trim(), password);
      if (d.ok) { onSuccess?.(); onClose(); }
      else setError(d.error ?? "Something went wrong.");
    } finally { setLoading(false); }
  }

  const handleGoogleToken = useCallback(async (credential: string) => {
    setLoading(true); setError("");
    try {
      const d = await loginWithGoogle(credential);
      if (d.ok) { onSuccess?.(); onClose(); }
      else setError(d.error ?? "Google sign-in failed.");
    } finally { setLoading(false); }
  }, [loginWithGoogle, onSuccess, onClose]);

  const tabs: { id: Method; label: string; icon: React.ReactNode }[] = [
    { id: "email", label: "Email", icon: <Mail size={13} /> },
    { id: "phone", label: "Mobile", icon: <Phone size={13} /> },
    { id: "google", label: "Google", icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    )},
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-md bg-[hsl(40,25%,98%)] rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
          >
            {/* Header */}
            <div className="bg-[hsl(225,50%,22%)] px-8 py-7 text-center relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                <X size={18} />
              </button>
              <img src="/wot-logo.png" alt="Woman of Taste" className="w-11 h-11 object-contain mx-auto mb-3"
                style={{ mixBlendMode: "screen", opacity: 0.9 }} />
              <h2 className="font-serif text-xl font-light text-[hsl(40,25%,96%)]">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="font-sans text-xs text-[hsl(40,25%,65%)] mt-1">
                {mode === "login" ? "Sign in to your account" : "Apply for High Tea at Buitengeluk"}
              </p>
            </div>

            {/* Method tabs */}
            <div className="flex border-b border-[hsl(35,15%,88%)] bg-white">
              {tabs.map(t => (
                <button key={t.id} onClick={() => { setMethod(t.id); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-sans text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${
                    method === t.id
                      ? "text-[hsl(225,50%,30%)] border-b-2 border-[hsl(225,50%,30%)] -mb-px"
                      : "text-[hsl(28,18%,50%)] hover:text-[hsl(28,18%,30%)]"
                  }`}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            <div className="px-8 py-7 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-sans">
                  {error}
                </div>
              )}

              {/* Google method */}
              {method === "google" && (
                <div className="py-2 space-y-4">
                  <p className="font-sans text-sm text-center text-[hsl(28,18%,35%)] leading-relaxed">
                    Continue with your Google account — no password needed.
                  </p>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-3 text-[hsl(28,18%,40%)]">
                      <Loader size={16} className="animate-spin" /> <span className="font-sans text-sm">Signing in…</span>
                    </div>
                  ) : (
                    <GoogleButton onToken={handleGoogleToken} />
                  )}
                </div>
              )}

              {/* Email / Phone methods */}
              {method !== "google" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,30%)] block mb-1.5">
                      {method === "email" ? "Email Address" : "Mobile Number"}
                    </label>
                    <input
                      type={method === "email" ? "email" : "tel"}
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      required
                      autoComplete={method === "email" ? "email" : "tel"}
                      className={inputCls}
                      placeholder={method === "email" ? "your@email.com" : "+27 82 123 4567"}
                    />
                    {method === "phone" && (
                      <p className="font-sans text-[10px] text-[hsl(28,18%,50%)] mt-1">
                        South African numbers: 082… or +27 82… format accepted
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,30%)] block mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        className={`${inputCls} pr-10`}
                        placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(28,18%,50%)] hover:text-[hsl(28,18%,30%)] transition-colors">
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && (
                    <div>
                      <label className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,30%)] block mb-1.5">Confirm Password</label>
                      <input
                        type={showPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className={inputCls}
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-sans text-[11px] font-bold tracking-[0.2em] uppercase bg-[hsl(225,50%,22%)] text-white py-3.5 rounded-xl hover:bg-[hsl(225,50%,18%)] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                  >
                    {loading && <Loader size={13} className="animate-spin" />}
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </button>
                </form>
              )}

              {/* Mode switcher */}
              {method !== "google" && (
                <p className="text-center font-sans text-xs text-[hsl(28,18%,40%)]">
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }}
                    className="text-[hsl(225,50%,35%)] font-semibold underline underline-offset-2"
                  >
                    {mode === "login" ? "Create one" : "Sign in"}
                  </button>
                </p>
              )}

              {/* Divider for Google alternative */}
              {method !== "google" && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[hsl(35,15%,88%)]" />
                  <span className="font-sans text-[10px] text-[hsl(28,18%,50%)]">or</span>
                  <div className="flex-1 h-px bg-[hsl(35,15%,88%)]" />
                </div>
              )}
              {method !== "google" && (
                <button onClick={() => { setMethod("google"); setError(""); }}
                  className="w-full flex items-center justify-center gap-2.5 font-sans text-sm text-[hsl(28,18%,30%)] border border-[hsl(35,15%,85%)] bg-white rounded-xl py-3 hover:bg-[hsl(35,15%,96%)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
