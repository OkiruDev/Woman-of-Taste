import { useEffect, useState } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { Save, CheckCircle, XCircle, AlertTriangle, Target, Eye, EyeOff, Bot, Cpu, Bell, Send, Calendar } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import RandIcon from "../../../components/RandIcon";

const INPUT = { padding: "0.65rem 0.9rem", border: "1px solid #ddd", borderRadius: 8, fontSize: "0.85rem", fontFamily: "Raleway, sans-serif", outline: "none", width: "100%", boxSizing: "border-box" as const };
const LABEL = { display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#666", marginBottom: 4 };
const BTN = (bg: string, color = "white") => ({ background: bg, color, border: "none", borderRadius: 8, padding: "0.6rem 1.1rem", fontSize: "0.8rem", fontWeight: 600 as const, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Raleway, sans-serif" });
const NAVY = "hsl(225,50%,22%)";

const DEFAULT_SETTINGS: Record<string, string> = {
  siteName: "Woman of Taste",
  contactEmail: "info@womanoftaste.co.za",
  businessAddress: "Johannesburg, South Africa",
  instagramUrl: "https://instagram.com/pashieb_the_wot",
  tiktokUrl: "https://tiktok.com/@pashieb_the_wot",
  facebookUrl: "",
  senderName: "Woman of Taste",
  testSendAddress: "",
  defaultSignature: "Woman of Taste | info@womanoftaste.co.za | womanoftaste.co.za",
  // Growth targets
  target_monthly_revenue: "",
  target_monthly_contacts: "",
  target_monthly_bookings: "",
  target_email_open_rate: "",
  target_conversion_rate: "",
  target_tiktok_followers: "",
  target_instagram_followers: "",
  // AI configuration
  ai_provider: "anthropic",
  openai_api_key: "",
  openai_model: "gpt-5-mini",
};

function IntegrationRow({ name, connected, detail }: { name: string; connected: boolean; detail: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 0", borderBottom: "1px solid #f0f0f5", flexWrap: "wrap", gap: 8 }}>
      <div>
        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#333" }}>{name}</div>
        <div style={{ fontSize: "0.75rem", color: "#888" }}>{detail}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {connected ? <CheckCircle size={16} style={{ color: "#16a34a" }} /> : <XCircle size={16} style={{ color: "#dc2626" }} />}
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: connected ? "#16a34a" : "#dc2626" }}>{connected ? "Connected" : "Not Connected"}</span>
      </div>
    </div>
  );
}

function Section({ title, onSave, saved, children }: {
  title: string; onSave?: () => void; saved?: boolean; children: React.ReactNode;
}) {
  return (
    <section style={{ background: "white", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.2rem", color: NAVY }}>{title}</h3>
        {onSave && (
          <button onClick={onSave} style={BTN(saved ? "#16a34a" : NAVY)}>
            <Save size={14} />{saved ? "Saved ✓" : "Save"}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function TargetInput({ label, icon, value, onChange, placeholder, suffix, hint }: {
  label: string; icon?: React.ReactNode; value: string;
  onChange: (v: string) => void; placeholder?: string; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && (
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#888", display: "flex" }}>
            {icon}
          </div>
        )}
        <input
          type="number" min="0" value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? "Not set"}
          style={{ ...INPUT, paddingLeft: icon ? 30 : undefined, paddingRight: suffix ? 40 : undefined }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: "0.8rem", fontWeight: 600, pointerEvents: "none" }}>{suffix}</span>
        )}
      </div>
      {hint && <div style={{ fontSize: "0.68rem", color: "#aaa", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

export default function Settings() {
  useAdminAuth();
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderResult, setReminderResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [socialSending, setSocialSending] = useState(false);
  const [socialResult, setSocialResult] = useState<{ ok: boolean; message: string } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    adminFetch("/admin/settings").then(r => r.json()).then(d => {
      if (d.ok) setSettings(prev => ({ ...prev, ...d.settings }));
    }).finally(() => setLoading(false));
  }, []);

  async function saveSettings() {
    await adminFetch("/admin/settings", { method: "PATCH", body: JSON.stringify(settings) });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  async function changePassword() {
    setPwStatus("");
    if (pw.newPw !== pw.confirm) { setPwStatus("New passwords do not match."); return; }
    if (pw.newPw.length < 6) { setPwStatus("Password must be at least 6 characters."); return; }
    const res = await adminFetch("/admin/settings/password", { method: "POST", body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw }) });
    const d = await res.json();
    setPwStatus(d.error ?? (d.ok ? "Password changed." : "Error."));
  }

  function set(k: string, v: string) { setSettings(p => ({ ...p, [k]: v })); }

  async function sendSocialNow() {
    setSocialSending(true); setSocialResult(null);
    try {
      const res = await adminFetch("/admin/social-reminder/send", { method: "POST" });
      const d = await res.json();
      setSocialResult(d.ok
        ? { ok: true, message: "Social reminder sent! Check info@womanoftaste.co.za for your monthly post ideas." }
        : { ok: false, message: d.error ?? "Failed to send." });
    } catch { setSocialResult({ ok: false, message: "Could not reach server." }); }
    finally { setSocialSending(false); }
  }

  async function sendReminderNow() {
    setReminderSending(true); setReminderResult(null);
    try {
      const res = await adminFetch("/admin/content-reminder/send", { method: "POST" });
      const d = await res.json();
      setReminderResult(d.ok
        ? { ok: true, message: "Reminder sent! Check your inbox at info@womanoftaste.co.za." }
        : { ok: false, message: d.error ?? "Failed to send." });
    } catch { setReminderResult({ ok: false, message: "Could not reach server." }); }
    finally { setReminderSending(false); }
  }

  async function testOpenAIKey() {
    const key = settings["openai_api_key"] ?? "";
    if (!key) { setKeyTestResult({ ok: false, message: "Enter an API key first." }); return; }
    setTestingKey(true); setKeyTestResult(null);
    try {
      const res = await adminFetch("/admin/settings/test-openai", { method: "POST", body: JSON.stringify({ key }) });
      const d = await res.json();
      setKeyTestResult(d.ok ? { ok: true, message: "Key is valid and working." } : { ok: false, message: d.error ?? "Key test failed." });
    } catch { setKeyTestResult({ ok: false, message: "Could not reach server." }); }
    finally { setTestingKey(false); }
  }

  const grid2 = { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.85rem" } as React.CSSProperties;

  const hasOpenAIKey = (settings["openai_api_key"] ?? "").length > 0;
  const INTEGRATIONS = [
    { name: "Zoho Mail SMTP", connected: true, detail: "smtppro.zoho.com · info@womanoftaste.co.za" },
    { name: "Booking System", connected: true, detail: "PostgreSQL database · Active" },
    { name: "AI Insights (Anthropic)", connected: true, detail: "Powers AI analytics insights · Replit AI Integrations" },
    { name: "AI Insights (OpenAI)", connected: hasOpenAIKey, detail: hasOpenAIKey ? `OpenAI ${settings["openai_model"] ?? "gpt-5-mini"} · API key saved` : "Add your OpenAI API key in AI Configuration below" },
    { name: "Google Analytics (GA4)", connected: false, detail: "Add GA4_PROPERTY_ID + GA4_CREDENTIALS to Replit Secrets" },
    { name: "TikTok API", connected: false, detail: "Add TIKTOK_CLIENT_KEY + TIKTOK_ACCESS_TOKEN to Replit Secrets" },
    { name: "Instagram API", connected: false, detail: "Add INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_ACCOUNT_ID to Replit Secrets" },
  ];

  if (loading) return <AdminLayout title="Settings"><div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading settings…</div></AdminLayout>;

  return (
    <AdminLayout title="Settings">
      <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* General */}
        <Section title="General" onSave={saveSettings} saved={saved}>
          <div style={grid2}>
            {[["siteName", "Site Name"], ["contactEmail", "Contact Email"], ["businessAddress", "Business Address"], ["instagramUrl", "Instagram URL"], ["tiktokUrl", "TikTok URL"], ["facebookUrl", "Facebook URL"]].map(([k, l]) => (
              <div key={k}>
                <label style={LABEL}>{l}</label>
                <input value={settings[k] ?? ""} onChange={e => set(k, e.target.value)} style={INPUT} />
              </div>
            ))}
          </div>
        </Section>

        {/* Growth Targets */}
        <Section title="Growth Targets" onSave={saveSettings} saved={saved}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0.75rem 1rem", background: "hsl(38,45%,65%,0.1)", borderRadius: 8, marginBottom: "1.25rem", border: "1px solid hsl(38,45%,65%,0.3)" }}>
            <Target size={15} style={{ color: "hsl(38,35%,45%)", marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: "0.8rem", color: "hsl(38,35%,35%)", margin: 0, lineHeight: 1.5 }}>
              Set your monthly growth targets here. The AI Insights engine on the Analytics page uses these to benchmark your performance and generate personalised recommendations.
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.75rem" }}>Financial</div>
            <div style={grid2}>
              <TargetInput
                label="Monthly Revenue Target"
                icon={<RandIcon size={14} />}
                value={settings["target_monthly_revenue"] ?? ""}
                onChange={v => set("target_monthly_revenue", v)}
                placeholder="e.g. 15000"
                hint="Total ticket revenue to collect per month (ZAR)"
              />
              <TargetInput
                label="Monthly Bookings Target"
                value={settings["target_monthly_bookings"] ?? ""}
                onChange={v => set("target_monthly_bookings", v)}
                placeholder="e.g. 30"
                hint="Number of paid bookings per month"
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.75rem" }}>Audience</div>
            <div style={grid2}>
              <TargetInput
                label="New Contacts per Month"
                value={settings["target_monthly_contacts"] ?? ""}
                onChange={v => set("target_monthly_contacts", v)}
                placeholder="e.g. 50"
                hint="New email subscribers / contacts to grow list by"
              />
              <TargetInput
                label="Booking Conversion Rate"
                value={settings["target_conversion_rate"] ?? ""}
                onChange={v => set("target_conversion_rate", v)}
                placeholder="e.g. 60"
                suffix="%"
                hint="% of booking requests that become paid"
              />
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.75rem" }}>Email</div>
            <div style={grid2}>
              <TargetInput
                label="Email Open Rate Target"
                value={settings["target_email_open_rate"] ?? ""}
                onChange={v => set("target_email_open_rate", v)}
                placeholder="e.g. 35"
                suffix="%"
                hint="Target open rate for email campaigns (industry avg ~25%)"
              />
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: "0.75rem" }}>Social Media</div>
            <div style={grid2}>
              <TargetInput
                label="TikTok Follower Target"
                value={settings["target_tiktok_followers"] ?? ""}
                onChange={v => set("target_tiktok_followers", v)}
                placeholder="e.g. 10000"
                hint="@pashieb_the_wot follower goal"
              />
              <TargetInput
                label="Instagram Follower Target"
                value={settings["target_instagram_followers"] ?? ""}
                onChange={v => set("target_instagram_followers", v)}
                placeholder="e.g. 5000"
                hint="@pashieb_the_wot follower goal"
              />
            </div>
          </div>
        </Section>

        {/* AI Configuration */}
        <Section title="AI Configuration" onSave={saveSettings} saved={saved}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0.85rem 1rem", background: "#f0f4ff", borderRadius: 8, marginBottom: "1.25rem", border: "1px solid #c7d7fc" }}>
            <Bot size={16} style={{ color: NAVY, marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: "0.8rem", color: "#334155", margin: 0, lineHeight: 1.55 }}>
              The AI Insights engine on the Analytics page supports two providers. <strong>Anthropic</strong> (Claude Haiku) is built-in via Replit — no key needed. <strong>OpenAI</strong> uses your own API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: NAVY }}>platform.openai.com</a>.
            </p>
          </div>

          <div style={grid2}>
            <div>
              <label style={LABEL}>AI Provider for Insights</label>
              <select
                value={settings["ai_provider"] ?? "anthropic"}
                onChange={e => set("ai_provider", e.target.value)}
                style={{ ...INPUT, appearance: "none", cursor: "pointer", background: "white" }}>
                <option value="anthropic">Anthropic (Claude Haiku) — Built-in</option>
                <option value="openai">OpenAI — Use my API key</option>
              </select>
              <div style={{ fontSize: "0.68rem", color: "#aaa", marginTop: 3 }}>Which AI generates insights on the Analytics page</div>
            </div>
            {settings["ai_provider"] === "openai" && (
              <div>
                <label style={LABEL}>OpenAI Model</label>
                <select
                  value={settings["openai_model"] ?? "gpt-5-mini"}
                  onChange={e => set("openai_model", e.target.value)}
                  style={{ ...INPUT, appearance: "none", cursor: "pointer", background: "white" }}>
                  <option value="gpt-5-mini">GPT-5 Mini — Fast & affordable</option>
                  <option value="gpt-4o-mini">GPT-4o Mini — Previous generation</option>
                  <option value="gpt-4o">GPT-4o — More capable</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo — Powerful</option>
                </select>
                <div style={{ fontSize: "0.68rem", color: "#aaa", marginTop: 3 }}>Model to use when OpenAI is selected</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={LABEL}>OpenAI API Key</label>
            <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Cpu size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings["openai_api_key"] ?? ""}
                  onChange={e => { set("openai_api_key", e.target.value); setKeyTestResult(null); }}
                  placeholder="sk-..."
                  style={{ ...INPUT, paddingLeft: 30, paddingRight: 38, fontFamily: showApiKey ? "monospace" : "Raleway, sans-serif", fontSize: showApiKey ? "0.78rem" : "0.85rem" }}
                />
                <button
                  onClick={() => setShowApiKey(p => !p)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", display: "flex", padding: 2 }}>
                  {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button
                onClick={testOpenAIKey} disabled={testingKey || !(settings["openai_api_key"] ?? "")}
                style={{ ...BTN(testingKey ? "#e5e7eb" : NAVY, testingKey ? "#aaa" : "white"), flexShrink: 0, whiteSpace: "nowrap" as const }}>
                {testingKey ? "Testing…" : "Test Key"}
              </button>
            </div>
            {keyTestResult && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                {keyTestResult.ok
                  ? <CheckCircle size={13} style={{ color: "#16a34a" }} />
                  : <XCircle size={13} style={{ color: "#dc2626" }} />}
                <span style={{ fontSize: "0.75rem", color: keyTestResult.ok ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{keyTestResult.message}</span>
              </div>
            )}
            <div style={{ fontSize: "0.68rem", color: "#aaa", marginTop: 4 }}>Your key is stored securely in the database and never exposed to the browser.</div>
          </div>
        </Section>

        {/* Email Settings */}
        <Section title="Email Settings" onSave={saveSettings} saved={saved}>
          <div style={{ ...grid2, marginBottom: "0.85rem" }}>
            <div>
              <label style={LABEL}>Sender Name</label>
              <input value={settings.senderName ?? ""} onChange={e => set("senderName", e.target.value)} style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Sender Email</label>
              <input value="info@womanoftaste.co.za" disabled style={{ ...INPUT, background: "#f8f8f8", color: "#888" }} />
              <p style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 3 }}>Set via SMTP_USER secret.</p>
            </div>
            <div>
              <label style={LABEL}>Test Send Address</label>
              <input value={settings.testSendAddress ?? ""} onChange={e => set("testSendAddress", e.target.value)} placeholder="your@email.com" style={INPUT} />
            </div>
          </div>
          <div>
            <label style={LABEL}>Default Email Signature</label>
            <textarea value={settings.defaultSignature ?? ""} onChange={e => set("defaultSignature", e.target.value)} rows={3} style={{ ...INPUT, resize: "vertical" }} />
          </div>
        </Section>

        {/* Integrations */}
        <Section title="Integrations">
          <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.5rem", marginTop: "-0.5rem" }}>Status of all connected services.</p>
          {INTEGRATIONS.map(i => <IntegrationRow key={i.name} {...i} />)}
        </Section>

        {/* Automations */}
        <Section title="Automations">
          <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "1rem", marginTop: "-0.5rem" }}>
            Automated tasks that run on a schedule — no action required.
          </p>

          {/* Weekly Content Reminder */}
          <div style={{ background: "#f8f7ff", borderRadius: 10, border: "1px solid #e0dbff", padding: "1rem 1.15rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 220 }}>
                <div style={{ background: NAVY, borderRadius: 8, padding: "0.55rem", display: "flex", flexShrink: 0 }}>
                  <Bell size={15} style={{ color: "#e8c96a" }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 3 }}>Weekly Content Reminder</div>
                  <div style={{ fontSize: "0.76rem", color: "#555", lineHeight: 1.55, marginBottom: 6 }}>
                    Every Monday at 09:00 SAST, a branded email is sent to <strong>info@womanoftaste.co.za</strong> with 5 trending blog topics and 3 newsletter ideas tailored to South African audiences — generated by AI with curated fallback topics.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#16a34a", fontWeight: 700 }}>
                      <CheckCircle size={12} /> Active
                    </div>
                    <span style={{ color: "#ccc" }}>·</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#888" }}>
                      <Calendar size={11} /> Mondays 09:00 SAST
                    </div>
                    <span style={{ color: "#ccc" }}>·</span>
                    <div style={{ fontSize: "0.72rem", color: "#888" }}>CC: admin@womanoftaste.co.za</div>
                  </div>
                </div>
              </div>
              <button
                onClick={sendReminderNow}
                disabled={reminderSending}
                style={{
                  ...BTN(reminderSending ? "#e5e7eb" : NAVY, reminderSending ? "#aaa" : "white"),
                  flexShrink: 0, whiteSpace: "nowrap" as const,
                  opacity: reminderSending ? 0.7 : 1,
                }}>
                <Send size={13} />
                {reminderSending ? "Sending…" : "Send Now"}
              </button>
            </div>
            {reminderResult && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "0.85rem", padding: "0.55rem 0.85rem", borderRadius: 7, background: reminderResult.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${reminderResult.ok ? "#bbf7d0" : "#fecaca"}` }}>
                {reminderResult.ok
                  ? <CheckCircle size={14} style={{ color: "#16a34a", flexShrink: 0 }} />
                  : <XCircle size={14} style={{ color: "#dc2626", flexShrink: 0 }} />}
                <span style={{ fontSize: "0.78rem", color: reminderResult.ok ? "#15803d" : "#dc2626", fontWeight: 600 }}>{reminderResult.message}</span>
              </div>
            )}
          </div>

          {/* Monthly Social Reminder */}
          <div style={{ background: "#fff7f0", borderRadius: 10, border: "1px solid #fde0c0", padding: "1rem 1.15rem", marginTop: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 220 }}>
                <div style={{ background: NAVY, borderRadius: 8, padding: "0.55rem", display: "flex", flexShrink: 0 }}>
                  <Send size={15} style={{ color: "#e8c96a" }} />
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#1a1a2e", marginBottom: 3 }}>Monthly Social Media Reminder</div>
                  <div style={{ fontSize: "0.76rem", color: "#555", lineHeight: 1.55, marginBottom: 6 }}>
                    On the 1st of every month at 09:00 SAST, a branded email is sent with AI-generated TikTok and Instagram post ideas — hooks, concepts, captions, and hashtags — tailored to @pashieb_the_wot for that month.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#16a34a", fontWeight: 700 }}>
                      <CheckCircle size={12} /> Active
                    </div>
                    <span style={{ color: "#ccc" }}>·</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#888" }}>
                      <Calendar size={11} /> 1st of every month, 09:00 SAST
                    </div>
                    <span style={{ color: "#ccc" }}>·</span>
                    <div style={{ fontSize: "0.72rem", color: "#888" }}>TikTok + Instagram</div>
                  </div>
                </div>
              </div>
              <button
                onClick={sendSocialNow}
                disabled={socialSending}
                style={{
                  ...BTN(socialSending ? "#e5e7eb" : "#c2440e", socialSending ? "#aaa" : "white"),
                  flexShrink: 0, whiteSpace: "nowrap" as const,
                  opacity: socialSending ? 0.7 : 1,
                }}>
                <Send size={13} />
                {socialSending ? "Sending…" : "Send Now"}
              </button>
            </div>
            {socialResult && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "0.85rem", padding: "0.55rem 0.85rem", borderRadius: 7, background: socialResult.ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${socialResult.ok ? "#bbf7d0" : "#fecaca"}` }}>
                {socialResult.ok
                  ? <CheckCircle size={14} style={{ color: "#16a34a", flexShrink: 0 }} />
                  : <XCircle size={14} style={{ color: "#dc2626", flexShrink: 0 }} />}
                <span style={{ fontSize: "0.78rem", color: socialResult.ok ? "#15803d" : "#dc2626", fontWeight: 600 }}>{socialResult.message}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Password */}
        <Section title="Admin Password">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0.75rem", background: "#fffbf0", borderRadius: 8, marginBottom: "1rem", border: "1px solid #fde68a" }}>
            <AlertTriangle size={14} style={{ color: "#a16207", marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: "0.78rem", color: "#a16207", margin: 0 }}>The admin password is stored as a Replit Secret (ADMIN_PASSWORD). To change it, update the secret and restart the server.</p>
          </div>
          <div style={{ ...grid2, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", marginBottom: "0.85rem" }}>
            {[["current", "Current Password"], ["newPw", "New Password"], ["confirm", "Confirm New Password"]].map(([k, l]) => (
              <div key={k}>
                <label style={LABEL}>{l}</label>
                <input type="password" value={pw[k as keyof typeof pw]} onChange={e => setPw(p => ({ ...p, [k]: e.target.value }))} style={INPUT} />
              </div>
            ))}
          </div>
          {pwStatus && <p style={{ fontSize: "0.82rem", color: pwStatus.includes("changed") ? "#16a34a" : "#dc2626", marginBottom: "0.75rem" }}>{pwStatus}</p>}
          <button onClick={changePassword} style={BTN(NAVY)}>Update Password</button>
        </Section>

      </div>
    </AdminLayout>
  );
}
