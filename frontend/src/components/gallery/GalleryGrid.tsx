'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Photo } from '@/lib/types';

export function GalleryGrid({ photos, categories }: { photos: Photo[]; categories: string[] }) {
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<number | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return photos.filter(
      (p) =>
        (!category || p.category === category) &&
        (!q || p.title.toLowerCase().includes(q) || p.caption.toLowerCase().includes(q)),
    );
  }, [photos, category, query]);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (delta: number) => setActive((i) => (i === null ? i : (i + delta + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [active, close, step]);

  const current = active !== null ? visible[active] : null;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {categories.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {['', ...categories].map((c) => (
              <button
                key={c || 'all'}
                type="button"
                onClick={() => setCategory(c)}
                className={clsx(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition',
                  category === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                )}
              >
                {c || 'All'}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <label className="relative block sm:w-64">
          <span className="sr-only">Search photos</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input h-10 pl-10 text-sm"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos..."
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          {query || category ? 'No photos match your search.' : 'No photos to show yet.'}
        </p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visible.map((photo, i) => (
            <button
              key={photo._id}
              type="button"
              onClick={() => setActive(i)}
              className="group relative mb-4 block w-full overflow-hidden rounded-2xl break-inside-avoid"
            >
              <Image
                src={photo.url}
                alt={photo.title}
                width={800}
                height={600}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-auto w-full transition duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                {photo.title}
              </span>
            </button>
          ))}
        </div>
      )}

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={close}
        >
          <button type="button" className="absolute top-4 right-4 rounded-full p-2 text-white hover:bg-white/10" onClick={close} aria-label="Close">
            <X className="size-6" />
          </button>
          {visible.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 rounded-full p-2 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button
                type="button"
                className="absolute right-4 rounded-full p-2 text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="size-8" />
              </button>
            </>
          )}
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={current.url} alt={current.title} className="max-h-[80vh] w-auto rounded-xl object-contain" />
            <figcaption className="mt-3 text-center text-white">
              <p className="font-semibold">{current.title}</p>
              {current.caption && <p className="mt-1 text-sm text-slate-300">{current.caption}</p>}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
