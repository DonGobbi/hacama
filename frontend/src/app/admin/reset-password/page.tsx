'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Brand } from '@/components/site/Brand';
import { publicApi } from '@/lib/api';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password'));
    if (password !== String(form.get('confirm'))) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await publicApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.replace('/admin/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        This reset link is missing its token. Request a new one from the sign-in page.
      </p>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-6 text-emerald-600" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-ink-950">Password updated</h1>
        <p className="mt-2 text-sm text-slate-500">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="label">New password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="block">
        <span className="label">Confirm new password</span>
        <input
          className="input"
          type="password"
          name="confirm"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Set new password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-stone-50 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,75,56,0.06),transparent_35%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand full />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-ink-950">Set a new password</h1>
          <Suspense>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
