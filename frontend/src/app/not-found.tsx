import { Compass } from 'lucide-react';
import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/tenders', label: 'Tenders' },
  { href: '/gallery', label: 'Gallery' },
];

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-stone-50 px-6 text-ink-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,75,56,0.05),transparent_35%)]" />
      <div className="relative animate-pop text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-500">
          <Compass className="size-7" />
        </span>
        <p className="mt-6 text-6xl font-bold tracking-tight text-brand-600">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500">
          The page you are looking for does not exist or is no longer available.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="btn btn-outline btn-sm">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
