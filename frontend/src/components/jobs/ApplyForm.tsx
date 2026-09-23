'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { publicApi } from '@/lib/api';

export function ApplyForm({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setStatus('sending');
    const form = new FormData(event.currentTarget);
    form.set('jobId', jobId);
    const cv = form.get('cv');
    if (cv instanceof File && cv.size === 0) form.delete('cv');

    try {
      await publicApi.apply(form);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  }

  if (status === 'done') {
    return (
      <div className="card flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 className="size-10 text-emerald-600" />
        <h3 className="text-lg font-semibold text-ink-950">Application submitted</h3>
        <p className="text-sm text-slate-600">Thank you. Our team will review your application and get back to you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <h3 className="text-lg font-semibold text-ink-950">Apply for this role</h3>
      <label className="block">
        <span className="label">Full name</span>
        <input className="input" name="fullName" required minLength={2} />
      </label>
      <label className="block">
        <span className="label">Email</span>
        <input className="input" type="email" name="email" required />
      </label>
      <label className="block">
        <span className="label">Phone</span>
        <input className="input" type="tel" name="phone" required minLength={6} placeholder="+265 ..." />
      </label>
      <label className="block">
        <span className="label">Cover letter</span>
        <textarea className="input" name="coverLetter" rows={5} maxLength={5000} />
      </label>
      <label className="block">
        <span className="label">CV (PDF or Word, max 5 MB)</span>
        <input
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          type="file"
          name="cv"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
      </label>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button className="btn btn-primary w-full" type="submit" disabled={status === 'sending'}>
        {status === 'sending' && <Loader2 className="size-4 animate-spin" />}
        Submit application
      </button>
    </form>
  );
}
