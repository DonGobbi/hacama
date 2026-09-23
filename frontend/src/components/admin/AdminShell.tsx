'use client';

import clsx from 'clsx';
import {
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  Handshake,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Quote,
  Settings,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brand } from '@/components/site/Brand';
import { useAuth } from './AuthProvider';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/photos', label: 'Photos', icon: Images },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/partners', label: 'Partners', icon: Handshake },
  { href: '/admin/settings', label: 'Site settings', icon: Settings },
  { href: '/admin/users', label: 'Users', icon: Users, superadminOnly: true },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const items = NAV.filter((item) => !item.superadminOnly || user.role === 'superadmin');
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="px-2">
        <Brand />
      </div>
      <nav className="mt-8 flex-1 space-y-1" aria-label="Admin navigation">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              isActive(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-100 hover:text-ink-950',
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-slate-200 pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-ink-950">
          <ExternalLink className="size-4" /> View site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-ink-950"
        >
          <LogOut className="size-4" /> Sign out
        </button>
        <div className="px-3 pt-3 text-xs text-slate-500">
          <p className="truncate font-medium text-ink-950">{user.name}</p>
          <p className="truncate">{user.email}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" className="rounded-lg p-1.5">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="font-semibold text-ink-950">Hacama Admin</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
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
