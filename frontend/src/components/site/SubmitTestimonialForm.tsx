'use client';

import { CheckCircle2, Loader2, PenLine } from 'lucide-react';
import { useState } from 'react';
import { publicApi } from '@/lib/api';

/**
 * Public testimonial submission. Saved unpublished on the backend so an
 * admin reviews it before it appears on the site.
 */
export function SubmitTestimonialForm() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setError('');
    setState('saving');
    try {
      await publicApi.submitTestimonial({
        quote: String(form.get('quote') ?? ''),
        name: String(form.get('name') ?? ''),
        role: String(form.get('role') ?? '') || undefined,
        organization: String(form.get('organization') ?? '') || undefined,
        website: String(form.get('website') ?? ''),
      });
      setState('done');
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Try again.');
      setState('idle');
    }
  }

  if (state === 'done') {
    return (
      <div className="card mx-auto mt-10 max-w-xl p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-6 text-emerald-600" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink-950">Thank you for sharing!</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your testimonial was received and will appear here once our team reviews it.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-10 text-center">
        <button type="button" onClick={() => setOpen(true)} className="btn btn-outline">
          <PenLine className="size-4" /> Share your experience
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-10 grid max-w-xl gap-4 p-6 sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-ink-950">Share your experience</h2>
        <p className="mt-1 text-sm text-slate-500">Tell others what it was like working with us.</p>
      </div>

      <label className="block">
        <span className="label">Your name *</span>
        <input className="input" name="name" required minLength={2} maxLength={120} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Role / title</span>
          <input className="input" name="role" maxLength={120} placeholder="e.g. Head Teacher" />
        </label>
        <label className="block">
          <span className="label">Organization</span>
          <input className="input" name="organization" maxLength={160} placeholder="e.g. Area 25 Secondary School" />
        </label>
      </div>

      <label className="block">
        <span className="label">Your testimonial *</span>
        <textarea
          className="input"
          name="quote"
          rows={4}
          required
          minLength={10}
          maxLength={1000}
          placeholder="What did we supply, and how was the service?"
        />
      </label>

      {/* Honeypot: invisible to humans, bots fill it and get silently dropped. */}
      <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={state === 'saving'}>
          {state === 'saving' && <Loader2 className="size-4 animate-spin" />}
          {state === 'saving' ? 'Sending...' : 'Submit testimonial'}
        </button>
      </div>
    </form>
  );
}
