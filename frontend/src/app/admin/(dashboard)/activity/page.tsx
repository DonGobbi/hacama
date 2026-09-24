'use client';

import { Globe, Loader2, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { useAuth } from '@/components/admin/AuthProvider';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { ActivityLog } from '@/lib/types';

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)} · ${d.toLocaleTimeString('en-MW', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .activity()
      .then(setLogs)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load activity'));
  }, []);

  return (
    <div>
      <PageHeader
        title="Activity logs"
        description={
          user.role === 'superadmin'
            ? 'Sign-in history for every admin account — device, IP, and location.'
            : 'Sign-in history for your account — device, IP, and location.'
        }
      />
      <ErrorNote message={error} />

      {!logs ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-7 animate-spin text-brand-600" />
        </div>
      ) : logs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No sign-ins recorded yet.
        </p>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => (
              <li key={log._id} className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4">
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
      )}
    </div>
  );
}
