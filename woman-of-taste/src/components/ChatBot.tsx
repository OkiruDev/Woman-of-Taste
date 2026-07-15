import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const API_BASE = "/api";

const WELCOME: Message = {
  role: "assistant",
  content: "Hello — I'm Aura, your Woman of Taste concierge. I can guide you around the site, tell you about PashieB's top-rated places, help with events, or connect you with the team. How may I assist you today?",
};

const NAV_CHIPS = [
  { label: "Explore reviewed places", msg: "Show me PashieB's top-rated places to eat and visit" },
  { label: "Upcoming events", msg: "What events does Woman of Taste have coming up?" },
  { label: "Partner with us", msg: "I'm a restaurant or venue — how can we partner with Woman of Taste?" },
  { label: "About PashieB", msg: "Tell me about Patience Bwanya and the Woman of Taste story" },
];

function renderMessageContent(content: string) {
  const parts: React.ReactNode[] = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|(https?:\/\/[^\s]+)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > last) {
      parts.push(content.slice(last, match.index));
    }
    if (match[1] && match[2]) {
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "hsl(225,50%,40%)", textDecoration: "underline", fontWeight: 500 }}
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      parts.push(
        <a
          key={match.index}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "hsl(225,50%,40%)", textDecoration: "underline", fontWeight: 500 }}
        >
          {match[3]}
        </a>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < content.length) parts.push(content.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? content : parts;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifiedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setBanner(true), 3200);
    return () => clearTimeout(t);
  }, []);

  function fireNotify(msgs: Message[]) {
    const userCount = msgs.filter((m) => m.role === "user").length;
    if (userCount === 0 || notifiedRef.current) return;
    notifiedRef.current = true;
    const payload = msgs
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }));
    fetch(`${API_BASE}/chat/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload }),
    }).catch(() => {});
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);

    const userMsg: Message = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);

    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages([...history, assistantMsg]);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => !m.streaming)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.content) {
              full += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: full, streaming: true };
                return updated;
              });
            }
            if (data.done || data.error) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: data.error ?? full,
                  streaming: false,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "I apologise — something went wrong. Please try again or reach us at info@womanoftaste.co.za.",
          streaming: false,
        };
        return updated;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Aura introduction banner — minimal speech bubble */}
      <AnimatePresence>
        {banner && !open && (
          <motion.div
            key="aura-banner"
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="fixed z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bottom-28 sm:bottom-44 right-4 sm:right-6"
            style={{
              background: "hsl(40,25%,97%)",
              boxShadow: "0 8px 32px rgba(28,20,12,0.18), 0 0 0 1px rgba(180,145,80,0.18)",
            }}
          >
            <p className="font-serif text-sm text-[hsl(28,18%,15%)] whitespace-nowrap">
              Hi, I'm <strong>Aura</strong>, your personal concierge
            </p>
            <button
              onClick={() => setBanner(false)}
              className="text-[hsl(28,18%,55%)] hover:text-[hsl(28,18%,20%)] transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X size={13} />
            </button>
            {/* Tail */}
            <div
              className="absolute -bottom-2 right-9 w-4 h-4 rotate-45"
              style={{ background: "hsl(40,25%,97%)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger — 64px on mobile, 128px on desktop */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-16 h-16 sm:w-32 sm:h-32">
        <motion.button
          onClick={() => {
            setBanner(false);
            if (open) fireNotify(messages);
            setOpen((v) => !v);
          }}
          className="absolute inset-0 focus:outline-none bg-transparent"
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.93 }}
          aria-label={open ? "Close chat" : "Open chat with Aura"}
        >
          {/* 3D navy circle — fills the full container */}
          <AnimatePresence>
            {!open && (
              <motion.div
                key="platform"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(ellipse at 38% 28%, hsl(225,45%,34%), hsl(225,55%,16%))",
                  boxShadow: [
                    "0 8px 24px rgba(12,8,4,0.5)",
                    "0 3px 8px rgba(12,8,4,0.3)",
                    "inset 0 2px 4px rgba(255,255,255,0.10)",
                    "inset 0 -4px 10px rgba(0,0,0,0.40)",
                    "0 0 0 1.5px hsl(38,42%,42%)",
                  ].join(", "),
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {open ? (
              /* Close button fills the circle when chat is open */
              <motion.div
                key="close"
                initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(ellipse at 38% 28%, hsl(225,45%,34%), hsl(225,55%,16%))",
                  boxShadow: "0 8px 24px rgba(12,8,4,0.5), inset 0 2px 4px rgba(255,255,255,0.1), 0 0 0 1.5px hsl(38,42%,42%)",
                }}
              >
                <X size={26} className="text-white opacity-90" />
              </motion.div>
            ) : (
              /* Wheat icon — centering wrapper keeps framer-motion transforms clean */
              <motion.div
                key="wheat-wrap"
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: 10 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.img
                  src="/aura-wheat.png"
                  alt="Chat with Aura"
                  style={{
                    width: 108,
                    height: 152,
                    objectFit: "contain",
                    mixBlendMode: "screen",
                    filter: "drop-shadow(0 -2px 8px rgba(180,130,60,0.4))",
                  }}
                  animate={{
                    y: [0, -3, 0, -2, 0],
                    rotate: [0, 1.8, 0, -1.8, 0],
                    scale: [1, 1.05, 1, 1.03, 1],
                  }}
                  transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 },
                    rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 },
                    scale: { duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 },
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Champagne pulse ring */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: "1.5px solid hsl(38,45%,58%)" }}
            animate={{ scale: [1, 1.45, 1.45], opacity: [0.55, 0, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", repeatDelay: 2.5 }}
          />
        )}
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-28 sm:bottom-[176px] right-4 sm:right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-24px)] flex flex-col rounded-3xl overflow-hidden"
            style={{
              height: "520px",
              boxShadow: "0 24px 64px rgba(28,20,12,0.28), 0 0 0 1px rgba(180,145,80,0.25)",
              background: "hsl(40,25%,97%)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,30%))" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(180,145,80,0.5)" }}
              >
                <img src="/aura-wheat.png" alt="" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <p className="font-serif text-sm font-medium text-white leading-none mb-0.5">Aura</p>
                <p className="font-sans text-[10px] tracking-widest uppercase text-[hsl(38,45%,70%)]">Woman of Taste Concierge</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[hsl(38,45%,65%)] animate-pulse" />
                <span className="font-sans text-[10px] text-[hsl(38,45%,70%)]">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
              {messages.map((msg, i) => (
                <React.Fragment key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(38,45%,52%))" }}
                      >
                        <img src="/aura-wheat.png" alt="" className="w-4 h-4 object-contain" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl font-sans text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-tr-sm"
                          : "text-[hsl(28,18%,15%)] rounded-tl-sm border border-[hsl(35,15%,88%)]"
                      }`}
                      style={
                        msg.role === "user"
                          ? { background: "linear-gradient(135deg, hsl(225,50%,28%), hsl(225,45%,36%))" }
                          : { background: "white" }
                      }
                    >
                      {renderMessageContent(msg.content)}
                      {msg.streaming && (
                        <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle rounded-sm bg-[hsl(38,45%,55%)] animate-pulse" />
                      )}
                    </div>
                  </motion.div>
                  {/* Nav chips — shown only after welcome message */}
                  {i === 0 && msg.role === "assistant" && messages.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.15 }}
                      className="flex flex-wrap gap-2 pl-9"
                    >
                      {NAV_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => {
                            setInput(chip.msg);
                            setTimeout(() => {
                              setInput("");
                              const userMsg: Message = { role: "user", content: chip.msg };
                              const history = [WELCOME, userMsg];
                              setMessages(history);
                              setBusy(true);
                              const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
                              setMessages([...history, assistantMsg]);
                              fetch(`${API_BASE}/chat`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  messages: [{ role: "user", content: chip.msg }],
                                }),
                              }).then(async (res) => {
                                if (!res.ok || !res.body) throw new Error();
                                const reader = res.body.getReader();
                                const decoder = new TextDecoder();
                                let full = "";
                                while (true) {
                                  const { done, value } = await reader.read();
                                  if (done) break;
                                  for (const line of decoder.decode(value).split("\n")) {
                                    if (!line.startsWith("data:")) continue;
                                    try {
                                      const data = JSON.parse(line.slice(5).trim());
                                      if (data.content) {
                                        full += data.content;
                                        setMessages((prev) => {
                                          const u = [...prev];
                                          u[u.length - 1] = { role: "assistant", content: full, streaming: true };
                                          return u;
                                        });
                                      }
                                      if (data.done || data.error) {
                                        setMessages((prev) => {
                                          const u = [...prev];
                                          u[u.length - 1] = { role: "assistant", content: data.error ?? full, streaming: false };
                                          return u;
                                        });
                                      }
                                    } catch {}
                                  }
                                }
                              }).catch(() => {
                                setMessages((prev) => {
                                  const u = [...prev];
                                  u[u.length - 1] = { role: "assistant", content: "I apologise — something went wrong. Please try again.", streaming: false };
                                  return u;
                                });
                              }).finally(() => setBusy(false));
                            }, 0);
                          }}
                          className="font-sans text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all hover:border-[hsl(225,50%,35%)] hover:text-[hsl(225,50%,25%)] hover:bg-[hsl(225,50%,97%)]"
                          style={{
                            borderColor: "hsl(35,15%,82%)",
                            color: "hsl(28,18%,30%)",
                            background: "white",
                          }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
              {busy && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(38,45%,52%))" }}>
                    <img src="/aura-wheat.png" alt="" className="w-4 h-4 object-contain" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-[hsl(35,15%,88%)] flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin text-[hsl(225,50%,30%)]" />
                    <span className="font-sans text-xs text-[hsl(28,18%,35%)]">Aura is composing…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Divider */}
            <div className="h-px bg-[hsl(35,15%,88%)] flex-shrink-0" />

            {/* Powered by */}
            <a
              href="https://www.okiru.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 flex-shrink-0 group"
              style={{ background: "hsl(40,22%,96%)" }}
            >
              <span className="font-sans text-[9px] font-bold tracking-[0.22em] uppercase text-[hsl(28,18%,38%)] group-hover:text-[hsl(28,18%,22%)] transition-colors">
                Powered by
              </span>
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src="/okiru-logo.png"
                  alt="Okiru"
                  className="h-4 object-contain"
                  style={{ filter: "brightness(0.22) saturate(0)" }}
                />
              </motion.div>
            </a>
            <div className="h-px bg-[hsl(35,15%,90%)] flex-shrink-0" />

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0 bg-white">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Ask me anything…"
                disabled={busy}
                className="flex-1 font-sans text-sm bg-[hsl(40,25%,97%)] border border-[hsl(35,15%,88%)] rounded-full px-4 py-2 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,50%)] focus:outline-none focus:border-[hsl(225,50%,40%)] focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all disabled:opacity-60"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(38,45%,52%))" }}
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
