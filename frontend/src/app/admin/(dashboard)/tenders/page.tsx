'use client';

import { CheckCircle2, FileDown, Loader2, Plus, ScrollText, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ErrorNote, PageHeader, StatusBadge } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Tender } from '@/lib/types';

const emptyForm = { title: '', reference: '', summary: '', description: '', deadline: '', published: true };

export default function AdminTendersPage() {
  const [tenders, setTenders] = useState<Tender[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Tender | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    adminApi
      .contentList<Tender>('tenders')
      .then(setTenders)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  function startEdit(t: Tender) {
    setEditing(t);
    setForm({
      title: t.title,
      reference: t.reference,
      summary: t.summary,
      description: t.description,
      deadline: t.deadline ? t.deadline.slice(0, 10) : '',
      published: t.published,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      const data = new FormData();
      data.set('title', form.title);
      data.set('reference', form.reference);
      data.set('summary', form.summary);
      data.set('description', form.description);
      if (form.deadline) data.set('deadline', form.deadline);
      data.set('published', String(form.published));
      if (editing) data.set('status', editing.status);
      const file = fileRef.current?.files?.[0];
      if (file) data.set('document', file);

      if (editing) {
        await adminApi.contentUpdate<Tender>('tenders', editing._id, data);
        setNotice('Tender updated.');
      } else {
        await adminApi.contentCreate<Tender>('tenders', data);
        setNotice('Tender published.');
      }
      resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(t: Tender, status: 'open' | 'closed') {
    try {
      const data = new FormData();
      data.set('status', status);
      await adminApi.contentUpdate<Tender>('tenders', t._id, data);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(t: Tender) {
    if (!confirm(`Delete tender "${t.title}"?`)) return;
    try {
      await adminApi.contentDelete('tenders', t._id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Tenders"
        description="Publish tenders and RFQs on the website. Attach the tender document as a PDF."
      />
      <ErrorNote message={error} />
      {notice && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" /> {notice}
        </p>
      )}

      <form onSubmit={save} className="card grid gap-4 p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="font-semibold text-ink-950">{editing ? `Edit: ${editing.title}` : 'Publish a tender'}</h2>
        </div>
        <label className="block">
          <span className="label">Title</span>
          <input
            className="input"
            required
            minLength={3}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Supply of 500 school desks"
          />
        </label>
        <label className="block">
          <span className="label">Reference</span>
          <input
            className="input"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            placeholder="e.g. HAC-2025-007"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Summary</span>
          <input
            className="input"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="One-line overview shown on the tender card"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Description</span>
          <textarea
            className="input"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Scope, submission instructions, evaluation criteria..."
          />
        </label>
        <label className="block">
          <span className="label">Closing date</span>
          <input
            className="input"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="label">Tender document (PDF)</span>
          <input ref={fileRef} type="file" accept="application/pdf" className="input" />
          {editing?.documentUrl && (
            <a href={editing.documentUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-brand-600 hover:underline">
              Current document is attached. Upload a new PDF to replace it.
            </a>
          )}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="size-4"
          />
          Visible on the website
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : editing ? <Upload className="size-4" /> : <Plus className="size-4" />}
            {editing ? 'Save changes' : 'Publish tender'}
          </button>
          {editing && (
            <button type="button" className="btn btn-outline" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="mt-6">
        {!tenders && <div className="card h-40 animate-pulse bg-slate-100" />}
        {tenders && tenders.length === 0 && (
          <div className="card flex flex-col items-center gap-2 p-10 text-center">
            <ScrollText className="size-8 text-slate-300" />
            <p className="text-sm text-slate-500">No tenders yet. Publish the first one above.</p>
          </div>
        )}
        <ul className="divide-y divide-slate-100">
          {tenders?.map((t) => (
            <li key={t._id} className="flex flex-wrap items-center gap-3 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-950">
                  {t.reference ? <span className="text-slate-400">{t.reference}: </span> : ''}
                  {t.title}
                </p>
                <p className="text-xs text-slate-500">
                  {t.deadline ? `Closes ${formatDate(t.deadline)}` : 'No closing date'}
                  {t.documentUrl && ' · PDF attached'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge value={t.status} />
                {!t.published && <StatusBadge value="draft" />}
                {t.documentUrl && (
                  <a href={t.documentUrl} target="_blank" rel="noreferrer" aria-label="Download document" className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600">
                    <FileDown className="size-4" />
                  </a>
                )}
                <select
                  value={t.status}
                  onChange={(e) => setStatus(t, e.target.value as 'open' | 'closed')}
                  className="input h-8 w-24 text-xs"
                  aria-label="Tender status"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
                <button type="button" onClick={() => startEdit(t)} className="btn btn-outline btn-sm">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(t)}
                  aria-label="Delete tender"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
