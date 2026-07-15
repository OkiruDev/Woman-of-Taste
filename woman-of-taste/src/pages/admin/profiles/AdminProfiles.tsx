import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, Search, Eye, Linkedin, Instagram, ChevronDown, Users } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { adminFetch } from "../AdminLogin";

interface Profile {
  id: number;
  userId: number;
  email: string;
  fullName: string | null;
  preferredName: string | null;
  profilePhotoUrl: string | null;
  shortBio: string | null;
  city: string | null;
  professionOrTitle: string | null;
  companyOrVenture: string | null;
  linkedinUrl: string | null;
  instagramHandle: string | null;
  whatBringsYou: string | null;
  dietaryRequirements: string | null;
  mobileNumber: string | null;
  profileStatus: string;
  profileRole: string;
  speakerTopic: string | null;
  speakerOrder: number | null;
  approvedAt: string | null;
  approvedBy: string | null;
  declinedReason: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-[hsl(28,18%,40%)]", bg: "bg-[hsl(35,15%,90%)]" },
  submitted: { label: "Submitted", color: "text-[hsl(38,45%,30%)]", bg: "bg-[hsl(38,45%,90%)]" },
  approved: { label: "Approved", color: "text-[hsl(140,40%,28%)]", bg: "bg-[hsl(140,35%,90%)]" },
  declined: { label: "Declined", color: "text-[hsl(0,50%,35%)]", bg: "bg-[hsl(0,40%,92%)]" },
  waitlisted: { label: "Waitlisted", color: "text-[hsl(225,50%,35%)]", bg: "bg-[hsl(225,40%,92%)]" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return <span className={`font-sans text-[10px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
}

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineInput, setShowDeclineInput] = useState(false);
  const [acting, setActing] = useState(false);
  const [roleEdit, setRoleEdit] = useState<{ role: string; topic: string; order: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await adminFetch("/admin/profiles");
      const d = await r.json();
      if (d.ok) setProfiles(d.profiles);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(profileId: number, action: "approve" | "decline" | "waitlist", extra?: object) {
    setActing(true);
    try {
      await adminFetch(`/admin/profiles/${profileId}/${action}`, {
        method: "POST",
        body: JSON.stringify(extra ?? {}),
      });
      await load();
      setSelected(s => s?.id === profileId ? null : s);
      setShowDeclineInput(false); setDeclineReason("");
    } finally { setActing(false); }
  }

  async function updateRole(profileId: number) {
    if (!roleEdit) return;
    setActing(true);
    try {
      await adminFetch(`/admin/profiles/${profileId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ profileRole: roleEdit.role, speakerTopic: roleEdit.topic, speakerOrder: Number(roleEdit.order) || null }),
      });
      await load();
      setRoleEdit(null);
    } finally { setActing(false); }
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || [p.fullName, p.preferredName, p.email, p.professionOrTitle, p.city].some(v => v?.toLowerCase().includes(q));
    const matchStatus = filterStatus === "all" || p.profileStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = Object.fromEntries(
    ["submitted", "approved", "declined", "waitlisted", "draft"].map(s => [s, profiles.filter(p => p.profileStatus === s).length])
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl text-[hsl(225,50%,22%)]">High Tea Profiles</h1>
            <p className="font-sans text-sm text-[hsl(28,18%,40%)] mt-0.5">Buitengeluk · 22 August 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[hsl(28,18%,50%)]" />
            <span className="font-sans text-sm text-[hsl(28,18%,40%)]">{profiles.length} total</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {["submitted", "approved", "waitlisted", "declined", "draft"].map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                className={`rounded-xl p-3 text-left border transition-all ${filterStatus === s ? "border-[hsl(225,50%,35%)] shadow-sm" : "border-[hsl(35,15%,88%)] bg-white hover:border-[hsl(225,50%,35%)]"}`}>
                <p className={`font-sans text-2xl font-light ${cfg.color}`}>{counts[s] ?? 0}</p>
                <p className="font-sans text-[10px] tracking-[0.1em] uppercase text-[hsl(28,18%,40%)] mt-0.5">{cfg.label}</p>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(28,18%,50%)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, city…"
              className="w-full font-sans text-sm pl-9 pr-4 py-2.5 border border-[hsl(35,15%,85%)] rounded-xl focus:outline-none focus:border-[hsl(225,50%,40%)] transition-colors bg-white" />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center font-sans text-sm text-[hsl(28,18%,40%)]">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center font-sans text-sm text-[hsl(28,18%,40%)]">No profiles found.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <motion.div key={p.id} layout
                className="bg-white border border-[hsl(35,15%,88%)] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  {p.profilePhotoUrl ? (
                    <img src={p.profilePhotoUrl} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-[hsl(35,15%,88%)]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(225,40%,70%)] to-[hsl(225,50%,50%)] flex items-center justify-center flex-shrink-0">
                      <span className="font-serif text-lg text-white">{(p.preferredName ?? p.fullName ?? "?")[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-base text-[hsl(225,50%,22%)] font-medium">{p.preferredName ?? p.fullName ?? "–"}</span>
                      <StatusBadge status={p.profileStatus} />
                      {p.profileRole !== "attendee" && (
                        <span className="font-sans text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full bg-[hsl(38,45%,90%)] text-[hsl(38,40%,30%)] capitalize">{p.profileRole}</span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-[hsl(28,18%,40%)]">{p.professionOrTitle}{p.companyOrVenture ? ` · ${p.companyOrVenture}` : ""}</p>
                    <p className="font-sans text-xs text-[hsl(28,18%,50%)]">{p.email}{p.city ? ` · ${p.city}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.profileStatus === "submitted" && (
                      <>
                        <button onClick={() => act(p.id, "approve")} disabled={acting}
                          className="flex items-center gap-1 font-sans text-[10px] font-semibold tracking-[0.1em] uppercase bg-[hsl(140,40%,42%)] text-white px-3 py-2 rounded-lg hover:bg-[hsl(140,40%,36%)] transition-colors disabled:opacity-50">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => { setSelected(selected?.id === p.id ? null : p); setShowDeclineInput(false); }}
                          className="flex items-center gap-1 font-sans text-[10px] font-semibold tracking-[0.1em] uppercase bg-[hsl(35,15%,90%)] text-[hsl(28,18%,35%)] px-3 py-2 rounded-lg hover:bg-[hsl(35,15%,84%)] transition-colors">
                          <Eye size={12} /> View
                        </button>
                      </>
                    )}
                    {p.profileStatus !== "submitted" && (
                      <button onClick={() => { setSelected(selected?.id === p.id ? null : p); setShowDeclineInput(false); }}
                        className="flex items-center gap-1 font-sans text-[10px] font-semibold tracking-[0.1em] uppercase bg-[hsl(35,15%,90%)] text-[hsl(28,18%,35%)] px-3 py-2 rounded-lg hover:bg-[hsl(35,15%,84%)] transition-colors">
                        <Eye size={12} /> View
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {selected?.id === p.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-[hsl(35,15%,90%)]">
                      <div className="p-5 grid sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          {[
                            { label: "Full Name", val: p.fullName },
                            { label: "City", val: p.city },
                            { label: "Bio", val: p.shortBio },
                            { label: "What Brings You", val: p.whatBringsYou },
                          ].map(({ label, val }) => val && (
                            <div key={label}>
                              <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-[hsl(38,45%,50%)] mb-0.5">{label}</p>
                              <p className="font-sans text-sm text-[hsl(28,18%,20%)] leading-relaxed">{val}</p>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            {p.linkedinUrl && <a href={p.linkedinUrl} target="_blank" rel="noopener" className="flex items-center gap-1 font-sans text-xs text-[hsl(225,50%,35%)] underline"><Linkedin size={12} /> LinkedIn</a>}
                            {p.instagramHandle && <a href={`https://instagram.com/${p.instagramHandle.replace("@", "")}`} target="_blank" rel="noopener" className="flex items-center gap-1 font-sans text-xs text-[hsl(350,30%,40%)] underline"><Instagram size={12} /> {p.instagramHandle}</a>}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-[hsl(38,45%,95%)] rounded-xl p-3 space-y-2">
                            <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-[hsl(38,40%,35%)] mb-1">Admin Only</p>
                            {[{ label: "Dietary", val: p.dietaryRequirements }, { label: "Mobile", val: p.mobileNumber }, { label: "Email", val: p.email }].map(({ label, val }) => val && (
                              <div key={label}><span className="font-sans text-[10px] uppercase text-[hsl(28,18%,45%)]">{label}: </span><span className="font-sans text-sm text-[hsl(28,18%,20%)]">{val}</span></div>
                            ))}
                          </div>

                          <div className="border border-[hsl(35,15%,88%)] rounded-xl p-3">
                            <p className="font-sans text-[10px] font-semibold tracking-[0.15em] uppercase text-[hsl(28,18%,40%)] mb-2">Role</p>
                            {roleEdit ? (
                              <div className="space-y-2">
                                <select value={roleEdit.role} onChange={e => setRoleEdit(r => r ? { ...r, role: e.target.value } : r)}
                                  className="w-full font-sans text-sm border border-[hsl(35,15%,85%)] rounded-lg px-3 py-2 focus:outline-none">
                                  {["attendee", "speaker", "host"].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                                </select>
                                {roleEdit.role === "speaker" && (
                                  <>
                                    <input value={roleEdit.topic} onChange={e => setRoleEdit(r => r ? { ...r, topic: e.target.value } : r)}
                                      placeholder="Speaking topic" className="w-full font-sans text-sm border border-[hsl(35,15%,85%)] rounded-lg px-3 py-2 focus:outline-none" />
                                    <input value={roleEdit.order} onChange={e => setRoleEdit(r => r ? { ...r, order: e.target.value } : r)}
                                      placeholder="Order (1, 2, 3…)" type="number" className="w-full font-sans text-sm border border-[hsl(35,15%,85%)] rounded-lg px-3 py-2 focus:outline-none" />
                                  </>
                                )}
                                <div className="flex gap-2">
                                  <button onClick={() => updateRole(p.id)} disabled={acting} className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase bg-[hsl(225,50%,22%)] text-white px-3 py-1.5 rounded-lg">Save</button>
                                  <button onClick={() => setRoleEdit(null)} className="font-sans text-[10px] uppercase text-[hsl(28,18%,40%)]">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setRoleEdit({ role: p.profileRole, topic: p.speakerTopic ?? "", order: String(p.speakerOrder ?? "") })}
                                className="flex items-center gap-1 font-sans text-xs text-[hsl(225,50%,35%)] underline capitalize">
                                {p.profileRole} <ChevronDown size={12} />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {p.profileStatus === "submitted" && (
                              <>
                                <button onClick={() => act(p.id, "approve")} disabled={acting}
                                  className="flex items-center gap-1 font-sans text-[10px] font-bold tracking-[0.1em] uppercase bg-[hsl(140,40%,42%)] text-white px-3 py-2 rounded-lg hover:bg-[hsl(140,40%,36%)] transition-colors">
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button onClick={() => act(p.id, "waitlist")} disabled={acting}
                                  className="flex items-center gap-1 font-sans text-[10px] font-bold tracking-[0.1em] uppercase bg-[hsl(225,40%,82%)] text-[hsl(225,50%,25%)] px-3 py-2 rounded-lg hover:bg-[hsl(225,40%,75%)] transition-colors">
                                  <Clock size={12} /> Waitlist
                                </button>
                                <button onClick={() => setShowDeclineInput(v => !v)}
                                  className="flex items-center gap-1 font-sans text-[10px] font-bold tracking-[0.1em] uppercase bg-[hsl(0,40%,92%)] text-[hsl(0,50%,35%)] px-3 py-2 rounded-lg hover:bg-[hsl(0,40%,86%)] transition-colors">
                                  <XCircle size={12} /> Decline
                                </button>
                              </>
                            )}
                            {p.profileStatus === "approved" && (
                              <button onClick={() => setShowDeclineInput(v => !v)}
                                className="flex items-center gap-1 font-sans text-[10px] font-bold tracking-[0.1em] uppercase bg-[hsl(0,40%,92%)] text-[hsl(0,50%,35%)] px-3 py-2 rounded-lg">
                                <XCircle size={12} /> Decline
                              </button>
                            )}
                          </div>
                          {showDeclineInput && (
                            <div className="space-y-2">
                              <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={2}
                                placeholder="Internal reason (not sent to applicant)"
                                className="w-full font-sans text-sm border border-[hsl(35,15%,85%)] rounded-xl px-3 py-2 focus:outline-none resize-none" />
                              <button onClick={() => act(p.id, "decline", { reason: declineReason })} disabled={acting}
                                className="font-sans text-[10px] font-bold tracking-[0.1em] uppercase bg-[hsl(0,50%,42%)] text-white px-4 py-2 rounded-lg hover:bg-[hsl(0,50%,36%)] transition-colors">
                                Confirm Decline
                              </button>
                            </div>
                          )}
                          {p.declinedReason && (
                            <div className="bg-[hsl(0,40%,96%)] rounded-lg p-2">
                              <p className="font-sans text-[10px] uppercase text-[hsl(0,50%,45%)] mb-0.5">Decline reason</p>
                              <p className="font-sans text-xs text-[hsl(28,18%,30%)]">{p.declinedReason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
