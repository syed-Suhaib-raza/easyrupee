export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-500">Wallet Balance, Quick Links, and Recent Activity</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="border p-4 rounded">Wallet Balance<br/><strong>PKR 0.00</strong></div>
        <div className="border p-4 rounded">Recent Transactions</div>
        <div className="border p-4 rounded">Shortcuts</div>
      </div>
    </section>
  )
}
