import React from "react";
import { cookies } from "next/headers";
import ExpensesForm from "./ExpensesForm"; // client subcomponent

type Expense = {
  expense_id?: number | string;
  id?: number | string;
  amount?: number | string;
  description?: string;
  date_recorded?: string;
};

async function fetchExpenses(userId?: string, walletId?: string): Promise<Expense[]> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set("user_id", userId);
    if (walletId) params.set("wallet_id", walletId);

    const base = process.env.NEXT_PUBLIC_SITE_URL || "";
    const url = `${base}/api/expenses${params.size ? `?${params}` : ""}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

export default async function ExpensesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("USER")?.value;
  const walletId = cookieStore.get("walletId")?.value;

  const expenses = await fetchExpenses(userId, walletId);

  const CATEGORIES = [
    { id: 4, name: "Entertainment" },
    { id: 6, name: "Food" },
    { id: 5, name: "Other" },
    { id: 1, name: "Rent" },
    { id: 3, name: "Salary" },
    { id: 2, name: "Utilities" },
  ];

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Expenses</h1>

      <section className="mt-6 mb-8 max-w-md">
        <h2 className="font-semibold mb-2">Add Expense</h2>

        {/* client component */}
        <ExpensesForm userId={userId} walletId={walletId} categories={CATEGORIES} />
      </section>

      <section>
        <h2 className="font-semibold mb-3">Recorded Expenses</h2>

        {expenses.length === 0 ? (
          <p className="text-sm text-gray-600 mt-2">No expenses recorded.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {expenses.map((e) => (
              <div key={e.expense_id} className="border p-3 rounded">
                <div className="flex justify-between">
                  <span>{e.description}</span>
                  <strong>Rs. {e.amount}</strong>
                </div>
                <div className="text-sm text-gray-600">Date: {e.date_recorded}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}