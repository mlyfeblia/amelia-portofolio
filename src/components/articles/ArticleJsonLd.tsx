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
  coverImage?: string;
}

export function ArticleJsonLd({
  title,
  excerpt,
  slug,
  category,
  publishedAt,
  tags,
  content,
  coverImage,
}: ArticleJsonLdProps) {
  const publishedIso = getIsoDateString(publishedAt);
  const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : undefined;
  const fullCoverUrl = coverImage
    ? coverImage.startsWith('http')
      ? coverImage
      : `${BASE_URL}${coverImage}`
    : undefined;

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
    image: [
      ...(fullCoverUrl ? [fullCoverUrl] : []),
      `${BASE_URL}/articles/${slug}/opengraph-image`,
      `${BASE_URL}/amelia.webp`,
    ],
    thumbnailUrl: fullCoverUrl || `${BASE_URL}/articles/${slug}/opengraph-image`,
    url: `${BASE_URL}/articles/${slug}`,
    datePublished: publishedIso,
    dateModified: publishedIso,
    wordCount: wordCount,
    timeRequired: wordCount ? `PT${Math.max(1, Math.ceil(wordCount / 180))}M` : 'PT5M',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#article-title', '.article-excerpt', '.article-content'],
    },
    author: {
      '@type': 'Person',
      name: 'Amelia',
      alternateName: 'Amel',
      url: `${BASE_URL}/about`,
      jobTitle: 'Konselor Sebaya & Mahasiswi Bimbingan Konseling Islam',
      gender: 'Female',
      sameAs: ['https://www.instagram.com/mlyfeb.lia'],
      affiliation: {
        '@type': 'EducationalOrganization',
        name: 'UIN Siber Syekh Nurjati Cirebon',
        alternateName: 'Universitas Islam Negeri Siber Syekh Nurjati Cirebon',
        url: 'https://uinssc.ac.id',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Amelia Portofolio & Konseling',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
    },
    copyrightHolder: {
      '@type': 'Person',
      name: 'Amelia',
    },
    copyrightYear: new Date().getFullYear(),
    keywords: [category, ...tags, 'BKI', 'Konseling Sebaya', 'UIN Siber Cirebon', 'Kesehatan Mental Islami'].join(', '),
    inLanguage: 'id-ID',
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
