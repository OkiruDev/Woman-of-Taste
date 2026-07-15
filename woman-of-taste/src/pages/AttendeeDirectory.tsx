import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Linkedin, Instagram, MapPin, Loader, Lock, X, Briefcase, Sparkles, Compass } from "lucide-react";
import Layout from "@/components/Layout";
import { useUserAuth, apiFetch } from "@/hooks/useUserAuth";
import SignInModal from "@/components/SignInModal";

interface Attendee {
  id: number;
  userId: number;
  preferredName: string | null;
  fullName: string | null;
  profilePhotoUrl: string | null;
  shortBio: string | null;
  city: string | null;
  professionOrTitle: string | null;
  companyOrVenture: string | null;
  qualifications: string | null;
  careerHighlights: string | null;
  passions: string | null;
  currentProjects: string | null;
  specialSkills: string | null;
  whatYouDo: string | null;
  whatYouWantNext: string | null;
  linkedinUrl: string | null;
  instagramHandle: string | null;
  whatBringsYou: string | null;
  profileRole: string;
  speakerTopic: string | null;
  speakerOrder: number | null;
  visibilityPrefs: Record<string, boolean> | null;
}

const roleBadge: Record<string, { label: string; color: string }> = {
  host: { label: "Host", color: "bg-[hsl(38,45%,92%)] text-[hsl(38,40%,30%)]" },
  speaker: { label: "Speaker", color: "bg-[hsl(225,40%,92%)] text-[hsl(225,50%,30%)]" },
};

function AttendeeCard({ a, onClick }: { a: Attendee; onClick: () => void }) {
  const badge = roleBadge[a.profileRole];
  const vis = a.visibilityPrefs ?? {};
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} viewport={{ once: true }}
      onClick={onClick}
      className="bg-white rounded-2xl border border-[hsl(35,15%,88%)] shadow-sm p-6 cursor-pointer hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        {a.profilePhotoUrl ? (
          <img src={a.profilePhotoUrl} alt={a.preferredName ?? ""} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-[hsl(35,15%,88%)]" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(225,40%,75%)] to-[hsl(225,50%,55%)] flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-xl text-white">{(a.preferredName ?? a.fullName ?? "?")[0]}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="font-serif text-base font-medium text-[hsl(225,50%,22%)] group-hover:text-[hsl(38,45%,40%)] transition-colors truncate">
              {a.preferredName ?? a.fullName}
            </h3>
            {badge && <span className={`font-sans text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${badge.color}`}>{badge.label}</span>}
          </div>
          <p className="font-sans text-xs text-[hsl(28,18%,35%)] truncate">{a.professionOrTitle}</p>
          {vis.showCompany !== false && a.companyOrVenture && (
            <p className="font-sans text-xs text-[hsl(28,18%,45%)] truncate">{a.companyOrVenture}</p>
          )}
          {a.city && <p className="font-sans text-[10px] text-[hsl(28,18%,52%)] flex items-center gap-1 mt-1.5"><MapPin size={10} />{a.city}</p>}
        </div>
      </div>
      {a.passions && (
        <p className="font-sans text-[11px] text-[hsl(28,18%,40%)] mt-3 border-t border-[hsl(35,15%,92%)] pt-3 line-clamp-2">
          ✦ {a.passions}
        </p>
      )}
      {a.speakerTopic && !a.passions && (
        <p className="font-sans text-[11px] italic text-[hsl(225,40%,45%)] mt-3 border-t border-[hsl(35,15%,90%)] pt-3">"{a.speakerTopic}"</p>
      )}
    </motion.div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[hsl(35,15%,90%)] pt-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[hsl(38,45%,48%)]">{icon}</span>
        <p className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[hsl(38,45%,48%)]">{title}</p>
      </div>
      {children}
    </div>
  );
}

