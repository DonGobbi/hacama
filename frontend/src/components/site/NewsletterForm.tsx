'use client';

import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { publicApi } from '@/lib/api';

/** Compact email-only signup used in the site footer. */
export function NewsletterForm() {
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    if (!email) return;

    setError('');
    setState('saving');
    try {
      await publicApi.subscribe({ email, website: String(form.get('website') ?? '') });
      setState('done');
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Try again.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle2 className="size-4" /> Subscribed! Watch your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="input h-10 flex-1 text-sm"
        />
        {/* Honeypot: invisible to humans, bots fill it and get silently dropped. */}
        <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button type="submit" disabled={state === 'saving'} className="btn btn-primary h-10 px-3.5" aria-label="Subscribe">
          {state === 'saving' ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
