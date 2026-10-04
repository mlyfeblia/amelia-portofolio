import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getArticles } from '@/lib/data-store';
import { getIsoDateString } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { ArticleJsonLd } from '@/components/articles/ArticleJsonLd';
import { ArticleHeader } from '@/components/articles/ArticleHeader';
import { ArticleMarkdownRenderer } from '@/components/articles/ArticleMarkdownRenderer';
import { ArticleTags } from '@/components/articles/ArticleTags';
import { ArticleCta } from '@/components/articles/ArticleCta';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getArticles(true);
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug, true);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan',
      description: 'Artikel yang Anda cari tidak tersedia.',
      robots: { index: false },
    };
  }

  const url = `${BASE_URL}/articles/${slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    keywords: [...(article.tags ?? []), 'BKI', 'Bimbingan Konseling Islam', 'Amelia', 'UIN Siber Cirebon'],
    authors: [{ name: 'Amelia', url: BASE_URL }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url,
      title: article.title,
      description: article.excerpt,
      publishedTime: getIsoDateString(article.publishedAt),
      authors: ['Amelia'],
      tags: article.tags,
      images: [
        {
          url: `${BASE_URL}/amelia.webp`,
          width: 1200,
          height: 1500,
          alt: `${article.title} | Amelia`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [`${BASE_URL}/amelia.webp`],
    },
  };
}

export default async function ArticleDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug, true);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        excerpt={article.excerpt}
        slug={slug}
        publishedAt={article.publishedAt}
        tags={article.tags}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Artikel', url: `${BASE_URL}/articles` },
          { name: article.title, url: `${BASE_URL}/articles/${slug}` },
        ]}
      />
      <Navbar />
      <main
        id="main-content"
        className="min-h-screen page-enter"
        tabIndex={-1}
        style={{ backgroundColor: 'var(--color-paper)' }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24 animate-fade-in-up">
          <article aria-labelledby="article-title">
            <ArticleHeader article={article} />
            <div className="mb-12" aria-label="Isi artikel">
              <ArticleMarkdownRenderer content={article.content} />
            </div>
            <ArticleTags tags={article.tags} />
            <ArticleCta />
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
