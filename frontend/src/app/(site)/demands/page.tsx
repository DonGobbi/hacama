import type { Metadata } from 'next';
import { Handshake } from 'lucide-react';
import { DemandCard } from '@/components/demands/DemandCard';
import { EmptyState } from '@/components/site/EmptyState';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
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
              {demands.map((d, i) => (
                <Reveal key={d._id} delay={Math.min(i * 60, 360)} className="h-full">
                  <DemandCard demand={d} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={Handshake}
                title="No active demands right now"
                text="Check back soon, or contact us with your offer."
                action={{ href: '/#contact', label: 'Contact us' }}
              />
            </div>
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
