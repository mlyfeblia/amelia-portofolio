import React from 'react';
import { getIsoDateString, safeJsonLd } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

interface ArticleJsonLdProps {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  publishedAt: string;
  tags: string[];
  content?: string;
}

export function ArticleJsonLd({
  title,
  excerpt,
  slug,
  category,
  publishedAt,
  tags,
  content,
}: ArticleJsonLdProps) {
  const publishedIso = getIsoDateString(publishedAt);
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : undefined;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/articles/${slug}`,
    },
    headline: title,
    description: excerpt,
    articleSection: category,
    articleBody: excerpt,
    image: [`${BASE_URL}/amelia.webp`],
    url: `${BASE_URL}/articles/${slug}`,
    datePublished: publishedIso,
    dateModified: publishedIso,
    wordCount: wordCount,
    author: {
      '@type': 'Person',
      name: 'Amelia',
      url: `${BASE_URL}/about`,
      jobTitle: 'Konselor Sebaya & Mahasiswi Bimbingan Konseling Islam',
      affiliation: {
        '@type': 'EducationalOrganization',
        name: 'UIN Siber Syekh Nurjati Cirebon',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Amelia Portofolio & Konseling',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
      },
    },
    keywords: [category, ...tags, 'BKI', 'Konseling Sebaya', 'UIN Siber Cirebon'].join(', '),
    inLanguage: 'id-ID',
    isAccessibleForFree: 'true',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
