import type { Metadata } from 'next';
import { Quote } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';

export const metadata: Metadata = { title: 'Testimonials' };

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function TestimonialsPage() {
  const testimonials = await safely(publicApi.testimonials(), []);

  return (
    <>
      <PageHero
        tag="Testimonials"
        title="What our customers say"
        text="Feedback from the organizations, businesses, and communities we serve across Malawi."
      />
      <section className="py-12">
        <div className="container-page">
          {testimonials.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              No testimonials yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t._id} className="card flex flex-col p-6">
                  <Quote className="size-6 text-brand-500" />
                  <blockquote className="mt-4 flex-1 whitespace-pre-line text-slate-700">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    {t.imageUrl ? (
                      <img src={t.imageUrl} alt="" loading="lazy" className="size-10 rounded-full object-cover" />
                    ) : (
                      <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-600">
                        {initials(t.name)}
                      </span>
                    )}
                    <span className="text-sm">
                      <span className="block font-semibold text-ink-950">{t.name}</span>
                      {(t.role || t.organization) && (
                        <span className="block text-slate-500">
                          {[t.role, t.organization].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
