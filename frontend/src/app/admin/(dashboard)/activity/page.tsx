'use client';

import clsx from 'clsx';
import { Download, Globe, Loader2, MonitorSmartphone, Route, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { useAuth } from '@/components/admin/AuthProvider';
import { adminApi } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';
import { formatDate } from '@/lib/format';
import type { ActivityLog, SiteVisit } from '@/lib/types';

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)} · ${d.toLocaleTimeString('en-MW', { hour: '2-digit', minute: '2-digit' })}`;
}

const MAX_ROWS = 10;

export default function ActivityPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'signins' | 'visitors'>('signins');
  const [logs, setLogs] = useState<ActivityLog[] | null>(null);
  const [visits, setVisits] = useState<SiteVisit[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    adminApi
      .activity()
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'));
    adminApi
      .visits()
      .then(setVisits)
      .catch(() => setVisits([]));
  }, []);

  const loading = tab === 'signins' ? logs === null : visits === null;
  const q = query.trim().toLowerCase();
  const filteredVisits =
    visits?.filter(
      (v) =>
        !q ||
        [v.device, v.location, v.ip, v.path]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q),
    ) ?? null;

  function exportVisits() {
    if (!visits?.length) return;
    downloadCsv(
      'site-visitors.csv',
      ['Time', 'Device', 'Location', 'IP', 'Landing page'],
      visits.map((v) => [formatTime(v.createdAt), v.device, v.location, v.ip, v.path]),
    );
  }

  return (
    <div>
      <PageHeader
        title="Activity logs"
        description={
          user.role === 'superadmin'
            ? 'Admin sign-ins and visits to the public website - device, IP, and location.'
            : 'Your sign-ins and visits to the public website - device, IP, and location.'
        }
      />
      <ErrorNote message={error} />

      <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {(
          [
            { id: 'signins', label: 'Admin sign-ins' },
            { id: 'visitors', label: 'Site visitors' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition',
              tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-ink-950',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'visitors' && visits && visits.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="input sm:max-w-xs"
            placeholder="Search location, IP, page, device..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className="btn btn-outline btn-sm sm:ml-auto" onClick={exportVisits}>
            <Download className="size-3.5" /> Export CSV
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-7 animate-spin text-brand-600" />
        </div>
      ) : tab === 'signins' ? (
        !logs?.length ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No sign-ins recorded yet.
          </p>
        ) : (
          <div className="card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {logs.slice(0, MAX_ROWS).map((log, i) => (
                <li
                  key={log._id}
                  className="flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4"
                  style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                    {log.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join('')}
                  </span>
                  <div className="min-w-40">
                    <p className="truncate text-sm font-semibold text-ink-950">{log.name}</p>
                    <p className="truncate text-xs text-slate-500">{log.email}</p>
                  </div>
                  <span className="badge inline-flex items-center gap-1 bg-slate-100 capitalize text-slate-600">
                    <ShieldCheck className="size-3.5" />
                    {log.role === 'superadmin' ? 'Super admin' : 'Admin'}
                  </span>
                  <div className="flex min-w-44 items-center gap-1.5 text-xs text-slate-500">
                    <MonitorSmartphone className="size-3.5 shrink-0" />
                    <span className="truncate">{log.device || 'Unknown device'}</span>
                  </div>
                  <div className="flex min-w-40 items-center gap-1.5 text-xs text-slate-500">
                    <Globe className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {log.location || 'Locating…'}
                      {log.ip ? ` · ${log.ip}` : ''}
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-slate-400">{formatTime(log.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      ) : !visits?.length ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No visits recorded yet.
        </p>
      ) : filteredVisits?.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No visits match "{query.trim()}".
        </p>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filteredVisits?.slice(0, MAX_ROWS).map((visit, i) => (
              <li
                key={visit._id}
                className="flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <Globe className="size-4" />
                </span>
                <div className="flex min-w-44 items-center gap-1.5 text-xs text-slate-500">
                  <MonitorSmartphone className="size-3.5 shrink-0" />
                  <span className="truncate">{visit.device || 'Unknown device'}</span>
                </div>
                <div className="flex min-w-40 items-center gap-1.5 text-xs text-slate-500">
                  <Globe className="size-3.5 shrink-0" />
                  <span className="truncate">
                    {visit.location || 'Locating…'}
                    {visit.ip ? ` · ${visit.ip}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Route className="size-3.5 shrink-0" />
                  <span className="truncate">{visit.path}</span>
                </div>
                <span className="ml-auto text-xs text-slate-400">{formatTime(visit.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
