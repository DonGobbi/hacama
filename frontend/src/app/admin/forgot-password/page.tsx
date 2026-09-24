'use client';

import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Brand } from '@/components/site/Brand';
import { publicApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const email = String(new FormData(event.currentTarget).get('email'));
    try {
      await publicApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-stone-50 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,75,56,0.06),transparent_35%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand full />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50">
                <MailCheck className="size-6 text-emerald-600" />
              </span>
              <h1 className="mt-4 text-xl font-bold text-ink-950">Check your inbox</h1>
              <p className="mt-2 text-sm text-slate-500">
                If that email has an admin account, a reset link is on its way. It expires in 1 hour.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-ink-950">Forgot password</h1>
              <p className="mt-1 mb-6 text-sm text-slate-500">
                Enter your admin email and we'll send you a reset link.
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block">
                  <span className="label">Email</span>
                  <input className="input" type="email" name="email" autoComplete="email" required />
                </label>
                {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Send reset link
                </button>
              </form>
            </>
          )}
          <Link
            href="/admin/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink-950"
          >
            <ArrowLeft className="size-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
