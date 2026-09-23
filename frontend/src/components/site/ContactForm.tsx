'use client';

import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { publicApi } from '@/lib/api';
import { SUPPLY_CATEGORIES } from '@/lib/company';

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const get = (key: string) => String(f.get(key) ?? '').trim();
    setError('');
    setSending(true);
    try {
      await publicApi.submitEnquiry({
        type: 'contact',
        name: get('name'),
        organization: get('organization'),
        email: get('email'),
        phone: get('phone'),
        category: get('category'),
        message: get('message'),
        website: get('website'),
      });
      setSentTo(get('name'));
      form.reset();
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again or call us.');
    } finally {
      setSending(false);
    }
  }

  if (sentTo) {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="size-10 text-emerald-600" />
        <h3 className="text-lg font-semibold text-ink-950">Thank you, {sentTo}.</h3>
        <p className="max-w-sm text-sm text-slate-600">
          Your enquiry has been received. Our team will get back to you shortly.
        </p>
        <button type="button" className="btn btn-outline mt-2" onClick={() => setSentTo('')}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
      <label className="block">
        <span className="label">Full name *</span>
        <input className="input" name="name" placeholder="Your name" required minLength={2} maxLength={120} />
      </label>
      <label className="block">
        <span className="label">Organization</span>
        <input className="input" name="organization" placeholder="Your company or institution" maxLength={160} />
      </label>
      <label className="block">
        <span className="label">Email address *</span>
        <input className="input" type="email" name="email" placeholder="name@example.com" required />
      </label>
      <label className="block">
        <span className="label">Phone</span>
        <input className="input" type="tel" name="phone" placeholder="+265 ..." minLength={6} maxLength={40} />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Area of interest</span>
        <select className="input" name="category" defaultValue="">
          <option value="">Select one</option>
          {SUPPLY_CATEGORIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
          <option>Other</option>
        </select>
      </label>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <label className="block sm:col-span-2">
        <span className="label">Message *</span>
        <textarea
          className="input"
          name="message"
          rows={5}
          placeholder="Tell us what you need, or how we can help."
          required
          maxLength={5000}
        />
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
      <button className="btn btn-primary sm:col-span-2" type="submit" disabled={sending}>
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send enquiry
      </button>
    </form>
  );
}
