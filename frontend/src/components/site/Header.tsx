'use client';

import clsx from 'clsx';
import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brand } from './Brand';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/demands', label: 'We Buy' },
  { href: '/tenders', label: 'Tenders' },
  { href: '/news', label: 'News' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/#contact', label: 'Contact' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState('');

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [pathname]);

  const isActive = (href: string) => {
    const i = href.indexOf('#');
    if (i >= 0) return pathname === '/' && hash === href.slice(i);
    if (href === '/') return pathname === '/' && hash === '';
    return pathname.startsWith(href);
  };

  const track = (href: string) => {
    const i = href.indexOf('#');
    setHash(i >= 0 ? href.slice(i) : '');
    // Clicking the link for the page you're already on is a no-op in Next -
    // force a refetch so freshly published content shows up.
    if (href === pathname) router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between py-3">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => track(item.href)}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-medium transition',
                isActive(item.href) ? 'bg-slate-100 text-ink-950' : 'text-slate-600 hover:text-ink-950',
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            aria-label="Search the site"
            className={clsx(
              'ml-2 rounded-full p-2 transition',
              isActive('/search') ? 'bg-slate-100 text-ink-950' : 'text-slate-600 hover:text-ink-950',
            )}
          >
            <Search className="size-4.5" />
          </Link>
          <Link href="/quote" className="btn btn-primary btn-sm ml-1">
            Request a Quote
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 text-ink-950 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-slate-200 bg-white md:hidden" aria-label="Mobile navigation">
          <div className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  track(item.href);
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              <Search className="size-5" /> Search
            </Link>
            <Link href="/quote" onClick={() => setOpen(false)} className="btn btn-primary mt-2">
              Request a Quote
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
