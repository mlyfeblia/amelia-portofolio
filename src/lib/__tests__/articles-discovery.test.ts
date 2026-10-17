import { describe, it, expect } from 'vitest';
import { seededShuffle } from '@/lib/seeded-random';
import { Article } from '@/types';

describe('Articles Discovery & Seeded Randomization Architecture', () => {
  const sampleArticles: Partial<Article>[] = [
    { id: '1', title: 'Artikel Satu', category: 'Kesehatan Mental Islami', publishedAt: '2026-10-01' },
    { id: '2', title: 'Artikel Dua', category: 'Kesehatan Mental Islami', publishedAt: '2026-10-02' },
    { id: '3', title: 'Artikel Tiga', category: 'Quarter-Life Crisis & Self Growth', publishedAt: '2026-10-03' },
    { id: '4', title: 'Artikel Empat', category: 'Quarter-Life Crisis & Self Growth', publishedAt: '2026-10-04' },
    { id: '5', title: 'Artikel Lima', category: 'Manajemen Emosi & Overthinking', publishedAt: '2026-10-05' },
  ];

  it('seededShuffle randomizes article list deterministically per session seed', () => {
    const runA = seededShuffle(sampleArticles, 'session-articles-1');
    const runB = seededShuffle(sampleArticles, 'session-articles-1');
    const runC = seededShuffle(sampleArticles, 'session-articles-2');

    expect(runA).toEqual(runB);
    expect(runA.length).toBe(sampleArticles.length);
    expect(runA).not.toEqual(runC);
  });

  it('chronological sort orders articles descending by publishedAt', () => {
    const sorted = [...sampleArticles].sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

    expect(sorted[0].id).toBe('5');
    expect(sorted[sorted.length - 1].id).toBe('1');
  });

  it('slug-seeded rotation exposes diverse related articles instead of static first-3 slice', () => {
    const categoryArticles: Partial<Article>[] = [
      { id: '1', slug: 'art-1', category: 'Kesehatan Mental Islami' },
      { id: '2', slug: 'art-2', category: 'Kesehatan Mental Islami' },
      { id: '3', slug: 'art-3', category: 'Kesehatan Mental Islami' },
      { id: '4', slug: 'art-4', category: 'Kesehatan Mental Islami' },
      { id: '5', slug: 'art-5', category: 'Kesehatan Mental Islami' },
      { id: '6', slug: 'art-6', category: 'Kesehatan Mental Islami' },
    ];

    // For article 1:
    const othersFor1 = categoryArticles.filter((a) => a.slug !== 'art-1');
    const relatedFor1 = seededShuffle(othersFor1, 'related_art-1').slice(0, 3);

    // For article 2:
    const othersFor2 = categoryArticles.filter((a) => a.slug !== 'art-2');
    const relatedFor2 = seededShuffle(othersFor2, 'related_art-2').slice(0, 3);

    expect(relatedFor1.length).toBe(3);
    expect(relatedFor2.length).toBe(3);
    // Verifies deterministic output per slug
    expect(seededShuffle(othersFor1, 'related_art-1').slice(0, 3)).toEqual(relatedFor1);
    // Verifies diversity across different articles
    expect(relatedFor1.map((a) => a.slug)).not.toEqual(relatedFor2.map((a) => a.slug));
  });

  it('homepage day-seed rotation produces different featured fallbacks on different days', () => {
    const pool = [
      { id: '1', title: 'A' },
      { id: '2', title: 'B' },
      { id: '3', title: 'C' },
      { id: '4', title: 'D' },
      { id: '5', title: 'E' },
    ];

    const day1 = seededShuffle(pool, 'homepage_articles_2026-10-17').slice(0, 2);
    const day2 = seededShuffle(pool, 'homepage_articles_2026-10-18').slice(0, 2);

    expect(day1.length).toBe(2);
    expect(day2.length).toBe(2);
    // Different days should produce different featured subsets
    expect(day1).not.toEqual(day2);
  });

  it('validates all 37 articles in database have standardized clean English slugs', async () => {
    const db = await import('../../../data/db.json');
    const articles = db.articles;

    expect(articles.length).toBe(37);

    // Common Indonesian words that should not appear as standalone slug tokens
    const indonesianTokens = ['dan', 'yang', 'untuk', 'dengan', 'pada', 'di', 'dari', 'ke', 'ini', 'itu', 'saat'];

    articles.forEach((art) => {
      expect(art.slug).toBeDefined();
      expect(typeof art.slug).toBe('string');
      // Slug should only contain lowercase alphanumeric characters and single hyphens
      expect(art.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);

      const tokens = art.slug.split('-');
      // Verify no untranslated Indonesian stop words in slugs
      tokens.forEach((token) => {
        expect(indonesianTokens).not.toContain(token);
      });
    });
  });

  it('validates LEGACY_SLUG_REDIRECTS maps legacy Indonesian URLs to valid existing article slugs', async () => {
    const { LEGACY_SLUG_REDIRECTS } = await import('@/lib/article-redirects');
    const db = await import('../../../data/db.json');
    const validSlugs = new Set(db.articles.map((a) => a.slug));

    const redirectEntries = Object.entries(LEGACY_SLUG_REDIRECTS);
    expect(redirectEntries.length).toBeGreaterThanOrEqual(26);

    redirectEntries.forEach(([legacySlug, targetSlug]) => {
      expect(legacySlug).toBeTruthy();
      expect(targetSlug).toBeTruthy();
      expect(validSlugs.has(targetSlug)).toBe(true);
    });
  });

  it('validates all related article recommendations in assessment data point to valid English slugs', async () => {
    const { getAssessmentSuggestions } = await import('@/data/assessment-data');
    const db = await import('../../../data/db.json');
    const validSlugs = new Set(db.articles.map((a) => a.slug));

    const dimensions = [
      { key: 'pikiran' as const, name: 'Pikiran', shortName: 'Pikiran', score: 2, maxScore: 6, percentage: 33, status: 'need_attention' as const, advice: 'test' },
      { key: 'emosi' as const, name: 'Emosi', shortName: 'Emosi', score: 2, maxScore: 6, percentage: 33, status: 'need_attention' as const, advice: 'test' },
      { key: 'spiritual' as const, name: 'Spiritual', shortName: 'Spiritual', score: 2, maxScore: 6, percentage: 33, status: 'need_attention' as const, advice: 'test' },
      { key: 'sosial' as const, name: 'Sosial', shortName: 'Sosial', score: 2, maxScore: 6, percentage: 33, status: 'need_attention' as const, advice: 'test' },
    ];

    dimensions.forEach((dim) => {
      const suggestion = getAssessmentSuggestions([dim]);
      expect(suggestion.relatedArticles.length).toBeGreaterThan(0);
      suggestion.relatedArticles.forEach((art) => {
        expect(validSlugs.has(art.slug)).toBe(true);
      });
    });
  });
});

