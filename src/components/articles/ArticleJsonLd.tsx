import React from 'react';
import { getIsoDateString, safeJsonLd } from '@/lib/utils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

interface ArticleJsonLdProps {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  tags: string[];
}

export function ArticleJsonLd({
  title,
  excerpt,
  slug,
  publishedAt,
  tags,
}: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/articles/${slug}`,
    },
    headline: title,
    description: excerpt,
    image: [`${BASE_URL}/amelia.webp`],
    url: `${BASE_URL}/articles/${slug}`,
    datePublished: getIsoDateString(publishedAt),
    dateModified: getIsoDateString(publishedAt),
    author: {
      '@type': 'Person',
      name: 'Amelia',
      url: BASE_URL,
      jobTitle: 'Mahasiswi Bimbingan Konseling Islam',
      affiliation: {
        '@type': 'EducationalOrganization',
        name: 'UIN Siber Syekh Nurjati Cirebon',
      },
    },
    publisher: {
      '@type': 'Person',
      name: 'Amelia',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
      },
    },
    keywords: tags.join(', '),
    inLanguage: 'id-ID',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
