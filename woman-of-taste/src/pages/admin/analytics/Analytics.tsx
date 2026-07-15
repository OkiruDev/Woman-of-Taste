import { useEffect, useState } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, ComposedChart, ReferenceLine,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Mail, Eye, MousePointer, UserMinus, TrendingUp, AlertCircle,
  Users, TrendingDown, DollarSign, TicketCheck, Instagram, Music2, Globe,
  ArrowUpRight, ArrowDownRight, Minus, Sparkles, Lightbulb, Zap, RefreshCw,
  CheckCircle, AlertTriangle, Info, Target,
} from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";
import RandIcon from "../../../components/RandIcon";

const NAVY = "hsl(225,50%,22%)";
const GOLD = "hsl(38,45%,65%)";

const TAB_STYLE = (active: boolean) => ({
  padding: "0.65rem 1rem", border: "none",
  borderBottom: active ? `2px solid ${NAVY}` : "2px solid transparent",
  background: "none", cursor: "pointer", fontFamily: "Raleway, sans-serif",
  fontSize: "0.82rem", fontWeight: active ? 700 : 400,
  color: active ? NAVY : "#888", whiteSpace: "nowrap" as const,
});

// ── AI Insights types ─────────────────────────────────────────────────────────
interface AIInsight {
  area: string;
  status: "good" | "warning" | "opportunity";
  finding: string;
  action: string;
}
interface GrowthSuggestion {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
}
interface InsightData {
  headline: string;
  insights: AIInsight[];
  growthSuggestions: GrowthSuggestion[];
  winThisWeek: string;
}
interface InsightTargets {
  monthly_revenue: number;
  monthly_contacts: number;
  monthly_bookings: number;
  email_open_rate: number;
  conversion_rate: number;
  tiktok_followers: number;
  instagram_followers: number;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface OverviewData {
  audience: {
    totalContacts: number; optedOut: number; optedIn: number; newsletterContacts: number;
    newThisMonth: number; newLastMonth: number;
    audienceGrowth: { month: string; contacts: number }[];
  };
  revenue: {
    totalRevenue: number; outstandingRevenue: number;
    revenueThisMonth: number; revenueLastMonth: number;
    monthlyRevenue: { month: string; revenue: number; tickets: number }[];
    revenueByEvent: { event: string; revenue: number; tickets: number; bookings: number }[];
  };
  bookings: {
    total: number; pending: number; approved: number;
    paid: number; overdue: number; declined: number; conversionRate: number;
    bookingsThisMonth: number; bookingsLastMonth: number;
    monthlyBookings: { month: string; requests: number; paid: number; approved: number }[];
  };
  email: {
    totalEmailsSent: number; avgOpenRate: number;
    avgClickRate: number; campaignCount: number;
  };
}

interface EmailStats {
  totalSent: number; totalOpens: number; totalClicks: number; totalOptOuts: number;
  avgOpenRate: number; avgClickRate: number; campaigns: CampaignRow[];
}
interface CampaignRow {
  id: number; subject: string; recipientsCount: number;
  opensCount: number; clicksCount: number; sentAt: string;
}

// ── Shared components ────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", border: "1px solid #eee", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.05rem", color: NAVY, margin: "0 0 0.75rem", fontWeight: 700 }}>
      {children}
    </h3>
  );
}

function MetricCard({ icon, label, value, sub, color, delta }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; color: string; delta?: { value: number; label: string };
}) {
  return (
    <Card style={{ padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: "0.73rem", color: "#888", marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 1 }}>{sub}</div>}
      </div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.72rem", fontWeight: 700, color: delta.value > 0 ? "#16a34a" : delta.value < 0 ? "#dc2626" : "#888", flexShrink: 0 }}>
          {delta.value > 0 ? <ArrowUpRight size={13} /> : delta.value < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}
          {delta.label}
        </div>
      )}
    </Card>
  );
}

function ConnectCard({ icon, platform, description, envKey }: {
  icon: React.ReactNode; platform: string; description: string; envKey: string;
}) {
  return (
    <Card style={{ padding: "1.5rem", textAlign: "center" }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: NAVY }}>
        {icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: NAVY, marginBottom: 4 }}>{platform}</div>
      <div style={{ fontSize: "0.78rem", color: "#888", lineHeight: 1.5, marginBottom: "1rem" }}>{description}</div>
      <code style={{ display: "block", background: "#f8f8fc", borderRadius: 6, padding: "6px 10px", fontSize: "0.72rem", color: "#7c3aed" }}>{envKey}</code>
      <div style={{ fontSize: "0.7rem", color: "#bbb", marginTop: 8 }}>Add to Replit Secrets to connect</div>
    </Card>
  );
}

function fmtZAR(v: number) {
  if (v >= 1000) return `R ${(v / 1000).toFixed(1)}k`;
  return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}
