export default function HomePage() {
  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold">EasyRupee</h1>
      <p className="mt-4 text-gray-600">A Digital Wallet & Expense Management System</p>
      <div className="mt-6 space-x-3">
        <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded">Login</a>
        <a href="/register" className="border px-4 py-2 rounded">Register</a>
      </div>
    </section>
  )
}
