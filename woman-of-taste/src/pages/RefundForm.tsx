import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";

type Stage = "loading" | "form" | "submitting" | "success" | "already" | "invalid" | "error";

interface RefundInfo {
  firstName: string;
  surname: string;
  eventTitle: string;
  eventDate: string;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
}

const SA_BANKS = [
  "ABSA",
  "Capitec Bank",
  "FNB (First National Bank)",
  "Nedbank",
  "Standard Bank",
  "African Bank",
  "Discovery Bank",
  "Investec",
  "TymeBank",
  "Other",
];

const BRANCH_CODES: Record<string, string> = {
  "ABSA": "632005",
  "Capitec Bank": "470010",
  "FNB (First National Bank)": "250655",
  "Nedbank": "198765",
  "Standard Bank": "051001",
  "African Bank": "430000",
  "Discovery Bank": "679000",
  "Investec": "580105",
  "TymeBank": "678910",
};

function fmtZAR(v: number) {
  return `R ${v.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

export default function RefundForm() {
  const { token } = useParams<{ token: string }>();
  const [stage, setStage] = useState<Stage>("loading");
  const [info, setInfo] = useState<RefundInfo | null>(null);
  const [error, setError] = useState("");

  const [accountHolder, setAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [accountType, setAccountType] = useState("");

  useEffect(() => {
    if (!token) { setStage("invalid"); return; }
    fetch(`/api/refund/${token}`)
      .then(async r => {
        const data = await r.json();
        if (r.ok && data.ok) {
          setInfo(data.refund);
          if (data.refund.status === "SUBMITTED" || data.refund.status === "PROCESSED") {
            setStage("already");
          } else {
            setStage("form");
          }
        } else if (r.status === 404) {
          setStage("invalid");
        } else {
          setError(data.error ?? "Something went wrong.");
          setStage("error");
        }
      })
      .catch(() => { setStage("error"); setError("Could not load your refund request."); });
  }, [token]);

  function handleBankChange(bank: string) {
    setBankName(bank);
    setBranchCode(BRANCH_CODES[bank] ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStage("submitting");
    try {
      const res = await fetch(`/api/refund/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountHolder, bankName, accountNumber, branchCode, accountType }),
      });
      const data = await res.json();
      if (res.status === 409) { setStage("already"); return; }
      if (!data.ok) { setError(data.error ?? "Submission failed."); setStage("error"); return; }
      setStage("success");
    } catch {
      setError("Network error. Please try again.");
      setStage("form");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "hsl(40,25%,96%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Raleway, sans-serif", padding: "2rem",
    }}>
      <div style={{ width: "100%", maxWidth: 540 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <style>{`
            @keyframes wotFloat {
              0%,100%{transform:translateY(0) scale(1);filter:drop-shadow(0 0 10px rgba(201,169,110,0.4));}
              50%{transform:translateY(-7px) scale(1.05);filter:drop-shadow(0 0 22px rgba(201,169,110,0.75));}
            }
            .wot-logo-float{animation:wotFloat 3.5s ease-in-out infinite;}
          `}</style>
          <img src="/wot-logo.png" alt="Woman of Taste" className="wot-logo-float" style={{ height: 72, marginBottom: "0.75rem" }} />
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.15rem", color: "hsl(225,50%,22%)", fontWeight: 600 }}>Woman of Taste</div>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "hsl(38,45%,55%)" }}>Refund Portal</div>
        </div>

        <div style={{
          background: "white", borderRadius: 20, padding: "2.25rem 2rem",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
        }}>
          {stage === "loading" && <LoadingState />}
          {stage === "form" && (
            <FormState
              info={info!}
              accountHolder={accountHolder} setAccountHolder={setAccountHolder}
              bankName={bankName} setBankName={handleBankChange}
              accountNumber={accountNumber} setAccountNumber={setAccountNumber}
              branchCode={branchCode} setBranchCode={setBranchCode}
              accountType={accountType} setAccountType={setAccountType}
              onSubmit={handleSubmit}
            />
          )}
          {stage === "submitting" && <LoadingState message="Submitting your bank details…" />}
          {stage === "success" && <SuccessState info={info} />}
          {stage === "already" && <AlreadyState info={info} />}
          {stage === "invalid" && <InvalidState />}
          {stage === "error" && <ErrorState message={error} />}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/" style={{ fontSize: "0.75rem", color: "hsl(225,50%,40%)", textDecoration: "none" }}>
            ← womanoftaste.co.za
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingState({ message = "Loading your refund request…" }: { message?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid hsl(40,25%,90%)", borderTopColor: "hsl(38,45%,65%)", animation: "spin 0.8s linear infinite", margin: "0 auto 1.25rem" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#888", fontSize: "0.9rem", margin: 0 }}>{message}</p>
    </div>
  );
}

function BookingRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: last ? 0 : "0.55rem", marginBottom: last ? 0 : "0.55rem", borderBottom: last ? "none" : "1px solid hsl(40,25%,90%)" }}>
      <span style={{ fontSize: "0.7rem", color: "#999", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: "0.82rem", color: "hsl(225,50%,22%)", fontWeight: 600, textAlign: "right", maxWidth: "65%" }}>{value}</span>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888", marginBottom: "0.4rem" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.85rem", border: "1px solid #dde", borderRadius: 8,
  fontFamily: "Raleway, sans-serif", fontSize: "0.88rem", color: "#1a1a2e",
  outline: "none", boxSizing: "border-box", background: "#fafafe",
};

