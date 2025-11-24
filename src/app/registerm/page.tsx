'use client'
import { redirect } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState('')

  async function handleRegister(e:any) {
    e.preventDefault()
    await fetch('/api/auth/registerm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, category })
    })
    return (
        <main>
        <div className='alert alert-success alert-soft'>
            <h2>Registration Successful!</h2>
        </div>
        </main>
    )
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5 text-center">Register</h1>
      <div className="flex justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 space-y-4">
        <label className="label">Name</label>
        <input type="text" className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}/>
        
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>

        <label className="label">Password</label>
        <input type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <label className="label">Phone</label>
        <input type="tel" className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>

        <label className="label" htmlFor="category">Business Category</label>
        <select
            id="category"
            className="select select-bordered w-full rounded-field bg-base-100"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Business Category"
        >
            <option value="" disabled hidden>Select category</option>
            <option value="1">Retail</option>
            <option value="2">Food</option>
            <option value="3">Entertainment</option>
            <option value="4">Utility</option>
        </select>

        <p><a href="/register">Are you a user?</a></p>

        <button className="btn btn-neutral rounded-field" onClick={handleRegister}>Register</button>
        <button className="btn btn-accent rounded-field" onClick={() => redirect('/login')}>Login</button>
      </fieldset>
      </div>
    </main>
  )
}
