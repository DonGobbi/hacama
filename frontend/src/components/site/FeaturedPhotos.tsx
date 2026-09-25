'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Photo } from '@/lib/types';

const VISIBLE = 3;
const ROTATE_MS = 4500;
const FADE_MS = 900;

interface Slot {
  current: number;
  leaving: number | null;
  /** Which Ken Burns drift variant the current photo uses. */
  kb: boolean;
}

/**
 * Shows 3 photos and periodically swaps one slot for a random photo that
 * isn't currently visible - the incoming image crossfades in over the old one.
 */
export function FeaturedPhotos({ photos }: { photos: Photo[] }) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => ({ current: i, leaving: null, kb: i % 2 === 0 })),
  );
  const [paused, setPaused] = useState(false);
  const timers = useRef<number[]>([]);
  const lastSlot = useRef(-1);

  useEffect(() => {
    if (photos.length <= VISIBLE || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      setSlots((prev) => {
        const visible = new Set(prev.map((s) => s.current));
        const pool = photos.map((_, i) => i).filter((i) => !visible.has(i));
        if (pool.length === 0) return prev;

        // Prefer a different slot than last time so the motion moves around.
        let slotIndex = Math.floor(Math.random() * prev.length);
        if (slotIndex === lastSlot.current && prev.length > 1) {
          slotIndex = (slotIndex + 1) % prev.length;
        }
        lastSlot.current = slotIndex;

        const next = pool[Math.floor(Math.random() * pool.length)];
        const leaving = prev[slotIndex].current;

        const t = window.setTimeout(() => {
          setSlots((s) =>
            s.map((slot, i) => (i === slotIndex && slot.leaving === leaving ? { ...slot, leaving: null } : slot)),
          );
        }, FADE_MS);
        timers.current.push(t);

        return prev.map((s, i) =>
          i === slotIndex ? { current: next, leaving, kb: Math.random() < 0.5 } : s,
        );
      });
    }, ROTATE_MS);

    return () => {
      window.clearInterval(interval);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [photos, paused]);

  return (
    <div
      className="mt-8 grid grid-cols-3 gap-3 sm:gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slots.map((slot, i) => {
        const current = photos[slot.current];
        const leaving = slot.leaving !== null ? photos[slot.leaving] : null;
        if (!current) return null;
        return (
          <div
            key={i}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-ink-950/5"
          >
            {leaving && (
              <Image
                src={leaving.url}
                alt={leaving.title}
                fill
                sizes="(max-width: 640px) 33vw, 400px"
                unoptimized
                className="animate-photo-out absolute inset-0 h-full w-full object-cover"
                aria-hidden
              />
            )}
            {/* Wrapper plays the dissolve; the img inside plays the Ken Burns
                drift - separate elements so the two transforms don't fight. */}
            <div
              key={current._id}
              className="animate-photo-in absolute inset-0"
              style={{ animationDelay: `${i * 140}ms` }}
            >
              <Image
                src={current.url}
                alt={current.title}
                fill
                sizes="(max-width: 640px) 33vw, 400px"
                className={clsx('h-full w-full object-cover', slot.kb ? 'animate-ken-burns' : 'animate-ken-burns-alt')}
              />
              {current.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/70 via-ink-950/25 to-transparent px-3 pt-10 pb-3">
                  <p className="animate-fade-up truncate text-xs font-medium text-white [animation-delay:450ms] sm:text-sm">
                    {current.title}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
