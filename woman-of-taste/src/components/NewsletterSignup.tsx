import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`${BASE}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
        setMessage(data.message ?? "You are on the list.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Unable to connect. Please try again shortly.");
    }
  }

  return (
    <section className="relative overflow-hidden bg-[hsl(225,50%,18%)]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, hsl(38,45%,65%,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-12 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 font-sans text-[10px] font-semibold tracking-[0.22em] text-[hsl(38,45%,65%)] uppercase mb-5">
            <Mail size={12} /> The Inner Circle
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-[hsl(40,25%,94%)] font-light mb-4 leading-snug">
            Stories Worth Savouring,{" "}
            <span className="italic text-[hsl(38,45%,65%)]">Delivered to You</span>
          </h2>

          <p className="font-sans text-sm font-normal text-[hsl(40,25%,60%)] max-w-lg mx-auto mb-10 leading-relaxed">
            Join the Woman of Taste circle — curated journal entries, exclusive dining
            experiences, and hospitality stories told with intention.
          </p>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center gap-3"
              >
                <CheckCircle2 size={40} className="text-[hsl(38,45%,65%)]" />
                <p className="font-serif text-lg text-[hsl(40,25%,88%)] italic">
                  {message === "You are already on the list."
                    ? "You are already with us."
                    : "Welcome to the table."}
                </p>
                <p className="font-sans text-xs text-[hsl(40,25%,55%)]">
                  Check your inbox for a welcome note from Patience.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              >
                <input
                  type="text"
                  placeholder="Your first name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === "loading"}
                  className="flex-none sm:w-40 px-4 py-3 rounded-sm bg-[hsl(225,40%,24%)] border border-[hsl(225,30%,32%)] text-[hsl(40,25%,88%)] placeholder:text-[hsl(40,25%,40%)] font-sans text-sm focus:outline-none focus:border-[hsl(38,45%,55%)] transition-colors"
                />
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                  className="flex-1 px-4 py-3 rounded-sm bg-[hsl(225,40%,24%)] border border-[hsl(225,30%,32%)] text-[hsl(40,25%,88%)] placeholder:text-[hsl(40,25%,40%)] font-sans text-sm focus:outline-none focus:border-[hsl(38,45%,55%)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || !email.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(38,45%,65%)] text-[hsl(225,50%,18%)] font-sans text-xs font-semibold tracking-widest uppercase rounded-sm hover:bg-[hsl(38,45%,72%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {status === "loading" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      Join <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 font-sans text-xs text-red-400"
            >
              {message}
            </motion.p>
          )}

          <p className="mt-8 font-sans text-[10px] text-[hsl(40,25%,38%)] tracking-wide">
            No noise. No spam. Only what is worth your time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
