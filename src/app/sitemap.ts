import type { MetadataRoute } from 'next';
import { getArticles } from '@/lib/data-store';
import { parseIndonesianDate } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles(true);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [`${BASE_URL}/amelia.webp`],
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [`${BASE_URL}/amelia.webp`],
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [`${BASE_URL}/amelia.webp`],
    },
    {
      url: `${BASE_URL}/assessment`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [`${BASE_URL}/amelia.webp`],
    },
    {
      url: `${BASE_URL}/counseling`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      images: [`${BASE_URL}/amelia.webp`],
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      images: [`${BASE_URL}/amelia.webp`],
    },
    {
      url: `${BASE_URL}/schedule`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [`${BASE_URL}/amelia.webp`],
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${BASE_URL}/articles/${art.slug}`,
    lastModified: parseIndonesianDate(art.publishedAt) || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
    images: [
      `${BASE_URL}/articles/${art.slug}/opengraph-image`,
      `${BASE_URL}/amelia.webp`,
    ],
  }));

  return [...staticRoutes, ...articleRoutes];
}
