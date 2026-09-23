'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { titleCase, toDateInput } from '@/lib/format';
import { EMPLOYMENT_TYPES, JOB_STATUSES, type EmploymentType, type Job, type JobInput, type JobStatus } from '@/lib/types';
import { ErrorNote } from './AdminShell';

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

export function JobForm({ job }: { job?: Job }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const f = new FormData(event.currentTarget);
    const deadline = String(f.get('deadline') ?? '');

    const data: JobInput = {
      title: String(f.get('title')),
      department: String(f.get('department') ?? ''),
      location: String(f.get('location')),
      employmentType: f.get('employmentType') as EmploymentType,
      status: f.get('status') as JobStatus,
      salary: String(f.get('salary') ?? ''),
      summary: String(f.get('summary')),
      description: String(f.get('description')),
      responsibilities: lines(f.get('responsibilities')),
      requirements: lines(f.get('requirements')),
      ...(deadline ? { deadline: new Date(deadline).toISOString() } : {}),
    };

    try {
      if (job) await adminApi.updateJob(job._id, data);
      else await adminApi.createJob(data);
      router.push('/admin/jobs');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      <ErrorNote message={error} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="label">Job title *</span>
          <input className="input" name="title" defaultValue={job?.title} required minLength={3} />
        </label>
        <label className="block">
          <span className="label">Department</span>
          <input className="input" name="department" defaultValue={job?.department} />
        </label>
        <label className="block">
          <span className="label">Location *</span>
          <input className="input" name="location" defaultValue={job?.location ?? 'Lilongwe, Malawi'} required />
        </label>
        <label className="block">
          <span className="label">Employment type</span>
          <select className="input" name="employmentType" defaultValue={job?.employmentType ?? 'full-time'}>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {titleCase(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select className="input" name="status" defaultValue={job?.status ?? 'draft'}>
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Salary</span>
          <input className="input" name="salary" defaultValue={job?.salary} placeholder="e.g. Negotiable" />
        </label>
        <label className="block">
          <span className="label">Application deadline</span>
          <input className="input" type="date" name="deadline" defaultValue={toDateInput(job?.deadline)} />
        </label>
      </div>
      <label className="block">
        <span className="label">Summary * (shown on job cards)</span>
        <textarea className="input" name="summary" rows={2} defaultValue={job?.summary} required minLength={10} />
      </label>
      <label className="block">
        <span className="label">Full description *</span>
        <textarea className="input" name="description" rows={6} defaultValue={job?.description} required minLength={20} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="label">Responsibilities (one per line)</span>
          <textarea className="input" name="responsibilities" rows={6} defaultValue={job?.responsibilities.join('\n')} />
        </label>
        <label className="block">
          <span className="label">Requirements (one per line)</span>
          <textarea className="input" name="requirements" rows={6} defaultValue={job?.requirements.join('\n')} />
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-outline" onClick={() => router.push('/admin/jobs')}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {job ? 'Save changes' : 'Create job'}
        </button>
      </div>
    </form>
  );
}
