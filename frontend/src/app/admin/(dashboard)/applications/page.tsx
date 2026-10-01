'use client';

import { Download, FileText, Mail, Phone, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { EmptyState, ErrorNote, LoadingNote, PageHeader, StatusBadge } from '@/components/admin/AdminShell';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminApi } from '@/lib/api';
import { formatDate, titleCase } from '@/lib/format';
import { APPLICATION_STATUSES, type Application, type ApplicationStatus, type Job } from '@/lib/types';

function ApplicationsView() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status') ?? '';
  const jobId = params.get('jobId') ?? '';

  const [items, setItems] = useState<Application[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    adminApi.jobs().then(setJobs).catch(() => {});
  }, []);

  useEffect(() => {
    setItems(null);
    adminApi
      .applications({ status, jobId })
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, [status, jobId]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/admin/applications?${next.toString()}`);
  }

  async function update(app: Application, data: { status?: ApplicationStatus; notes?: string }) {
    try {
      const updated = await adminApi.updateApplication(app._id, data);
      setItems((prev) => prev?.map((a) => (a._id === updated._id ? updated : a)) ?? null);
      setSelected(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(app: Application) {
    setBusy(true);
    try {
      await adminApi.deleteApplication(app._id);
      setItems((prev) => prev?.filter((a) => a._id !== app._id) ?? null);
      setSelected(null);
      setPending(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered =
    items?.filter((a) =>
      !q ||
      [a.fullName, a.email, a.phone, a.job?.title]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    ) ?? null;

  return (
    <>
      <PageHeader title="Applications" description="Review candidates and track hiring progress." />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search name, email, phone, job..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input sm:w-64" value={jobId} onChange={(e) => setFilter('jobId', e.target.value)}>
          <option value="">All jobs</option>
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.title}
            </option>
          ))}
        </select>
        <select className="input sm:w-44" value={status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card divide-y divide-slate-100 self-start">
          {items === null && <LoadingNote />}
          {items?.length === 0 && (
            <EmptyState icon={FileText} message="No applications found." hint="Applications submitted through job posts appear here." />
          )}
          {items !== null && items.length > 0 && filtered?.length === 0 && (
            <EmptyState icon={FileText} message={`No applications match "${query.trim()}".`} />
          )}
          {filtered?.map((a, i) => (
            <button
              key={a._id}
              type="button"
              onClick={() => setSelected(a)}
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              className={`flex w-full animate-fade-up flex-wrap items-center justify-between gap-2 px-5 py-3 text-left text-sm hover:bg-slate-50 ${selected?._id === a._id ? 'bg-brand-50' : ''}`}
            >
              <div>
                <p className="font-medium text-ink-950">{a.fullName}</p>
                <p className="text-slate-500">{a.job?.title ?? 'Deleted job'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                <StatusBadge value={a.status} />
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <aside key={selected._id} className="card space-y-4 self-start p-5 lg:sticky lg:top-6">
            <div>
              <h2 className="text-lg font-semibold text-ink-950">{selected.fullName}</h2>
              <p className="text-sm text-slate-500">
                {selected.job?.title ?? 'Deleted job'} · {formatDate(selected.createdAt)}
              </p>
            </div>
            <div className="space-y-1.5 text-sm">
              <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-slate-700 hover:text-brand-600">
                <Mail className="size-4" /> {selected.email}
              </a>
              <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-slate-700 hover:text-brand-600">
                <Phone className="size-4" /> {selected.phone}
              </a>
              {selected.cvUrl && (
                <a href={selected.cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-medium text-brand-600 hover:underline">
                  <Download className="size-4" /> Download CV
                </a>
              )}
            </div>
            {selected.coverLetter && (
              <div>
                <p className="label">Cover letter</p>
                <p className="max-h-60 overflow-y-auto rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-line text-slate-700">
                  {selected.coverLetter}
                </p>
              </div>
            )}
            <label className="block">
              <span className="label">Status</span>
              <select
                className="input"
                value={selected.status}
                onChange={(e) => update(selected, { status: e.target.value as ApplicationStatus })}
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </select>
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update(selected, { notes: String(new FormData(e.currentTarget).get('notes') ?? '') });
              }}
            >
              <label className="block">
                <span className="label">Internal notes</span>
                <textarea className="input" name="notes" rows={4} defaultValue={selected.notes} />
              </label>
              <div className="mt-3 flex justify-between">
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setPending(selected)}>
                  <Trash2 className="size-3.5" /> Delete
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save notes
                </button>
              </div>
            </form>
          </aside>
        ) : (
          <p className="hidden rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 lg:block">
            Select an application to view details.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title="Delete application?"
        message={pending ? `Delete the application from ${pending.fullName}? This cannot be undone.` : ''}
        busy={busy}
        onConfirm={() => pending && remove(pending)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

export default function AdminApplicationsPage() {
  return (
    <Suspense>
      <ApplicationsView />
    </Suspense>
  );
}
