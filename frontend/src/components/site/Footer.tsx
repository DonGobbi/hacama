import Link from 'next/link';
import { telLink } from '@/lib/company';
import type { SiteSettings } from '@/lib/types';
import { Brand } from './Brand';

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500">
      <div className="container-page grid gap-8 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div className="space-y-4">
          <Brand />
          <p className="max-w-sm text-sm">
            A diversified investment, procurement, and supply company in Lilongwe, Malawi — reliable sourcing and
            dependable service.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-950">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#about" className="hover:text-ink-950">About</Link></li>
            <li><Link href="/#services" className="hover:text-ink-950">Services</Link></li>
            <li><Link href="/quote" className="hover:text-ink-950">Request a Quote</Link></li>
            <li><Link href="/jobs" className="hover:text-ink-950">Careers</Link></li>
            <li><Link href="/news" className="hover:text-ink-950">News</Link></li>
            <li><Link href="/gallery" className="hover:text-ink-950">Gallery</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-950">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>{settings.address || 'Lilongwe, Malawi'}</li>
            {settings.phone && (
              <li><a href={telLink(settings.phone)} className="hover:text-ink-950">{settings.phone}</a></li>
            )}
            {settings.email && (
              <li><a href={`mailto:${settings.email}`} className="hover:text-ink-950">{settings.email}</a></li>
            )}
            <li><Link href="/#contact" className="hover:text-ink-950">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-ink-950">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs">
        © {new Date().getFullYear()} Hacama Investments. All rights reserved.
      </div>
    </footer>
  );
}
