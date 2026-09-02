"use client";

import { useEffect, useState, FormEvent } from "react";

type Role = "super_admin" | "follow_up_coordinator" | "viewer";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
}

const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  follow_up_coordinator: "Follow-up Coordinator",
  viewer: "Viewer",
};

export default function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      email: data.get("email"),
      password: data.get("password"),
      fullName: data.get("fullName"),
      role: data.get("role"),
    };

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.error ?? "Could not create the account.");
      setSubmitting(false);
      return;
    }

    form.reset();
    setSubmitting(false);
    loadUsers();
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-2xl text-forest">Admin users</h1>
        <p className="text-forest/60 text-[15px] mt-1">
          Create and review accounts that can access this portal.
        </p>
      </div>

      <form onSubmit={handleCreate} className="rounded-lg border border-forest/10 bg-white p-6 space-y-4">
        <h2 className="font-display text-lg text-forest">New account</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-forest/80">Full name</span>
            <input
              name="fullName"
              className="mt-1.5 w-full rounded-lg border border-forest/15 px-3 py-2.5 text-[15px] text-forest focus:border-orange"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-forest/80">Email *</span>
            <input
              name="email"
              type="email"
              required
              className="mt-1.5 w-full rounded-lg border border-forest/15 px-3 py-2.5 text-[15px] text-forest focus:border-orange"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-forest/80">Temporary password *</span>
            <input
              name="password"
              type="text"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="mt-1.5 w-full rounded-lg border border-forest/15 px-3 py-2.5 text-[15px] text-forest focus:border-orange"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-forest/80">Role *</span>
            <select
              name="role"
              required
              defaultValue=""
              className="mt-1.5 w-full rounded-lg border border-forest/15 px-3 py-2.5 text-[15px] text-forest focus:border-orange"
            >
              <option value="" disabled>
                Select a role
              </option>
              <option value="viewer">Viewer — read only</option>
              <option value="follow_up_coordinator">
                Follow-up Coordinator — can update records, send outreach
              </option>
              <option value="super_admin">Super Admin — full access + manage accounts</option>
            </select>
          </label>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-orange bg-orange/10 rounded-lg px-4 py-3">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-orange text-cream font-medium text-[14px] px-5 py-2.5 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-lg text-forest mb-3">Existing accounts</h2>
        {loading ? (
          <p className="text-forest/50 text-sm">Loading…</p>
        ) : (
          <div className="rounded-lg border border-forest/10 bg-white overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left text-forest/50 border-b border-forest/10">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-forest/5 last:border-0">
                    <td className="px-4 py-2.5 text-forest">{u.full_name ?? "—"}</td>
                    <td className="px-4 py-2.5 text-forest/70">{u.email}</td>
                    <td className="px-4 py-2.5 text-forest/70">{ROLE_LABEL[u.role]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
