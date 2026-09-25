'use client';

import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { publicApi } from '@/lib/api';
import { SUPPLY_CATEGORIES } from '@/lib/company';

const empty = { companyName: '', contactPerson: '', email: '', phone: '', location: '', notes: '', website: '' };

/** Public supplier registration form - vendors tell us what they can supply. */
export function SupplierForm() {
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { website, ...rest } = form;
      await publicApi.registerSupplier({ ...rest, categories, website });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-emerald-50">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </span>
        <h3 className="text-lg font-semibold text-ink-950">Registration received</h3>
        <p className="max-w-md text-sm text-slate-600">
          Thanks for registering. We will reach out when we need items you supply, or when a matching demand comes up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {/* Honeypot - hidden from humans, bots fill it */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <label className="block">
        <span className="label">Company name *</span>
        <input
          className="input"
          required
          minLength={2}
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="label">Contact person *</span>
        <input
          className="input"
          required
          minLength={2}
          value={form.contactPerson}
          onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="label">Email *</span>
        <input
          className="input"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="label">Phone</span>
        <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </label>
      <label className="block sm:col-span-2">
        <span className="label">Location</span>
        <input
          className="input"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. Lilongwe, Area 47"
        />
      </label>
      <div className="sm:col-span-2">
        <span className="label">What do you supply?</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUPPLY_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              aria-pressed={categories.includes(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                categories.includes(c)
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <label className="block sm:col-span-2">
        <span className="label">Notes (optional)</span>
        <textarea
          className="input"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Delivery capacity, brands you carry, certifications..."
        />
      </label>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Register as a supplier
        </button>
      </div>
    </form>
  );
}
