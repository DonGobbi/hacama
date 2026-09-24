import { ArrowRight, Briefcase, CalendarClock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { deadlineState, formatDate, titleCase } from '@/lib/format';
import type { Job } from '@/lib/types';

export function JobCard({ job }: { job: Job }) {
  const deadline = deadlineState(job.deadline);
  const closed = deadline === 'closed' || job.status === 'closed';
  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {job.department && <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">{job.department}</p>}
          <h3 className="mt-1 text-lg font-semibold text-ink-950">{job.title}</h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="badge bg-slate-100 text-slate-600">{titleCase(job.employmentType)}</span>
          {closed && <span className="badge bg-red-100 text-red-700">Closed</span>}
          {deadline === 'closing-soon' && <span className="badge bg-amber-100 text-amber-800">Closing soon</span>}
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-slate-600">{job.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {job.location}
        </span>
        {job.salary && (
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="size-3.5" /> {job.salary}
          </span>
        )}
        {job.deadline && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5" />
            {closed ? `Closed ${formatDate(job.deadline)}` : `Apply by ${formatDate(job.deadline)}`}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-ink-900 group-hover:text-brand-600">
          View role <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
