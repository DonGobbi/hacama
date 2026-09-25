'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Testimonial } from '@/lib/types';

const ROTATE_MS = 6000;
const SLIDE_MS = 750;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Slide({ t, className, animate }: { t: Testimonial; className?: string; animate?: boolean }) {
  return (
    <figure
      aria-hidden={!animate}
      className={clsx(
        'relative col-start-1 row-start-1 flex flex-col items-center px-6 py-12 text-center sm:px-16 sm:py-14',
        className,
      )}
    >
      {/* oversized watermark quotes */}
      <Quote
        aria-hidden
        className="pointer-events-none absolute top-5 left-5 size-14 -scale-x-100 text-brand-600/10 sm:size-20"
      />
      <Quote aria-hidden className="pointer-events-none absolute right-5 bottom-5 size-14 text-brand-600/10 sm:size-20" />

      <span
        className={clsx(
          'grid size-12 place-items-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30',
          animate && 'animate-pop',
        )}
      >
        <Quote className="size-5" />
      </span>
      <blockquote
        className={clsx(
          'mt-7 line-clamp-4 max-w-3xl text-xl leading-relaxed font-medium text-balance text-ink-950 sm:text-2xl',
          animate && 'animate-fade-up [animation-delay:120ms]',
        )}
      >
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className={clsx('mt-8 flex items-center gap-3', animate && 'animate-fade-up [animation-delay:240ms]')}>
        {t.imageUrl ? (
          <Image src={t.imageUrl} alt="" width={48} height={48} className="size-12 rounded-full object-cover ring-2 ring-white" />
        ) : (
          <span className="grid size-12 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 ring-2 ring-white">
            {initials(t.name)}
          </span>
        )}
        <span className="text-left text-sm">
          <span className="block font-semibold text-ink-950">{t.name}</span>
          {(t.role || t.organization) && (
            <span className="block text-slate-500">{[t.role, t.organization].filter(Boolean).join(', ')}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Shows one testimonial at a time. Every few seconds a random different
 * testimonial slides in (random direction); arrows and dots allow manual
 * navigation. Pauses on hover and respects prefers-reduced-motion.
 */
export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const cleanup = useRef<number | null>(null);

  const go = (next: number, direction: 1 | -1) => {
    if (next === index || next < 0 || next >= testimonials.length) return;
    setLeaving(index);
    setDir(direction);
    setIndex(next);
    if (cleanup.current) window.clearTimeout(cleanup.current);
    cleanup.current = window.setTimeout(() => setLeaving(null), SLIDE_MS);
  };

  useEffect(() => {
    if (testimonials.length <= 1 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const t = window.setTimeout(() => {
      let next = index;
      while (next === index) next = Math.floor(Math.random() * testimonials.length);
      go(next, Math.random() < 0.5 ? 1 : -1);
    }, ROTATE_MS);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused, testimonials.length]);

  useEffect(
    () => () => {
      if (cleanup.current) window.clearTimeout(cleanup.current);
    },
    [],
  );

  const current = testimonials[index];
  if (!current) return null;

  return (
    <div className="mt-10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-brand-50/40 to-slate-50 shadow-sm">
        {/* soft decorative glows */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-brand-100/60 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-brand-50 blur-3xl" />

        {/* All slides stay mounted in the same grid cell so the panel height
            always equals the tallest quote - no layout shift on rotation. */}
        <div className="relative grid" aria-live="polite">
          {testimonials.map((t, i) => {
            const isCurrent = i === index;
            const isLeaving = i === leaving;
            return (
              <Slide
                key={t._id}
                t={t}
                animate={isCurrent}
                className={clsx(
                  !isCurrent && 'pointer-events-none',
                  isCurrent
                    ? dir === 1
                      ? 'animate-slide-in-right'
                      : 'animate-slide-in-left'
                    : isLeaving
                      ? dir === 1
                        ? 'animate-slide-out-left'
                        : 'animate-slide-out-right'
                      : 'invisible',
                )}
              />
            );
          })}
        </div>
      </div>

      {testimonials.length > 1 && (
        <div className="mt-10 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => go((index - 1 + testimonials.length) % testimonials.length, -1)}
            aria-label="Previous testimonial"
            className="grid size-9 place-items-center rounded-full border border-slate-300 text-slate-600 transition hover:border-brand-600 hover:text-brand-600"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t._id}
                type="button"
                onClick={() => go(i, i > index ? 1 : -1)}
                aria-label={`Show testimonial ${i + 1}`}
                className={clsx(
                  'relative h-2 overflow-hidden rounded-full transition-all duration-300',
                  i === index ? 'w-10 bg-brand-100' : 'w-2 bg-slate-300 hover:bg-slate-400',
                )}
              >
                {i === index && (
                  <span
                    className={clsx(
                      'animate-progress absolute inset-0 origin-left rounded-full bg-brand-600',
                      paused && '[animation-play-state:paused]',
                    )}
                    style={{ animationDuration: `${ROTATE_MS}ms` }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go((index + 1) % testimonials.length, 1)}
            aria-label="Next testimonial"
            className="grid size-9 place-items-center rounded-full border border-slate-300 text-slate-600 transition hover:border-brand-600 hover:text-brand-600"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
