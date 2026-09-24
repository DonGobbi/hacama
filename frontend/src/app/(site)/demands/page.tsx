import type { Metadata } from 'next';
import { DemandCard } from '@/components/demands/DemandCard';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';

export const metadata: Metadata = { title: 'We Buy — Market Demands' };

export default async function DemandsPage() {
  const demands = await safely(publicApi.demands(), []);
  const open = demands.filter((d) => d.status === 'open').length;

  return (
    <>
      <PageHero
        tag="We Buy"
        title="Commodities we're sourcing"
        text="Hacama Investments is actively buying the commodities below. If you can supply, open a demand and get in touch — we move fast on genuine offers."
      />

      <section className="py-12">
        <div className="container-page">
          <p className="text-sm text-slate-500">
            {open} active {open === 1 ? 'demand' : 'demands'}
            {demands.length > open ? ` · ${demands.length - open} fulfilled` : ''}
          </p>

          {demands.length > 0 ? (
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {demands.map((d) => (
                <DemandCard key={d._id} demand={d} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No active demands right now — check back soon or contact us with your offer.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
