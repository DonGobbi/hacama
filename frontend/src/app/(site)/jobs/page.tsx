import { Search } from 'lucide-react';
import type { Metadata } from 'next';
import { JobCard } from '@/components/jobs/JobCard';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';
import { titleCase } from '@/lib/format';
import { EMPLOYMENT_TYPES } from '@/lib/types';

export const metadata: Metadata = { title: 'Jobs' };

type Props = { searchParams: Promise<{ search?: string; type?: string }> };

export default async function JobsPage({ searchParams }: Props) {
  const { search = '', type = '' } = await searchParams;
  const employmentType = EMPLOYMENT_TYPES.includes(type as never) ? type : '';
  const jobs = await safely(publicApi.jobs({ search, employmentType }), []);

  return (
    <>
      <PageHero
        tag="Careers"
        title="Build your career with Hacama Investments"
        text="Explore current opportunities at our Lilongwe-based supply company and apply online."
      />

      <section className="py-12">
        <div className="container-page">
          <form className="card flex flex-col gap-3 p-4 sm:flex-row" role="search">
            <label className="relative flex-1">
              <span className="sr-only">Search jobs</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                name="search"
                defaultValue={search}
                placeholder="Search by title, department, or location"
              />
            </label>
            <label className="sm:w-56">
              <span className="sr-only">Employment type</span>
              <select className="input" name="type" defaultValue={employmentType}>
                <option value="">All types</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {titleCase(t)}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>

          <p className="mt-8 text-sm text-slate-500">
            {jobs.length} open {jobs.length === 1 ? 'position' : 'positions'}
          </p>

          {jobs.length > 0 ? (
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No jobs match your search right now.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
