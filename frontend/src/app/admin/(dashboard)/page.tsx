'use client';

import clsx from 'clsx';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Circle,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderKanban,
  ImagePlus,
  Inbox,
  MessageSquareText,
  Plus,
  Settings,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ErrorNote, StatusBadge } from '@/components/admin/AdminShell';
import { useAuth } from '@/components/admin/AuthProvider';
import { adminApi } from '@/lib/api';
import type {
  Application,
  Demand,
  Enquiry,
  EnquiryStatus,
  Job,
  News,
  Partner,
  Photo,
  Project,
  SiteSettings,
  Testimonial,
} from '@/lib/types';

type DashboardData = {
  jobs: Job[];
  applications: Application[];
  photos: Photo[];
  enquiries: Enquiry[];
  testimonials: Testimonial[];
  partners: Partner[];
  projects: Project[];
  news: News[];
  demands: Demand[];
  settings: SiteSettings;
};

const PIPELINE: { status: EnquiryStatus; label: string; hint: string; bar: string }[] = [
  { status: 'new', label: 'New', hint: 'Waiting for a first reply', bar: 'bg-blue-500' },
  { status: 'in-progress', label: 'In progress', hint: 'Being worked on', bar: 'bg-amber-500' },
  { status: 'quoted', label: 'Quoted', hint: 'Quotation sent', bar: 'bg-violet-500' },
  { status: 'closed', label: 'Closed', hint: 'Done or declined', bar: 'bg-slate-400' },
];

const QUICK_ACTIONS = [
  { label: 'Post a job', href: '/admin/jobs/new', icon: Briefcase },
  { label: 'Add a project', href: '/admin/projects', icon: FolderKanban },
  { label: 'Upload photos', href: '/admin/photos', icon: ImagePlus },
  { label: 'Site settings', href: '/admin/settings', icon: Settings },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(date: string) {
  const minutes = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
      {initials(name) || <UserRound className="size-4" />}
    </span>
  );
}

