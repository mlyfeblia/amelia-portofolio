import { describe, it, expect, beforeEach } from 'vitest';
import { verifySecretPin, SECRET_PIN } from '@/lib/secret-engine';
import { boostArticleViews, setArticleViews, getArticles } from '@/lib/data-store';

describe('Secret View Engine & PIN Verification Suite', () => {
  it('correctly validates the secret PIN 071220', () => {
    expect(verifySecretPin('071220')).toBe(true);
    expect(verifySecretPin('  071220  ')).toBe(true);
  });

  it('rejects incorrect or malformed PINs', () => {
    expect(verifySecretPin('000000')).toBe(false);
    expect(verifySecretPin('071221')).toBe(false);
    expect(verifySecretPin('123456')).toBe(false);
    expect(verifySecretPin('07122')).toBe(false);
    expect(verifySecretPin('0712200')).toBe(false);
    expect(verifySecretPin('')).toBe(false);
    expect(verifySecretPin(null)).toBe(false);
    expect(verifySecretPin(undefined)).toBe(false);
    expect(verifySecretPin(12345)).toBe(false);
  });

  it('verifies that SECRET_PIN constant is 071220', () => {
    expect(SECRET_PIN).toBe('071220');
  });

  describe('Article View Boosting Operations', () => {
    let testSlug: string;

    beforeEach(async () => {
      const articles = await getArticles(false);
      expect(articles.length).toBeGreaterThan(0);
      testSlug = articles[0].slug;
    });

    it('boostArticleViews increases view count atomically', async () => {
      const articlesBefore = await getArticles(false);
      const article = articlesBefore.find((a) => a.slug === testSlug)!;
      const initialViews = article.views ?? 0;

      const updatedViews = await boostArticleViews(testSlug, 25);
      expect(updatedViews).toBe(initialViews + 25);

      const articlesAfter = await getArticles(false);
      const afterArticle = articlesAfter.find((a) => a.slug === testSlug)!;
      expect(afterArticle.views).toBe(initialViews + 25);
    });

    it('boostArticleViews clamps minimum count to at least 1', async () => {
      const articlesBefore = await getArticles(false);
      const initialViews = articlesBefore.find((a) => a.slug === testSlug)!.views ?? 0;

      const updatedViews = await boostArticleViews(testSlug, -10);
      expect(updatedViews).toBe(initialViews + 1);
    });

    it('setArticleViews sets view count to exact target value', async () => {
      const targetViews = 777;
      const updatedViews = await setArticleViews(testSlug, targetViews);
      expect(updatedViews).toBe(targetViews);

      const articlesAfter = await getArticles(false);
      const afterArticle = articlesAfter.find((a) => a.slug === testSlug)!;
      expect(afterArticle.views).toBe(targetViews);
    });
  });
});
