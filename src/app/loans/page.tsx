"use client";

import React, { useEffect, useState } from "react";

type Loan = {
  loan_id: number;
  principal: number;
  interest_rate?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status_id?: number | null;
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [payLoan, setPayLoan] = useState<Loan | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function loadLoans() {
    setLoading(true);
    try {
      const res = await fetch("/api/loans", { cache: "no-store" });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `Failed to load (${res.status})`);
      }
      const data = (await res.json()) as { loans?: Loan[] };
      setLoans(data.loans ?? []);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Unable to load loans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  async function submitPayment() {
    if (!payLoan) {
      setError("No loan selected");
      return;
    }

    const numericAmount = Number(amount);
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loan_id: payLoan.loan_id,
          amount_paid: numericAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? `Payment failed (${res.status})`);
        return;
      }

      // success
      setPayLoan(null);
      setAmount("");
      setError("");
      await loadLoans();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Payment failed");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Loans</h1>

      {loading && <p>Loading…</p>}
      {error && !loading && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {loans.map((l) => (
          <div
            key={l.loan_id}
            style={{
              padding: 14,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div><b>Loan #{l.loan_id}</b></div>
                <div>Outstanding: {formatPKR(l.principal)}</div>
                <div>Interest: {l.interest_rate ?? "—"}%</div>
                <div>
                  Period: {l.start_date ?? "—"} → {l.end_date ?? "—"}
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setPayLoan(l);
                    setAmount("");
                    setError("");
                  }}
                >
                  Make Payment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Modal */}
      {payLoan && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
    onClick={() => setPayLoan(null)}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "#0a1a3f",     // DARK BLUE BG
        padding: 20,
        borderRadius: 8,
        width: 350,
        color: "white",            // WHITE TEXT
      }}
    >
      <h3>Pay Loan #{payLoan.loan_id}</h3>
      <p>Outstanding: {formatPKR(payLoan.principal)}</p>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "100%",
          marginTop: 10,
          marginBottom: 10,
          padding: "8px",
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      {error && <p style={{ color: "#ff8080" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={() => setPayLoan(null)}
          style={{
            background: "#344a8c",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
          }}
        >
          Cancel
        </button>
        <button
          onClick={submitPayment}
          style={{
            background: "#1e3aa8",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

function formatPKR(amount: number | null | undefined) {
  const value = amount ?? 0;
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 2 }).format(
    value
  );
}