const SELECT_STYLE: React.CSSProperties = {
  ...INPUT_STYLE, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M6 8L0 0h12z' fill='%23aaa'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", paddingRight: "2rem",
};

function FormState({
  info, accountHolder, setAccountHolder, bankName, setBankName,
  accountNumber, setAccountNumber, branchCode, setBranchCode,
  accountType, setAccountType, onSubmit,
}: {
  info: RefundInfo;
  accountHolder: string; setAccountHolder: (v: string) => void;
  bankName: string; setBankName: (v: string) => void;
  accountNumber: string; setAccountNumber: (v: string) => void;
  branchCode: string; setBranchCode: (v: string) => void;
  accountType: string; setAccountType: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "hsl(225,50%,95%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.5rem" }}>🏦</div>
        <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.55rem", color: "hsl(225,50%,22%)", margin: "0 0 0.4rem" }}>
          Refund Bank Details
        </h2>
        <p style={{ fontSize: "0.83rem", color: "#777", margin: 0, lineHeight: 1.6 }}>
          Hi {info.firstName}! Please provide your banking details so we can process your refund.
        </p>
      </div>

      {/* Booking summary */}
      <div style={{ background: "hsl(40,25%,98%)", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: "1.5rem", border: "1px solid hsl(40,25%,88%)" }}>
        <BookingRow label="Event" value={info.eventTitle} />
        <BookingRow label="Date" value={info.eventDate} />
        <BookingRow label="Invoice" value={info.invoiceNumber} />
        <BookingRow label="Refund Amount" value={fmtZAR(info.totalAmount)} last />
      </div>

      <form onSubmit={onSubmit}>
        <Field label="Account Holder Name" required>
          <input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} required placeholder="As it appears on your bank account"
            style={INPUT_STYLE} />
        </Field>

        <Field label="Bank" required>
          <select value={bankName} onChange={e => setBankName(e.target.value)} required style={SELECT_STYLE}>
            <option value="">Select your bank…</option>
            {SA_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Account Number" required>
            <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required placeholder="e.g. 1234567890"
              style={INPUT_STYLE} inputMode="numeric" />
          </Field>
          <Field label="Branch Code" required>
            <input value={branchCode} onChange={e => setBranchCode(e.target.value)} required placeholder="e.g. 250655"
              style={INPUT_STYLE} inputMode="numeric" />
          </Field>
        </div>

        <Field label="Account Type" required>
          <select value={accountType} onChange={e => setAccountType(e.target.value)} required style={SELECT_STYLE}>
            <option value="">Select account type…</option>
            <option value="Cheque / Current">Cheque / Current</option>
            <option value="Savings">Savings</option>
            <option value="Transmission">Transmission</option>
          </select>
        </Field>

        <button type="submit" style={{
          width: "100%", padding: "0.9rem", border: "none", borderRadius: 10,
          background: "linear-gradient(135deg, hsl(225,50%,22%), hsl(225,42%,32%))",
          color: "white", fontFamily: "Raleway, sans-serif", fontSize: "0.88rem",
          fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", marginTop: "0.5rem",
        }}>
          Submit Bank Details
        </button>

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#aaa", marginTop: "0.85rem", lineHeight: 1.5 }}>
          Your banking details are transmitted securely and used only to process this refund.
        </p>
      </form>
    </div>
  );
}

function SuccessState({ info }: { info: RefundInfo | null }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "1.75rem" }}>✓</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: "hsl(225,50%,22%)", margin: "0 0 0.5rem" }}>
        Details Received
      </h2>
      <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.82rem", margin: "0 0 1.25rem", letterSpacing: "0.05em" }}>
        THANK YOU — WE'LL PROCESS YOUR REFUND SHORTLY
      </p>
      {info && (
        <div style={{ background: "hsl(40,25%,98%)", borderRadius: 12, padding: "1.1rem 1.25rem", marginBottom: "1.25rem", border: "1px solid hsl(40,25%,88%)", textAlign: "left" }}>
          <BookingRow label="Event" value={info.eventTitle} />
          <BookingRow label="Refund Amount" value={fmtZAR(info.totalAmount)} last />
        </div>
      )}
      <p style={{ fontSize: "0.83rem", color: "#666", lineHeight: 1.7, margin: 0 }}>
        Your bank details have been securely received. Our team will review and process your refund. You'll hear from us at <strong>{info?.eventTitle ? "info@womanoftaste.co.za" : "info@womanoftaste.co.za"}</strong> once it's done.
      </p>
    </div>
  );
}

function AlreadyState({ info }: { info: RefundInfo | null }) {
  const isProcessed = info?.status === "PROCESSED";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{isProcessed ? "✅" : "ℹ️"}</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem" }}>
        {isProcessed ? "Refund Processed" : "Details Already Submitted"}
      </h2>
      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.7 }}>
        {isProcessed
          ? "Your refund has already been processed. If you have any questions, please contact us at info@womanoftaste.co.za."
          : "Your banking details have already been submitted. Our team is reviewing your refund. If you need help, please contact info@womanoftaste.co.za."}
      </p>
    </div>
  );
}

function InvalidState() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔗</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem" }}>Invalid Link</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.7 }}>
        This refund link is invalid or has expired. Please contact us at <a href="mailto:info@womanoftaste.co.za" style={{ color: "hsl(225,50%,40%)" }}>info@womanoftaste.co.za</a> for assistance.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "hsl(225,50%,22%)", margin: "0 0 0.75rem" }}>Something Went Wrong</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.7 }}>
        {message || "An unexpected error occurred. Please try again or contact info@womanoftaste.co.za."}
      </p>
    </div>
  );
}
