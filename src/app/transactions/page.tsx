"use client";

import React, { useEffect, useState } from "react";

type Tx = {
  id: number | string;
  amount: number;
  description?: string;
  type_id: number;
  wallet_id_recv?: string | number;
  wallet_id_send?: string | number;
  created_at?: string;
};

type Wallet = {
  wallet_id: number | string;
  label?: string;
  balance?: number;
  user_id?: number | string;
};
export default function TransactionsPage() {
  const [tx, setTx] = useState<Tx[]>([]);
  const [wallets, setWallets] = useState<Wallet[] | null>(null);
  const [am, setAm]=useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingWallets, setLoadingWallets] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [typeId, setTypeId] = useState<string>("1");
  const [walletRecv, setWalletRecv] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  
  async function fetchTx() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch transactions (${res.status})`);
      const data = (await res.json()) as unknown;

      
      if (Array.isArray(data)) {
        setTx(data as Tx[]);
      } else {
        
        setTx([]);
      }
    } catch (err: any) {
      setError(err?.message ?? "Unknown error fetching transactions");
    } finally {
      setLoading(false);
    }
  }

  
  async function fetchWallets() {
    setLoadingWallets(true);
    try {
      const res = await fetch("/api/wallets", { cache: "no-store" });
      if (!res.ok) {
        setWallets(null);
        return;
      }
      const data = (await res.json()) as unknown;
      if (Array.isArray(data)) {
        setWallets(data as Wallet[]);
        if ((data as Wallet[]).length > 0) {
          const firstId = String((data as Wallet[])[0].wallet_id ?? (data as Wallet[])[0].wallet_id);
          setWalletRecv(firstId);
        }
      } else {
        setWallets(null);
      }
    } catch {
      setWallets(null);
    } finally {
      setLoadingWallets(false);
    }
  }

  useEffect(() => {
    fetchTx();
    fetchWallets();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    
    const amt = Number(amount);
    if (!amount || Number.isNaN(amt) || amt === 0) {
      setError("Enter a non-zero amount.");
      return;
    }
    if (!typeId) {
      setError("Choose a transaction category.");
      return;
    }
    if (!walletRecv) {
      setError("Enter/select a receiving wallet id.");
      return;
    }

    setSubmitting(true);

    const payload = {
      amount: amt,
      description,
      type_id: Number(typeId),
      wallet_recv: walletRecv,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `Server returned ${res.status}`);
      }

      const created = (await res.json()) as { id?: number | string; amount?: number; description?: string; type_id?: number };

      
      const newTx: Tx = {
        id: created.id ?? Date.now(),
        amount: created.amount ?? amt,
        description: created.description ?? description,
        type_id: (created.type_id ?? Number(typeId)) as number,
        wallet_id_recv: payload.wallet_recv,
        created_at: new Date().toISOString(),
      };

      
      setTx((prev) => [newTx, ...prev]);

      // reset form
      setAmount("");
      setDescription("");
      setTypeId("1");
      if (!wallets) setWalletRecv("");
    } catch (err: any) {
      setError(err?.message ?? "Unknown error while submitting");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Transactions — Demo (TS)</h1>

      <section className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4 bg-blue p-4 rounded shadow-sm border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="e.g. 100.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type (category)</label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full border rounded p-2"
                required
              >
                <option value="1">Food</option>
                <option value="3">Utilities</option>
                <option value="2">Entertainment</option>
                <option value="4">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="What is this transaction for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Receiving wallet (wallet_id_recv)</label>

            {loadingWallets ? (
              <div className="text-sm text-gray-500">Loading wallets...</div>
            ) : wallets && wallets.length > 0 ? (
              <select
                value={walletRecv}
                onChange={(e) => setWalletRecv(e.target.value)}
                className="w-full border rounded p-2"
                required
              >
                <option value="">— select a wallet —</option>
                {wallets.map((w) => (
                  <option key={String(w.wallet_id)} value={String(w.wallet_id)}>
                    {(w.label ? `${w.label} — ` : "") + `id:${w.wallet_id}` + (w.balance != null ? ` — ${w.balance}` : "")}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={walletRecv}
                onChange={(e) => setWalletRecv(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Enter receiving wallet id (e.g. 42)"
                required
              />
            )}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Create Transaction"}
            </button>

            <button
              type="button"
              onClick={() => {
                fetchTx();
                fetchWallets();
              }}
              className="px-3 py-2 rounded border"
            >
              Refresh
            </button>

            <div className="text-sm text-gray-500 ml-auto">{tx.length} transactions</div>
          </div>
        </form>
      </section>

      <section className="mb-5">
        <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>

        {loading ? (
          <div className="text-gray-500">Loading transactions...</div>
        ) : tx.length === 0 ? (
          <div className="text-gray-500">No transactions yet.</div>
        ) : (
          <div className="space-y-3">
            {tx.map((t) => (
              <div key={String(t.id)} className="border rounded p-3 bg-blue">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm text-gray-600">Type: {t.type_id}</div>
                  <div className="text-lg font-semibold">{t.amount}</div>
                </div>
                <div className="text-sm text-gray-700 mt-1">{t.description ?? <span className="text-gray-400">—</span>}</div>
                <div className="text-xs text-gray-500 mt-2 flex gap-3">
                  <span>recv: {String(t.wallet_id_recv ?? "—")}</span>
                  <span>send: {String(t.wallet_id_send ?? "—")}</span>
                  {t.created_at && <span>{new Date(t.created_at).toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="mt-5 mb-5">
  <div className="text-gray-400">
    <h1 className="mb-3">Deposit Amount</h1>

    <input
      type="number"
      placeholder="Enter amount to deposit"
      className="border p-2 rounded w-1/2 pr-5"
      value={am}
      onChange={(e) => setAm(Number(e.target.value))}
    />

    <button
      className="ml-3 px-4 py-2 rounded bg-green-600 text-white"
      onClick={async () => {
        await fetch("/api/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: am }),
        });
      }}
    >
      Deposit
    </button>
  </div>
</section>

    </main>
  );
}