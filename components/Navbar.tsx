'use client'
import Link from 'next/link'

export default function Navbar(){
  return (
  <div className="navbar bg-base-100 shadow-sm">
    <div className="flex-1">
      <Link href="/"><span className="font-bold text-xl">EasyRupee</span></Link>
    </div>
    <div className="flex-none">
      <ul className="menu menu-horizontal px-1">
        <Link href="/dashboard" className='btn btn-soft btn-accent'>Dashboard</Link>
        <Link href="/transactions" className='btn btn-soft btn-accent'>Transactions</Link>
        <Link href="/expenses" className='btn btn-soft btn-accent'>Expenses</Link>
        <Link href="/bills" className='btn btn-soft btn-accent'>Bills</Link>
        <Link href="/loans" className='btn btn-soft btn-accent'>Loans</Link>
        <Link href="/profile" className='btn btn-soft btn-accent'>Profile</Link>
      </ul>
    </div>
  </div>
  )
}