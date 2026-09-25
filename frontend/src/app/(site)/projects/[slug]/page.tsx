import { ArrowLeft, Building2, CalendarDays, FolderKanban } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ApiError, publicApi, safely } from '@/lib/api';
import { projectSlug } from '@/lib/format';
import type { Project } from '@/lib/types';

type Props = { params: Promise<{ slug: string }> };

const getProject = cache(async (slug: string): Promise<Project | null> => {
  try {
    return await publicApi.projectBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug).catch(() => null);
  return project ? { title: project.title, description: project.summary } : { title: 'Project not found' };
}

export default async function ProjectDetailsPage({ params }: Props) {
  const project = await getProject((await params).slug);
  if (!project) notFound();

  const all = await safely(publicApi.projects(), []);
  const related = all.filter((p) => p._id !== project._id).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-stone-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.08),transparent_35%)]" />
        <div className="container-page relative py-14 sm:py-16">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-ink-950"
          >
            <ArrowLeft className="size-4" /> All projects
          </Link>
          {project.category && (
            <div className="mt-8">
              <span className="section-tag">{project.category}</span>
            </div>
          )}
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{project.title}</h1>
          <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
            {project.client && (
              <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-slate-700 shadow-sm">
                <Building2 className="size-4 text-brand-600" /> {project.client}
              </span>
            )}
            {project.year && (
              <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-slate-700 shadow-sm">
                <CalendarDays className="size-4 text-brand-600" /> {project.year}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-page max-w-4xl">
          {project.imageUrl && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}
          {project.summary && (
            <p className="mt-8 border-l-4 border-brand-500 pl-5 text-lg leading-relaxed font-medium text-ink-900">
              {project.summary}
            </p>
          )}
          {project.details ? (
            <div className="mt-6 leading-relaxed whitespace-pre-line text-slate-600">{project.details}</div>
          ) : (
            !project.summary && (
              <p className="mt-8 text-slate-500">Details for this project are being prepared.</p>
            )
          )}

          <div className="card mt-10 flex flex-wrap items-center justify-between gap-4 bg-stone-50 p-6">
            <div>
              <h2 className="font-semibold text-ink-950">Need a similar supply run?</h2>
              <p className="mt-1 text-sm text-slate-600">Tell us what you need and we will quote it.</p>
            </div>
            <Link href="/quote" className="btn btn-primary">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-stone-50 py-12">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="section-tag">Keep exploring</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">More projects</h2>
              </div>
              <Link href="/projects" className="btn btn-outline btn-sm shrink-0">
                All projects
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p._id}
                  href={`/projects/${projectSlug(p)}`}
                  className="card group flex items-start gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <FolderKanban className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-ink-950 group-hover:text-brand-700">{p.title}</span>
                    {p.summary && <span className="mt-1 line-clamp-2 block text-sm text-slate-500">{p.summary}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
