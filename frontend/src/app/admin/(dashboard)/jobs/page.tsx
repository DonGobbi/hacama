'use client';

import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ErrorNote, PageHeader, StatusBadge } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import { formatDate, titleCase } from '@/lib/format';
import { JOB_STATUSES, type Job } from '@/lib/types';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    adminApi
      .jobs({ status, search })
      .then(setJobs)
      .catch((err: Error) => setError(err.message));
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function remove(job: Job) {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteJob(job._id);
      setJobs((prev) => prev?.filter((j) => j._id !== job._id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Create, edit, publish, and close job posts."
        action={
          <Link href="/admin/jobs/new" className="btn btn-primary">
            <Plus className="size-4" /> New job
          </Link>
        }
      />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {JOB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs === null && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {jobs?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No jobs found.
                </td>
              </tr>
            )}
            {jobs?.map((job) => (
              <tr key={job._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-950">{job.title}</p>
                  <p className="text-xs text-slate-500">
                    {[job.department, job.location].filter(Boolean).join(' · ')}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-600">{titleCase(job.employmentType)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={job.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(job.deadline) || '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {job.status === 'open' && (
                      <Link href={`/jobs/${job.slug}`} target="_blank" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="View">
                        <ExternalLink className="size-4" />
                      </Link>
                    )}
                    <Link href={`/admin/jobs/${job._id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit">
                      <Pencil className="size-4" />
                    </Link>
                    <button type="button" onClick={() => remove(job)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