function Panel({
  title,
  href,
  linkLabel = 'View all',
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-ink-950">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
            {linkLabel} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      adminApi.jobs(),
      adminApi.applications(),
      adminApi.photos(),
      adminApi.enquiries(),
      adminApi.contentList<Testimonial>('testimonials'),
      adminApi.contentList<Partner>('partners'),
      adminApi.contentList<Project>('projects'),
      adminApi.contentList<News>('news'),
      adminApi.contentList<Demand>('demands'),
      adminApi.settings(),
    ])
      .then(([jobs, applications, photos, enquiries, testimonials, partners, projects, news, demands, settings]) =>
        setData({ jobs, applications, photos, enquiries, testimonials, partners, projects, news, demands, settings }),
      )
      .catch((err: Error) => setError(err.message));
  }, []);

  const newEnquiries = data?.enquiries.filter((e) => e.status === 'new').length ?? 0;
  const newApplications = data?.applications.filter((a) => a.status === 'new').length ?? 0;
  const pipelineTotal = data?.enquiries.length ?? 0;
  const countByStatus = (status: EnquiryStatus) => data?.enquiries.filter((e) => e.status === status).length ?? 0;

  const stats = data
    ? [
        {
          label: 'New enquiries',
          value: newEnquiries,
          sub: `${data.enquiries.length} total`,
          icon: MessageSquareText,
          href: '/admin/enquiries?status=new',
        },
        {
          label: 'Open quote requests',
          value: data.enquiries.filter((e) => e.type === 'quote' && e.status !== 'closed').length,
          sub: `${data.enquiries.filter((e) => e.type === 'quote').length} received`,
          icon: ClipboardList,
          href: '/admin/enquiries?type=quote',
        },
        {
          label: 'Open jobs',
          value: data.jobs.filter((j) => j.status === 'open').length,
          sub: `${data.jobs.length} posted`,
          icon: Briefcase,
          href: '/admin/jobs',
        },
        {
          label: 'New applications',
          value: newApplications,
          sub: `${data.applications.length} total`,
          icon: FileText,
          href: '/admin/applications?status=new',
        },
      ]
    : [];

  const visible = <T extends { published: boolean }>(items: T[]) => items.filter((i) => i.published).length;
  const content = data
    ? [
        { label: 'Past projects', count: visible(data.projects), href: '/admin/projects' },
        { label: 'News articles', count: visible(data.news), href: '/admin/news' },
        { label: 'Market demands', count: visible(data.demands), href: '/admin/demands' },
        { label: 'Testimonials', count: visible(data.testimonials), href: '/admin/testimonials' },
        { label: 'Partner logos', count: visible(data.partners), href: '/admin/partners' },
        { label: 'Featured photos', count: data.photos.filter((p) => p.featured).length, href: '/admin/photos' },
        { label: 'Key numbers', count: data.settings.stats.length, href: '/admin/settings' },
        { label: 'Credentials', count: data.settings.credentials.length, href: '/admin/settings' },
        { label: 'FAQ', count: data.settings.faqs.length, href: '/admin/settings' },
        { label: 'Office address & map', count: data.settings.address ? 1 : 0, done: 'Set', href: '/admin/settings' },
        { label: 'Company profile PDF', count: data.settings.companyProfileUrl ? 1 : 0, done: 'Uploaded', href: '/admin/settings' },
      ]
    : [];
  const liveSections = content.filter((c) => c.count > 0).length;

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-stone-50 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.10),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(168,75,56,0.06),transparent_40%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="section-tag">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
              {greeting()}, {user.name.split(' ')[0]}.
            </h1>
            <p className="mt-2 text-slate-600">
              {!data
                ? 'Loading the latest activity across the site...'
                : newEnquiries + newApplications === 0
                  ? 'You are all caught up — no new enquiries or applications waiting.'
                  : `You have ${newEnquiries} new enquir${newEnquiries === 1 ? 'y' : 'ies'} and ${newApplications} new application${newApplications === 1 ? '' : 's'} waiting.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/enquiries?status=new" className="btn btn-primary">
              <Inbox className="size-4" /> Open inbox
            </Link>
            <Link href="/admin/jobs/new" className="btn btn-outline">
              <Plus className="size-4" /> Post a job
            </Link>
            <Link href="/" target="_blank" className="btn btn-outline">
              <ExternalLink className="size-4" /> View site
            </Link>
          </div>
        </div>
      </section>

      <ErrorNote message={error} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data ? stats : Array.from({ length: 4 }, () => null)).map((stat, i) =>
          stat ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <stat.icon className="size-5" />
                </span>
                <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-ink-950">{stat.value}</p>
              <p className="text-sm font-medium text-slate-700">{stat.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{stat.sub}</p>
            </Link>
          ) : (
            <div key={i} className="card h-40 animate-pulse bg-slate-100" />
          ),
        )}
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="section-tag">Enquiry pipeline</span>
            <h2 className="mt-2 text-lg font-semibold text-ink-950">From request to delivery</h2>
          </div>
          <p className="text-sm text-slate-500">{pipelineTotal} enquiries in total</p>
        </div>

        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-slate-100">
          {pipelineTotal > 0 &&
            PIPELINE.map((step) => (
              <div
                key={step.status}
                className={clsx(step.bar, 'transition-all')}
                style={{ width: `${(countByStatus(step.status) / pipelineTotal) * 100}%` }}
              />
            ))}
        </div>

        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((step, i) => (
            <li key={step.status}>
              <Link
                href={`/admin/enquiries?status=${step.status}`}
                className="flex h-full items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand-500/40 hover:bg-brand-50/40"
              >
                <span className={clsx('mt-1.5 size-2.5 shrink-0 rounded-full', step.bar)} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-ink-950">{step.label}</span>
                    <span className="text-xs font-bold text-slate-300">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <span className="mt-1 block text-2xl font-bold tracking-tight text-ink-950">
                    {data ? countByStatus(step.status) : '–'}
                  </span>
                  <span className="block text-xs text-slate-500">{step.hint}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Panel title="Recent enquiries" href="/admin/enquiries">
            {data && data.enquiries.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <MessageSquareText className="size-8 text-slate-300" />
                <p className="text-sm text-slate-500">No enquiries yet. Contact and quote requests will appear here.</p>
              </div>
            )}
            {!data && <div className="m-5 h-40 animate-pulse rounded-xl bg-slate-100" />}
            <ul className="divide-y divide-slate-100">
              {data?.enquiries.slice(0, 6).map((e) => (
                <li key={e._id}>
                  <Link
                    href={`/admin/enquiries?type=${e.type}`}
                    className="flex items-center gap-3 px-5 py-3.5 text-sm transition hover:bg-slate-50"
                  >
                    <Avatar name={e.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink-950">
                        {e.name}
                        {e.organization && <span className="font-normal text-slate-500"> · {e.organization}</span>}
                      </p>
                      <p className="truncate text-slate-500">
                        {e.type === 'quote'
                          ? `${e.items.length} item${e.items.length === 1 ? '' : 's'}${e.category ? ` · ${e.category}` : ''}`
                          : e.message}
                      </p>
                    </div>
                    <div className="hidden shrink-0 items-center gap-2 sm:flex">
                      <StatusBadge value={e.type} />
                      <StatusBadge value={e.status} />
                    </div>
                    <span className="w-14 shrink-0 text-right text-xs text-slate-400">{timeAgo(e.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recent applications" href="/admin/applications">
            {data && data.applications.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-10 text-center">
                <FileText className="size-8 text-slate-300" />
                <p className="text-sm text-slate-500">No applications yet.</p>
              </div>
            )}
            {!data && <div className="m-5 h-32 animate-pulse rounded-xl bg-slate-100" />}
            <ul className="divide-y divide-slate-100">
              {data?.applications.slice(0, 5).map((a) => (
                <li key={a._id}>
                  <Link
                    href="/admin/applications"
                    className="flex items-center gap-3 px-5 py-3.5 text-sm transition hover:bg-slate-50"
                  >
                    <Avatar name={a.fullName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink-950">{a.fullName}</p>
                      <p className="truncate text-slate-500">{a.job?.title ?? 'Deleted job'}</p>
                    </div>
                    <StatusBadge value={a.status} />
                    <span className="w-14 shrink-0 text-right text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Website content">
            <div className="px-5 pt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-slate-600">Sections live on the site</span>
                <span className="font-semibold text-ink-950">
                  {data ? `${liveSections} / ${content.length}` : '–'}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: content.length ? `${(liveSections / content.length) * 100}%` : '0%' }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Empty sections stay hidden on the public site.</p>
            </div>
            {!data && <div className="m-5 h-64 animate-pulse rounded-xl bg-slate-100" />}
            <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              {content.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="group flex items-center gap-3 px-5 py-3 text-sm transition hover:bg-slate-50">
                    {c.count > 0 ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-slate-300" />
                    )}
                    <span className="flex-1 text-slate-700">{c.label}</span>
                    {c.count > 0 ? (
                      <span className="text-xs font-medium text-emerald-700">{c.done ?? `${c.count} live`}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 opacity-80 group-hover:opacity-100">
                        Add <ArrowRight className="size-3" />
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Quick actions">
            <div className="grid grid-cols-2 gap-3 p-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-ink-950 transition hover:border-brand-500/40 hover:bg-brand-50/40"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <action.icon className="size-4" />
                  </span>
                  {action.label}
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
