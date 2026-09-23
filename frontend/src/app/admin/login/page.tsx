'use client';

import { Loader2, LockKeyhole } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Brand } from '@/components/site/Brand';
import { publicApi } from '@/lib/api';
import { setToken } from '@/lib/auth';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const { accessToken } = await publicApi.login(String(form.get('email')), String(form.get('password')));
      setToken(accessToken);
      const next = params.get('next');
      router.replace(next && next.startsWith('/admin') ? next : '/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="label">Email</span>
        <input className="input" type="email" name="email" autoComplete="email" required />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <input className="input" type="password" name="password" autoComplete="current-password" required />
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
        Sign in
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-stone-50 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,75,56,0.06),transparent_35%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand full />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-ink-950">Admin sign in</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">Manage jobs, applications, photos, and users.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