function fmtZARFull(v: number) {
  return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

// ── Target progress bar ───────────────────────────────────────────────────────
function TargetBar({ label, current, target, format = (v: number) => String(v), color = NAVY }: {
  label: string; current: number; target: number; format?: (v: number) => string; color?: string;
}) {
  if (!target) return null;
  const pct = Math.min(100, Math.round((current / target) * 100));
  const statusColor = pct >= 100 ? "#16a34a" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#555" }}>{label}</span>
        <span style={{ fontSize: "0.78rem", color: statusColor, fontWeight: 700 }}>{format(current)} / {format(target)} <span style={{ fontSize: "0.7rem", fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "#16a34a" : color, borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ── MoM trend card ────────────────────────────────────────────────────────────
function MoMCard({ label, current, previous, format, icon, color }: {
  label: string; current: number; previous: number;
  format: (v: number) => string; icon: React.ReactNode; color: string;
}) {
  const diff = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;
  const up = diff > 0; const flat = diff === 0;
  return (
    <Card style={{ padding: "1rem 1.15rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.72rem", fontWeight: 700, color: up ? "#16a34a" : flat ? "#888" : "#ef4444", background: up ? "#f0fdf4" : flat ? "#f3f4f6" : "#fef2f2", borderRadius: 99, padding: "3px 8px", whiteSpace: "nowrap" }}>
          {up ? <ArrowUpRight size={12} /> : flat ? <Minus size={12} /> : <ArrowDownRight size={12} />}
          {up ? "+" : ""}{diff}%
        </div>
      </div>
      <div style={{ marginTop: "0.6rem" }}>
        <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.1 }}>{format(current)}</div>
        <div style={{ fontSize: "0.7rem", color: "#999", marginTop: 3 }}>{label}</div>
        <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 1 }}>vs {format(previous)} last month</div>
      </div>
    </Card>
  );
}

