'use client';

import { CheckCircle2, FileText, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import type { Credential, Faq, SiteSettings, Stat } from '@/lib/types';

type RowField<T> = { key: keyof T; label: string; placeholder?: string; maxLength: number; multiline?: boolean };

function RowsEditor<T extends object>({
  rows,
  onChange,
  fields,
  empty,
  max,
  addLabel,
  columns,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  fields: RowField<T>[];
  empty: T;
  max: number;
  addLabel: string;
  columns: string;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className={`grid items-start gap-3 ${columns}`}>
          {fields.map((f) => {
            const props = {
              className: 'input',
              'aria-label': `${f.label} ${i + 1}`,
              placeholder: f.placeholder ?? f.label,
              maxLength: f.maxLength,
              value: String(row[f.key] ?? ''),
              onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onChange(rows.map((r, j) => (j === i ? { ...r, [f.key]: e.target.value } : r))),
            };
            return f.multiline ? <textarea key={String(f.key)} rows={3} {...props} /> : <input key={String(f.key)} {...props} />;
          })}
          <button
            type="button"
            className="grid h-10 place-items-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            aria-label={`Remove row ${i + 1}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => onChange([...rows, { ...empty }])}
        disabled={rows.length >= max}
      >
        <Plus className="size-3.5" /> {addLabel}
      </button>
    </div>
  );
}

function tidy<T extends object>(rows: T[]) {
  return rows
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '').trim()])) as T)
    .filter((r) => Object.values(r).some(Boolean));
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi
      .settings()
      .then(setSettings)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (!settings) {
    return (
      <>
        <PageHeader title="Site settings" />
        <ErrorNote message={error} />
        {!error && <p className="text-sm text-slate-400">Loading...</p>}
      </>
    );
  }

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    const stats = tidy(settings.stats);
    const credentials = tidy(settings.credentials);
    const faqs = tidy(settings.faqs);

    if (stats.some((s) => !s.value || !s.label)) return setError('Each key number needs both a value and a label.');
    if (credentials.some((c) => !c.title)) return setError('Each credential needs a title.');
    if (faqs.some((f) => !f.question || !f.answer)) return setError('Each FAQ needs both a question and an answer.');

    setError('');
    setNotice('');
    setSaving(true);
    try {
      const saved = await adminApi.updateSettings({
        phone: settings.phone.trim(),
        whatsapp: settings.whatsapp.trim(),
        email: settings.email.trim(),
        address: settings.address.trim(),
        officeHours: settings.officeHours.trim(),
        announcement: settings.announcement.trim(),
        announcementLink: settings.announcementLink.trim(),
        stats,
        credentials,
        faqs,
      });
      setSettings(saved);
      setNotice('Settings saved. Changes appear on the website within a minute.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadProfile() {
    const file = fileRef.current?.files?.[0];
    if (!file) return setError('Choose a PDF file first.');
    const form = new FormData();
    form.set('file', file);
    setError('');
    setUploading(true);
    try {
      setSettings(await adminApi.uploadCompanyProfile(form));
      if (fileRef.current) fileRef.current.value = '';
      setNotice('Company profile uploaded.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function removeProfile() {
    if (!confirm('Remove the company profile PDF from the website?')) return;
    try {
      setSettings(await adminApi.removeCompanyProfile());
      setNotice('Company profile removed.');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Site settings"
        description="Contact details and credibility content shown on the public website. Empty sections stay hidden."
      />
      <ErrorNote message={error} />
      {notice && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" /> {notice}
        </p>
      )}

      <form onSubmit={save} className="space-y-6">
        <section className="card grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="font-semibold text-ink-950">Contact details</h2>
            <p className="text-sm text-slate-500">Used in the footer, contact section, quote page, and WhatsApp button.</p>
          </div>
          <label className="block">
            <span className="label">Phone</span>
            <input className="input" value={settings.phone} maxLength={40} onChange={(e) => set('phone', e.target.value)} />
          </label>
          <label className="block">
            <span className="label">WhatsApp number</span>
            <input
              className="input"
              value={settings.whatsapp}
              maxLength={40}
              placeholder="Leave empty to hide the WhatsApp button"
              onChange={(e) => set('whatsapp', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input className="input" type="email" value={settings.email} onChange={(e) => set('email', e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Office hours</span>
            <input
              className="input"
              value={settings.officeHours}
              maxLength={120}
              placeholder="e.g. Mon - Fri, 8:00 - 17:00"
              onChange={(e) => set('officeHours', e.target.value)}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="label">Physical address</span>
            <input
              className="input"
              value={settings.address}
              maxLength={300}
              placeholder="Street, area, Lilongwe - a map is shown on the website when this is filled in"
              onChange={(e) => set('address', e.target.value)}
            />
          </label>
        </section>

        <section className="card grid gap-4 p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="font-semibold text-ink-950">Announcement bar</h2>
            <p className="text-sm text-slate-500">
              A slim banner pinned to the top of every page, e.g. &quot;Now buying maize: get a quote&quot;. Clear the text to
              hide it.
            </p>
          </div>
          <label className="block">
            <span className="label">Announcement text</span>
            <input
              className="input"
              value={settings.announcement}
              maxLength={160}
              placeholder="e.g. Now buying maize: we pay within 48 hours"
              onChange={(e) => set('announcement', e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label">Link (optional)</span>
            <input
              className="input"
              value={settings.announcementLink}
              maxLength={300}
              placeholder="e.g. /demands or /quote"
              onChange={(e) => set('announcementLink', e.target.value)}
            />
          </label>
        </section>

        <section className="card space-y-4 p-5">
          <div>
            <h2 className="font-semibold text-ink-950">Key numbers</h2>
            <p className="text-sm text-slate-500">Only add real figures, e.g. &quot;10+&quot; / &quot;Years in operation&quot;. Up to 8.</p>
          </div>
          <RowsEditor<Stat>
            rows={settings.stats}
            onChange={(rows) => set('stats', rows)}
            fields={[
              { key: 'value', label: 'Value', placeholder: 'e.g. 500+', maxLength: 20 },
              { key: 'label', label: 'Label', placeholder: 'e.g. Orders delivered', maxLength: 60 },
            ]}
            empty={{ value: '', label: '' }}
            max={8}
            addLabel="Add number"
            columns="grid-cols-[8rem_1fr_2.5rem]"
          />
        </section>

        <section className="card space-y-4 p-5">
          <div>
            <h2 className="font-semibold text-ink-950">Compliance &amp; credentials</h2>
            <p className="text-sm text-slate-500">
              Shown under the PPDA badge, e.g. Business registration, MRA tax clearance, TPIN.
            </p>
          </div>
          <RowsEditor<Credential>
            rows={settings.credentials}
            onChange={(rows) => set('credentials', rows)}
            fields={[
              { key: 'title', label: 'Title', placeholder: 'e.g. MRA Tax Clearance', maxLength: 80 },
              { key: 'detail', label: 'Detail', placeholder: 'e.g. Valid until Dec 2026', maxLength: 160 },
            ]}
            empty={{ title: '', detail: '' }}
            max={12}
            addLabel="Add credential"
            columns="grid-cols-[1fr_1fr_2.5rem]"
          />
        </section>

        <section className="card space-y-4 p-5">
          <div>
            <h2 className="font-semibold text-ink-950">FAQ</h2>
            <p className="text-sm text-slate-500">Review these answers so they match how you actually work.</p>
          </div>
          <RowsEditor<Faq>
            rows={settings.faqs}
            onChange={(rows) => set('faqs', rows)}
            fields={[
              { key: 'question', label: 'Question', maxLength: 200 },
              { key: 'answer', label: 'Answer', maxLength: 2000, multiline: true },
            ]}
            empty={{ question: '', answer: '' }}
            max={30}
            addLabel="Add question"
            columns="grid-cols-1 md:grid-cols-[1fr_1.5fr_2.5rem]"
          />
        </section>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save settings
          </button>
        </div>
      </form>

      <section className="card mt-6 space-y-4 p-5">
        <div>
          <h2 className="font-semibold text-ink-950">Company profile (PDF)</h2>
          <p className="text-sm text-slate-500">Adds a download button to the About section. PDF only, max 15 MB.</p>
        </div>
        {settings.companyProfileUrl && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <a
              href={settings.companyProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
            >
              <FileText className="size-4" /> View current company profile
            </a>
            <button type="button" className="btn btn-danger btn-sm" onClick={removeProfile}>
              <Trash2 className="size-3.5" /> Remove
            </button>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          />
          <button type="button" className="btn btn-primary shrink-0" onClick={uploadProfile} disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {settings.companyProfileUrl ? 'Replace PDF' : 'Upload PDF'}
          </button>
        </div>
      </section>
    </>
  );
}
