import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, Package, Phone, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { DemandCard } from '@/components/demands/DemandCard';
import { ShareButtons } from '@/components/jobs/ShareButtons';
import { ApiError, publicApi, safely } from '@/lib/api';
import { formatDate } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

const getDemand = cache(async (slug: string) => {
  try {
    return await publicApi.demandBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demand = await getDemand((await params).slug).catch(() => null);
  return demand
    ? { title: `We Buy: ${demand.title}`, description: `${demand.quantity}${demand.location ? ` · ${demand.location}` : ''}` }
    : { title: 'Demand not found' };
}

export default async function DemandDetailsPage({ params }: Props) {
  const demand = await getDemand((await params).slug);
  if (!demand) notFound();

  const settings = await safely(publicApi.settings(), null);
  const fulfilled = demand.status === 'fulfilled';
  const contact = demand.contact || settings?.whatsapp || settings?.phone || '';
  const wa = contact.replace(/\D/g, '');

  const all = await safely(publicApi.demands(), []);
  const related = all.filter((d) => d._id !== demand._id && d.status === 'open').slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-stone-50 text-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.08),transparent_35%)]" />
        <div className="container-page relative py-14 sm:py-16">
          <Link
            href="/demands"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-ink-950"
          >
            <ArrowLeft className="size-4" /> All demands
          </Link>
          <div className="mt-8">
            <span className="section-tag">We Buy</span>
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">{demand.title}</h1>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 shadow-sm">
              <Package className="size-4 text-brand-600" /> {demand.quantity}
            </span>
            {demand.price && (
              <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 shadow-sm">
                <Tag className="size-4 text-brand-600" /> {demand.price}
              </span>
            )}
            {demand.location && (
              <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 shadow-sm">
                <MapPin className="size-4 text-brand-600" /> {demand.location}
              </span>
            )}
            <span
              className={`badge gap-1.5 border px-3.5 py-1.5 text-sm font-medium shadow-sm ${
                fulfilled
                  ? 'border-slate-200 bg-slate-100 text-slate-600'
                  : 'border-brand-100 bg-brand-50 text-brand-700'
              }`}
            >
              {fulfilled ? (
                <>
                  <CheckCircle2 className="size-4" /> Fulfilled
                </>
              ) : (
                'Buying now'
              )}
            </span>
            <span className="badge gap-1.5 border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-500 shadow-sm">
              <CalendarDays className="size-4" /> Posted {formatDate(demand.createdAt)}
            </span>
          </div>
          <div className="mt-6">
            <ShareButtons title={`We Buy: ${demand.title}`} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_380px]">
          <article className="space-y-8">
            {demand.imageUrl && (
              <Image
                src={demand.imageUrl}
                alt={demand.title}
                width={1200}
                height={675}
                sizes="(max-width: 1024px) 100vw, 700px"
                className="h-auto w-full rounded-2xl border border-slate-200 object-cover"
              />
            )}
            {demand.details ? (
              <div className="whitespace-pre-line leading-relaxed text-slate-600">{demand.details}</div>
            ) : (
              <p className="leading-relaxed text-slate-600">
                Hacama Investments is buying {demand.title}, {demand.quantity}
                {demand.location ? ` in ${demand.location}` : ''}. Reach out using the contact details to make an offer.
              </p>
            )}
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {fulfilled ? (
              <div className="card flex flex-col items-center gap-3 p-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-slate-100">
                  <CheckCircle2 className="size-8 text-slate-500" />
                </span>
                <h3 className="text-lg font-semibold text-ink-950">Demand fulfilled</h3>
                <p className="text-sm text-slate-600">
                  We've secured supply for this commodity. Browse what else we're buying below.
                </p>
                <Link href="/demands" className="btn btn-outline btn-sm mt-1">
                  View all demands
                </Link>
              </div>
            ) : (
              <div className="card p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-ink-950">Can you supply this?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Send us your offer: quantity available, price, and delivery location.
                </p>
                {wa && (
                  <a
                    href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi Hacama, I can supply: ${demand.title} (${demand.quantity}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary mt-5 w-full"
                  >
                    Respond on WhatsApp
                  </a>
                )}
                {contact && (
                  <p className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                    <Phone className="mt-0.5 size-4 shrink-0 text-brand-600" /> {contact}
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-slate-200 bg-stone-50 py-12">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="section-tag">Keep exploring</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink-950">Other things we're buying</h2>
              </div>
              <Link href="/demands" className="btn btn-outline btn-sm shrink-0">
                All demands
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((d) => (
                <DemandCard key={d._id} demand={d} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
