"use client";

import { useEffect, useState } from "react";

type Bill = {
  bill_id: number;
  merchant_id?: number;
  merchant_name?: string | null;
  amount: number;
  status_id?: number;
  status_name?: string;
  due_date?: string;
};

type Wallet = {
  wallet_id: number;
  label?: string | null;
  balance?: number;
  user_id?: number;
};

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [payAmount, setPayAmount] = useState<number | "">("");
  const [payWallet, setPayWallet] = useState<number | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBills();
    loadWalletFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWalletFromServer() {
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (!res.ok) {
        // fallback to listing wallets from API if /api/wallet returns 404 or error
        await fetchWallets();
        return;
      }
      const data = await res.json();
      // Expecting { wallet_id: number } or { wallet_id: null }
      if (data?.wallet_id) {
        setWallets([{ wallet_id: Number(data.wallet_id), label: "Default Wallet" }]);
        setPayWallet(Number(data.wallet_id));
      } else {
        await fetchWallets();
      }
    } catch {
      // fallback to fetch wallets list
      await fetchWallets();
    }
  }

  async function fetchBills() {
    setLoading(true);
    try {
      const res = await fetch("/api/bills", { cache: "no-store" });
      if (!res.ok) {
        setBills([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setBills(data);
      else setBills([]);
    } catch {
      setBills([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWallets() {
    try {
      const res = await fetch("/api/wallets", { cache: "no-store" });
      if (!res.ok) {
        setWallets([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setWallets(data);
        if (data.length > 0 && !payWallet) setPayWallet(data[0].wallet_id);
      } else {
        setWallets([]);
      }
    } catch {
      setWallets([]);
    }
  }

  function openPayModal(bill: Bill) {
    setSelectedBill(bill);
    setPayAmount(bill.amount); // default pay full outstanding
    setPayWallet(wallets.length > 0 ? wallets[0].wallet_id : "");
    setError(null);
    setShowPayModal(true);
  }

  function closeModal() {
    setShowPayModal(false);
    setSelectedBill(null);
    setPayAmount("");
    setPayWallet("");
    setError(null);
  }

  async function submitPayment(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!selectedBill) return setError("No bill selected.");
    const amt = Number(payAmount);
    if (!payAmount || Number.isNaN(amt) || amt <= 0) return setError("Enter a positive amount.");
    if (amt > selectedBill.amount) return setError("Payment cannot exceed outstanding bill amount.");
    if (!payWallet) return setError("Select a wallet to pay from.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bill_id: selectedBill.bill_id,
          amount: amt,
          wallet_id_send: Number(payWallet),
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? `Server returned ${res.status}`);

      // success: refetch bills & wallets to refresh balances and bill amounts
      await fetchBills();
      await fetchWallets();
      closeModal();
    } catch (err: any) {
      setError(err?.message ?? "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-bold">Bills</h1>
      <p className="mt-2 text-gray-500">Pay and manage bills</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-gray-500">Loading bills...</div>
        ) : bills.length === 0 ? (
          <div className="text-gray-400">No bills found.</div>
        ) : (
          bills.map((bill) => (
            <div key={bill.bill_id} className="border p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="font-semibold">{bill.merchant_name || "Unknown Merchant"}</p>
                <p className="text-gray-500 text-sm">Due: {bill.due_date?.slice(0, 10)}</p>
              </div>

              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-bold">Rs {Number(bill.amount).toFixed(2)}</p>
                <p className={bill.status_id === 1 ? "text-green-600" : bill.status_id === 2 ? "text-red-600" : "text-orange-500"}>
                  {bill.status_name}
                </p>
                <button
                  onClick={() => openPayModal(bill)}
                  className="mt-2 px-3 py-1 rounded bg-blue-600 text-white text-sm"
                >
                  Pay
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pay modal */}
      {showPayModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form onSubmit={submitPayment} className="bg-black rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-2">Pay bill — {selectedBill.merchant_name ?? `#${selectedBill.bill_id}`}</h2>
            <p className="text-sm text-gray-600 mb-4">Outstanding: Rs {Number(selectedBill.amount).toFixed(2)}</p>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={payAmount === "" ? "" : String(payAmount)}
                onChange={(e) => setPayAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border rounded p-2"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Pay from wallet</label>
              {wallets.length > 0 ? (
                <select
                  value={String(payWallet)}
                  onChange={(e) => setPayWallet(Number(e.target.value))}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">— select wallet —</option>
                  {wallets.map((w) => (
                    <option key={w.wallet_id} value={w.wallet_id}>
                      {(w.label ? `${w.label} — ` : "") + `id:${w.wallet_id}` + (w.balance != null ? ` — Rs ${Number(w.balance).toFixed(2)}` : "")}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-gray-500">No wallets available</div>
              )}
            </div>

            {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={closeModal} className="px-3 py-2 rounded border">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-green-600 text-white">
                {submitting ? "Paying…" : "Pay"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}