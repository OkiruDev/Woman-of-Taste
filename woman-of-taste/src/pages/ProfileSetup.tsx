import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Camera, ChevronRight, ChevronLeft, CheckCircle, Loader, AlertCircle,
  Upload, Link2, Linkedin, Instagram, Sparkles, ChevronDown, ChevronUp, X,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useUserAuth, apiFetch } from "@/hooks/useUserAuth";

// ─── Step config ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Identity",        emoji: "👤" },
  { label: "Career",          emoji: "💼" },
  { label: "Passions & Skills", emoji: "✨" },
  { label: "Your Direction",  emoji: "🧭" },
  { label: "Story & Social",  emoji: "📖" },
  { label: "Practical",       emoji: "🔒" },
  { label: "Review & Submit", emoji: "✅" },
];

// ─── Per-step writing tips ───────────────────────────────────────────────────
const TIPS: Record<number, { heading: string; bullets: string[] }> = {
  0: {
    heading: "First impressions matter",
    bullets: [
      "Use the name people know you by — not necessarily your legal name.",
      "A clear, warm, well-lit headshot makes your card stand out in the room.",
      "LinkedIn profile photos work well — copy the image URL or download and upload.",
    ],
  },
  1: {
    heading: "Make your career legible at a glance",
    bullets: [
      "Your title should reflect what you *do*, not just your job description — 'Entrepreneur & Brand Strategist' is more compelling than 'Director'.",
      "Career highlights should be specific: numbers, names, moments. 'Launched a brand into 3 markets' beats 'managed projects'.",
      "You don't need a full CV — pick the 3 things that define your arc.",
    ],
  },
  2: {
    heading: "Let people see beyond the title",
    bullets: [
      "Passions are conversation starters — be honest, not performative.",
      "Special skills are your superpower: the specific, rare thing you do better than most.",
      "Mention current projects even if they're early-stage — the room is a safe space for seeds.",
    ],
  },
  3: {
    heading: "This is the most powerful section",
    bullets: [
      "Be honest and specific — 'right now I'm navigating X while building Y' is far more interesting than a polished summary.",
      "'What's next' doesn't need to be certain. A direction, a question, a door you're trying to open — all of that is valid.",
      "These answers spark the most meaningful conversations at the table.",
    ],
  },
  4: {
    heading: "Your bio is your introduction",
    bullets: [
      "Write your bio as if a friend who admires your work is introducing you to the room.",
      "Three sentences: who you are, what you've built or led, and what drives you.",
      "What brings you is optional but powerful — it signals openness and intentionality.",
    ],
  },
  5: {
    heading: "Just logistics — completely private",
    bullets: [
      "Dietary requirements go directly to the kitchen team. Please be specific.",
      "Your mobile number is only used by organisers if we need to reach you on the day.",
      "None of this is ever visible to other attendees.",
    ],
  },
};

// ─── Shared UI primitives ────────────────────────────────────────────────────
const inputCls = "w-full font-sans text-sm bg-white border border-[hsl(35,15%,85%)] rounded-xl px-4 py-3 focus:outline-none focus:border-[hsl(225,50%,40%)] transition-colors placeholder:text-[hsl(28,18%,58%)]";
const textareaCls = `${inputCls} resize-none leading-relaxed`;

function Field({ label, note, hint, children }: { label: string; note?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <label className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,28%)]">{label}</label>
        {note && <span className="font-sans text-[10px] text-[hsl(28,18%,52%)]">{note}</span>}
      </div>
      {children}
      {hint && <p className="font-sans text-[10px] text-[hsl(28,18%,50%)] leading-relaxed">{hint}</p>}
    </div>
  );
}

function WordCount({ text }: { text: string }) {
  const count = text.trim().split(/\s+/).filter(Boolean).length;
  return <p className="font-sans text-[10px] text-right text-[hsl(28,18%,48%)] mt-0.5">{count} word{count !== 1 ? "s" : ""}</p>;
}

function VisibilityToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 mt-1.5 group">
      <div className={`w-8 h-4 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[hsl(225,50%,40%)]" : "bg-[hsl(35,15%,78%)]"}`}>
        <div className={`w-3 h-3 bg-white rounded-full m-0.5 transition-transform ${checked ? "translate-x-4" : ""}`} />
      </div>
      <span className="font-sans text-[11px] text-[hsl(28,18%,42%)] group-hover:text-[hsl(28,18%,28%)] transition-colors text-left">{label}</span>
    </button>
  );
}

// ─── Tips panel ──────────────────────────────────────────────────────────────
function TipsPanel({ step }: { step: number }) {
  const [open, setOpen] = useState(false);
  const tip = TIPS[step];
  if (!tip) return null;
  return (
    <div className="border border-[hsl(38,45%,75%)] rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(38,45%,96%)] hover:bg-[hsl(38,45%,93%)] transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-[hsl(38,45%,45%)]" />
          <span className="font-sans text-[11px] font-semibold tracking-[0.12em] uppercase text-[hsl(38,40%,35%)]">Aura's Guide · {tip.heading}</span>
        </div>
        {open ? <ChevronUp size={13} className="text-[hsl(38,45%,45%)]" /> : <ChevronDown size={13} className="text-[hsl(38,45%,45%)]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <ul className="px-5 py-4 space-y-2 bg-[hsl(38,45%,98%)]">
              {tip.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[hsl(38,45%,50%)] mt-0.5 flex-shrink-0">✦</span>
                  <span className="font-sans text-[12px] text-[hsl(28,18%,28%)] leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Aura LinkedIn import panel ───────────────────────────────────────────────
function AuraImport({ onApply }: { onApply: (fields: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const run = async () => {
    setError(""); setLoading(true);
    try {
      const r = await apiFetch("/ai/profile-assist", {
        method: "POST",
        body: JSON.stringify({ linkedinText: text }),
      });
      const d = await r.json();
      if (!d.ok) { setError(d.error ?? "Something went wrong."); return; }
      onApply(d.profile);
      setDone(true);
      setTimeout(() => { setOpen(false); setDone(false); setText(""); }, 1800);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="rounded-2xl border border-[hsl(225,50%,78%)] overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[hsl(225,50%,22%)] to-[hsl(225,50%,30%)] hover:from-[hsl(225,50%,18%)] hover:to-[hsl(225,50%,26%)] transition-colors">
        <div className="flex items-center gap-2.5">
          <Sparkles size={14} className="text-[hsl(38,45%,65%)]" />
          <span className="font-sans text-[11px] font-bold tracking-[0.18em] uppercase text-white">Write with Aura · Import from LinkedIn</span>
        </div>
        {open
          ? <ChevronUp size={13} className="text-white/60" />
          : <ChevronDown size={13} className="text-white/60" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.22 }} className="overflow-hidden">
            <div className="p-5 bg-[hsl(225,50%,97%)] space-y-4">

              {done ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 py-4 justify-center">
                  <CheckCircle size={20} className="text-[hsl(225,50%,35%)]" />
                  <span className="font-sans text-sm font-semibold text-[hsl(225,50%,25%)]">Profile filled — review each step and personalise as needed.</span>
                </motion.div>
              ) : (
                <>
                  <div>
                    <p className="font-sans text-[12px] text-[hsl(28,18%,28%)] leading-relaxed mb-1">
                      Open your <strong>LinkedIn profile</strong>, select all the text on the page (Ctrl+A / Cmd+A), and paste it below. Aura will read your experience and write your profile for you.
                    </p>
                    <p className="font-sans text-[11px] text-[hsl(28,18%,48%)]">
                      Your text is used only to generate your profile — it is not stored.
                    </p>
                  </div>

                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={7}
                    className="w-full font-sans text-sm bg-white border border-[hsl(225,50%,70%)] rounded-xl px-4 py-3 focus:outline-none focus:border-[hsl(225,50%,40%)] transition-colors resize-none placeholder:text-[hsl(28,18%,60%)] leading-relaxed"
                    placeholder="Paste your LinkedIn profile text here…&#10;&#10;Tip: On LinkedIn, click 'More' on your profile → 'Save to PDF' or just select all text and copy."
                  />

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-sans">
                      <AlertCircle size={13} className="flex-shrink-0" /> {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => setOpen(false)}
                      className="font-sans text-[11px] text-[hsl(28,18%,45%)] hover:text-[hsl(28,18%,25%)] transition-colors flex items-center gap-1">
                      <X size={11} /> Cancel
                    </button>
                    <button type="button" onClick={run} disabled={loading || !text.trim()}
                      className="flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.15em] uppercase bg-[hsl(225,50%,22%)] text-white px-6 py-2.5 rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors disabled:opacity-50">
                      {loading ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      {loading ? "Aura is writing…" : "Generate My Profile"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
type PhotoMode = "upload" | "url";

export default function ProfileSetup() {
  const { user, profile, loading, refresh } = useUserAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [photoMode, setPhotoMode] = useState<PhotoMode>("upload");
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "", preferredName: "", city: "", profilePhotoUrl: "",
    professionOrTitle: "", companyOrVenture: "",
    qualifications: "", careerHighlights: "",
    passions: "", currentProjects: "", specialSkills: "",
    whatYouDo: "", whatYouWantNext: "",
    shortBio: "", linkedinUrl: "", instagramHandle: "", whatBringsYou: "",
    dietaryRequirements: "", mobileNumber: "",
    visibilityPrefs: {} as Record<string, boolean>,
  });

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setForm(f => ({
        ...f,
        fullName: p.fullName ?? "",
        preferredName: p.preferredName ?? "",
        city: p.city ?? "",
        profilePhotoUrl: p.profilePhotoUrl ?? "",
        professionOrTitle: p.professionOrTitle ?? "",
        companyOrVenture: p.companyOrVenture ?? "",
        qualifications: p.qualifications ?? "",
        careerHighlights: p.careerHighlights ?? "",
        passions: p.passions ?? "",
        currentProjects: p.currentProjects ?? "",
        specialSkills: p.specialSkills ?? "",
        whatYouDo: p.whatYouDo ?? "",
        whatYouWantNext: p.whatYouWantNext ?? "",
        shortBio: p.shortBio ?? "",
        linkedinUrl: p.linkedinUrl ?? "",
        instagramHandle: p.instagramHandle ?? "",
        whatBringsYou: p.whatBringsYou ?? "",
        dietaryRequirements: p.dietaryRequirements ?? "",
        mobileNumber: p.mobileNumber ?? "",
        visibilityPrefs: (p.visibilityPrefs as Record<string, boolean>) ?? {},
      }));
      if (p.profileStatus === "submitted" || p.profileStatus === "approved") setSubmitted(true);
    }
  }, [profile]);

  const set = (key: string, val: string | boolean | Record<string, boolean>) =>
    setForm(f => ({ ...f, [key]: val }));

  const setVis = (key: string, val: boolean) =>
    setForm(f => ({ ...f, visibilityPrefs: { ...f.visibilityPrefs, [key]: val } }));

  const applyAura = (fields: Record<string, string>) => {
    setForm(f => ({ ...f, ...fields }));
  };

  const saveStep = useCallback(async () => {
    setSaving(true); setError("");
    try {
      const r = await apiFetch("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName: form.fullName, preferredName: form.preferredName, city: form.city,
          professionOrTitle: form.professionOrTitle, companyOrVenture: form.companyOrVenture,
          qualifications: form.qualifications, careerHighlights: form.careerHighlights,
          passions: form.passions, currentProjects: form.currentProjects, specialSkills: form.specialSkills,
          whatYouDo: form.whatYouDo, whatYouWantNext: form.whatYouWantNext,
          shortBio: form.shortBio, linkedinUrl: form.linkedinUrl,
          instagramHandle: form.instagramHandle, whatBringsYou: form.whatBringsYou,
          dietaryRequirements: form.dietaryRequirements, mobileNumber: form.mobileNumber,
          visibilityPrefs: form.visibilityPrefs,
        }),
      });
      const d = await r.json();
      if (!d.ok) { setError(d.error ?? "Save failed."); return false; }
      return true;
    } catch { setError("Network error."); return false; }
    finally { setSaving(false); }
  }, [form]);

  const handlePhotoFile = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5MB."); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const r = await apiFetch("/profile/photo", { method: "POST", body: JSON.stringify({ dataUrl: e.target?.result }) });
        const d = await r.json();
        if (d.ok) set("profilePhotoUrl", d.url);
        else setError(d.error ?? "Upload failed.");
      } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  }, []);

  const applyPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    set("profilePhotoUrl", photoUrlInput.trim());
    setPhotoUrlInput("");
  };

  const nextStep = async () => {
    const ok = await saveStep();
    if (ok) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const submitProfile = async () => {
    const saved = await saveStep();
    if (!saved) return;
    setSaving(true);
    try {
      const r = await apiFetch("/profile/submit", { method: "POST" });
      const d = await r.json();
      if (d.ok) { setSubmitted(true); await refresh(); }
      else setError(d.error ?? "Submission failed.");
    } finally { setSaving(false); }
  };

  // ── Guards ──
  if (loading) return (
    <Layout title="Profile">
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-[hsl(225,50%,22%)]" size={28} />
      </div>
    </Layout>
  );

  if (!user) return (
    <Layout title="Profile">
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,25%,96%)] pt-20">
        <div className="text-center">
          <h1 className="font-serif text-3xl text-[hsl(225,50%,22%)] mb-4">Sign in to continue</h1>
          <button onClick={() => navigate("/events/high-tea-buitengeluk-jun-2026")}
            className="font-sans text-sm text-[hsl(225,50%,35%)] underline underline-offset-2">Back to event</button>
        </div>
      </div>
    </Layout>
  );

  if (submitted) return (
    <Layout title="Application Received">
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,25%,96%)] px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full text-center">
          <CheckCircle size={64} className="text-[hsl(38,45%,55%)] mx-auto mb-6" />
          <h1 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mb-4">Application Received</h1>
          <p className="font-sans text-base text-[hsl(28,18%,30%)] leading-relaxed mb-6">
            Your profile has been received. The Woman of Taste team will review and confirm within 48 hours.
          </p>
          {(profile as any)?.profileStatus === "approved" && (
            <button onClick={() => navigate("/events/high-tea-buitengeluk-jun-2026/attendees")}
              className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase bg-[hsl(225,50%,22%)] text-white px-8 py-3.5 rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors">
              View the Room →
            </button>
          )}
        </motion.div>
      </div>
    </Layout>
  );

  const isLastStep = step === STEPS.length - 1;

  return (
    <Layout title="Complete Your Profile">
      <div className="min-h-screen bg-[hsl(40,25%,96%)] pt-24 pb-28 px-4">
        <div className="max-w-xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,48%)]">
              High Tea at Buitengeluk · 16 June 2026
            </span>
            <h1 className="font-serif text-4xl font-light text-[hsl(225,50%,22%)] mt-2 mb-1">Your Profile</h1>
            <p className="font-sans text-sm text-[hsl(28,18%,40%)]">
              <span className="text-[hsl(225,50%,35%)] font-semibold">{STEPS[step].emoji} {STEPS[step].label}</span>
              <span className="text-[hsl(28,18%,55%)]"> · Step {step + 1} of {STEPS.length}</span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="flex gap-1 mb-6">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => i < step && setStep(i)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < step ? "cursor-pointer" : "cursor-default"}`}
                style={{ background: i < step ? "hsl(38,45%,50%)" : i === step ? "hsl(225,50%,35%)" : "hsl(35,15%,82%)" }} />
            ))}
          </div>

          {/* Aura import — shown on steps 0–4 only */}
          {step < 5 && (
            <div className="mb-4">
              <AuraImport onApply={applyAura} />
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700 font-sans">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* Step card */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="bg-white rounded-3xl shadow-sm border border-[hsl(35,15%,88%)] p-8 space-y-6"
            >

              {/* ── STEP 0: Identity ── */}
              {step === 0 && (<>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Full Name" note="required">
                    <input className={inputCls} value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="As on your ID" />
                  </Field>
                  <Field label="Preferred Name" note="shown publicly">
                    <input className={inputCls} value={form.preferredName} onChange={e => set("preferredName", e.target.value)} placeholder="What to call you" />
                  </Field>
                </div>
                <Field label="City" note="required">
                  <input className={inputCls} value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Johannesburg" />
                </Field>
                <Field label="Profile Photo" note="shown to attendees">
                  <div className="flex items-center gap-4 mb-3">
                    {form.profilePhotoUrl ? (
                      <img src={form.profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-[hsl(35,15%,82%)] flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[hsl(35,15%,90%)] flex items-center justify-center flex-shrink-0">
                        <Camera size={22} className="text-[hsl(28,18%,52%)]" />
                      </div>
                    )}
                    <p className="font-sans text-sm text-[hsl(28,18%,35%)]">{form.profilePhotoUrl ? "Photo set ✓" : "No photo yet"}</p>
                  </div>
                  <div className="flex border border-[hsl(35,15%,85%)] rounded-xl overflow-hidden mb-2">
                    {(["upload", "url"] as PhotoMode[]).map(m => (
                      <button key={m} type="button" onClick={() => setPhotoMode(m)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-sans text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${photoMode === m ? "bg-[hsl(225,50%,22%)] text-white" : "bg-white text-[hsl(28,18%,45%)] hover:bg-[hsl(35,15%,95%)]"}`}>
                        {m === "upload" ? <Upload size={11} /> : <Link2 size={11} />}
                        {m === "upload" ? "Upload File" : "Paste URL"}
                      </button>
                    ))}
                  </div>
                  {photoMode === "upload" && (
                    <>
                      <button type="button" onClick={() => photoInputRef.current?.click()} disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 font-sans text-[11px] font-semibold tracking-[0.12em] uppercase border border-dashed border-[hsl(225,50%,35%)] text-[hsl(225,50%,35%)] py-3 rounded-xl hover:bg-[hsl(225,50%,97%)] transition-colors disabled:opacity-50">
                        {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
                        {uploading ? "Uploading…" : form.profilePhotoUrl ? "Upload a Different Photo" : "Click to Upload"}
                      </button>
                      <p className="font-sans text-[10px] text-[hsl(28,18%,50%)] text-center mt-1">JPG, PNG, WebP · Max 5MB</p>
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handlePhotoFile(e.target.files[0])} />
                    </>
                  )}
                  {photoMode === "url" && (
                    <div className="space-y-2">
                      <p className="font-sans text-[11px] text-[hsl(28,18%,45%)]">Paste a direct photo URL from LinkedIn, Google, Instagram, or any public link.</p>
                      <div className="flex gap-2">
                        <input value={photoUrlInput} onChange={e => setPhotoUrlInput(e.target.value)}
                          className={`${inputCls} flex-1`} placeholder="https://…" />
                        <button type="button" onClick={applyPhotoUrl}
                          className="font-sans text-[11px] font-bold tracking-[0.1em] uppercase bg-[hsl(225,50%,22%)] text-white px-4 py-2.5 rounded-xl hover:bg-[hsl(225,50%,18%)] transition-colors whitespace-nowrap">Apply</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["LinkedIn", "Google", "Instagram"].map(s => (
                          <span key={s} className="font-sans text-[10px] text-[hsl(28,18%,45%)] bg-[hsl(35,15%,92%)] px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </Field>
              </>)}

              {/* ── STEP 1: Career ── */}
              {step === 1 && (<>
                <Field label="Current Position / Title" note="required">
                  <input className={inputCls} value={form.professionOrTitle} onChange={e => set("professionOrTitle", e.target.value)}
                    placeholder="e.g. Creative Director · Entrepreneur · Head of Marketing" />
                </Field>
                <Field label="Company or Venture" note="optional">
                  <input className={inputCls} value={form.companyOrVenture} onChange={e => set("companyOrVenture", e.target.value)}
                    placeholder="Organisation, brand, or business" />
                  <VisibilityToggle label="Show company to other attendees"
                    checked={form.visibilityPrefs.showCompany !== false}
                    onChange={v => setVis("showCompany", v)} />
                </Field>
                <Field label="Qualifications" note="optional"
                  hint="Education, certifications, professional designations — whatever shaped your path.">
                  <textarea className={textareaCls} rows={3} value={form.qualifications} onChange={e => set("qualifications", e.target.value)}
                    placeholder="e.g. BA Honours in Communications · Chartered Accountant · Self-taught Developer" />
                </Field>
                <Field label="Career Highlights" note="optional"
                  hint="2–5 milestones you're proud of — launches, awards, pivotal moments.">
                  <textarea className={textareaCls} rows={5} value={form.careerHighlights} onChange={e => set("careerHighlights", e.target.value)}
                    placeholder="• Built a team of 40 from scratch&#10;• Launched a brand into 3 African markets&#10;• Founded a social enterprise reaching 10,000 women" />
                  <WordCount text={form.careerHighlights} />
                </Field>
              </>)}

              {/* ── STEP 2: Passions & Skills ── */}
              {step === 2 && (<>
                <Field label="Passions" note="optional"
                  hint="What genuinely excites you outside of work — causes, interests, creative pursuits.">
                  <textarea className={textareaCls} rows={3} value={form.passions} onChange={e => set("passions", e.target.value)}
                    placeholder="e.g. Food systems · Women's leadership · Afrofuturism · Fine wine · Mentoring young creatives" />
                </Field>
                <Field label="Special Skills" note="optional"
                  hint="The unique, specific capabilities that make you remarkable — technical, creative, interpersonal.">
                  <textarea className={textareaCls} rows={3} value={form.specialSkills} onChange={e => set("specialSkills", e.target.value)}
                    placeholder="e.g. Turning complex data into compelling narratives · Fluent in 4 languages · Expert at building community from scratch" />
                </Field>
                <Field label="Current Projects" note="optional"
                  hint="What are you actively building, creating, or contributing to right now?">
                  <textarea className={textareaCls} rows={3} value={form.currentProjects} onChange={e => set("currentProjects", e.target.value)}
                    placeholder="e.g. Writing my first book · Launching a podcast · Building a fintech startup" />
                  <VisibilityToggle label="Show projects to other attendees"
                    checked={form.visibilityPrefs.showProjects !== false}
                    onChange={v => setVis("showProjects", v)} />
                </Field>
              </>)}

              {/* ── STEP 3: Your Direction ── */}
              {step === 3 && (<>
                <Field label="What are you currently doing?" note="required"
                  hint="A fuller picture of your day-to-day life right now — what you're building, leading, or navigating.">
                  <textarea className={textareaCls} rows={5} value={form.whatYouDo} onChange={e => set("whatYouDo", e.target.value)}
                    placeholder="Right now I'm running a marketing consultancy that works with mid-size African brands, while also co-hosting a weekly podcast on women and wealth…" />
                  <WordCount text={form.whatYouDo} />
                </Field>
                <Field label="What do you want to do next?" note="required"
                  hint="Your next chapter — the goal, pivot, dream, or door you're trying to open.">
                  <textarea className={textareaCls} rows={5} value={form.whatYouWantNext} onChange={e => set("whatYouWantNext", e.target.value)}
                    placeholder="In the next 12 months I want to close funding and go full-time on the startup, publish my first long-form piece, and build a proper creative community for women doing things like me." />
                  <WordCount text={form.whatYouWantNext} />
                  <VisibilityToggle label="Share these with other attendees"
                    checked={form.visibilityPrefs.showDirection !== false}
                    onChange={v => setVis("showDirection", v)} />
                </Field>
              </>)}

              {/* ── STEP 4: Story & Social ── */}
              {step === 4 && (<>
                <Field label="Short Bio" note="shown on your card"
                  hint="2–4 sentences. How would a friend who admires your work introduce you to the room?">
                  <textarea className={textareaCls} rows={5} value={form.shortBio} onChange={e => set("shortBio", e.target.value)}
                    placeholder="Patience is the founder of Woman of Taste — a lifestyle platform celebrating women who live with intention. She has spent 10 years at the intersection of food, culture, and community…" />
                  <WordCount text={form.shortBio} />
                </Field>
                <Field label="What brings you to this event?" note="optional">
                  <textarea className={textareaCls} rows={3} value={form.whatBringsYou} onChange={e => set("whatBringsYou", e.target.value)}
                    placeholder="What do you hope to take away from the High Tea?" />
                  <VisibilityToggle label="Share this with other attendees"
                    checked={form.visibilityPrefs.showWhatBringsYou === true}
                    onChange={v => setVis("showWhatBringsYou", v)} />
                </Field>
                <div className="space-y-4 pt-1">
                  <Field label="LinkedIn URL" note="optional">
                    <div className="relative">
                      <Linkedin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(225,50%,45%)]" />
                      <input className={`${inputCls} pl-9`} value={form.linkedinUrl} onChange={e => set("linkedinUrl", e.target.value)}
                        placeholder="https://linkedin.com/in/yourname" />
                    </div>
                    <VisibilityToggle label="Show LinkedIn to other attendees"
                      checked={form.visibilityPrefs.showLinkedin !== false}
                      onChange={v => setVis("showLinkedin", v)} />
                  </Field>
                  <Field label="Instagram Handle" note="optional">
                    <div className="relative">
                      <Instagram size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(350,30%,45%)]" />
                      <input className={`${inputCls} pl-9`} value={form.instagramHandle} onChange={e => set("instagramHandle", e.target.value)}
                        placeholder="@yourhandle" />
                    </div>
                    <VisibilityToggle label="Show Instagram to other attendees"
                      checked={form.visibilityPrefs.showInstagram !== false}
                      onChange={v => setVis("showInstagram", v)} />
                  </Field>
                </div>
              </>)}

              {/* ── STEP 5: Practical ── */}
              {step === 5 && (<>
                <div className="flex items-start gap-3 p-3 bg-[hsl(38,45%,95%)] rounded-xl">
                  <span className="text-base">🔒</span>
                  <p className="font-sans text-[11px] text-[hsl(28,18%,33%)] leading-relaxed">
                    This information is visible to organisers only and will <strong>never</strong> be shared with other attendees.
                  </p>
                </div>
                <Field label="Dietary Requirements" note="organisers only">
                  <input className={inputCls} value={form.dietaryRequirements} onChange={e => set("dietaryRequirements", e.target.value)}
                    placeholder="e.g. Vegetarian, Gluten-free, Halal, None" />
                </Field>
                <Field label="Mobile Number" note="organisers only"
                  hint="In case we need to reach you on the day.">
                  <input className={inputCls} type="tel" value={form.mobileNumber} onChange={e => set("mobileNumber", e.target.value)}
                    placeholder="+27 82 000 0000" />
                </Field>
              </>)}

              {/* ── STEP 6: Review & Submit ── */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {form.profilePhotoUrl ? (
                      <img src={form.profilePhotoUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[hsl(35,15%,85%)] flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[hsl(35,15%,90%)] flex items-center justify-center flex-shrink-0">
                        <Camera size={20} className="text-[hsl(28,18%,50%)]" />
                      </div>
                    )}
                    <div>
                      <p className="font-serif text-lg text-[hsl(225,50%,22%)]">{form.preferredName || form.fullName || "Your Name"}</p>
                      <p className="font-sans text-sm text-[hsl(28,18%,35%)]">{form.professionOrTitle}</p>
                      {form.companyOrVenture && <p className="font-sans text-xs text-[hsl(28,18%,48%)]">{form.companyOrVenture}</p>}
                      {form.city && <p className="font-sans text-xs text-[hsl(28,18%,52%)]">{form.city}</p>}
                    </div>
                  </div>
                  {[
                    { label: "Bio", val: form.shortBio?.slice(0, 140) },
                    { label: "Qualifications", val: form.qualifications },
                    { label: "Highlights", val: form.careerHighlights?.slice(0, 120) },
                    { label: "Passions", val: form.passions },
                    { label: "Skills", val: form.specialSkills },
                    { label: "Projects", val: form.currentProjects },
                    { label: "Currently", val: form.whatYouDo?.slice(0, 100) },
                    { label: "What's Next", val: form.whatYouWantNext?.slice(0, 100) },
                    { label: "LinkedIn", val: form.linkedinUrl },
                    { label: "Instagram", val: form.instagramHandle },
                    { label: "Dietary", val: form.dietaryRequirements, admin: true },
                    { label: "Mobile", val: form.mobileNumber, admin: true },
                  ].filter(r => r.val).map(({ label, val, admin }) => (
                    <div key={label} className="flex gap-3 border-t border-[hsl(35,15%,90%)] pt-3">
                      <span className="font-sans text-[10px] font-semibold tracking-[0.12em] uppercase text-[hsl(38,45%,48%)] w-24 flex-shrink-0 pt-0.5">{label}</span>
                      <span className="font-sans text-sm text-[hsl(28,18%,22%)] flex-1 leading-relaxed">{val}</span>
                      {admin && <span className="font-sans text-[9px] bg-[hsl(38,45%,92%)] text-[hsl(28,18%,45%)] px-2 py-0.5 rounded-full self-start flex-shrink-0">Private</span>}
                    </div>
                  ))}
                  <div className="border-t border-[hsl(35,15%,90%)] pt-4">
                    <p className="font-sans text-xs text-[hsl(28,18%,45%)] leading-relaxed">
                      By submitting, you confirm this information is accurate and give Woman of Taste permission to share your public profile with approved attendees. Your profile will be reviewed within 48 hours.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Tips panel — below card, above nav */}
          {step < 6 && (
            <div className="mt-4">
              <TipsPanel step={step} />
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between mt-5">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,42%)] hover:text-[hsl(225,50%,25%)] transition-colors py-3 px-4">
                <ChevronLeft size={14} /> Back
              </button>
            ) : <div />}

            {!isLastStep ? (
              <button onClick={nextStep} disabled={saving}
                className="flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.18em] uppercase bg-[hsl(225,50%,22%)] text-white px-7 py-3.5 rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors disabled:opacity-60">
                {saving && <Loader size={12} className="animate-spin" />}
                Save & Continue <ChevronRight size={13} />
              </button>
            ) : (
              <button onClick={submitProfile} disabled={saving}
                className="flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.18em] uppercase bg-[hsl(38,45%,42%)] text-white px-8 py-3.5 rounded-full hover:bg-[hsl(38,45%,36%)] transition-colors disabled:opacity-60">
                {saving ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                Submit Application
              </button>
            )}
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => i < step && setStep(i)}
                className={`rounded-full transition-all ${i === step ? "w-5 h-1.5 bg-[hsl(225,50%,35%)]" : i < step ? "w-1.5 h-1.5 bg-[hsl(38,45%,50%)] cursor-pointer" : "w-1.5 h-1.5 bg-[hsl(35,15%,82%)]"}`} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
