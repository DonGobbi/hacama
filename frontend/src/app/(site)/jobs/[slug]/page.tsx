import { ArrowLeft, Banknote, Briefcase, CalendarClock, CheckCircle2, MapPin } from 'lucide-react';
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
      <section className="relative overflow-hidden border-b border-slate-200 bg-stone-50 text-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.08),transparent_35%)]" />
        <div className="container-page relative py-14 sm:py-16">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-ink-950"
          >
            <ArrowLeft className="size-4" /> All jobs
          </Link>
          {job.department && (
            <div className="mt-8">
              <span className="section-tag">{job.department}</span>
            </div>
          )}
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{job.title}</h1>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 shadow-sm">
              <MapPin className="size-4 text-brand-600" /> {job.location}
            </span>
            <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 shadow-sm">
              <Briefcase className="size-4 text-brand-600" /> {titleCase(job.employmentType)}
            </span>
            {job.salary && (
              <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 shadow-sm">
                <Banknote className="size-4 text-brand-600" /> {job.salary}
              </span>
            )}
            {job.deadline && (
              <span className="badge gap-1.5 border border-brand-100 bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-700 shadow-sm">
                <CalendarClock className="size-4" /> Apply by {formatDate(job.deadline)}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_380px]">
          <article className="space-y-10">
            <p className="border-l-4 border-brand-500 pl-5 text-lg leading-relaxed font-medium text-ink-900">
              {job.summary}
            </p>
            <div className="whitespace-pre-line leading-relaxed text-slate-600">{job.description}</div>

            {job.responsibilities.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2.5 text-xl font-semibold text-ink-950">
                  <span className="h-6 w-1 rounded-full bg-brand-500" /> Responsibilities
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {job.responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-slate-600">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.requirements.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2.5 text-xl font-semibold text-ink-950">
                  <span className="h-6 w-1 rounded-full bg-brand-500" /> Requirements
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {job.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-slate-600">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600" />
                      <span>{item}</span>
                    </li>
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