function AttendeeDrawer({ a, onClose }: { a: Attendee; onClose: () => void }) {
  const badge = roleBadge[a.profileRole];
  const vis = a.visibilityPrefs ?? {};

  return (
    <motion.div className="fixed inset-0 z-[100] flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative ml-auto w-full max-w-md h-full bg-[hsl(40,25%,98%)] overflow-y-auto shadow-2xl flex flex-col"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>

        {/* Header */}
        <div className="bg-[hsl(225,50%,22%)] p-8 flex-shrink-0">
          <button onClick={onClose} className="flex items-center gap-1.5 text-white/50 hover:text-white font-sans text-xs mb-6 transition-colors">
            <X size={12} /> Close
          </button>
          {a.profilePhotoUrl ? (
            <img src={a.profilePhotoUrl} alt={a.preferredName ?? ""} className="w-24 h-24 rounded-full object-cover border-4 border-white/20 mx-auto mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(225,40%,55%)] to-[hsl(225,50%,35%)] flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
              <span className="font-serif text-4xl text-white">{(a.preferredName ?? a.fullName ?? "?")[0]}</span>
            </div>
          )}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
              <h2 className="font-serif text-2xl font-light text-[hsl(40,25%,96%)]">{a.preferredName ?? a.fullName}</h2>
              {badge && <span className={`font-sans text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>}
            </div>
            <p className="font-sans text-sm text-[hsl(40,25%,75%)]">{a.professionOrTitle}</p>
            {vis.showCompany !== false && a.companyOrVenture && (
              <p className="font-sans text-xs text-[hsl(40,25%,62%)] mt-0.5">{a.companyOrVenture}</p>
            )}
            {a.city && (
              <p className="font-sans text-xs text-[hsl(40,25%,58%)] flex items-center justify-center gap-1 mt-1.5">
                <MapPin size={10} />{a.city}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-0 flex-1">

          {a.speakerTopic && (
            <div className="bg-[hsl(225,40%,95%)] rounded-xl p-4 mb-5">
              <p className="font-sans text-[10px] font-semibold tracking-[0.2em] uppercase text-[hsl(225,50%,40%)] mb-1">Speaking On</p>
              <p className="font-serif text-base italic text-[hsl(225,50%,25%)]">"{a.speakerTopic}"</p>
            </div>
          )}

          {a.shortBio && (
            <div className="pb-5 border-b border-[hsl(35,15%,90%)]">
              <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed">{a.shortBio}</p>
            </div>
          )}

          {/* Career */}
          {(a.qualifications || a.careerHighlights) && (
            <Section icon={<Briefcase size={12} />} title="Career">
              {a.qualifications && (
                <div className="mb-3">
                  <p className="font-sans text-[10px] font-semibold text-[hsl(28,18%,45%)] mb-1">Qualifications</p>
                  <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed">{a.qualifications}</p>
                </div>
              )}
              {a.careerHighlights && (
                <div>
                  <p className="font-sans text-[10px] font-semibold text-[hsl(28,18%,45%)] mb-1">Highlights</p>
                  <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed whitespace-pre-line">{a.careerHighlights}</p>
                </div>
              )}
            </Section>
          )}

          {/* Passions & Skills */}
          {(a.passions || a.specialSkills || (vis.showProjects !== false && a.currentProjects)) && (
            <Section icon={<Sparkles size={12} />} title="Passions & Skills">
              {a.passions && (
                <div className="mb-3">
                  <p className="font-sans text-[10px] font-semibold text-[hsl(28,18%,45%)] mb-1">Passions</p>
                  <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed">{a.passions}</p>
                </div>
              )}
              {a.specialSkills && (
                <div className="mb-3">
                  <p className="font-sans text-[10px] font-semibold text-[hsl(28,18%,45%)] mb-1">Special Skills</p>
                  <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed">{a.specialSkills}</p>
                </div>
              )}
              {vis.showProjects !== false && a.currentProjects && (
                <div>
                  <p className="font-sans text-[10px] font-semibold text-[hsl(28,18%,45%)] mb-1">Current Projects</p>
                  <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed">{a.currentProjects}</p>
                </div>
              )}
            </Section>
          )}

          {/* Direction */}
          {vis.showDirection !== false && (a.whatYouDo || a.whatYouWantNext) && (
            <Section icon={<Compass size={12} />} title="Her Direction">
              {a.whatYouDo && (
                <div className="mb-4">
                  <p className="font-sans text-[10px] font-semibold text-[hsl(28,18%,45%)] mb-1.5">Currently</p>
                  <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed">{a.whatYouDo}</p>
                </div>
              )}
              {a.whatYouWantNext && (
                <div>
                  <p className="font-sans text-[10px] font-semibold text-[hsl(28,18%,45%)] mb-1.5">What's Next</p>
                  <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed italic text-[hsl(225,40%,30%)]">{a.whatYouWantNext}</p>
                </div>
              )}
            </Section>
          )}

          {/* What brings her */}
          {vis.showWhatBringsYou && a.whatBringsYou && (
            <Section icon={<span className="text-xs">✦</span>} title="What Brings Her">
              <p className="font-sans text-sm text-[hsl(28,18%,22%)] leading-relaxed italic">{a.whatBringsYou}</p>
            </Section>
          )}

          {/* Social links */}
          {(vis.showLinkedin !== false && a.linkedinUrl || vis.showInstagram !== false && a.instagramHandle) && (
            <div className="border-t border-[hsl(35,15%,90%)] pt-5 flex gap-3 flex-wrap">
              {vis.showLinkedin !== false && a.linkedinUrl && (
                <a href={a.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-xs font-semibold text-[hsl(225,50%,35%)] border border-[hsl(225,50%,35%)] px-4 py-2 rounded-full hover:bg-[hsl(225,50%,35%)] hover:text-white transition-colors">
                  <Linkedin size={13} /> LinkedIn
                </a>
              )}
              {vis.showInstagram !== false && a.instagramHandle && (
                <a href={`https://instagram.com/${a.instagramHandle.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-xs font-semibold text-[hsl(350,30%,40%)] border border-[hsl(350,30%,40%)] px-4 py-2 rounded-full hover:bg-[hsl(350,30%,40%)] hover:text-white transition-colors">
                  <Instagram size={13} /> {a.instagramHandle}
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AttendeeDirectory() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, profile, loading: authLoading } = useUserAuth();
  const [, navigate] = useLocation();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [selected, setSelected] = useState<Attendee | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    if (profile && profile.profileStatus !== "approved") { setLoading(false); return; }
    apiFetch(`/events/${eventId}/attendees`)
      .then(r => r.json())
      .then(d => { if (d.ok) setAttendees(d.attendees); else setError(d.error ?? "Failed to load."); })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [user, profile, authLoading, eventId]);

  const cities = ["all", ...Array.from(new Set(attendees.map(a => a.city).filter(Boolean) as string[]))];

  const filtered = attendees.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || [a.preferredName, a.fullName, a.professionOrTitle, a.companyOrVenture, a.passions, a.specialSkills].some(v => v?.toLowerCase().includes(q));
    const matchRole = filterRole === "all" || a.profileRole === filterRole;
    const matchCity = filterCity === "all" || a.city === filterCity;
    return matchSearch && matchRole && matchCity;
  });

  if (authLoading || loading) return (
    <Layout title="The Room"><div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-[hsl(225,50%,22%)]" size={32} /></div></Layout>
  );

  if (!user) return (
    <Layout title="The Room">
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,25%,96%)] px-6">
        <div className="max-w-sm text-center">
          <Lock size={48} className="text-[hsl(225,50%,35%)] mx-auto mb-6 opacity-60" />
          <h1 className="font-serif text-3xl text-[hsl(225,50%,22%)] mb-3">Members Only</h1>
          <p className="font-sans text-sm text-[hsl(28,18%,35%)] mb-6">Sign in to access the attendee room.</p>
          <button onClick={() => setShowSignIn(true)} className="font-sans text-[11px] font-bold tracking-[0.2em] uppercase bg-[hsl(225,50%,22%)] text-white px-8 py-3.5 rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors">
            Sign In
          </button>
        </div>
      </div>
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} onSuccess={() => navigate(`/events/${eventId}/attendees`)} />
    </Layout>
  );

  if (profile?.profileStatus !== "approved") return (
    <Layout title="The Room">
      <div className="min-h-screen flex items-center justify-center bg-[hsl(40,25%,96%)] px-6">
        <div className="max-w-sm text-center">
          <Lock size={48} className="text-[hsl(225,50%,35%)] mx-auto mb-6 opacity-60" />
          <h1 className="font-serif text-3xl text-[hsl(225,50%,22%)] mb-3">Access Pending</h1>
          <p className="font-sans text-sm text-[hsl(28,18%,35%)] leading-relaxed">
            {profile?.profileStatus === "submitted"
              ? "Your application is under review. You'll receive an email once confirmed."
              : "Complete and submit your profile to access the attendee room."}
          </p>
          {(!profile?.profileStatus || profile.profileStatus === "draft") && (
            <button onClick={() => navigate("/profile/setup")} className="mt-6 font-sans text-[11px] font-bold tracking-[0.2em] uppercase bg-[hsl(225,50%,22%)] text-white px-8 py-3.5 rounded-full hover:bg-[hsl(225,50%,18%)] transition-colors">
              Complete Profile
            </button>
          )}
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout title="The Room — High Tea at Buitengeluk">
      <div className="min-h-screen bg-[hsl(40,25%,96%)] pt-24 pb-20">
        <section className="bg-[hsl(225,50%,22%)] pt-28 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at top right, hsl(38,45%,60%), transparent 60%)" }} />
          <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
            <span className="font-sans text-[11px] font-semibold tracking-[0.3em] uppercase text-[hsl(38,45%,55%)] mb-3 block">16 June 2026 · Buitengeluk, Broadacres</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-[hsl(40,25%,96%)] mb-3">The Room</h1>
            <p className="font-sans text-sm text-[hsl(40,25%,75%)]">{attendees.length} women joining us</p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 -mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[hsl(35,15%,88%)] p-4 flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(28,18%,50%)]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, profession, passions…"
                className="w-full font-sans text-sm pl-9 pr-4 py-2.5 border border-[hsl(35,15%,85%)] rounded-xl focus:outline-none focus:border-[hsl(225,50%,40%)] transition-colors" />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="font-sans text-xs border border-[hsl(35,15%,85%)] rounded-xl px-3 py-2.5 bg-white focus:outline-none">
              <option value="all">All Roles</option>
              <option value="host">Host</option>
              <option value="speaker">Speaker</option>
              <option value="attendee">Attendee</option>
            </select>
            {cities.length > 2 && (
              <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="font-sans text-xs border border-[hsl(35,15%,85%)] rounded-xl px-3 py-2.5 bg-white focus:outline-none">
                {cities.map(c => <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 mt-8">
          {error && <p className="font-sans text-sm text-red-600 mb-6">{error}</p>}
          {filtered.length === 0 ? (
            <p className="font-serif text-xl text-[hsl(28,18%,40%)] text-center py-16">No attendees found.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(a => <AttendeeCard key={a.id} a={a} onClick={() => setSelected(a)} />)}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && <AttendeeDrawer a={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </Layout>
  );
}
