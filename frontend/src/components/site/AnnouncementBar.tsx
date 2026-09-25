'use client';

import { Megaphone, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { SiteSettings } from '@/lib/types';

/** Slim banner pinned above the header; hidden unless admin sets announcement text. */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !settings.announcement) return null;

  const text = (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <Megaphone className="size-4 shrink-0" />
      {settings.announcement}
    </span>
  );

  return (
    <div className="relative z-50 bg-brand-600 px-4 py-2 text-center text-white">
      {settings.announcementLink ? (
        <Link href={settings.announcementLink} className="inline-block hover:underline">
          {text}
        </Link>
      ) : (
        text
      )}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
