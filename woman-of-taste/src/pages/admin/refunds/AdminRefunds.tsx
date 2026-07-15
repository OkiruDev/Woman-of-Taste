import { useEffect, useState, useCallback } from "react";
import { useAdminAuth, adminFetch } from "../AdminLogin";
import AdminLayout from "../AdminLayout";
import { RefreshCw, Copy, Check, Clock, Banknote, CircleCheck } from "lucide-react";
import { useIsMobile } from "../../../hooks/use-mobile";

interface RefundRequest {
  id: number;
  bookingId: number;
  invoiceNumber: string;
  firstName: string;
  surname: string;
  email: string;
  eventTitle: string;
  eventDate: string;
  totalAmount: number;
  status: string;
  accountHolder: string | null;
  bankName: string | null;
  accountNumber: string | null;
  branchCode: string | null;
  accountType: string | null;
  adminNotes: string | null;
  submittedAt: string | null;
  processedAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG = {
  PENDING_DETAILS: { label: "Awaiting Details", bg: "#fef3c7", text: "#92400e", icon: <Clock size={12} /> },
  SUBMITTED:       { label: "Details Submitted", bg: "#dbeafe", text: "#1e40af", icon: <Banknote size={12} /> },
  PROCESSED:       { label: "Processed", bg: "#dcfce7", text: "#166534", icon: <CircleCheck size={12} /> },
};

function fmtZAR(v: number) { return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`; }
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button onClick={copy} title={`Copy ${label ?? text}`}
      style={{ background: copied ? "#dcfce7" : "#f0f4ff", color: copied ? "#166534" : "hsl(225,50%,30%)", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", fontWeight: 600 }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : (label ?? "Copy")}
    </button>
  );
}

function BankDetails({ r }: { r: RefundRequest }) {
  if (!r.accountHolder) return <span style={{ color: "#aaa", fontSize: "0.78rem", fontStyle: "italic" }}>Not yet submitted</span>;
  const allDetails = `Account Holder: ${r.accountHolder}\nBank: ${r.bankName}\nAccount Number: ${r.accountNumber}\nBranch Code: ${r.branchCode}\nAccount Type: ${r.accountType}`;
  return (
    <div style={{ background: "hsl(220,25%,97%)", borderRadius: 10, padding: "0.85rem 1rem", border: "1px solid #e0e4f0", marginTop: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>Banking Details</span>
        <CopyButton text={allDetails} label="All Details" />
      </div>
      {[
        { label: "Account Holder", value: r.accountHolder },
        { label: "Bank", value: r.bankName! },
        { label: "Account No.", value: r.accountNumber! },
        { label: "Branch Code", value: r.branchCode! },
        { label: "Account Type", value: r.accountType! },
      ].map(({ label, value }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.72rem", color: "#888" }}>{label}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a1a2e" }}>{value}</span>
            <CopyButton text={value} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminRefunds() {
  useAdminAuth();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const isMobile = useIsMobile();

  const load = useCallback(async () => {
    setRefreshing(true);
    const res = await adminFetch("/admin/refunds");
    const d = await res.json();
    if (d.ok) setRefunds(d.refunds);
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function showMsg(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function markProcessed(r: RefundRequest) {
    if (!window.confirm(`Mark refund for ${r.firstName} ${r.surname} (${r.invoiceNumber}) as PROCESSED?\n\nThis confirms the money has been transferred.`)) return;
    setProcessing(r.id);
    const res = await adminFetch(`/admin/refunds/${r.id}/processed`, { method: "POST" });
    const d = await res.json();
    if (d.ok) { await load(); showMsg("Marked as processed ✓"); }
    else showMsg(d.error ?? "Failed.");
    setProcessing(null);
  }

  const counts = {
    pending: refunds.filter(r => r.status === "PENDING_DETAILS").length,
    submitted: refunds.filter(r => r.status === "SUBMITTED").length,
    processed: refunds.filter(r => r.status === "PROCESSED").length,
  };

  if (loading) return <AdminLayout title="Refunds"><div style={{ padding: "3rem", textAlign: "center", color: "#aaa" }}>Loading…</div></AdminLayout>;

  return (
    <AdminLayout title="Refunds">
      {msg && <div style={{ position: "fixed", bottom: "1.5rem", right: "1rem", left: isMobile ? "1rem" : "auto", background: "hsl(225,50%,22%)", color: "white", padding: "0.75rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, zIndex: 300, textAlign: isMobile ? "center" : "left" }}>{msg}</div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.65rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Awaiting Details", value: counts.pending, color: "#f59e0b" },
          { label: "Details Submitted", value: counts.submitted, color: "#3b82f6" },
          { label: "Processed", value: counts.processed, color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 10, padding: "0.85rem 1rem", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #eee" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#777", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ margin: 0, fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "hsl(225,50%,22%)" }}>
          All Refund Requests ({refunds.length})
        </h3>
        <button onClick={load} disabled={refreshing}
          style={{ background: "#f0f4ff", color: "hsl(225,50%,30%)", border: "none", borderRadius: 8, padding: "0.5rem 0.85rem", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw size={13} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} /> Refresh
        </button>
      </div>

      {refunds.length === 0 ? (
        <div style={{ background: "white", borderRadius: 12, padding: "3rem", textAlign: "center", color: "#aaa" }}>
          No refund requests yet. Use the "Request Refund" button on any booking to send a refund link to a guest.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {refunds.map(r => {
            const sc = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING_DETAILS;
            return (
              <div key={r.id} style={{ background: "white", borderRadius: 14, padding: "1.25rem", border: "1px solid #eee", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: "0.3rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>{r.firstName} {r.surname}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#aaa" }}>{r.invoiceNumber}</span>
                      <span style={{ background: sc.bg, color: sc.text, fontSize: "0.68rem", padding: "2px 9px", borderRadius: 99, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#888" }}>{r.email}</div>
                    <div style={{ fontSize: "0.82rem", color: "#555", fontWeight: 500, marginTop: "0.3rem" }}>{r.eventTitle}</div>
                    <div style={{ fontSize: "0.74rem", color: "#aaa" }}>{r.eventDate}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "hsl(225,50%,22%)" }}>{fmtZAR(r.totalAmount)}</div>
                    <div style={{ fontSize: "0.7rem", color: "#bbb", marginTop: 2 }}>Requested {fmtDate(r.createdAt)}</div>
                    {r.submittedAt && <div style={{ fontSize: "0.7rem", color: "#3b82f6", marginTop: 2 }}>Submitted {fmtDate(r.submittedAt)}</div>}
                    {r.processedAt && <div style={{ fontSize: "0.7rem", color: "#10b981", marginTop: 2 }}>Processed {fmtDate(r.processedAt)}</div>}
                  </div>
                </div>

                <BankDetails r={r} />

                {r.status === "SUBMITTED" && (
                  <div style={{ marginTop: "0.85rem" }}>
                    <button
                      onClick={() => markProcessed(r)}
                      disabled={processing === r.id}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.6rem 1rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", opacity: processing === r.id ? 0.6 : 1 }}
                    >
                      <CircleCheck size={15} />
                      {processing === r.id ? "Processing…" : "Mark as Processed (Refund Sent)"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}
