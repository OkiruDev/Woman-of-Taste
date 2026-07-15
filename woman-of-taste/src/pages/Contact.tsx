import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { FaTiktok, FaInstagram } from "react-icons/fa";
import { CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import FAQ from "@/components/FAQ";
import { faqsByPage } from "@/data/faqData";
import AnimatedBackground from "@/components/AnimatedBackground";
import { socialLinks } from "@/data/social";

const subjects = [
  "General Enquiry",
  "Collaboration",
  "Media & Press",
  "Event Enquiry",
  "Partnership",
  "Other",
];

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Your name is required.";
    if (!form.email.trim()) {
      errs.email = "Your email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!form.subject) errs.subject = "Please select a subject.";
    if (!form.message.trim()) errs.message = "Please include a message.";
    else if (form.message.trim().length < 20) errs.message = "Your message is a little short, please tell us a bit more.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const [sendError, setSendError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSendError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
      } else {
        setSendError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setSendError("Unable to send your message right now. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Layout title="Contact">
      <Helmet>
        <title>Contact | Woman of Taste</title>
        <meta name="description" content="Get in touch with Woman of Taste — for event enquiries, restaurant partnership opportunities, press, or a simple hello. Based in Johannesburg, South Africa." />
        <meta property="og:title" content="Contact | Woman of Taste" />
        <meta property="og:description" content="Reach out to Woman of Taste for events, partnerships, and enquiries." />
        <meta property="og:url" content="https://womanoftaste.co.za/contact" />
        <link rel="canonical" href="https://womanoftaste.co.za/contact" />
      </Helmet>
      {/* ── Hero ── */}
      <section className="relative bg-[hsl(40,25%,96%)] overflow-hidden pt-28 pb-16">
        <AnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,55%)] mb-3 block">
              Reach Out
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl font-light text-[hsl(225,50%,22%)] mb-4">
              Get in Touch
            </h1>
            <p className="font-sans text-base font-normal text-[hsl(28,18%,18%)] max-w-xl mx-auto leading-relaxed">
              Whether you have a collaboration in mind, a media enquiry, or simply wish to say hello, we would love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Content ── */}
      <section className="py-16 bg-[hsl(40,25%,96%)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Left: Info */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl font-medium text-[hsl(225,50%,22%)] mb-6 leading-snug">
                We'd love to connect with you.
              </h2>
              <p className="font-sans text-sm font-normal text-[hsl(28,18%,18%)] leading-relaxed mb-5">
                Woman of Taste welcomes enquiries from brands, publications, venues, and individuals who resonate with our vision of elegant, intentional living.
              </p>
              <div className="mb-8">
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(38,45%,55%)] mb-3">
                  Email Us
                </p>
                <a href="mailto:info@womanoftaste.co.za"
                  className="flex items-center gap-2 font-sans text-sm font-medium text-[hsl(225,50%,22%)] hover:text-[hsl(38,45%,45%)] transition-colors mb-1">
                  <span className="text-[hsl(38,45%,55%)]">✉</span> info@womanoftaste.co.za
                </a>
              </div>

              <div className="space-y-6 mb-10">
                {[
                  { label: "Collaborations", desc: "Brand partnerships and creative collaborations that align with our values." },
                  { label: "Media & Press", desc: "Editorial features, interviews, and media coverage enquiries." },
                  { label: "Event Partnerships", desc: "Venue partnerships, sponsorships, and event collaboration opportunities." },
                  { label: "General Enquiries", desc: "Any other questions or conversations you'd like to begin." },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-1 h-full min-h-[2rem] bg-gradient-to-b from-[hsl(38,45%,60%)] to-[hsl(225,50%,40%)] rounded-full flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-base font-medium text-[hsl(225,50%,22%)] mb-1">{item.label}</h3>
                      <p className="font-sans text-sm font-normal text-[hsl(28,18%,24%)] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social */}
              <div>
                <p className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-[hsl(38,45%,55%)] mb-4">
                  Follow Us
                </p>
                <div className="flex gap-4">
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-sans text-sm font-medium text-[hsl(225,50%,22%)] bg-[hsl(35,15%,90%)] px-5 py-2.5 rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all"
                  >
                    <FaTiktok size={14} /> TikTok
                  </a>
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-sans text-sm font-medium text-[hsl(225,50%,22%)] bg-[hsl(35,15%,90%)] px-5 py-2.5 rounded-full hover:bg-[hsl(225,50%,22%)] hover:text-white transition-all"
                  >
                    <FaInstagram size={14} /> Instagram
                  </a>
                  {/* Facebook: Add when ready */}
                  {/* Pinterest: Add when ready */}
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-[hsl(40,30%,98%)] border border-[hsl(35,15%,88%)] rounded-3xl p-10 shadow-sm">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="mb-6"
                      >
                        <CheckCircle size={56} className="mx-auto text-[hsl(38,45%,55%)]" />
                      </motion.div>
                      <h3 className="font-serif text-3xl font-medium text-[hsl(225,50%,22%)] mb-3">
                        Thank you, {form.name.split(" ")[0]}.
                      </h3>
                      <p className="font-sans text-base font-normal text-[hsl(28,18%,20%)] leading-relaxed mb-6 max-w-sm mx-auto">
                        Your message has been received. We will be in touch with you shortly and look forward to connecting.
                      </p>
                      <p className="font-serif text-sm italic text-[hsl(38,45%,55%)]">
                        Woman of Taste
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      {/* Name + Email */}
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,18%)] mb-2 block">
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Jane Smith"
                            className={`w-full font-sans text-sm bg-[hsl(40,25%,96%)] border rounded-xl px-5 py-3.5 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,18%)] focus:outline-none focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all ${
                              errors.name ? "border-red-400" : "border-[hsl(35,15%,84%)]"
                            }`}
                          />
                          {errors.name && <p className="font-sans text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,18%)] mb-2 block">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="jane@example.com"
                            className={`w-full font-sans text-sm bg-[hsl(40,25%,96%)] border rounded-xl px-5 py-3.5 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,18%)] focus:outline-none focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all ${
                              errors.email ? "border-red-400" : "border-[hsl(35,15%,84%)]"
                            }`}
                          />
                          {errors.email && <p className="font-sans text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,18%)] mb-2 block">
                          Subject
                        </label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className={`w-full font-sans text-sm bg-[hsl(40,25%,96%)] border rounded-xl px-5 py-3.5 text-[hsl(28,18%,15%)] focus:outline-none focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all appearance-none ${
                            errors.subject ? "border-red-400" : "border-[hsl(35,15%,84%)]"
                          } ${!form.subject ? "text-[hsl(28,18%,18%)]" : ""}`}
                        >
                          <option value="" disabled>Select a subject</option>
                          {subjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.subject && <p className="font-sans text-xs text-red-500 mt-1">{errors.subject}</p>}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,18%)] mb-2 block">
                          Your Message
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={6}
                          placeholder="Tell us a little about yourself and what you have in mind..."
                          className={`w-full font-sans text-sm bg-[hsl(40,25%,96%)] border rounded-xl px-5 py-4 text-[hsl(28,18%,15%)] placeholder:text-[hsl(28,18%,18%)] focus:outline-none focus:ring-1 focus:ring-[hsl(225,50%,40%)] transition-all resize-none ${
                            errors.message ? "border-red-400" : "border-[hsl(35,15%,84%)]"
                          }`}
                        />
                        {errors.message && <p className="font-sans text-xs text-red-500 mt-1">{errors.message}</p>}
                      </div>

                      {sendError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5"
                        >
                          <p className="font-sans text-sm text-red-600">{sendError}</p>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-sans text-sm font-semibold tracking-widest uppercase py-4 bg-[hsl(225,50%,22%)] text-white rounded-full hover:bg-[hsl(225,50%,18%)] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? "Sending..." : "Send Message"}
                      </button>

                      <p className="font-sans text-xs text-center text-[hsl(28,18%,30%)] leading-relaxed">
                        We typically respond within 2–3 business days. For urgent media enquiries, please mention this in your message.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FAQ items={faqsByPage.contact} title="Questions About Getting in Touch with Woman of Taste" />
    </Layout>
  );
}
