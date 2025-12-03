"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExpensesForm({
  userId,
  walletId,
  categories,
}: {
  userId?: string;
  walletId?: string;
  categories: { id: number; name: string }[];
}) {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!amount) {
      setError("Enter amount");
      return;
    }

    const payload = {
      wallet_id: walletId ?? null,     // server resolves user_id using wallet_id
      category_id: category ? Number(category) : null,
      amount: Number(amount),
      description,
      date,
    };

    try {
      setSubmitting(true);

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error || "Failed to add expense");
        return;
      }

      setDescription("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().slice(0, 10));

      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 border rounded"
      />

      <input
        placeholder="Amount"
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
        className="p-2 border rounded"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">— Select category —</option>
        {categories.map((c) => (
          <option key={c.id} value={String(c.id)}>
            {c.id} — {c.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="p-2 border rounded"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white p-2 rounded"
      >
        {submitting ? "Saving..." : "Add Expense"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}