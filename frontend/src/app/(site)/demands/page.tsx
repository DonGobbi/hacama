import { CalendarDays, CheckCircle2, MapPin, Package, Phone, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'We Buy — Market Demands' };

export default async function DemandsPage() {
  const [demands, settings] = await Promise.all([safely(publicApi.demands(), []), safely(publicApi.settings(), null)]);

  const fallbackPhone = settings?.whatsapp || settings?.phone || '';
  const waNumber = fallbackPhone.replace(/\D/g, '');

  return (
    <>
      <PageHero
        tag="We Buy"
        title="Commodities we're sourcing"
        text="Hacama Investments is actively buying the commodities below. If you can supply, get in touch — we move fast on genuine offers."
      />

      <section className="py-12">
        <div className="container-page max-w-4xl">
          {demands.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No active demands right now — check back soon or contact us with your offer.
            </p>
          ) : (
            <div className="space-y-6">
              {demands.map((d) => {
                const fulfilled = d.status === 'fulfilled';
                const contact = d.contact || fallbackPhone;
                const wa = (d.contact || waNumber).replace(/\D/g, '');
                return (
                  <article key={d._id} className={`card p-6 sm:p-8 ${fulfilled ? 'opacity-70' : ''}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {fulfilled ? (
                        <span className="badge inline-flex items-center gap-1 bg-slate-100 text-slate-600">
                          <CheckCircle2 className="size-3.5" /> Fulfilled
                        </span>
                      ) : (
                        <span className="badge bg-brand-50 text-brand-700">Buying now</span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="size-3.5" /> Posted {formatDate(d.createdAt)}
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">{d.title}</h2>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
                        <Package className="mt-0.5 size-4 shrink-0 text-brand-600" />
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Quantity</dt>
                          <dd className="text-sm font-semibold text-ink-950">{d.quantity}</dd>
                        </div>
                      </div>
                      {d.price && (
                        <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
                          <Tag className="mt-0.5 size-4 shrink-0 text-brand-600" />
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Price</dt>
                            <dd className="text-sm font-semibold text-ink-950">{d.price}</dd>
                          </div>
                        </div>
                      )}
                      {d.location && (
                        <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
                          <div>
                            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Location</dt>
                            <dd className="text-sm font-semibold text-ink-950">{d.location}</dd>
                          </div>
                        </div>
                      )}
                    </dl>

                    {d.details && (
                      <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{d.details}</p>
                    )}

                    {!fulfilled && contact && (
                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                        {wa ? (
                          <a
                            href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi Hacama, I can supply: ${d.title} (${d.quantity}).`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            Respond on WhatsApp
                          </a>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone className="size-4 text-brand-600" /> {contact}
                        </span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
