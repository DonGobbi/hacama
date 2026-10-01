'use client';

import clsx from 'clsx';
import {
  Activity,
  Briefcase,
  ChevronDown,
  ExternalLink,
  Factory,
  FileText,
  FolderKanban,
  Handshake,
  Images,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  MailPlus,
  Menu,
  Newspaper,
  Quote,
  ScrollText,
  Settings,
  UserCog,
  Users,
  Wheat,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Brand } from '@/components/site/Brand';
import { useAuth } from './AuthProvider';

type NavItem = { href: string; label: string; icon: LucideIcon; superadminOnly?: boolean };

const NAV_SECTIONS: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    title: 'Engagement',
    items: [
      { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
      { href: '/admin/subscribers', label: 'Subscribers', icon: MailPlus },
    ],
  },
  {
    title: 'Careers',
    items: [
      { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
      { href: '/admin/applications', label: 'Applications', icon: FileText },
    ],
  },
  {
    title: 'Sourcing',
    items: [
      { href: '/admin/tenders', label: 'Tenders', icon: ScrollText },
      { href: '/admin/demands', label: 'Demands', icon: Wheat },
      { href: '/admin/suppliers', label: 'Suppliers', icon: Factory },
    ],
  },
  {
    title: 'Website',
    items: [
      { href: '/admin/photos', label: 'Photos', icon: Images },
      { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
      { href: '/admin/news', label: 'News', icon: Newspaper },
      { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
      { href: '/admin/partners', label: 'Partners', icon: Handshake },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/settings', label: 'Site settings', icon: Settings },
      { href: '/admin/activity', label: 'Activity logs', icon: Activity },
      { href: '/admin/users', label: 'Users', icon: Users, superadminOnly: true },
    ],
  },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-slate-300 hover:shadow-sm"
      >
        <span className="grid size-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-36 truncate text-sm font-semibold leading-tight text-ink-950">{user.name}</span>
          <span className="block text-xs capitalize leading-tight text-slate-500">
            {user.role === 'superadmin' ? 'Super admin' : 'Admin'}
          </span>
        </span>
        <ChevronDown className={`size-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-pop overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-950">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <span className="badge mt-1 bg-brand-50 text-brand-700">
                {user.role === 'superadmin' ? 'Super admin' : 'Admin'}
              </span>
            </div>
          </div>
          <div className="p-1.5">
            <Link
              href="/admin/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink-950"
            >
              <UserCog className="size-4" /> Account & settings
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const visibleItems = (items: NavItem[]) =>
    items.filter((item) => !item.superadminOnly || user.role === 'superadmin');
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  const current = NAV_SECTIONS.flatMap((s) => visibleItems(s.items)).find((item) => isActive(item.href));

  const sidebar = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="flex items-center justify-between px-2">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1" aria-label="Admin navigation">
        {NAV_SECTIONS.map((section) => {
          const items = visibleItems(section.items);
          if (!items.length) return null;
          return (
            <div key={section.title ?? 'overview'}>
              {section.title && (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition active:scale-[0.98]',
                      isActive(href)
                        ? 'bg-brand-50 font-semibold text-brand-700'
                        : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-ink-950',
                    )}
                  >
                    <Icon className="size-4" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-slate-200 pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-ink-950">
          <ExternalLink className="size-4" /> View site
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-slide-in-left">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg p-1.5 lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="lg:hidden">
            <Brand />
          </div>
          <span className="hidden items-baseline gap-1.5 text-sm lg:flex">
            <span className="font-medium text-slate-400">Admin console</span>
            {current && current.href !== '/admin' && (
              <>
                <span className="text-slate-300">/</span>
                <span key={current.href} className="animate-fade-in font-semibold text-ink-950">
                  {current.label}
                </span>
              </>
            )}
          </span>
          <div className="ml-auto">
            <AccountMenu />
          </div>
        </header>
        <main key={pathname} className="mx-auto max-w-6xl animate-fade-up p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-950">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>;
}

export function EmptyState({
  icon: Icon,
  message,
  hint,
}: {
  icon?: LucideIcon;
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex animate-fade-up flex-col items-center gap-2 p-10 text-center">
      {Icon && <Icon className="size-8 text-slate-300" />}
      <p className="text-sm text-slate-500">{message}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function LoadingNote() {
  return (
    <p className="flex items-center gap-2 p-6 text-sm text-slate-400">
      <Loader2 className="size-4 animate-spin" /> Loading...
    </p>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    open: 'bg-emerald-100 text-emerald-800',
    draft: 'bg-slate-200 text-slate-700',
    closed: 'bg-red-100 text-red-700',
    new: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-amber-100 text-amber-800',
    shortlisted: 'bg-violet-100 text-violet-800',
    rejected: 'bg-red-100 text-red-700',
    hired: 'bg-emerald-100 text-emerald-800',
    'in-progress': 'bg-amber-100 text-amber-800',
    quoted: 'bg-violet-100 text-violet-800',
    quote: 'bg-brand-50 text-brand-700',
    contact: 'bg-slate-100 text-slate-700',
  };
  return (
    <span className={clsx('badge capitalize', styles[value] ?? 'bg-slate-100 text-slate-700')}>{value.replace('-', ' ')}</span>
  );
}
