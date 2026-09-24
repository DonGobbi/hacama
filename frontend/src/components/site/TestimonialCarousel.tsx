'use client';

import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Testimonial } from '@/lib/types';

const ROTATE_MS = 6000;
const SLIDE_MS = 700;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function Slide({ t, className }: { t: Testimonial; className?: string }) {
  return (
    <figure className={clsx('col-start-1 row-start-1 flex flex-col items-center text-center', className)}>
      <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Quote className="size-5" />
      </span>
      <blockquote className="mt-6 max-w-3xl text-xl leading-relaxed font-medium text-balance text-ink-950 sm:text-2xl">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-3">
        {t.imageUrl ? (
          <img src={t.imageUrl} alt="" className="size-12 rounded-full object-cover" />
        ) : (
          <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
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
      <div className="grid" aria-live="polite">
        {leaving !== null && testimonials[leaving] && (
          <Slide
            t={testimonials[leaving]}
            className={clsx('pointer-events-none', dir === 1 ? 'animate-slide-out-left' : 'animate-slide-out-right')}
          />
        )}
        <Slide key={index} t={current} className={dir === 1 ? 'animate-slide-in-right' : 'animate-slide-in-left'} />
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
                  'h-2 rounded-full transition-all duration-300',
                  i === index ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300 hover:bg-slate-400',
                )}
              />
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
