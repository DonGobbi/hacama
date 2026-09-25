import { ArrowRight, Briefcase, FolderKanban, Newspaper, ScrollText, Search, Wheat } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';
import { formatDate, projectSlug, titleCase } from '@/lib/format';
import type { SearchResults } from '@/lib/types';

export const metadata: Metadata = { title: 'Search' };

type Props = { searchParams: Promise<{ q?: string }> };

function ResultLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="group flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition hover:bg-slate-50">
        <span className="min-w-0">{children}</span>
        <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </Link>
    </li>
  );
}

function Group({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4">
        <Icon className="size-4.5 text-brand-600" />
        <h2 className="font-semibold text-ink-950">{title}</h2>
      </header>
      <ul className="divide-y divide-slate-100 p-2">{children}</ul>
    </section>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? '').trim();
  const results: SearchResults | null = q ? await safely(publicApi.search(q), null) : null;
  const total = results
    ? results.jobs.length + results.demands.length + results.news.length + results.projects.length + results.tenders.length
    : 0;

  return (
    <>
      <PageHero tag="Search" title="Search the site" text="Find jobs, buying demands, news, projects, and tenders." />
      <section className="py-12">
        <div className="container-page max-w-3xl">
          <form action="/search" method="get" className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              autoFocus={!q}
              placeholder="e.g. maize, driver, laptops, tender..."
              className="input h-12 pl-12 text-base"
              aria-label="Search the site"
            />
          </form>

          {q && results && (
            <p className="mt-6 text-sm text-slate-500">
              {total === 0 ? `No results for "${q}". Try a different term.` : `${total} result${total === 1 ? '' : 's'} for "${q}"`}
            </p>
          )}

          <div className="mt-6 space-y-6">
            {results && results.jobs.length > 0 && (
              <Group icon={Briefcase} title="Jobs">
                {results.jobs.map((j) => (
                  <ResultLink key={j._id} href={`/jobs/${j.slug}`}>
                    <span className="block truncate font-medium text-ink-950">{j.title}</span>
                    <span className="block truncate text-sm text-slate-500">
                      {j.location} · {titleCase(j.employmentType)}
                    </span>
                  </ResultLink>
                ))}
              </Group>
            )}

            {results && results.demands.length > 0 && (
              <Group icon={Wheat} title="We buy">
                {results.demands.map((d) => (
                  <ResultLink key={d._id} href={`/demands/${d.slug}`}>
                    <span className="block truncate font-medium text-ink-950">{d.title}</span>
                    <span className="block truncate text-sm text-slate-500">{d.quantity}</span>
                  </ResultLink>
                ))}
              </Group>
            )}

            {results && results.tenders.length > 0 && (
              <Group icon={ScrollText} title="Tenders">
                {results.tenders.map((t) => (
                  <ResultLink key={t._id} href="/tenders">
                    <span className="block truncate font-medium text-ink-950">
                      {t.reference ? `${t.reference}: ` : ''}
                      {t.title}
                    </span>
                    <span className="block truncate text-sm text-slate-500">
                      {t.deadline ? `Closes ${formatDate(t.deadline)}` : 'Open'}
                    </span>
                  </ResultLink>
                ))}
              </Group>
            )}

            {results && results.projects.length > 0 && (
              <Group icon={FolderKanban} title="Projects">
                {results.projects.map((p) => (
                  <ResultLink key={p._id} href={`/projects/${projectSlug(p)}`}>
                    <span className="block truncate font-medium text-ink-950">{p.title}</span>
                    <span className="block truncate text-sm text-slate-500">
                      {[p.category, p.year].filter(Boolean).join(' · ')}
                    </span>
                  </ResultLink>
                ))}
              </Group>
            )}

            {results && results.news.length > 0 && (
              <Group icon={Newspaper} title="News">
                {results.news.map((n) => (
                  <ResultLink key={n._id} href="/news">
                    <span className="block truncate font-medium text-ink-950">{n.title}</span>
                    <span className="block truncate text-sm text-slate-500">{formatDate(n.createdAt)}</span>
                  </ResultLink>
                ))}
              </Group>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
