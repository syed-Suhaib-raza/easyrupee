// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { db } from "@/lib/db";
import { cookies } from "next/headers";


function formatPKR(amount: number | null | undefined) {
  const value = typeof amount === "number" ? amount : 0;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateShort(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}


async function getWalletForUser(userId: number) {
  try {
    const [rows] = (await db.query(
      `SELECT balance FROM Wallets WHERE user_id = ? LIMIT 1`,
      [userId]
    )) as any;
    return rows?.length ? Number(rows[0].balance) : 0;
  } catch (err) {
    console.error("getWalletForUser error:", err);
    return 0;
  }
}

async function getRecentTransactions(userId: number, limit = 8) {
  try {
    const [rows] = (await db.query(
      `SELECT transaction_id, amount, type, description, created_at 
       FROM Transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    )) as any;
    return rows || [];
  } catch (err) {
    console.error("getRecentTransactions error:", err);
    return [];
  }
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const store = await cookies();
  const name = store.get("name")?.value || "Guest";
  if (!userId) redirect("/login");

  const [balance, transactions] = await Promise.all([
    getWalletForUser(userId),
    getRecentTransactions(userId, 10),
  ]);

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back{userId ? ` — user #${name}` : ""}. Overview of your wallet and recent activity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm shadow-sm hover:shadow transition"
            onClick={() => {}}
          >
            {/* small settings icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0a1.724 1.724 0 002.468 1.04c.84-.49 1.846.314 1.449 1.191-.24.52-.15 1.134.242 1.56.66.7.51 1.83-.29 2.28a1.724 1.724 0 00-.47 2.494c.452.683-.019 1.64-.859 1.74a1.724 1.724 0 00-1.534 1.497c-.07.74-.78 1.24-1.48.95-.56-.24-1.22-.08-1.56.42-.5.77-1.6.92-2.34.29-.46-.39-1.06-.44-1.57-.12-.72.45-1.6.02-1.8-.79a1.724 1.724 0 00-1.8-1.98c-.8.05-1.52-.59-1.45-1.39.07-.8-.42-1.52-1.2-1.68-.86-.19-1.2-1.26-.62-1.9.46-.52.2-1.32-.5-1.58-.83-.3-1.03-1.46-.37-2.06.6-.55.52-1.53-.16-1.98C2.91 6.3 2.71 4.88 3.9 4.2c.98-.56 1.01-1.86.06-2.47C3.04.96 3.37 0 4.34 0c.69 0 1.26.44 1.43 1.09.15.57.66.98 1.26 1.05.3.03.56-.11.75-.34a1.724 1.724 0 012.57-.1z" />
            </svg>
            <span className="text-gray-700">Settings</span>
          </button>

          <a
            href="/wallet/deposit"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm shadow-sm hover:bg-indigo-700 transition"
          >
            Add Funds
          </a>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Wallet card + quick actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg bg-gradient-to-r from-white to-gray-50 border p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">{formatPKR(balance)}</span>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Your current balance. Withdrawals and deposits reflect here in real time.
                </p>
              </div>

              <div className="ml-4 shrink-0">
                {/* clean wallet icon */}
                <div className="bg-indigo-50 text-indigo-600 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8h18M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M7 8V6a3 3 0 013-3h4a3 3 0 013 3v2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <a
                href="/transactions"
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-gray-50 transition"
              >
                Send
              </a>
              <a
                href="/transactions"
                className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 bg-white border rounded-md text-sm hover:bg-gray-50 transition"
              >
                Withdraw
              </a>
            </div>
          </div>

          <div className="rounded-lg border p-4 bg-white shadow-sm">
            <h3 className="text-sm font-medium text-gray-800">Quick Actions</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href="/invoices" className="p-3 rounded-md hover:bg-gray-50 text-sm border flex items-center justify-center">Invoices</a>
              <a href="/contacts" className="p-3 rounded-md hover:bg-gray-50 text-sm border flex items-center justify-center">Contacts</a>
              <a href="/topup" className="p-3 rounded-md hover:bg-gray-50 text-sm border flex items-center justify-center">Top-up</a>
              <a href="/support" className="p-3 rounded-md hover:bg-gray-50 text-sm border flex items-center justify-center">Support</a>
            </div>
          </div>
        </div>

        {/* Right column: Transactions */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-900">Recent Transactions</h2>
              <a href="/transactions" className="text-sm text-indigo-600 hover:underline">View all</a>
            </div>

            <div className="mt-4">
              {transactions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No recent transactions. Your activity will appear here.
                </div>
              ) : (
                <ul className="divide-y">
                  {transactions.map((t: any) => {
                    const positive = Number(t.amount) >= 0;
                    return (
                      <li key={t.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium">
                            {/* simple initials/icon */}
                            {t.type ? t.type.charAt(0).toUpperCase() : "T"}
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {t.description || (t.type ? t.type.toUpperCase() : "Transaction")}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {formatDateShort(t.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-sm font-semibold ${positive ? "text-green-600" : "text-red-600"}`}>
                            {positive ? "+" : "-"}{formatPKR(Math.abs(Number(t.amount)))}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">ID: {t.id}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}