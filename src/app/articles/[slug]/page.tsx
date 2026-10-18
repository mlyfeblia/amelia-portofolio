import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ChevronRight, Clock, Eye, BookOpen } from 'lucide-react';
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
import { ArticleMobileTopicExplorer } from '@/components/articles/ArticleMobileTopicExplorer';
import { ArticleReadingProgress } from '@/components/articles/ArticleReadingProgress';
import { seededShuffle } from '@/lib/prng';
import { LEGACY_SLUG_REDIRECTS } from '@/lib/article-redirects';

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
  const targetSlug = LEGACY_SLUG_REDIRECTS[slug] || slug;
  const article = await getArticleBySlug(targetSlug, true);

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan',
      description: 'Artikel yang kamu cari tidak tersedia atau belum dipublikasikan.',
      robots: { index: false, follow: false },
    };
  }

  const url = `${BASE_URL}/articles/${targetSlug}`;
  const keywordsList = [
    ...(article.tags ?? []),
    article.category,
    'Kesehatan Mental Islami',
    'Bimbingan Konseling Islam',
    'Amelia BKI',
    'UIN Siber Syekh Nurjati Cirebon',
    'Konselor Sebaya',
  ];

  const ogImageUrl = article.coverImage
    ? article.coverImage.startsWith('http')
      ? article.coverImage
      : `${BASE_URL}${article.coverImage}`
    : `${BASE_URL}/articles/${targetSlug}/opengraph-image`;

  return {
    title: article.title,
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
          url: ogImageUrl,
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
      images: [ogImageUrl],
    },
  };
}

export default async function ArticleDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  if (LEGACY_SLUG_REDIRECTS[slug]) {
    redirect(`/articles/${LEGACY_SLUG_REDIRECTS[slug]}`);
  }

  const [article, allArticles] = await Promise.all([
    getArticleBySlug(slug, true),
    getArticles(true),
  ]);

  if (!article) {
    notFound();
  }

  const articleFullUrl = `${BASE_URL}/articles/${slug}`;

  // Find related articles with deterministic slug-seeded diversity shuffle
  const otherArticles = allArticles.filter((a) => a.slug !== slug);
  const sameCategoryArticles = otherArticles.filter((a) => a.category === article.category);
  const otherCategoryArticles = otherArticles.filter((a) => a.category !== article.category);

  // Deterministically rotate same-category articles so all articles get internal link equity
  const shuffledSameCategory = seededShuffle(sameCategoryArticles, `related_${slug}`);
  const shuffledOtherCategory = seededShuffle(otherCategoryArticles, `related_fallback_${slug}`);

  const relatedArticles = [...shuffledSameCategory, ...shuffledOtherCategory].slice(0, 3);

  return (
    <>
      {/* Preload avatar Amel untuk eliminasi kedipan saat page-enter */}
      <link rel="preload" as="image" href="/amelia.webp" type="image/webp" />
      <ArticleJsonLd
        title={article.title}
        excerpt={article.excerpt}
        slug={slug}
        category={article.category}
        publishedAt={article.publishedAt}
        tags={article.tags}
        content={article.content}
        coverImage={article.coverImage}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: BASE_URL },
          { name: 'Artikel', url: `${BASE_URL}/articles` },
          { name: article.category, url: `${BASE_URL}/articles` },
          { name: article.title, url: articleFullUrl },
        ]}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ArticleReadingProgress />
        <main
          id="main-content"
          className="flex-1 page-enter"
          tabIndex={-1}
          style={{ backgroundColor: 'var(--color-paper)' }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16">
          
          {/* Top Clean Navigation Breadcrumb */}
          <nav aria-label="Navigasi rekam jejak artikel" className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[var(--color-ink-muted)]">
              <Link
                href="/articles"
                className="btn-interactive inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-all"
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

              {/* Cover Image (Hanya muncul di dalam artikel detail) */}
              {article.coverImage && (
                <div className="relative aspect-video sm:aspect-21/9 w-full rounded-2xl overflow-hidden mb-8 border border-[var(--color-paper-border)] shadow-xs bg-[var(--color-paper-muted)]/50">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 860px"
                  />
                </div>
              )}

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

              {/* Mobile Focus Topic & Quick Category Explorer */}
              <div className="mt-8 block lg:hidden">
                <ArticleMobileTopicExplorer currentCategory={article.category} />
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
                      className="group p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent)] rounded-2xl flex flex-col justify-between space-y-3 card-interactive shadow-2xs"
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
                          {rel.publishedAt ? `${rel.publishedAt} - ` : ''}{rel.excerpt}
                        </p>
                      </div>

                      <div className="pt-2.5 flex items-end justify-between gap-3 text-xs text-[var(--color-ink-soft)] border-t border-[var(--color-paper-border)]">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="font-semibold text-[var(--color-accent)] truncate">
                            {rel.category}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                            <span>{rel.readTime}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                            <Eye className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                            <span>{typeof rel.views === 'number' ? rel.views : 0} pembaca</span>
                          </span>
                        </div>
                        <Link
                          href={`/articles/${rel.slug}`}
                          className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-end transition-all"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
                          <span>Baca Tulisan</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Consultation CTA Banner */}
            <ArticleCta category={article.category} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
