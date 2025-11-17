'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')

  async function handleRegister(e:any) {
    e.preventDefault()
    const queryData = {
    email: `${email}`,
    password: `${password}`
    };
    const params = new URLSearchParams(queryData);
    const response = await fetch(`/api/users?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if(response){
      const result = await fetch('/api/log', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, password })
    })    
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">Register (demo)</h1>
      <form onSubmit={handleRegister} className="mt-4 space-y-3">
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" value={password} onChange={e=>setPass(e.target.value)} />
        <button className="btn btn-neutral btn-outline">Submit</button>
      </form>
    </main>
  )
}
