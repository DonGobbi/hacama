'use client';

import { Facebook, Linkedin, MessageCircle, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => setUrl(window.location.href), []);
  if (!url) return null;

  const text = encodeURIComponent(`${title} — Hacama Investments`);
  const encoded = encodeURIComponent(url);

  const links = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${text}%20${encoded}`,
      icon: MessageCircle,
      className: 'hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      icon: Facebook,
      className: 'hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      icon: Linkedin,
      className: 'hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700',
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <Share2 className="size-4" /> Share
      </span>
      {links.map(({ label, href, icon: Icon, className }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          title={`Share on ${label}`}
          className={`grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition ${className}`}
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}
