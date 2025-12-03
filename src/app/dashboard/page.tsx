// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

function formatPKR(amount: number | null | undefined) {
  const value = amount ?? 0;
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
} // <-- added missing closing brace here

async function getRecentTransactions(walletId: number | string | undefined, limit = 8) {
  if (!walletId) return [];
  try {
    const [rows] = (await db.query(
      `SELECT transaction_id AS id,
              amount,
              type_id AS type,
              description,
              created_at,
              wallet_id_send,
              wallet_id_recv
       FROM Transactions 
       WHERE wallet_id_send = ? OR wallet_id_recv = ?
       ORDER BY created_at DESC 
       LIMIT ?`,
      [walletId, walletId, Number(limit)]
    )) as any;
    return rows || [];
  } catch (err) {
    console.error("getRecentTransactions error:", err);
    return [];
  }
}
async function getBal(walletId: number | string |undefined){
  try {
    const [rows] = (await db.query(
      `SELECT balance 
       FROM Wallets 
       WHERE wallet_id = ?`,
      [walletId]
    )) as any;
    return (rows && rows[0] && rows[0].balance) ?? 0;
  } catch (err) {
    console.error("getBal error:", err);
    return (0);
  }
}

export default async function DashboardPage() {
  const store = await cookies();
  const userId = store.get("userId");
  const wallet = store.get("walletId")?.value;
  if (!userId) redirect("/login");
  console.log(wallet);
  const cookieName = store.get("USER")?.value ?? null;
  const balanceFromDB = await getBal(wallet);

  const transactions = await getRecentTransactions(wallet , 10);

  const sampleRows = [
    { id: "S1", description: "Sample: Receive salary", created_at: new Date().toISOString(), amount: 50000 },
    { id: "S2", description: "Sample: Groceries", created_at: new Date().toISOString(), amount: -3500 },
    { id: "S3", description: "Sample: Mobile top-up", created_at: new Date().toISOString(), amount: -500 },
  ];

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-600">
          {cookieName ? `Welcome back — ${cookieName}.` : "Welcome back — Guest."}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance card */}
        <div className="lg:col-span-1 border rounded p-5 bg-blue">
          <div className="text-xs text-gray-500">Available Balance</div>
          <div className="text-3xl font-bold mt-2">{formatPKR(balanceFromDB)}</div>

          <div className="mt-4 flex gap-2">
            <a href="/transactions" className="flex-1 inline-block text-center px-3 py-2 border rounded">Add funds</a>
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 border rounded p-5 bg-blue">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent Transactions</h2>
            <a href="/transactions" className="text-sm underline">View all</a>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              {/* Plain visual placeholder instead of SVG */}
              <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <div className="text-xs">No data</div>
              </div>

              <div className="text-lg font-semibold mb-2">No transactions yet</div>
              <div className="text-sm text-gray-500 mb-6">
                You haven't logged any transactions for this wallet. Start by sending or receiving money.
              </div>

              <div className="flex items-center justify-center gap-4">
                <a href="/transactions/new" className="px-4 py-2 border rounded-md">Make a transaction</a>
              </div>

              {/* sample rows so the panel isn't empty */}
              <ul className="mt-8 divide-y max-w-2xl mx-auto">
                {sampleRows.map((s) => {
                  const positive = s.amount >= 0;
                  return (
                    <li key={s.id} className="py-3 flex justify-between items-center opacity-80">
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-700">{s.description}</div>
                        <div className="text-xs text-gray-400">{formatDateShort(s.created_at)}</div>
                      </div>
                      <div className={`text-sm font-semibold ${positive ? "text-green-600" : "text-red-600"}`}>
                        {positive ? "+" : "-"}{formatPKR(Math.abs(s.amount))}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <ul className="divide-y">
              {transactions.map((t: any) => {
                // compare DB wallet ids to current wallet cookie (both as strings)
                const isSender = String(t.wallet_id_send) === String(wallet);
                const isReceiver = String(t.wallet_id_recv) === String(wallet);

                // fallback: if neither matches assume it's a neutral transaction (use sign from amount)
                const amountNum = Number(t.amount);
                const positive = isReceiver ? true : isSender ? false : amountNum >= 0;

                return (
                  <li key={t.id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{t.description || (t.type ? String(t.type).toUpperCase() : "Transaction")}</div>
                      <div className="text-xs text-gray-500">{formatDateShort(t.created_at)}</div>
                    </div>
                    <div className={`text-sm font-semibold ${positive ? "text-green-600" : "text-red-600"}`}>
                      {positive ? "+" : "-"}{formatPKR(Math.abs(Number(t.amount)))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}