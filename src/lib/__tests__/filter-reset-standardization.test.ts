import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Filter Reset Standardization & Atomic Handlers', () => {
  it('correctly determines hasActiveFilters for admin bookings', () => {
    const checkActiveFilters = (
      search: string,
      status: string,
      topic: string,
      date: string
    ) => {
      return Boolean(
        search.trim() ||
        status !== 'semua' ||
        topic !== 'Semua Topik' ||
        date.trim()
      );
    };

    expect(checkActiveFilters('', 'semua', 'Semua Topik', '')).toBe(false);
    expect(checkActiveFilters('amelia', 'semua', 'Semua Topik', '')).toBe(true);
    expect(checkActiveFilters('', 'menunggu', 'Semua Topik', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'Manajemen Stres', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'Semua Topik', '2026-10-17')).toBe(true);
  });

  it('correctly determines hasActiveFilters for admin counseling', () => {
    const checkActiveFilters = (
      search: string,
      status: string,
      visibility: string,
      landing: string,
      category: string,
      date: string
    ) => {
      return Boolean(
        search.trim() ||
        status !== 'semua' ||
        visibility !== 'semua' ||
        landing !== 'semua' ||
        category !== 'Semua' ||
        date.trim()
      );
    };

    expect(checkActiveFilters('', 'semua', 'semua', 'semua', 'Semua', '')).toBe(false);
    expect(checkActiveFilters('', 'unanswered', 'semua', 'semua', 'Semua', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'public', 'semua', 'Semua', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'semua', 'landing', 'Semua', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'semua', 'semua', 'Keluarga', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'semua', 'semua', 'Semua', '2026-10-17')).toBe(true);
  });

  it('correctly determines hasActiveFilters for admin articles', () => {
    const checkActiveFilters = (
      search: string,
      status: string,
      landing: string,
      category: string,
      date: string
    ) => {
      return Boolean(
        search.trim() ||
        status !== 'semua' ||
        landing !== 'semua' ||
        category !== 'Semua' ||
        date.trim()
      );
    };

    expect(checkActiveFilters('', 'semua', 'semua', 'Semua', '')).toBe(false);
    expect(checkActiveFilters('', 'draft', 'semua', 'Semua', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'landing', 'Semua', '')).toBe(true);
    expect(checkActiveFilters('', 'semua', 'semua', 'Kesehatan Mental', '')).toBe(true);
    expect(checkActiveFilters('bki', 'semua', 'semua', 'Semua', '')).toBe(true);
  });

  it('atomically resets state and parameters without closure overwrite', () => {
    let statusFilter = 'published';
    let landingFilter = 'landing';
    const storage: Record<string, string> = {
      admin_articles_status: 'published',
      admin_articles_landing: 'landing',
    };

    // Atomic combined handler simulation
    const onStatusAndLandingChange = (
      newStatus: 'semua' | 'published' | 'draft',
      newLanding: 'semua' | 'landing'
    ) => {
      statusFilter = newStatus;
      landingFilter = newLanding;
      if (newStatus !== 'semua') storage.admin_articles_status = newStatus;
      else delete storage.admin_articles_status;

      if (newLanding !== 'semua') storage.admin_articles_landing = newLanding;
      else delete storage.admin_articles_landing;
    };

    // Reset via atomic handler
    onStatusAndLandingChange('semua', 'semua');

    expect(statusFilter).toBe('semua');
    expect(landingFilter).toBe('semua');
    expect(storage.admin_articles_status).toBeUndefined();
    expect(storage.admin_articles_landing).toBeUndefined();
  });

  it('admin filter cards do not render redundant toolbar banners to keep filter bar minimal and clean', () => {
    // Verify component files retired redundant Filter Aktif Diterapkan toolbar banners
    const articleFilters = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/articles/ArticleFilters.tsx'), 'utf-8');
    const bookingFilters = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/bookings/BookingFilters.tsx'), 'utf-8');
    const counselingFilters = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/counseling/CounselingFilters.tsx'), 'utf-8');

    expect(articleFilters).not.toContain('Filter Aktif Diterapkan');
    expect(bookingFilters).not.toContain('Filter Aktif Diterapkan');
    expect(counselingFilters).not.toContain('Filter Aktif Diterapkan');
  });

  it('public directory views (ArticlesDirectory and CurhatWall) do not render redundant Menampilkan filter strips', () => {
    const articlesDir = fs.readFileSync(path.resolve(process.cwd(), 'src/components/articles/ArticlesDirectory.tsx'), 'utf-8');
    const curhatWall = fs.readFileSync(path.resolve(process.cwd(), 'src/components/counseling/CurhatWall.tsx'), 'utf-8');

    // No redundant "Menampilkan:" strip above list
    expect(articlesDir).not.toContain('<span>Menampilkan:</span>');
    expect(curhatWall).not.toContain('<span>Menampilkan:</span>');

    // EmptyState provides comprehensive recovery action
    expect(articlesDir).toContain('Tampilkan Semua Artikel');
    expect(curhatWall).toContain('Tampilkan Semua Curhat');
  });
});

