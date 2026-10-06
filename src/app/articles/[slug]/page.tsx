import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
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
import { ArticleShareBar } from '@/components/articles/ArticleShareBar';
import { ArticleSidebar } from '@/components/articles/ArticleSidebar';

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
      title: 'Artikel Tidak Ditemukan | Amelia',
      description: 'Artikel yang kamu cari tidak tersedia atau belum dipublikasikan.',
      robots: { index: false, follow: false },
    };
  }

  const url = `${BASE_URL}/articles/${slug}`;
  const keywordsList = [
    ...(article.tags ?? []),
    article.category,
    'Kesehatan Mental Islami',
    'Bimbingan Konseling Islam',
    'Amelia BKI',
    'UIN Siber Syekh Nurjati Cirebon',
    'Konselor Sebaya',
  ];

  return {
    title: `${article.title} | Amelia`,
    description: article.excerpt,
    keywords: keywordsList,
    authors: [{ name: 'Amelia', url: `${BASE_URL}/about` }],
    creator: 'Amelia',
    publisher: 'Amelia Portofolio & Konseling',
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'id_ID',
      url,
      siteName: 'Amelia Portofolio & Konseling',
      title: article.title,
      description: article.excerpt,
      publishedTime: getIsoDateString(article.publishedAt),
      modifiedTime: getIsoDateString(article.publishedAt),
      section: article.category,
      authors: ['Amelia'],
      tags: article.tags,
      images: [
        {
          url: `${BASE_URL}/articles/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${article.title} - Amelia Konseling Sebaya`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [`${BASE_URL}/articles/${slug}/opengraph-image`],
    },
  };
}

export default async function ArticleDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const [article, allArticles] = await Promise.all([
    getArticleBySlug(slug, true),
    getArticles(true),
  ]);

  if (!article) {
    notFound();
  }

  const articleFullUrl = `${BASE_URL}/articles/${slug}`;

  // Find related articles (same category or shared tags, excluding self)
  const relatedArticles = allArticles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => {
      const aSameCategory = a.category === article.category ? 1 : 0;
      const bSameCategory = b.category === article.category ? 1 : 0;
      return bSameCategory - aSameCategory;
    })
    .slice(0, 3);

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        excerpt={article.excerpt}
        slug={slug}
        category={article.category}
        publishedAt={article.publishedAt}
        tags={article.tags}
        content={article.content}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Artikel', url: `${BASE_URL}/articles` },
          { name: article.category, url: `${BASE_URL}/articles` },
          { name: article.title, url: articleFullUrl },
        ]}
      />
      <Navbar />
      <main
        id="main-content"
        className="min-h-screen page-enter"
        tabIndex={-1}
        style={{ backgroundColor: 'var(--color-paper)' }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-20 md:pb-24">
          
          {/* Top Clean Navigation Breadcrumb */}
          <nav aria-label="Navigasi rekam jejak artikel" className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--color-ink-muted)]">
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 font-medium hover:text-[var(--color-accent)] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Direktori Artikel</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-paper-border)]" aria-hidden="true" />
              <span className="text-[var(--color-ink-soft)] font-medium">
                {article.category}
              </span>
            </div>
          </nav>

          {/* 2-Column Desktop Editorial Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Main Reading Column */}
            <article aria-labelledby="article-title" className="lg:col-span-8 min-w-0">
              <ArticleHeader article={article} />

              <div className="mb-10" aria-label="Isi artikel">
                <ArticleMarkdownRenderer content={article.content} />
              </div>

              {/* Tags and Topic Focus */}
              <div className="mb-8">
                <ArticleTags tags={article.tags} />
              </div>

              {/* Share & Copy Link Section */}
              <div>
                <ArticleShareBar title={article.title} url={articleFullUrl} />
              </div>
            </article>

            {/* Desktop Sticky Sidebar (Terkunci di bawah Navbar h-16 dan berhenti otomatis saat batas akhir grid artikel tercapai) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20 self-start">
              <ArticleSidebar currentCategory={article.category} />
            </div>

          </div>

          {/* Full-width Bottom Sections on Desktop (Tulisan Terkait & CTA Konseling) */}
          <div className="mt-6 sm:mt-10 lg:mt-14 space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Related Articles for SEO Internal Linking */}
            {relatedArticles.length > 0 && (
              <section className="pt-6 sm:pt-8 lg:pt-10 border-t border-[var(--color-paper-border)] space-y-5 sm:space-y-6" aria-label="Tulisan Terkait">
                <div className="space-y-1">
                  <h3
                    className="text-xl sm:text-2xl font-medium text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Tulisan Refleksi Terkait
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)]">
                    Baca juga ulasan lain seputar {article.category.toLowerCase()} dan bimbingan konseling.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relatedArticles.map((rel) => (
                    <div
                      key={rel.id}
                      className="group p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent)] hover:shadow-sm rounded-2xl flex flex-col justify-between space-y-3 card-interactive shadow-2xs transition-all duration-200"
                    >
                      <div className="space-y-2">
                        <h4
                          className="text-base sm:text-lg font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)] leading-snug line-clamp-2 transition-colors duration-200"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          <Link href={`/articles/${rel.slug}`} className="hover:underline underline-offset-4 decoration-[var(--color-accent)]/60">
                            {rel.title}
                          </Link>
                        </h4>
                        <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] line-clamp-3 leading-relaxed">
                          {rel.publishedAt ? `${rel.publishedAt} — ` : ''}{rel.excerpt}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs text-[var(--color-ink-soft)] border-t border-[var(--color-paper-border)]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-medium text-[var(--color-accent)]">{rel.category}</span>
                          <span>•</span>
                          <span>{rel.readTime}</span>
                        </span>
                        <Link
                          href={`/articles/${rel.slug}`}
                          className="font-semibold text-[var(--color-accent)] group-hover:translate-x-0.5 hover:underline inline-flex items-center gap-1 transition-transform duration-200"
                        >
                          <span>Baca</span>
                          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Consultation CTA Banner */}
            <ArticleCta />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
