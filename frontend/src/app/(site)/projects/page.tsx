import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';
import { projectSlug } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Procurement and supply projects delivered by Hacama Investments for institutions across Malawi.',
};

export default async function ProjectsPage() {
  const projects = await safely(publicApi.projects(), []);

  return (
    <>
      <PageHero
        tag="Track record"
        title="Projects we've delivered"
        text="A selection of supply and procurement work for schools, organizations, and institutions across Malawi."
      />

      <section className="py-12">
        <div className="container-page">
          {projects.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Projects will appear here as we complete them.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p._id}
                  href={`/projects/${projectSlug(p)}`}
                  className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {p.imageUrl && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={p.imageUrl}
                        alt={p.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {p.category && <span className="badge border border-slate-200 bg-slate-50 px-2.5 py-0.5">{p.category}</span>}
                      {p.year && <span>{p.year}</span>}
                    </div>
                    <h2 className="mt-2.5 font-semibold text-ink-950 group-hover:text-brand-700">{p.title}</h2>
                    {p.summary && <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">{p.summary}</p>}
                    {p.client && <p className="mt-2 text-xs text-slate-400">Client: {p.client}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">
                      View project <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
