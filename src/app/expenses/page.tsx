async function getExpenses(){
  const base = process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL;

  const res = await fetch(`${base}/api/expenses`, {
    cache: "no-store",
  });

  return res.json();
}

export default async function ExpensesPage() {
  const items = await getExpenses()
  return (
    <section>
      <h1 className="text-2xl font-bold">Expenses</h1>
      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="text-gray-500">No expenses recorded.</p>}
        {items.map((e:any)=>(
          <div key={e.id} className="border p-3 rounded">
            <div className="flex justify-between"><span>{e.description}</span><strong>{e.amount}</strong></div>
            <div className="text-sm text-gray-600">Date: {e.date}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
