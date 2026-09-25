import { ArrowLeft, Banknote, Briefcase, CalendarClock, CheckCircle2, MapPin } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ApplyForm } from '@/components/jobs/ApplyForm';
import { JobCard } from '@/components/jobs/JobCard';
import { ShareButtons } from '@/components/jobs/ShareButtons';
import { ApiError, publicApi, safely } from '@/lib/api';
import { deadlineState, formatDate, titleCase } from '@/lib/format';

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

  const closed = deadlineState(job.deadline) === 'closed' || job.status === 'closed';
  const closingSoon = !closed && deadlineState(job.deadline) === 'closing-soon';

  // Structured data so listings can surface in Google for Jobs.
  const employmentTypes: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    contract: 'CONTRACTOR',
    internship: 'INTERN',
    temporary: 'TEMPORARY',
  };
  const jobJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: `${job.summary}\n\n${job.description}`,
    datePosted: job.createdAt,
    ...(job.deadline ? { validThrough: job.deadline } : {}),
    employmentType: employmentTypes[job.employmentType] ?? 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Hacama Investments',
      sameAs: 'https://hacama-web-370098605562.africa-south1.run.app',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'MW',
      },
    },
    ...(job.department ? { occupationalCategory: job.department } : {}),
  };

  const allJobs = await safely(publicApi.jobs(), []);
  const related = allJobs
    .filter((j) => j._id !== job._id && j.status === 'open' && deadlineState(j.deadline) !== 'closed')
    .sort((a, b) => Number(b.department === job.department) - Number(a.department === job.department))
    .slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobJsonLd) }} />
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
              <span
                className={`badge gap-1.5 border px-3.5 py-1.5 text-sm font-medium shadow-sm ${
                  closed
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : closingSoon
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-brand-100 bg-brand-50 text-brand-700'
                }`}
              >
                <CalendarClock className="size-4" />
                {closed
                  ? `Applications closed ${formatDate(job.deadline)}`
                  : closingSoon
                    ? `Closing soon · ${formatDate(job.deadline)}`
                    : `Apply by ${formatDate(job.deadline)}`}
              </span>
            )}
          </div>
          <div className="mt-6">
            <ShareButtons title={job.title} />
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
            {closed ? (
              <div className="card flex flex-col items-center gap-3 p-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-red-50">
                  <CalendarClock className="size-8 text-red-500" />
                </span>
                <h3 className="text-lg font-semibold text-ink-950">Applications closed</h3>
                <p className="text-sm text-slate-600">
                  The deadline for this role has passed. Browse our other open positions below.
                </p>
                <Link href="/jobs" className="btn btn-outline btn-sm mt-1">
                  View all jobs
                </Link>
              </div>
            ) : (
              <ApplyForm jobId={job._id} />
            )}
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-stone-50 py-12">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="section-tag">Keep exploring</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">More open roles</h2>
              </div>
              <Link href="/jobs" className="btn btn-outline btn-sm shrink-0">
                All jobs
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((j) => (
                <JobCard key={j._id} job={j} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
