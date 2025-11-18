'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  async function handleLogin(e: any) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) return router.push("/dashboard");
    setMsg(data.error || "Login failed");
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-5 text-center">Login</h1>
      <div className="flex justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 space-y-4">
        <label className="label">Email</label>
        <input type="email" className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>

        <label className="label">Password</label>
        <input type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPass(e.target.value)} />

        <button className="btn btn-neutral mt-4 rounded-field" onClick={handleLogin}>Login</button>
      </fieldset>
      </div>
      

      {msg && <p className="mt-4 text-red-600">{msg}</p>}
    </main>
  );
}