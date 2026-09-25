import type { MetadataRoute } from 'next';
import { publicApi, safely } from '@/lib/api';
import { SITE_URL } from '@/lib/company';
import { projectSlug } from '@/lib/format';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, demands, projects] = await Promise.all([
    safely(publicApi.jobs(), []),
    safely(publicApi.demands(), []),
    safely(publicApi.projects(), []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: '', priority: 1 },
    { path: '/demands', priority: 0.9 },
    { path: '/gallery', priority: 0.8 },
    { path: '/jobs', priority: 0.8 },
    { path: '/projects', priority: 0.8 },
    { path: '/tenders', priority: 0.8 },
    { path: '/news', priority: 0.7 },
    { path: '/testimonials', priority: 0.7 },
    { path: '/quote', priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((j) => ({
    url: `${SITE_URL}/jobs/${j.slug}`,
    lastModified: j.updatedAt ? new Date(j.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const demandRoutes: MetadataRoute.Sitemap = demands.map((d) => ({
    url: `${SITE_URL}/demands/${d.slug}`,
    lastModified: d.updatedAt ? new Date(d.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}/projects/${projectSlug(p)}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...jobRoutes, ...demandRoutes, ...projectRoutes];
}
