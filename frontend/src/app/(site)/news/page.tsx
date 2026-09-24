import { CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'News & Updates' };

export default async function NewsPage() {
  const articles = await safely(publicApi.news(), []);

  return (
    <>
      <PageHero
        tag="News & Updates"
        title="The latest from Hacama Investments"
        text="Company announcements, tender wins, and completed projects."
      />

      <section className="py-12">
        <div className="container-page max-w-4xl">
          {articles.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No news yet — check back soon.
            </p>
          ) : (
            <div className="space-y-6">
              {articles.map((article) => (
                <article key={article._id} className="card overflow-hidden">
                  {article.imageUrl && (
                    <img src={article.imageUrl} alt="" className="aspect-[21/9] w-full object-cover" />
                  )}
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      {article.category && (
                        <span className="badge bg-brand-50 text-brand-700">{article.category}</span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="size-3.5" /> {formatDate(article.createdAt)}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold tracking-tight text-ink-950 sm:text-2xl">{article.title}</h2>
                    <p className="mt-2 font-medium text-slate-700">{article.summary}</p>
                    {article.body && (
                      <div className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{article.body}</div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
