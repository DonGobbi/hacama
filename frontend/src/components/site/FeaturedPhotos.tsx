'use client';

import { useEffect, useRef, useState } from 'react';
import type { Photo } from '@/lib/types';

const VISIBLE = 3;
const ROTATE_MS = 4500;
const FADE_MS = 900;

interface Slot {
  current: number;
  leaving: number | null;
}

/**
 * Shows 3 photos and periodically swaps one slot for a random photo that
 * isn't currently visible — the incoming image crossfades in over the old one.
 */
export function FeaturedPhotos({ photos }: { photos: Photo[] }) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    Array.from({ length: VISIBLE }, (_, i) => ({ current: i, leaving: null })),
  );
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (photos.length <= VISIBLE) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      setSlots((prev) => {
        const visible = new Set(prev.map((s) => s.current));
        const pool = photos.map((_, i) => i).filter((i) => !visible.has(i));
        if (pool.length === 0) return prev;

        const slotIndex = Math.floor(Math.random() * prev.length);
        const next = pool[Math.floor(Math.random() * pool.length)];
        const leaving = prev[slotIndex].current;

        const t = window.setTimeout(() => {
          setSlots((s) =>
            s.map((slot, i) => (i === slotIndex && slot.leaving === leaving ? { ...slot, leaving: null } : slot)),
          );
        }, FADE_MS);
        timers.current.push(t);

        return prev.map((s, i) => (i === slotIndex ? { current: next, leaving } : s));
      });
    }, ROTATE_MS);

    return () => {
      window.clearInterval(interval);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [photos]);

  return (
    <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
      {slots.map((slot, i) => {
        const current = photos[slot.current];
        const leaving = slot.leaving !== null ? photos[slot.leaving] : null;
        if (!current) return null;
        return (
          <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
            {leaving && (
              <img
                src={leaving.url}
                alt={leaving.title}
                className="absolute inset-0 h-full w-full object-cover"
                aria-hidden
              />
            )}
            <img
              key={current._id}
              src={current.url}
              alt={current.title}
              loading="lazy"
              className="animate-photo-in absolute inset-0 h-full w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
