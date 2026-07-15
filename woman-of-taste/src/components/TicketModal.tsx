import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, Ticket, AlertCircle } from "lucide-react";
import type { Event } from "@/data/events";

const API_BASE = "/api";

interface Props {
  event: Event | null;
  onClose: () => void;
}

type Step = "form" | "loading" | "success" | "error";

export default function TicketModal({ event, onClose }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [total, setTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    quantity: 1,
    dietary: "",
  });

  useEffect(() => {
    if (event) {
      setStep("form");
      setForm({ firstName: "", surname: "", email: "", phone: "", quantity: 1, dietary: "" });
    }
  }, [event]);

  useEffect(() => {
    if (event) {
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    return undefined;
  }, [event, onClose]);

  const price = event?.price ?? 0;
  const ticketTotal = price * form.quantity;

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    setStep("loading");

    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          eventDate: `${event.date}${event.time ? " · " + event.time : ""}`,
          eventLocation: event.location,
          firstName: form.firstName.trim(),
          surname: form.surname.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          quantity: form.quantity,
          pricePerTicket: price,
          dietary: form.dietary.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setInvoiceNumber(data.invoiceNumber);
      setTotal(data.total);
      setStep("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setStep("error");
    }
  }

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
              style={{ background: "hsl(40,25%,97%)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 rounded-t-3xl"
                style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,30%))" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(201,169,110,0.2)", border: "1px solid rgba(201,169,110,0.5)" }}
                  >
                    <Ticket size={16} className="text-[hsl(38,45%,70%)]" />
                  </div>
                  <div>
                    <p className="font-serif text-base font-medium text-white leading-none">
                      Reserve Your Ticket
                    </p>
                    <p className="font-sans text-[10px] tracking-widest uppercase text-[hsl(38,45%,65%)] mt-0.5">
                      Woman of Taste Events
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Event pill */}
              <div className="px-8 pt-6">
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,32%))" }}
                >
                  <p className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[hsl(38,45%,65%)] mb-1">
                    {event.category}
                  </p>
                  <p className="font-serif text-lg text-white leading-snug mb-3">{event.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-white/60">
                    <span>📅 {event.date}{event.time && ` · ${event.time}`}</span>
                    <span>📍 {event.location}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 pt-6">
                <AnimatePresence mode="wait">
                  {/* ── FORM ── */}
                  {step === "form" && (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                    >
                      <p className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[hsl(38,45%,55%)] mb-4">
                        Your Details
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,38%)] mb-1.5">
                            First Name *
                          </label>
                          <input
                            required
                            value={form.firstName}
                            onChange={(e) => set("firstName", e.target.value)}
                            className="w-full font-sans text-sm bg-white border border-[hsl(35,15%,86%)] rounded-xl px-4 py-2.5 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,55%)] focus:outline-none focus:border-[hsl(225,50%,40%)] focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,38%)] mb-1.5">
                            Surname *
                          </label>
                          <input
                            required
                            value={form.surname}
                            onChange={(e) => set("surname", e.target.value)}
                            className="w-full font-sans text-sm bg-white border border-[hsl(35,15%,86%)] rounded-xl px-4 py-2.5 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,55%)] focus:outline-none focus:border-[hsl(225,50%,40%)] focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all"
                            placeholder="Surname"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,38%)] mb-1.5">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          className="w-full font-sans text-sm bg-white border border-[hsl(35,15%,86%)] rounded-xl px-4 py-2.5 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,55%)] focus:outline-none focus:border-[hsl(225,50%,40%)] focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,38%)] mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          className="w-full font-sans text-sm bg-white border border-[hsl(35,15%,86%)] rounded-xl px-4 py-2.5 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,55%)] focus:outline-none focus:border-[hsl(225,50%,40%)] focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all"
                          placeholder="+27 82 000 0000"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,38%)] mb-1.5">
                          Dietary Requirements <span className="normal-case text-[hsl(28,18%,50%)]">(optional)</span>
                        </label>
                        <input
                          value={form.dietary}
                          onChange={(e) => set("dietary", e.target.value)}
                          className="w-full font-sans text-sm bg-white border border-[hsl(35,15%,86%)] rounded-xl px-4 py-2.5 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,55%)] focus:outline-none focus:border-[hsl(225,50%,40%)] focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all"
                          placeholder="e.g. Vegetarian, Halaal, Gluten-free…"
                        />
                      </div>

                      {/* Ticket count + price */}
                      <div className="mb-6 p-5 rounded-2xl border border-[hsl(35,15%,86%)] bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,40%)] mb-0.5">
                              Number of Tickets
                            </p>
                            {event.ticketsLeft !== undefined && (
                              <p className="font-sans text-[10px] text-[hsl(38,45%,50%)]">
                                {event.ticketsLeft} seats remaining
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => set("quantity", Math.max(1, form.quantity - 1))}
                              className="w-8 h-8 rounded-full border border-[hsl(35,15%,82%)] flex items-center justify-center font-sans text-lg text-[hsl(225,50%,22%)] hover:bg-[hsl(225,50%,22%)] hover:text-white hover:border-[hsl(225,50%,22%)] transition-all"
                            >
                              −
                            </button>
                            <span className="font-serif text-2xl text-[hsl(225,50%,22%)] w-6 text-center">
                              {form.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => set("quantity", Math.min(event.ticketsLeft ?? 10, form.quantity + 1))}
                              className="w-8 h-8 rounded-full border border-[hsl(35,15%,82%)] flex items-center justify-center font-sans text-lg text-[hsl(225,50%,22%)] hover:bg-[hsl(225,50%,22%)] hover:text-white hover:border-[hsl(225,50%,22%)] transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="h-px bg-[hsl(35,15%,90%)] mb-4" />
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,40%)]">
                              Price per ticket
                            </p>
                            <p className="font-serif text-base text-[hsl(28,18%,20%)]">
                              R {price.toLocaleString("en-ZA")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,40%)]">Total</p>
                            <p className="font-serif text-2xl text-[hsl(225,50%,22%)] font-medium">
                              R {ticketTotal.toLocaleString("en-ZA")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="font-sans text-[11px] text-[hsl(28,18%,42%)] leading-relaxed mb-5">
                        You will receive an invoice with banking details immediately after submitting this form. Your seat is reserved once payment is confirmed.
                      </p>

                      <button
                        type="submit"
                        className="w-full font-sans text-xs font-semibold tracking-widest uppercase py-4 rounded-full text-white transition-all shadow-lg hover:shadow-xl active:scale-[0.99]"
                        style={{ background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,32%))" }}
                      >
                        Submit & Receive Invoice
                      </button>
                    </motion.form>
                  )}

                  {/* ── LOADING ── */}
                  {step === "loading" && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-4"
                    >
                      <Loader2 size={32} className="animate-spin text-[hsl(225,50%,30%)]" />
                      <p className="font-serif text-lg text-[hsl(225,50%,22%)]">Processing your reservation…</p>
                      <p className="font-sans text-sm text-[hsl(28,18%,42%)]">Generating your invoice</p>
                    </motion.div>
                  )}

                  {/* ── SUCCESS ── */}
                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-8 gap-4"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                        style={{ background: "linear-gradient(135deg, hsl(145,55%,38%), hsl(145,45%,52%))" }}
                      >
                        <CheckCircle size={30} className="text-white" />
                      </div>
                      <h3 className="font-serif text-2xl text-[hsl(225,50%,22%)]">Reservation Confirmed</h3>
                      <p className="font-sans text-sm text-[hsl(28,18%,32%)] leading-relaxed max-w-sm">
                        Your invoice has been sent to <strong>{form.email}</strong>. Please check your inbox — including spam — for payment instructions.
                      </p>

                      <div className="w-full mt-2 p-5 rounded-2xl border border-[hsl(35,15%,86%)] bg-white text-left">
                        <p className="font-sans text-[10px] tracking-widest uppercase text-[hsl(28,18%,42%)] mb-1">Invoice Reference</p>
                        <p className="font-serif text-xl text-[hsl(225,50%,22%)] font-medium tracking-wide mb-3">{invoiceNumber}</p>
                        <div className="h-px bg-[hsl(35,15%,90%)] mb-3" />
                        <div className="flex justify-between">
                          <p className="font-sans text-xs text-[hsl(28,18%,42%)]">
                            {form.quantity} × {event.title}
                          </p>
                          <p className="font-sans text-xs font-semibold text-[hsl(225,50%,22%)]">
                            R {total.toLocaleString("en-ZA")}
                          </p>
                        </div>
                      </div>

                      <p className="font-sans text-xs text-[hsl(28,18%,45%)] leading-relaxed max-w-sm">
                        Your seat is reserved for <strong>48 hours</strong>. Use <strong>{invoiceNumber}</strong> as your payment reference. Contact <a href="mailto:info@womanoftaste.co.za" className="text-[hsl(38,45%,50%)]">info@womanoftaste.co.za</a> with any questions.
      </p>

                      <button
                        onClick={onClose}
                        className="mt-2 font-sans text-xs font-semibold tracking-widest uppercase px-8 py-3 rounded-full border border-[hsl(225,50%,22%)] text-[hsl(225,50%,22%)] hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}

                  {/* ── ERROR ── */}
                  {step === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center text-center py-8 gap-4"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                        style={{ background: "hsl(0,60%,95%)", border: "1px solid hsl(0,60%,80%)" }}
                      >
                        <AlertCircle size={28} className="text-red-500" />
                      </div>
                      <h3 className="font-serif text-xl text-[hsl(225,50%,22%)]">Something went wrong</h3>
                      <p className="font-sans text-sm text-[hsl(28,18%,40%)] leading-relaxed max-w-sm">{errorMsg}</p>
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={() => setStep("form")}
                          className="font-sans text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-full bg-[hsl(225,50%,22%)] text-white hover:bg-[hsl(225,50%,18%)] transition-all"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={onClose}
                          className="font-sans text-xs font-semibold tracking-widest uppercase px-6 py-3 rounded-full border border-[hsl(35,15%,82%)] text-[hsl(28,18%,32%)] hover:bg-[hsl(35,15%,90%)] transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
