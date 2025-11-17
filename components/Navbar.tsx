'use client'
import Link from 'next/link'

export default function Navbar(){
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto p-3 flex items-center justify-between">
        <Link href="/"><span className="font-bold">EasyRupee</span></Link>
        <div className="space-x-3">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/transactions">Transactions</Link>
          <Link href="/expenses">Expenses</Link>
          <Link href="/bills">Bills</Link>
          <Link href="/loans">Loans</Link>
          <Link href="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  )
}