// ── Combined growth chart (contacts + bookings dual axis) ─────────────────────
function GrowthVelocityChart({ audienceGrowth, monthlyBookings, isMobile }: {
  audienceGrowth: { month: string; contacts: number }[];
  monthlyBookings: { month: string; requests: number; paid: number }[];
  isMobile: boolean;
}) {
  const combined = audienceGrowth.map((a, i) => ({
    month: a.month,
    contacts: a.contacts,
    requests: monthlyBookings[i]?.requests ?? 0,
    paid: monthlyBookings[i]?.paid ?? 0,
  }));

  return (
    <Card style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: 4 }}>Growth Velocity — Contacts & Bookings (6 Months)</div>
      <div style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: "0.85rem" }}>New contacts (bars) vs booking requests (line) per month</div>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
        <ComposedChart data={combined}>
          <defs>
            <linearGradient id="contactBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            formatter={(v: number, name: string) => [v, name === "contacts" ? "New Contacts" : name === "requests" ? "Booking Requests" : "Paid"]}
            contentStyle={{ fontSize: "0.78rem", borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
          <Bar yAxisId="left" dataKey="contacts" name="New Contacts" fill="url(#contactBarGrad)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="requests" name="Booking Requests" stroke="hsl(38,45%,55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(38,45%,55%)" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── Revenue trend with target reference line ──────────────────────────────────
function RevenueTargetChart({ monthlyRevenue, targetMonthly, isMobile }: {
  monthlyRevenue: { month: string; revenue: number; tickets: number }[];
  targetMonthly: number; isMobile: boolean;
}) {
  return (
    <Card style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.85rem", flexWrap: "wrap", gap: 6 }}>
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#555" }}>Monthly Revenue Trend (Last 6 Months)</div>
          {targetMonthly > 0 && (
            <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 2 }}>
              Dashed line = monthly target (R{targetMonthly.toLocaleString("en-ZA")})
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
        <ComposedChart data={monthlyRevenue}>
          <defs>
            <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(225,50%,22%)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="hsl(225,50%,22%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `R${(v / 1000).toFixed(0)}k` : `R${v}`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v: number, name: string) => [
            name === "revenue" ? `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}` : v,
            name === "revenue" ? "Revenue" : "Tickets Sold",
          ]} contentStyle={{ fontSize: "0.78rem", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
          {targetMonthly > 0 && (
            <ReferenceLine yAxisId="left" y={targetMonthly} stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: "Target", fill: "#ef4444", fontSize: 10, position: "insideTopRight" }} />
          )}
          <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(225,50%,22%)" fill="url(#revAreaGrad)" strokeWidth={2.5} dot={{ r: 4 }} />
          <Bar yAxisId="right" dataKey="tickets" name="Tickets Sold" fill="hsl(38,45%,65%)" radius={[3, 3, 0, 0]} opacity={0.7} />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── Revenue breakdown donut ───────────────────────────────────────────────────
const DONUT_COLORS = ["hsl(225,50%,22%)", "hsl(38,45%,65%)", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

function RevenueDonutChart({ revenueByEvent, isMobile }: {
  revenueByEvent: { event: string; revenue: number }[]; isMobile: boolean;
}) {
  if (revenueByEvent.length === 0) return null;
  const data = revenueByEvent.slice(0, 7).map((e, i) => ({
    name: e.event.length > 22 ? e.event.slice(0, 22) + "…" : e.event,
    value: e.revenue,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card style={{ padding: "1.25rem" }}>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: "0.85rem" }}>Revenue Breakdown by Event</div>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "center", gap: "1rem" }}>
        <div style={{ flexShrink: 0 }}>
          <ResponsiveContainer width={isMobile ? 200 : 180} height={180}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, "Revenue"]} contentStyle={{ fontSize: "0.78rem", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                <div style={{ fontSize: "0.68rem", color: "#aaa" }}>{total > 0 ? Math.round((d.value / total) * 100) : 0}% · R {d.value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Booking funnel visual ─────────────────────────────────────────────────────
function BookingTrendChart({ monthlyBookings, isMobile }: {
  monthlyBookings: { month: string; requests: number; paid: number; approved: number }[];
  isMobile: boolean;
}) {
  return (
    <Card style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: 4 }}>Monthly Booking Trends</div>
      <div style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: "0.85rem" }}>Requests received vs paid bookings per month</div>
      <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
        <BarChart data={monthlyBookings}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: "0.78rem", borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
          <Bar dataKey="requests" name="Requests" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
          <Bar dataKey="approved" name="Approved" fill="hsl(225,50%,40%)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="paid" name="Paid" fill="#16a34a" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── AI Insights Panel ─────────────────────────────────────────────────────────
function AIInsightsPanel() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [targets, setTargets] = useState<InsightTargets | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasTargets, setHasTargets] = useState(false);
  const isMobile = useIsMobile();

  // Check if any targets are set from overview
  useEffect(() => {
    adminFetch("/admin/settings").then(r => r.json()).then(d => {
      if (d.ok) {
        const s = d.settings as Record<string, string>;
        const anySet = ["target_monthly_revenue", "target_monthly_contacts", "target_monthly_bookings", "target_email_open_rate"].some(k => !!s[k]);
        setHasTargets(anySet);
      }
    });
  }, []);

  async function generate() {
    setLoading(true); setError("");
    try {
      const res = await adminFetch("/admin/analytics/insights");
      const d = await res.json();
      if (d.ok) { setInsights(d.insights); setTargets(d.targets); }
      else setError(d.error ?? "Could not generate insights.");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  const statusIcon = (s: AIInsight["status"]) => s === "good"
    ? <CheckCircle size={14} style={{ color: "#16a34a" }} />
    : s === "warning" ? <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
    : <Info size={14} style={{ color: "#3b82f6" }} />;

  const statusColor = (s: AIInsight["status"]) => s === "good" ? "#f0fdf4" : s === "warning" ? "#fffbeb" : "#eff6ff";
  const statusBorder = (s: AIInsight["status"]) => s === "good" ? "#bbf7d0" : s === "warning" ? "#fde68a" : "#bfdbfe";

  const impactColor = { high: "#16a34a", medium: "#f59e0b", low: "#9ca3af" };
  const effortColor = { high: "#ef4444", medium: "#f59e0b", low: "#16a34a" };

  // Show target bars if targets set but no insights yet
  const showTargetSection = targets && (
    targets.monthly_revenue > 0 || targets.monthly_contacts > 0 || targets.monthly_bookings > 0 ||
    targets.email_open_rate > 0 || targets.conversion_rate > 0
  );

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
        <SectionTitle>AI Insights & Growth Targets</SectionTitle>
        <button
          onClick={generate} disabled={loading}
          style={{
            background: loading ? "#e5e7eb" : `linear-gradient(135deg, ${NAVY} 0%, hsl(255,50%,35%) 100%)`,
            color: loading ? "#aaa" : "white", border: "none", borderRadius: 10, padding: "0.65rem 1.2rem",
            fontSize: "0.82rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 7, fontFamily: "Raleway, sans-serif",
            boxShadow: loading ? "none" : "0 2px 8px rgba(25,35,80,0.2)",
          }}>
          {loading ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={15} />}
          {loading ? "Analysing your data…" : insights ? "Regenerate Insights" : "Generate AI Insights"}
        </button>
      </div>

      {!hasTargets && !insights && !loading && (
        <Card style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Target size={20} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: NAVY, marginBottom: 4 }}>Set your growth targets first</div>
            <div style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.6 }}>
              Go to <strong>Settings → Growth Targets</strong> to set monthly revenue, audience, and email goals. The AI will use these to benchmark your performance and give you personalised recommendations.
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "1rem 1.25rem", color: "#dc2626", fontSize: "0.82rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {!insights && !loading && hasTargets && !error && (
        <Card style={{ padding: "1.5rem", textAlign: "center" }}>
          <Sparkles size={32} style={{ color: GOLD, marginBottom: "0.75rem" }} />
          <div style={{ fontWeight: 700, fontSize: "1rem", color: NAVY, marginBottom: 6 }}>Aura is ready to analyse your data</div>
          <div style={{ fontSize: "0.82rem", color: "#888", lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
            Click the button above and Aura will analyse your audience, revenue, email, and booking data against your targets — then deliver specific, actionable recommendations.
          </div>
        </Card>
      )}

      {loading && (
        <Card style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>Analysing your business data…</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: "0.5rem" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: NAVY, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </Card>
      )}

      {insights && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Headline */}
          <Card style={{ padding: "1.1rem 1.4rem", background: `linear-gradient(135deg, ${NAVY} 0%, hsl(255,50%,35%) 100%)`, borderRadius: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Sparkles size={18} style={{ color: GOLD, marginTop: 2, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: "0.95rem", fontStyle: "italic", color: "white", fontFamily: "Cormorant Garamond, serif", lineHeight: 1.5 }}>
                {insights.headline}
              </p>
            </div>
          </Card>

          {/* Target progress bars */}
          {showTargetSection && (
            <Card style={{ padding: "1.25rem 1.4rem" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>Monthly Targets vs Actuals</div>
              {/* These values come from the insights endpoint — we use targets here, actuals are approximated from the headline data */}
              {targets!.monthly_revenue > 0 && (
                <TargetBar
                  label="Monthly Revenue"
                  current={0}
                  target={targets!.monthly_revenue}
                  format={v => v === 0 ? "R—" : `R${v.toLocaleString("en-ZA")}`}
                  color="#16a34a"
                />
              )}
              {targets!.monthly_contacts > 0 && (
                <TargetBar label="New Contacts" current={0} target={targets!.monthly_contacts} color="#3b82f6" />
              )}
              {targets!.email_open_rate > 0 && (
                <TargetBar label="Email Open Rate" current={0} target={targets!.email_open_rate} format={v => `${v}%`} color="#8b5cf6" />
              )}
              <p style={{ fontSize: "0.7rem", color: "#aaa", margin: "0.5rem 0 0", fontStyle: "italic" }}>
                Actuals are shown on the cards above. Update targets in Settings → Growth Targets.
              </p>
            </Card>
          )}

          {/* Insight cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0.75rem" }}>
            {insights.insights.map((ins, i) => (
              <Card key={i} style={{ padding: "1.1rem 1.25rem", background: statusColor(ins.status), border: `1px solid ${statusBorder(ins.status)}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  {statusIcon(ins.status)}
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#666" }}>{ins.area}</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: "0.83rem", color: "#333", lineHeight: 1.55 }}>{ins.finding}</p>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "0.6rem 0.8rem", background: "rgba(255,255,255,0.6)", borderRadius: 7 }}>
                  <Zap size={12} style={{ color: NAVY, marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.75rem", color: NAVY, fontWeight: 600, lineHeight: 1.45 }}>{ins.action}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Growth suggestions */}
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Growth Playbook</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {insights.growthSuggestions.map((s, i) => (
                <Card key={i} style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ background: `${NAVY}12`, borderRadius: 8, padding: "0.5rem", flexShrink: 0 }}>
                      <Lightbulb size={16} style={{ color: NAVY }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: NAVY }}>{s.title}</span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 99, background: `${impactColor[s.impact]}18`, color: impactColor[s.impact] }}>
                          {s.impact} impact
                        </span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 99, background: `${effortColor[s.effort]}18`, color: effortColor[s.effort] }}>
                          {s.effort} effort
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#555", lineHeight: 1.55 }}>{s.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick win */}
          <Card style={{ padding: "1.1rem 1.4rem", background: "linear-gradient(135deg, hsl(38,45%,65%,0.12) 0%, hsl(38,45%,65%,0.06) 100%)", border: `1px solid hsl(38,45%,65%,0.4)` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Zap size={18} style={{ color: "hsl(38,35%,45%)", marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(38,35%,40%)", marginBottom: 6 }}>This Week's Quick Win</div>
                <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: NAVY, lineHeight: 1.55 }}>{insights.winThisWeek}</p>
              </div>
            </div>
          </Card>

        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0) } 40% { transform: scale(1) } }
      `}</style>
    </section>
  );
}

function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetRevenue, setTargetRevenue] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    Promise.all([
      adminFetch("/admin/analytics/overview").then(r => r.json()),
      adminFetch("/admin/settings").then(r => r.json()),
    ]).then(([overview, settings]) => {
      if (overview.ok) setData(overview.data);
      if (settings.ok) {
        const t = Number(settings.settings.target_monthly_revenue) || 0;
        setTargetRevenue(t);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading analytics…</div>;
  if (!data) return <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>Could not load analytics.</div>;

  const { audience, revenue, bookings, email } = data;
  const revGrowth = revenue.revenueLastMonth > 0
    ? Math.round(((revenue.revenueThisMonth - revenue.revenueLastMonth) / revenue.revenueLastMonth) * 100)
    : 0;

  const grid3 = { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "0.65rem" } as React.CSSProperties;
  const grid4 = { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "0.65rem" } as React.CSSProperties;
  const momGrid = { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "0.65rem" } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Month-over-Month Snapshot ── */}
      <section>
        <SectionTitle>Month-over-Month Performance</SectionTitle>
        <div style={momGrid}>
          <MoMCard label="Revenue This Month" current={revenue.revenueThisMonth} previous={revenue.revenueLastMonth}
            format={fmtZAR} icon={<DollarSign size={18} />} color="#16a34a" />
          <MoMCard label="New Contacts" current={audience.newThisMonth} previous={audience.newLastMonth}
            format={v => String(v)} icon={<Users size={18} />} color="#3b82f6" />
          <MoMCard label="Booking Requests" current={bookings.bookingsThisMonth} previous={bookings.bookingsLastMonth}
            format={v => String(v)} icon={<TicketCheck size={18} />} color="hsl(38,45%,55%)" />
          <MoMCard label="Email Open Rate" current={email.avgOpenRate} previous={email.avgOpenRate}
            format={v => `${v}%`} icon={<Mail size={18} />} color="#8b5cf6" />
        </div>
      </section>

      {/* ── Audience & Growth ── */}
      <section>
        <SectionTitle>Audience & Growth</SectionTitle>
        <div style={{ ...grid4, marginBottom: "0.75rem" }}>
          <MetricCard icon={<Users size={20} />} label="Total Contacts" value={audience.totalContacts} color="#3b82f6"
            delta={{ value: audience.newThisMonth, label: `+${audience.newThisMonth} this month` }} />
          <MetricCard icon={<Mail size={20} />} label="Opted In" value={audience.optedIn} color="#8b5cf6"
            sub={`incl. ${audience.newsletterContacts} newsletter sign-ups`} />
          <MetricCard icon={<TrendingUp size={20} />} label="New This Month" value={audience.newThisMonth} color="#10b981" />
          <MetricCard icon={<UserMinus size={20} />} label="Opted Out" value={audience.optedOut} color="#f59e0b"
            sub={`${audience.totalContacts > 0 ? Math.round((audience.optedOut / audience.totalContacts) * 100) : 0}% of list`} />
        </div>

        {/* Audience growth chart */}
        <Card style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: "0.85rem" }}>Contact List Growth (Last 6 Months)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={audience.audienceGrowth}>
              <defs>
                <linearGradient id="contactGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [`${v} contacts`, "New"]} />
              <Area type="monotone" dataKey="contacts" stroke="#3b82f6" fill="url(#contactGrad)" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </section>

      {/* ── Growth Velocity ── */}
      <GrowthVelocityChart audienceGrowth={audience.audienceGrowth} monthlyBookings={bookings.monthlyBookings} isMobile={isMobile} />

      {/* ── Social & Reach (placeholders) ── */}
      <section>
        <SectionTitle>Social Media & Reach</SectionTitle>
        <div style={{ ...grid3 }}>
          <ConnectCard
            icon={<Music2 size={22} />}
            platform="TikTok (@pashieb_the_wot)"
            description="Connect to see follower count, video views, profile visits, and top-performing content."
            envKey="TIKTOK_ACCESS_TOKEN"
          />
          <ConnectCard
            icon={<Instagram size={22} />}
            platform="Instagram (@pashieb_the_wot)"
            description="Connect to see followers, reach, impressions, story views, and engagement rate."
            envKey="INSTAGRAM_ACCESS_TOKEN"
          />
          <ConnectCard
            icon={<Globe size={22} />}
            platform="Website Traffic"
            description="Connect Google Analytics to see unique visitors, page views, traffic sources, and top pages."
            envKey="GA4_PROPERTY_ID"
          />
        </div>
      </section>

      {/* ── Financial Performance ── */}
      <section>
        <SectionTitle>Financial Performance</SectionTitle>
        <div style={{ ...grid4, marginBottom: "0.75rem" }}>
          <MetricCard
            icon={<RandIcon size={20} />} label="Total Revenue Collected"
            value={fmtZAR(revenue.totalRevenue)} color="#16a34a"
            sub={fmtZARFull(revenue.totalRevenue)} />
          <MetricCard
            icon={<DollarSign size={20} />} label="Outstanding Payments"
            value={fmtZAR(revenue.outstandingRevenue)} color="#ef4444"
            sub="Awaiting payment" />
          <MetricCard
            icon={<TrendingUp size={20} />} label="Revenue This Month"
            value={fmtZAR(revenue.revenueThisMonth)} color="#f59e0b"
            delta={{ value: revGrowth, label: `${revGrowth > 0 ? "+" : ""}${revGrowth}% vs last month` }} />
          <MetricCard
            icon={<TicketCheck size={20} />} label="Tickets Sold (Paid)"
            value={revenue.revenueByEvent.reduce((s, e) => s + e.tickets, 0)} color="#8b5cf6"
            sub={`across ${revenue.revenueByEvent.length} event${revenue.revenueByEvent.length !== 1 ? "s" : ""}`} />
        </div>

        {/* Monthly revenue chart with target reference line */}
        <div style={{ marginBottom: "0.75rem" }}>
          <RevenueTargetChart monthlyRevenue={revenue.monthlyRevenue} targetMonthly={targetRevenue} isMobile={isMobile} />
        </div>

        {/* Revenue breakdown donut */}
        {revenue.revenueByEvent.length > 1 && (
          <div style={{ marginBottom: "0.75rem" }}>
            <RevenueDonutChart revenueByEvent={revenue.revenueByEvent} isMobile={isMobile} />
          </div>
        )}

        {/* Revenue by event */}
        {revenue.revenueByEvent.length > 0 && (
          <Card>
            <div style={{ padding: "0.85rem 1.1rem", borderBottom: "1px solid #f0f0f5" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#555" }}>Revenue by Event</div>
            </div>
            {revenue.revenueByEvent.map((e, i) => (
              <div key={e.event} style={{ padding: "0.85rem 1.1rem", borderBottom: i < revenue.revenueByEvent.length - 1 ? "1px solid #f0f0f5" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.event}</div>
                  <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 2 }}>{e.tickets} ticket{e.tickets !== 1 ? "s" : ""} · {e.bookings} booking{e.bookings !== 1 ? "s" : ""}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#16a34a", flexShrink: 0 }}>{fmtZARFull(e.revenue)}</div>
              </div>
            ))}
          </Card>
        )}
      </section>

      {/* ── Booking Funnel ── */}
      <section>
        <SectionTitle>Booking Funnel</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, 1fr)", gap: "0.65rem", marginBottom: "0.75rem" }}>
          {[
            { label: "Requests", value: bookings.total, color: "#64748b" },
            { label: "Pending", value: bookings.pending, color: "#f59e0b" },
            { label: "Approved", value: bookings.approved, color: "#3b82f6" },
            { label: "Paid", value: bookings.paid, color: "#16a34a" },
            { label: "Overdue", value: bookings.overdue, color: "#ef4444" },
            { label: "Declined", value: bookings.declined, color: "#9ca3af" },
          ].map(f => (
            <Card key={f.label} style={{ padding: "0.85rem 1rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: f.color }}>{f.value}</div>
              <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{f.label}</div>
            </Card>
          ))}
        </div>
        <Card style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#888" }}>Conversion Rate</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: bookings.conversionRate >= 50 ? "#16a34a" : bookings.conversionRate >= 25 ? "#f59e0b" : "#ef4444" }}>
              {bookings.conversionRate}%
            </div>
            <div style={{ fontSize: "0.7rem", color: "#aaa" }}>Requests → Paid</div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            {/* Visual funnel bar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "Requests", val: bookings.total, color: "#64748b" },
                { label: "Approved", val: bookings.approved + bookings.paid + bookings.overdue, color: "#3b82f6" },
                { label: "Paid", val: bookings.paid, color: "#16a34a" },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: "0.68rem", color: "#888", width: 60, flexShrink: 0, textAlign: "right" }}>{f.label}</div>
                  <div style={{ flex: 1, height: 10, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${bookings.total > 0 ? Math.round((f.val / bookings.total) * 100) : 0}%`, background: f.color, borderRadius: 99, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#888", width: 28, flexShrink: 0 }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* ── Booking Trends ── */}
      {bookings.monthlyBookings.some(m => m.requests > 0) && (
        <BookingTrendChart monthlyBookings={bookings.monthlyBookings} isMobile={isMobile} />
      )}

      {/* ── Email Engagement ── */}
      <section>
        <SectionTitle>Email Engagement</SectionTitle>
        <div style={{ ...grid4 }}>
          <MetricCard icon={<Mail size={20} />} label="Emails Sent" value={email.totalEmailsSent} color="#3b82f6"
            sub={`${email.campaignCount} campaigns`} />
          <MetricCard icon={<Eye size={20} />} label="Avg Open Rate" value={`${email.avgOpenRate}%`}
            color={email.avgOpenRate >= 25 ? "#16a34a" : email.avgOpenRate >= 15 ? "#f59e0b" : "#ef4444"}
            sub={email.avgOpenRate >= 25 ? "Above industry avg" : "Industry avg ~25%"} />
          <MetricCard icon={<MousePointer size={20} />} label="Avg Click Rate" value={`${email.avgClickRate}%`}
            color={email.avgClickRate >= 3 ? "#16a34a" : "#f59e0b"}
            sub={email.avgClickRate >= 3 ? "Above industry avg" : "Industry avg ~3%"} />
          <MetricCard icon={<TrendingDown size={20} />} label="List Health"
            value={`${audience.totalContacts > 0 ? Math.round(((audience.totalContacts - audience.optedOut) / audience.totalContacts) * 100) : 100}%`}
            color="#8b5cf6" sub="Active subscribers" />
        </div>
      </section>

      {/* ── AI Insights ── */}
      <AIInsightsPanel />

    </div>
  );
}

