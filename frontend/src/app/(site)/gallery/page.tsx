import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { PageHero } from '@/components/site/PageHero';
import { publicApi, safely } from '@/lib/api';

export const metadata: Metadata = { title: 'Gallery' };

export default async function GalleryPage() {
  const [photos, categories] = await Promise.all([
    safely(publicApi.photos(), []),
    safely(publicApi.photoCategories(), []),
  ]);

  return (
    <>
      <PageHero tag="Gallery" title="Our work in pictures" text="Products, projects, and moments from our work across Malawi." />
      <section className="py-12">
        <div className="container-page">
          <GalleryGrid photos={photos} categories={categories} />
        </div>
      </section>
    </>
  );
}
