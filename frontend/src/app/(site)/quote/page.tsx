import { MessageCircle, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { QuoteForm } from '@/components/site/QuoteForm';
import { publicApi, safely } from '@/lib/api';
import { DEFAULT_SETTINGS, SUPPLY_CATEGORIES, telLink, whatsappLink } from '@/lib/company';

export const metadata: Metadata = {
  title: 'Request a Quote',
  description: 'Send Hacama Investments your list of items and quantities and receive a quotation.',
};

const NEXT_STEPS = [
  'We review your list and confirm any details with you.',
  'We source the items and prepare a quotation.',
  'Once you approve, we arrange supply and delivery.',
];

type Props = { searchParams: Promise<{ category?: string }> };

export default async function QuotePage({ searchParams }: Props) {
  const { category = '' } = await searchParams;
  const initialCategory = SUPPLY_CATEGORIES.includes(category) ? category : '';
  const settings = { ...DEFAULT_SETTINGS, ...(await safely(publicApi.settings(), DEFAULT_SETTINGS)) };

  return (
    <>
      <PageHero
        tag="Request a Quote"
        title="Tell us what you need."
        text="List the items and quantities you need and where they should be delivered. We will come back to you with a quotation."
      />
      <section className="py-12">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_320px]">
          <QuoteForm initialCategory={initialCategory} />

          <aside className="space-y-5 self-start lg:sticky lg:top-24">
            <div className="card p-6">
              <h2 className="font-semibold text-ink-950">What happens next</h2>
              <ol className="mt-4 space-y-4">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-slate-600">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="card space-y-3 p-6">
              <h2 className="font-semibold text-ink-950">Prefer to talk?</h2>
              {settings.whatsapp && (
                <a
                  href={whatsappLink(settings.whatsapp, 'Hello Hacama Investments, I would like a quotation for:')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
                >
                  <MessageCircle className="size-4" /> Chat on WhatsApp
                </a>
              )}
              {settings.phone && (
                <a href={telLink(settings.phone)} className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-600">
                  <Phone className="size-4" /> {settings.phone}
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
