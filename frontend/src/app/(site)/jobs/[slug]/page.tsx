import { ArrowLeft, Briefcase, CalendarClock, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ApplyForm } from '@/components/jobs/ApplyForm';
import { ApiError, publicApi } from '@/lib/api';
import { formatDate, titleCase } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

const getJob = cache(async (slug: string) => {
  try {
    return await publicApi.jobBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob((await params).slug).catch(() => null);
  return job ? { title: job.title, description: job.summary } : { title: 'Job not found' };
}

export default async function JobDetailsPage({ params }: Props) {
  const job = await getJob((await params).slug);
  if (!job) notFound();

  return (
    <>
      <section className="border-b border-slate-200 bg-stone-50 text-ink-950">
        <div className="container-page py-14">
          <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-ink-950">
            <ArrowLeft className="size-4" /> All jobs
          </Link>
          {job.department && <p className="section-tag mt-6">{job.department}</p>}
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{job.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="size-4" /> {titleCase(job.employmentType)}
              {job.salary && ` · ${job.salary}`}
            </span>
            {job.deadline && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" /> Apply by {formatDate(job.deadline)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_380px]">
          <article className="space-y-8">
            <p className="text-lg text-slate-700">{job.summary}</p>
            <div className="whitespace-pre-line text-slate-600">{job.description}</div>

            {job.responsibilities.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-ink-950">Responsibilities</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
                  {job.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-ink-950">Requirements</h2>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
                  {job.requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ApplyForm jobId={job._id} />
          </aside>
        </div>
      </section>
    </>
  );
}
