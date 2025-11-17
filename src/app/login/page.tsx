'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  async function handleRegister(e:any) {
    e.preventDefault()
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    })
    alert('Registered (demo). You can now go to dashboard.')
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Register (demo)</h1>
      <form onSubmit={handleRegister} className="mt-4 space-y-3">
        <input className="border p-2 w-full" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </main>
  )
}
