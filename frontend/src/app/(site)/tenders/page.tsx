import { CalendarClock, FileDown, ScrollText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';
import { deadlineState, formatDate } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Tenders',
  description: 'Current procurement tenders and RFQs published by Hacama Investments. Download tender documents and submit bids.',
};

export default async function TendersPage() {
  const tenders = await safely(publicApi.tenders(), []);
  const open = tenders.filter((t) => t.status === 'open' && deadlineState(t.deadline) !== 'closed');
  const closed = tenders.filter((t) => t.status === 'closed' || deadlineState(t.deadline) === 'closed');

  return (
    <>
      <PageHero
        tag="Procurement"
        title="Tenders & RFQs"
        text="Current tenders we are running. Download the tender document for submission requirements, and submit your bid before the closing date."
      />

      <section className="py-12">
        <div className="container-page max-w-4xl">
          {tenders.length === 0 && (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <ScrollText className="size-10 text-slate-300" />
              <h2 className="text-lg font-semibold text-ink-950">No tenders right now</h2>
              <p className="max-w-md text-sm text-slate-600">
                When we publish a tender or RFQ it will appear here. Register as a supplier to be notified of upcoming
                opportunities.
              </p>
              <Link href="/demands#suppliers" className="btn btn-outline btn-sm mt-2">
                Register as a supplier
              </Link>
            </div>
          )}

          {open.length > 0 && (
            <div className="space-y-5">
              {open.map((t) => {
                const closingSoon = deadlineState(t.deadline) === 'closing-soon';
                return (
                  <article key={t._id} className="card p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {t.reference && <span className="section-tag">{t.reference}</span>}
                      <span className="badge border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        Open
                      </span>
                      {t.deadline && (
                        <span
                          className={`badge gap-1.5 border px-3 py-1 text-xs font-medium ${
                            closingSoon
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          <CalendarClock className="size-3.5" />
                          {closingSoon ? 'Closing soon: ' : 'Closes '}
                          {formatDate(t.deadline)}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-xl font-bold tracking-tight text-ink-950">{t.title}</h2>
                    {t.summary && <p className="mt-2 text-slate-600">{t.summary}</p>}
                    {t.description && (
                      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-slate-600">{t.description}</p>
                    )}
                    {t.documentUrl && (
                      <a href={t.documentUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm mt-5">
                        <FileDown className="size-4" /> Download tender document
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {closed.length > 0 && (
            <div className="mt-12">
              <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Closed tenders</h2>
              <ul className="mt-4 divide-y divide-slate-200 border-t border-b border-slate-200">
                {closed.map((t) => (
                  <li key={t._id} className="flex items-center justify-between gap-4 py-3">
                    <span className="text-sm text-slate-600">
                      {t.reference ? `${t.reference}: ` : ''}
                      {t.title}
                    </span>
                    <span className="shrink-0 text-xs text-slate-400">
                      {t.deadline ? `Closed ${formatDate(t.deadline)}` : 'Closed'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
