'use client';

import { CheckCircle2, Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { publicApi } from '@/lib/api';
import { SUPPLY_CATEGORIES } from '@/lib/company';

type Row = { id: number; description: string; quantity: string };

let nextId = 1;
const newRow = (): Row => ({ id: nextId++, description: '', quantity: '' });

export function QuoteForm({ initialCategory = '' }: { initialCategory?: string }) {
  const [rows, setRows] = useState<Row[]>(() => [newRow()]);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState('');

  const updateRow = (id: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const f = new FormData(form);
    const get = (key: string) => String(f.get(key) ?? '').trim();

    const items = rows
      .map((r) => ({ description: r.description.trim(), quantity: r.quantity.trim() }))
      .filter((r) => r.description);

    if (items.length === 0) {
      setError('Please add at least one item to your request.');
      return;
    }

    setError('');
    setSending(true);
    try {
      await publicApi.submitEnquiry({
        type: 'quote',
        name: get('name'),
        organization: get('organization'),
        email: get('email'),
        phone: get('phone'),
        category: get('category'),
        message: get('message'),
        deliveryLocation: get('deliveryLocation'),
        neededBy: get('neededBy'),
        website: get('website'),
        items,
      });
      setSentTo(get('name'));
      form.reset();
      setRows([newRow()]);
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again or call us.');
    } finally {
      setSending(false);
    }
  }

  if (sentTo) {
    return (
      <div className="card flex flex-col items-center gap-3 p-10 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="size-12 text-emerald-600" />
        <h2 className="text-xl font-semibold text-ink-950">Request received — thank you, {sentTo}.</h2>
        <p className="max-w-md text-sm text-slate-600">
          We will review your requirements and get back to you with a quotation.
        </p>
        <button type="button" className="btn btn-outline mt-2" onClick={() => setSentTo('')}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-8 p-6 sm:p-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold text-ink-950">Your details</legend>
        <label className="block">
          <span className="label">Full name *</span>
          <input className="input" name="name" required minLength={2} maxLength={120} />
        </label>
        <label className="block">
          <span className="label">Organization</span>
          <input className="input" name="organization" placeholder="School, company, NGO..." maxLength={160} />
        </label>
        <label className="block">
          <span className="label">Email address *</span>
          <input className="input" type="email" name="email" required />
        </label>
        <label className="block">
          <span className="label">Phone *</span>
          <input className="input" type="tel" name="phone" placeholder="+265 ..." required minLength={6} maxLength={40} />
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-base font-semibold text-ink-950">What do you need?</legend>
        <label className="mb-4 block">
          <span className="label">Category</span>
          <select className="input" name="category" defaultValue={initialCategory}>
            <option value="">Select a category</option>
            {SUPPLY_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
            <option>Other</option>
          </select>
        </label>

        <div className="space-y-3">
          <div className="hidden grid-cols-[1fr_9rem_2.5rem] gap-3 sm:grid">
            <span className="label mb-0">Item description *</span>
            <span className="label mb-0">Quantity</span>
          </div>
          {rows.map((row, i) => (
            <div key={row.id} className="grid grid-cols-[1fr_6.5rem_2.5rem] gap-3 sm:grid-cols-[1fr_9rem_2.5rem]">
              <input
                className="input"
                aria-label={`Item ${i + 1} description`}
                placeholder="e.g. Student desks, NPK fertilizer 50kg"
                value={row.description}
                maxLength={300}
                onChange={(e) => updateRow(row.id, { description: e.target.value })}
              />
              <input
                className="input"
                aria-label={`Item ${i + 1} quantity`}
                placeholder="e.g. 200"
                value={row.quantity}
                maxLength={60}
                onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
              />
              <button
                type="button"
                className="grid place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                disabled={rows.length === 1}
                aria-label={`Remove item ${i + 1}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setRows((prev) => [...prev, newRow()])}
            disabled={rows.length >= 50}
          >
            <Plus className="size-3.5" /> Add item
          </button>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-4 text-base font-semibold text-ink-950">Delivery</legend>
        <label className="block">
          <span className="label">Delivery location</span>
          <input className="input" name="deliveryLocation" placeholder="Town / district" maxLength={200} />
        </label>
        <label className="block">
          <span className="label">Needed by</span>
          <input className="input" type="date" name="neededBy" />
        </label>
        <label className="block sm:col-span-2">
          <span className="label">Additional notes</span>
          <textarea
            className="input"
            name="message"
            rows={4}
            maxLength={5000}
            placeholder="Specifications, preferred brands, tender reference, or anything else we should know."
          />
        </label>
      </fieldset>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button className="btn btn-primary w-full sm:w-auto" type="submit" disabled={sending}>
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Request quotation
      </button>
    </form>
  );
}
