"use client";

import React, { useEffect, useState } from "react";

type Profile = {
  user_id: number | string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load profile");
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        setProfile(data);
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          password: "",
          phone: data.phone ?? "",
        });
        setError(null);
      })
      .catch((err) => {
        setError(err?.message ?? "Unknown error");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setSuccess(null);
    setError(null);
  }

  function validate() {
    if (!form.name.trim()) {
      return "Name is required";
    }
    if (!form.email.trim()) {
      return "Email is required";
    }
    const emailRe = /^\S+@\S+\.\S+$/;
    if (!emailRe.test(form.email)) {
      return "Email looks invalid";
    }
    if (form.password && form.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (form.phone && !/^\d{3,15}$/.test(form.phone)) {
      return "Phone should be digits only (3-15 digits)";
    }
    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      if (!res.ok) {
        try {
          const json = JSON.parse(text);
          throw new Error(json?.error || JSON.stringify(json) || text || "Update failed");
        } catch {
          throw new Error(text || "Update failed");
        }
      }
      const updated = JSON.parse(text);
      setProfile(updated);
      setForm((s) => ({ ...s, password: "" }));
      setSuccess("Profile updated.");
    } catch (err: any) {
      setError(err?.message ?? "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading profile…</div>;
  }

  if (!profile) {
    return <div className="p-6 text-red-600">No profile found. Are you authenticated?</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your profile</h1>

      {error && (
        <div className="mb-4 text-red-700 bg-blue p-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-green-700 bg-blue p-3 rounded">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            className="w-full border rounded p-2"
            disabled={saving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password (leave blank to keep)</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            className="w-full border rounded p-2"
            disabled={saving}
            placeholder="•••••• (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded p-2"
            disabled={saving}
            placeholder="digits only"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-dark-blue text-white rounded disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          <button
            type="button"
            onClick={() => {
              setForm({
                name: profile.name ?? "",
                email: profile.email ?? "",
                password: "",
                phone: profile.phone ?? "",
              });
              setError(null);
              setSuccess(null);
            }}
            disabled={saving}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        Account created: {profile.created_at ? new Date(profile.created_at).toLocaleString() : "–"}
      </div>
    </div>
  );
}