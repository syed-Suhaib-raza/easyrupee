'use client'
import Link from 'next/link'

export default function Sidebar(){
  return (
    <aside className="w-64 border-r p-4 hidden md:block">
      <nav className="space-y-2">
        <Link href="/dashboard" className="block">Dashboard</Link>
        <Link href="/transactions" className="block">Transactions</Link>
        <Link href="/expenses" className="block">Expenses</Link>
        <Link href="/bills" className="block">Bills</Link>
        <Link href="/loans" className="block">Loans</Link>
      </nav>
    </aside>
  )
}