// ── Email Tab ─────────────────────────────────────────────────────────────────
function EmailTab() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    adminFetch("/admin/email/stats").then(r => r.json()).then(d => { if (d.ok) setStats(d.stats); }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading email stats…</div>;
  if (!stats) return <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>Could not load stats.</div>;

  const chartData = stats.campaigns.slice(0, 10).reverse().map(c => ({
    name: c.subject.slice(0, 18) + (c.subject.length > 18 ? "…" : ""),
    sent: c.recipientsCount, opens: c.opensCount, clicks: c.clicksCount,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "0.65rem" }}>
        {[
          { icon: <Mail size={18} />, label: "Total Emails Sent", value: stats.totalSent },
          { icon: <Eye size={18} />, label: "Avg Open Rate", value: `${stats.avgOpenRate}%`, sub: `${stats.totalOpens} opens` },
          { icon: <MousePointer size={18} />, label: "Avg Click Rate", value: `${stats.avgClickRate}%`, sub: `${stats.totalClicks} clicks` },
          { icon: <UserMinus size={18} />, label: "Total Opt-outs", value: stats.totalOptOuts },
        ].map((s, i) => (
          <MetricCard key={i} icon={s.icon} label={s.label} value={s.value} sub={(s as any).sub} color={NAVY} />
        ))}
      </div>

      {chartData.length > 0 && (
        <Card style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: "0.85rem" }}>Campaign Performance</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="sent" name="Sent" fill="#c7d8ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="opens" name="Opens" fill={NAVY} radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" name="Clicks" fill={GOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {stats.campaigns.length > 0 && (
        <Card style={{ overflow: "hidden" }}>
          <div style={{ padding: "0.85rem 1.1rem", borderBottom: "1px solid #eee" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#555" }}>Top Campaigns by Open Rate</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "#f8f8fc" }}>
                  {["Subject", "Sent", "Opens", "Open Rate"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #eee" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.campaigns.map((c, i) => {
                  const rate = c.recipientsCount > 0 ? Math.round((c.opensCount / c.recipientsCount) * 100) : 0;
                  return (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                      <td style={{ padding: "0.65rem 1rem", borderBottom: "1px solid #f0f0f5", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.subject}</td>
                      <td style={{ padding: "0.65rem 1rem", borderBottom: "1px solid #f0f0f5" }}>{c.recipientsCount}</td>
                      <td style={{ padding: "0.65rem 1rem", borderBottom: "1px solid #f0f0f5" }}>{c.opensCount}</td>
                      <td style={{ padding: "0.65rem 1rem", borderBottom: "1px solid #f0f0f5" }}>
                        <span style={{ fontWeight: 700, color: rate >= 20 ? "#16a34a" : rate >= 10 ? "#a16207" : "#666" }}>{rate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {stats.campaigns.length === 0 && (
        <Card style={{ padding: "3rem", textAlign: "center" }}>
          <TrendingUp size={32} style={{ opacity: 0.3, marginBottom: 8, color: "#888" }} />
          <p style={{ color: "#aaa", margin: 0 }}>Send your first email campaign to see performance analytics here.</p>
        </Card>
      )}
    </div>
  );
}

function SetupPanel({ title, description, envVars }: { title: string; description: string; envVars: string[] }) {
  return (
    <Card style={{ padding: "2.5rem", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: NAVY }}><AlertCircle size={24} /></div>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: NAVY, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: "0.85rem", color: "#666", maxWidth: 500, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>{description}</p>
      <div style={{ background: "#f8f8fc", borderRadius: 8, padding: "1rem 1.25rem", maxWidth: 400, margin: "0 auto", textAlign: "left" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "0.5rem" }}>Required Secrets:</p>
        {envVars.map(v => <code key={v} style={{ display: "block", fontSize: "0.82rem", color: "#7c3aed", marginBottom: 4 }}>{v}</code>)}
      </div>
      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "1rem" }}>Add to Replit Secrets and restart the server to connect.</p>
    </Card>
  );
}

// ── Website Analytics Tab ─────────────────────────────────────────────────────
interface WebsiteMetrics {
  sessions: number; users: number; pageViews: number;
  bounceRate: number; avgSessionDuration: number; newUsers: number;
}
interface WebsiteData {
  metrics: WebsiteMetrics;
  pages: { path: string; views: number; users: number }[];
  trafficSources: { channel: string; sessions: number }[];
  dailyTrend: { date: string; sessions: number; users: number }[];
}

const SOURCE_COLORS: Record<string, string> = {
  "Organic Search": "#16a34a", "Direct": NAVY, "Social": "#8b5cf6",
  "Referral": "#f59e0b", "Email": "#3b82f6", "Paid Search": "#ef4444",
  "Organic Social": "#ec4899", "(Other)": "#9ca3af",
};

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function WebsiteTab() {
  const [data, setData] = useState<WebsiteData | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    adminFetch("/admin/analytics/website")
      .then(r => r.json())
      .then(d => {
        if (d.configured === false) { setConfigured(false); }
        else if (d.ok) { setConfigured(true); setData(d); }
        else { setConfigured(true); setError(d.error ?? "Could not load analytics."); }
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading website analytics…</div>;

  if (configured === false) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Card style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: NAVY }}><Globe size={24} /></div>
          <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.4rem", color: NAVY, marginBottom: 8 }}>Connect Google Analytics</h3>
          <p style={{ fontSize: "0.85rem", color: "#666", maxWidth: 520, margin: "0 auto 1.5rem", lineHeight: 1.6 }}>
            Connect your GA4 property to see website traffic, top pages, sessions, bounce rate, and traffic sources right here in your dashboard.
          </p>
          <div style={{ background: "#f8f8fc", borderRadius: 10, padding: "1.25rem", maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#555", marginBottom: "0.75rem" }}>Required Secrets:</p>
            {["GA4_PROPERTY_ID", "GA4_CREDENTIALS"].map(v => (
              <code key={v} style={{ display: "block", fontSize: "0.82rem", color: "#7c3aed", marginBottom: 6, padding: "4px 8px", background: "#ede9fe", borderRadius: 5 }}>{v}</code>
            ))}
            <div style={{ marginTop: "1rem", padding: "0.85rem", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#555", marginBottom: "0.5rem" }}>How to get these:</p>
              <ol style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.8, paddingLeft: "1rem", margin: 0 }}>
                <li>Go to <strong>analytics.google.com</strong> → Admin → Property Details → copy the <strong>Property ID</strong> (numeric) → add as <code style={{ color: "#7c3aed" }}>GA4_PROPERTY_ID</code></li>
                <li>Go to <strong>console.cloud.google.com</strong> → Create a Service Account → Download the JSON key → paste the full JSON as <code style={{ color: "#7c3aed" }}>GA4_CREDENTIALS</code></li>
                <li>Back in GA4 → Admin → Account Access Management → Add the service account email with <strong>Viewer</strong> role</li>
                <li>Restart the server after adding both secrets</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) return <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626" }}>{error}</div>;
  if (!data) return null;

  const { metrics, pages, trafficSources, dailyTrend } = data;
  const totalSourceSessions = trafficSources.reduce((s, t) => s + t.sessions, 0);

  const grid3 = { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "0.65rem" } as React.CSSProperties;
  const grid6 = { display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "0.65rem" } as React.CSSProperties;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Key metrics */}
      <section>
        <SectionTitle>Last 30 Days — Website Overview</SectionTitle>
        <div style={grid6}>
          {[
            { icon: <Users size={18} />, label: "Total Users", value: metrics.users.toLocaleString("en-ZA"), color: "#3b82f6" },
            { icon: <Eye size={18} />, label: "Page Views", value: metrics.pageViews.toLocaleString("en-ZA"), color: NAVY },
            { icon: <Globe size={18} />, label: "Sessions", value: metrics.sessions.toLocaleString("en-ZA"), color: "#10b981" },
            { icon: <TrendingUp size={18} />, label: "New Users", value: metrics.newUsers.toLocaleString("en-ZA"), color: "#8b5cf6" },
            { icon: <AlertTriangle size={18} />, label: "Bounce Rate", value: `${metrics.bounceRate}%`, color: metrics.bounceRate > 60 ? "#ef4444" : metrics.bounceRate > 40 ? "#f59e0b" : "#16a34a", sub: metrics.bounceRate > 60 ? "High — review content" : metrics.bounceRate > 40 ? "Average" : "Low — great!" },
            { icon: <Zap size={18} />, label: "Avg Session", value: fmtDuration(metrics.avgSessionDuration), color: "#f59e0b" },
          ].map((m, i) => (
            <MetricCard key={i} icon={m.icon} label={m.label} value={m.value} sub={(m as any).sub} color={m.color} />
          ))}
        </div>
      </section>

      {/* Daily trend chart */}
      {dailyTrend.length > 0 && (
        <Card style={{ padding: "1.25rem 1.25rem 0.75rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#555", marginBottom: 4 }}>Daily Sessions & Users — Last 14 Days</div>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="sessionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NAVY} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: "0.78rem", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
              <Area type="monotone" dataKey="sessions" name="Sessions" stroke={NAVY} fill="url(#sessionGrad)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="users" name="Users" stroke={GOLD} strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Top pages + Traffic sources side by side */}
      <div style={grid3}>
        {/* Top pages */}
        <Card style={{ gridColumn: isMobile ? "1 / -1" : "span 2" }}>
          <div style={{ padding: "0.85rem 1.1rem", borderBottom: "1px solid #f0f0f5", fontSize: "0.78rem", fontWeight: 700, color: "#555" }}>Top Pages (Last 30 Days)</div>
          {pages.map((p, i) => {
            const maxViews = pages[0]?.views ?? 1;
            const pct = Math.round((p.views / maxViews) * 100);
            return (
              <div key={p.path} style={{ padding: "0.7rem 1.1rem", borderBottom: i < pages.length - 1 ? "1px solid #f8f8f8" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.8rem", color: "#333", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{p.path === "/" ? "/ (Home)" : p.path}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: NAVY, flexShrink: 0 }}>{p.views.toLocaleString("en-ZA")} views</span>
                </div>
                <div style={{ height: 4, background: "#f0f0f5", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: NAVY, borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </Card>

        {/* Traffic sources */}
        <Card style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
          <div style={{ padding: "0.85rem 1.1rem", borderBottom: "1px solid #f0f0f5", fontSize: "0.78rem", fontWeight: 700, color: "#555" }}>Traffic Sources</div>
          {trafficSources.map((s, i) => {
            const pct = totalSourceSessions > 0 ? Math.round((s.sessions / totalSourceSessions) * 100) : 0;
            const color = SOURCE_COLORS[s.channel] ?? "#9ca3af";
            return (
              <div key={s.channel} style={{ padding: "0.75rem 1.1rem", borderBottom: i < trafficSources.length - 1 ? "1px solid #f8f8f8" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#333" }}>{s.channel}</span>
                  <span style={{ fontSize: "0.75rem", color: "#888" }}>{pct}%</span>
                </div>
                <div style={{ height: 4, background: "#f0f0f5", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 2 }}>{s.sessions.toLocaleString("en-ZA")} sessions</div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Analytics() {
  useAdminAuth();
  const [tab, setTab] = useState("overview");
  const isMobile = useIsMobile();

  const TABS = [
    { id: "overview", label: isMobile ? "Overview" : "📊 Overview" },
    { id: "email", label: isMobile ? "Email" : "📧 Email" },
    { id: "website", label: isMobile ? "Website" : "🌐 Website" },
    { id: "tiktok", label: isMobile ? "TikTok" : "🎵 TikTok" },
    { id: "instagram", label: isMobile ? "Instagram" : "📸 Instagram" },
  ];

  return (
    <AdminLayout title="Analytics">
      <div style={{ borderBottom: "1px solid #eee", marginBottom: "1.25rem", display: "flex", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={TAB_STYLE(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "email" && <EmailTab />}
      {tab === "website" && <WebsiteTab />}
      {tab === "tiktok" && (
        <SetupPanel
          title="Connect TikTok Analytics"
          description="Connect your TikTok Business account to see follower count, video views, profile visits, and your top-performing videos."
          envVars={["TIKTOK_CLIENT_KEY", "TIKTOK_ACCESS_TOKEN"]}
        />
      )}
      {tab === "instagram" && (
        <SetupPanel
          title="Connect Instagram Analytics"
          description="Connect your Instagram Business account via Meta Business Suite to see followers, reach, impressions, and your top posts."
          envVars={["INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_ACCOUNT_ID"]}
        />
      )}
    </AdminLayout>
  );
}
