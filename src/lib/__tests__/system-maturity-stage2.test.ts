import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getPreferredScrollBehavior } from '../dom-utils';

if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = {
    matchMedia: () => ({ matches: false }),
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('System Maturity Stage 2 Test Suite', () => {
  describe('Reduced Motion & Autoscroll (dom-utils)', () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('returns "smooth" by default when reduced motion is not preferred', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getPreferredScrollBehavior()).toBe('smooth');
    });

    it('returns "auto" when prefers-reduced-motion: reduce is enabled', () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      expect(getPreferredScrollBehavior()).toBe('auto');
    });

    it('globals.css includes transition-duration in prefers-reduced-motion block', () => {
      const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
      const css = fs.readFileSync(cssPath, 'utf-8');
      expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?transition-duration:\s*0\.01ms\s*!important/);
      expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?transition-delay:\s*0ms\s*!important/);
    });
  });

  describe('Assessment Section Anti-Duplication & Recovery', () => {
    const sectionPath = path.resolve(process.cwd(), 'src/components/AssessmentSection.tsx');
    const content = fs.readFileSync(sectionPath, 'utf-8');

    it('uses hasSavedRef to prevent duplicate localStorage entries on re-render', () => {
      expect(content).toContain('hasSavedRef = useRef<boolean>(false)');
      expect(content).toMatch(/!hasSavedRef\.current/);
      expect(content).toMatch(/hasSavedRef\.current\s*=\s*true/);
    });

    it('implements in-progress quiz session recovery via sessionStorage', () => {
      expect(content).toContain('amelia_quiz_draft_v1');
      expect(content).toMatch(/sessionStorage\.getItem\(['"]amelia_quiz_draft_v1['"]\)/);
      expect(content).toMatch(/sessionStorage\.setItem\(\s*['"]amelia_quiz_draft_v1['"]/);
    });

    it('resets hasSavedRef and clears draft on handleReset', () => {
      expect(content).toMatch(/handleReset\s*=\s*useCallback\([\s\S]*?hasSavedRef\.current\s*=\s*false/);
      expect(content).toMatch(/sessionStorage\.removeItem\(['"]amelia_quiz_draft_v1['"]\)/);
    });
  });

  describe('Navbar Mobile Focus Trap & Touch Target', () => {
    const navbarPath = path.resolve(process.cwd(), 'src/components/Navbar.tsx');
    const content = fs.readFileSync(navbarPath, 'utf-8');

    it('attaches mobileNavRef to useModalAnimation and mobile-nav panel', () => {
      expect(content).toContain('mobileNavRef = useRef<HTMLDivElement>(null)');
      expect(content).toMatch(/containerRef:\s*mobileNavRef/);
      expect(content).toMatch(/id="mobile-nav"[\s\S]*?ref=\{mobileNavRef\}/);
    });

    it('meets 44x44px touch target compliance on mobile toggle button', () => {
      expect(content).toMatch(/before:-inset-1\.5/);
      expect(content).toMatch(/before:content-\[''\]/);
    });
  });

  describe('Article Reading Progress and Back to Top', () => {
    const articleSlugPath = path.resolve(process.cwd(), 'src/app/articles/[slug]/page.tsx');
    const slugContent = fs.readFileSync(articleSlugPath, 'utf-8');

    it('embeds ArticleReadingProgress in article detail page', () => {
      expect(slugContent).toContain('ArticleReadingProgress');
      expect(slugContent).toMatch(/<ArticleReadingProgress\s*\/>/);
    });

    it('ArticleReadingProgress component exists and handles scroll progress', () => {
      const progressCompPath = path.resolve(process.cwd(), 'src/components/articles/ArticleReadingProgress.tsx');
      expect(fs.existsSync(progressCompPath)).toBe(true);
      const progressContent = fs.readFileSync(progressCompPath, 'utf-8');
      expect(progressContent).toContain('requestAnimationFrame');
      expect(progressContent).toContain('getPreferredScrollBehavior');
      expect(progressContent).toContain('scrollToTop');
    });
  });

  describe('Admin Keyboard Shortcut Hook (useSearchShortcut)', () => {
    const hookPath = path.resolve(process.cwd(), 'src/lib/use-search-shortcut.ts');
    expect(fs.existsSync(hookPath)).toBe(true);
    const hookContent = fs.readFileSync(hookPath, 'utf-8');

    it('focuses search input when pressing "/" outside editable controls', () => {
      expect(hookContent).toContain("e.key === '/'");
      expect(hookContent).toContain('inputRef.current?.focus()');
    });

    it('BookingFilters, CounselingFilters, and ArticleFilters utilize useSearchShortcut', () => {
      const bookingFilters = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/bookings/BookingFilters.tsx'), 'utf-8');
      const counselingFilters = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/counseling/CounselingFilters.tsx'), 'utf-8');
      const articleFilters = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/articles/ArticleFilters.tsx'), 'utf-8');

      expect(bookingFilters).toContain('useSearchShortcut()');
      expect(counselingFilters).toContain('useSearchShortcut()');
      expect(articleFilters).toContain('useSearchShortcut()');
    });
  });
});
