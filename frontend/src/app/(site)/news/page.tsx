import { CalendarDays, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { EmptyState } from '@/components/site/EmptyState';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
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
            <EmptyState icon={Newspaper} title="No news yet" text="Check back soon for updates from Hacama Investments." />
          ) : (
            <div className="space-y-6">
              {articles.map((article, i) => (
                <Reveal key={article._id} delay={Math.min(i * 70, 350)}>
                  <article className="card overflow-hidden">
                  {article.imageUrl && (
                    <div className="relative aspect-[21/9] w-full">
                      <Image src={article.imageUrl} alt="" fill sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
                    </div>
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
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
