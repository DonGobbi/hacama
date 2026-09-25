import type { Metadata } from 'next';
import { DemandCard } from '@/components/demands/DemandCard';
import { PageHero } from '@/components/site/PageHero';
import { SupplierForm } from '@/components/site/SupplierForm';
import { publicApi, safely } from '@/lib/api';

export const metadata: Metadata = { title: 'We Buy: Market Demands' };

export default async function DemandsPage() {
  const demands = await safely(publicApi.demands(), []);
  const open = demands.filter((d) => d.status === 'open').length;

  return (
    <>
      <PageHero
        tag="We Buy"
        title="Commodities we're sourcing"
        text="Hacama Investments is actively buying the commodities below. If you can supply, open a demand and get in touch. We move fast on genuine offers."
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
              No active demands right now. Check back soon or contact us with your offer.
            </p>
          )}
        </div>
      </section>

      <section id="suppliers" className="scroll-mt-24 border-t border-slate-200 bg-stone-50 py-16">
        <div className="container-page max-w-3xl">
          <span className="section-tag">Supply to us</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">Register as a supplier</h2>
          <p className="mt-3 text-slate-600">
            We are always onboarding reliable vendors for commodities and goods across Malawi. Register your company and
            we will contact you when we need what you supply.
          </p>
          <div className="card mt-8 p-6 sm:p-8">
            <SupplierForm />
          </div>
        </div>
      </section>
    </>
  );
}
