import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';
import { getArticleBySlug, getArticles } from '@/lib/data-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mlyfeblia.vercel.app';

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);

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
      publishedTime: article.publishedAt,
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

function ArticleJsonLd({
  title,
  excerpt,
  slug,
  publishedAt,
  tags,
}: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  tags: string[];
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    url: `${BASE_URL}/articles/${slug}`,
    datePublished: publishedAt,
    author: {
      '@type': 'Person',
      name: 'Amelia',
      url: BASE_URL,
      affiliation: {
        '@type': 'EducationalOrganization',
        name: 'UIN Siber Syekh Nurjati Cirebon',
      },
    },
    publisher: {
      '@type': 'Person',
      name: 'Amelia',
      url: BASE_URL,
    },
    keywords: tags.join(', '),
    inLanguage: 'id-ID',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--color-ink)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-[var(--color-ink)] font-serif">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

/**
 * Render Markdown content cleanly into semantically structured HTML.
 * Handles headings (H2, H3), lists, and short paragraphs (2-3 sentences max).
 */
function MarkdownRenderer({ content }: { content: string }) {
  const paragraphs = content.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-6 text-base sm:text-lg text-[var(--color-ink)] leading-relaxed">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();

        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)] pt-6 pb-2 leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-xl sm:text-2xl font-semibold text-[var(--color-ink)] pt-4 pb-1"
            >
              {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // Unordered list
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
          return (
            <ul key={idx} className="space-y-2.5 my-4 pl-1" role="list">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2.5 shrink-0" />
                  <span className="leading-relaxed">{renderInlineMarkdown(item.replace(/^[-*]\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter((line) => /^\d+\.\s/.test(line.trim()));
          return (
            <ol key={idx} className="space-y-3 my-4 pl-1" role="list">
              {items.map((item, itemIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)/);
                const num = match ? match[1] : `${itemIdx + 1}`;
                const text = match ? match[2] : item;
                return (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span className="leading-relaxed">{renderInlineMarkdown(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular short paragraph
        return (
          <p key={idx} className="leading-relaxed text-[var(--color-ink-muted)]">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default async function ArticleDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const article = await getArticleBySlug(slug);

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
      <Navbar />
      <main
        id="main-content"
        className="min-h-screen"
        tabIndex={-1}
        style={{ backgroundColor: 'var(--color-paper)' }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24 animate-fade-in-up">

          {/* Back link */}
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] mb-8 transition-colors duration-150 min-h-[44px] group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            Kembali ke Semua Artikel
          </Link>

          <article aria-labelledby="article-title">
            {/* Article Header */}
            <header className="mb-10 pb-8 border-b border-[var(--color-paper-border)] space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                <span className="font-semibold text-[var(--color-accent)] px-3 py-1 rounded-full bg-[var(--color-accent-soft)]">
                  {article.category}
                </span>
                <span className="text-[var(--color-paper-border)]" aria-hidden="true">&bull;</span>
                <span className="inline-flex items-center gap-1.5 text-[var(--color-ink-soft)]">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {article.readTime}
                </span>
                <span className="text-[var(--color-paper-border)]" aria-hidden="true">&bull;</span>
                <time
                  dateTime={article.publishedAt}
                  className="inline-flex items-center gap-1.5 text-[var(--color-ink-soft)]"
                >
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  {article.publishedAt}
                </time>
              </div>

              {/* Single H1 per page, 10-14 words */}
              <h1
                id="article-title"
                className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[var(--color-ink)] leading-[1.2]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {article.title}
              </h1>

              <p className="text-lg sm:text-xl text-[var(--color-ink-muted)] leading-relaxed italic pt-1">
                {article.excerpt}
              </p>

              {/* Byline */}
              <div
                className="flex items-center gap-3.5 pt-6 border-t border-[var(--color-paper-border)]"
                aria-label="Penulis artikel"
              >
                <div
                  className="w-11 h-11 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)] text-[var(--color-accent)] flex items-center justify-center text-base font-bold shrink-0"
                  aria-hidden="true"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  A
                </div>
                <div>
                  <div className="text-base font-semibold text-[var(--color-ink)]">
                    Amelia (Amel)
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-ink-soft)]">
                    Konselor Sebaya · Mahasiswi Bimbingan Konseling UIN Siber Cirebon
                  </div>
                </div>
              </div>
            </header>

            {/* Body Content with Sub-headings (H2, H3) and short paragraphs */}
            <div className="mb-12" aria-label="Isi artikel">
              <MarkdownRenderer content={article.content} />
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div
                className="flex flex-wrap gap-2 pt-8 border-t border-[var(--color-paper-border)]"
                role="list"
                aria-label="Tag artikel"
              >
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    className="text-xs font-medium px-3 py-1.5 border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Counselor CTA Card */}
            <div
              className="mt-12 p-8 sm:p-10 border border-[var(--color-accent-border)] rounded-2xl bg-[var(--color-accent-soft)]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 card-interactive"
              role="complementary"
              aria-label="Ajakan untuk sesi konseling"
            >
              <div className="space-y-1.5 max-w-lg">
                <h2
                  className="text-2xl font-medium text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Merasakan hal serupa dan butuh teman diskusi?
                </h2>
                <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
                  Amel siap mendengarkan cerita dan kegelisahanmu tanpa penghakiman melalui sesi bimbingan privat yang terjaga amanahnya.
                </p>
              </div>
              <Link
                href="/schedule"
                className="btn-primary min-h-[46px] px-6 text-sm shrink-0"
              >
                Jadwalkan Konsultasi
                <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
