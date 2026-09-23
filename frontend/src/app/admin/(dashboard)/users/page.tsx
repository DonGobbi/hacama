'use client';

import { KeyRound, Loader2, Trash2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { useAuth } from '@/components/admin/AuthProvider';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { AdminUser, UserRole } from '@/lib/types';

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (me.role !== 'superadmin') {
      router.replace('/admin');
      return;
    }
    adminApi
      .users()
      .then(setUsers)
      .catch((err: Error) => setError(err.message));
  }, [me.role, router]);

  const replace = (u: AdminUser) => setUsers((prev) => prev?.map((x) => (x._id === u._id ? u : x)) ?? null);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setCreating(true);
    const f = new FormData(event.currentTarget);
    try {
      const user = await adminApi.createUser({
        name: String(f.get('name')),
        email: String(f.get('email')),
        password: String(f.get('password')),
        role: f.get('role') as UserRole,
      });
      setUsers((prev) => [user, ...(prev ?? [])]);
      formRef.current?.reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function update(user: AdminUser, data: Parameters<typeof adminApi.updateUser>[1]) {
    try {
      replace(await adminApi.updateUser(user._id, data));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function resetPassword(user: AdminUser) {
    const password = prompt(`New password for ${user.email} (min 8 characters):`);
    if (!password) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    await update(user, { password });
  }

  async function remove(user: AdminUser) {
    if (!confirm(`Delete ${user.email}?`)) return;
    try {
      await adminApi.deleteUser(user._id);
      setUsers((prev) => prev?.filter((u) => u._id !== user._id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (me.role !== 'superadmin') return null;

  return (
    <>
      <PageHeader title="Users" description="Manage who can sign in to the admin dashboard." />
      <ErrorNote message={error} />

      <form ref={formRef} onSubmit={create} className="card mb-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <input className="input" name="name" placeholder="Full name" required minLength={2} />
        <input className="input" type="email" name="email" placeholder="Email" required />
        <input className="input" type="password" name="password" placeholder="Password (min 8)" required minLength={8} autoComplete="new-password" />
        <select className="input" name="role" defaultValue="admin">
          <option value="admin">Admin</option>
          <option value="superadmin">Super admin</option>
        </select>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
          Add user
        </button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users === null && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {users?.map((u) => {
              const isMe = u._id === me.id;
              return (
                <tr key={u._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-950">
                      {u.name} {isMe && <span className="text-xs text-slate-400">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="input py-1.5"
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => update(u, { role: e.target.value as UserRole })}
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-brand-600"
                      checked={u.active}
                      disabled={isMe}
                      onChange={(e) => update(u, { active: e.target.checked })}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => resetPassword(u)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Reset password">
                        <KeyRound className="size-4" />
                      </button>
                      {!isMe && (
                        <button type="button" onClick={() => remove(u)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
