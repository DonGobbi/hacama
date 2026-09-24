import { ArrowRight, CheckCircle2, MapPin, Package, Tag } from 'lucide-react';
import Link from 'next/link';
import type { Demand } from '@/lib/types';

export function DemandCard({ demand }: { demand: Demand }) {
  const fulfilled = demand.status === 'fulfilled';
  return (
    <Link
      href={`/demands/${demand.slug}`}
      className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">We buy</p>
          <h3 className="mt-1 text-lg font-semibold text-ink-950">{demand.title}</h3>
        </div>
        {fulfilled ? (
          <span className="badge inline-flex shrink-0 items-center gap-1 bg-slate-100 text-slate-600">
            <CheckCircle2 className="size-3.5" /> Fulfilled
          </span>
        ) : (
          <span className="badge shrink-0 bg-brand-50 text-brand-700">Buying now</span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Package className="size-3.5" /> {demand.quantity}
        </span>
        {demand.price && (
          <span className="inline-flex items-center gap-1.5">
            <Tag className="size-3.5" /> {demand.price}
          </span>
        )}
        {demand.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {demand.location}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 font-semibold text-ink-900 group-hover:text-brand-600">
          View demand <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
