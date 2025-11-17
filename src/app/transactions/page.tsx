async function getTx() {
  const base = process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL;

  const res = await fetch(`${base}/api/transactions`, {
    cache: "no-store",
  });

  return res.json();
}


export default async function TransactionsPage() {
  const tx = await getTx();

  return (
    <section>
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="mt-4 space-y-2">
        {tx.length === 0 && (
          <p className="text-gray-500">No transactions yet.</p>
        )}
        {tx.map((t: any) => (
          <div key={t.id} className="border p-3 rounded">
            <div className="flex justify-between">
              <span>{t.type}</span>
              <strong>{t.amount}</strong>
            </div>
            <div className="text-sm text-gray-600">{t.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
