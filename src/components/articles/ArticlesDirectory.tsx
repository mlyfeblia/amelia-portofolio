'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Article, ARTICLE_CATEGORIES } from '@/types';
import { ArticleListItem } from './ArticleListItem';

const ARTICLES_PER_PAGE = 6;

interface ArticlesDirectoryProps {
  initialArticles: Article[];
}

export function ArticlesDirectory({ initialArticles }: ArticlesDirectoryProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync category, query, and page from URL on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const catParam = params.get('category');
      const qParam = params.get('q');
      const pageParam = params.get('page');

      if (catParam) setActiveCategory(catParam);
      else setActiveCategory('Semua');

      if (qParam) setSearchQuery(qParam);
      else setSearchQuery('');

      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p) && p > 0) setCurrentPage(p);
      } else {
        setCurrentPage(1);
      }

      // Clear any legacy sticky sessionStorage
      sessionStorage.removeItem('articles_category');
      sessionStorage.removeItem('articles_q');
      sessionStorage.removeItem('articles_page');
    } catch {}
  }, []);

  const syncParams = (cat: string, q: string, page: number) => {
    try {
      const url = new URL(window.location.href);
      if (cat && cat !== 'Semua') url.searchParams.set('category', cat);
      else url.searchParams.delete('category');

      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');

      if (page > 1) url.searchParams.set('page', page.toString());
      else url.searchParams.delete('page');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  // Dynamic list of categories from existing articles + predefined categories
  const categories = useMemo(() => {
    const set = new Set<string>(['Semua', ...ARTICLE_CATEGORIES]);
    initialArticles.forEach((a) => {
      if (a.category && a.category.trim()) {
        set.add(a.category.trim());
      }
    });
    return Array.from(set);
  }, [initialArticles]);

  // Filtered articles based on category and search
  const filteredArticles = useMemo(() => {
    return initialArticles.filter((art) => {
      const matchCategory = activeCategory === 'Semua' || art.category === activeCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchExcerpt = art.excerpt.toLowerCase().includes(q);
      const matchCategoryText = art.category.toLowerCase().includes(q);
      const matchTags = (art.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchExcerpt || matchCategoryText || matchTags;
    });
  }, [initialArticles, activeCategory, searchQuery]);

  // Pagination calculation
  const totalItems = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ARTICLES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedArticles = useMemo(() => {
    const startIndex = (safePage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [filteredArticles, safePage]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    syncParams(cat, searchQuery, 1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    syncParams(activeCategory, val, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    syncParams(activeCategory, searchQuery, newPage);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * ARTICLES_PER_PAGE + 1;
  const endItem = Math.min(safePage * ARTICLES_PER_PAGE, totalItems);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8" id="articles-directory-container">
      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
              Eksplorasi Topik &amp; Kategori
            </h2>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari judul, topik, atau kata kunci..."
              className="search-input text-xs sm:text-sm pl-9 pr-9"
              aria-label="Cari artikel"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                type="button"
                className="btn-icon-interactive absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer"
                title="Bersihkan kata kunci pencarian"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar"
          role="tablist"
          aria-label="Filter kategori artikel"
        >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const count =
            cat === 'Semua'
              ? initialArticles.length
              : initialArticles.filter((a) => a.category === cat).length;

          return (
            <button
              key={cat}
              id={`tab-${cat}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleCategoryChange(cat)}
              type="button"
              className={`chip-interactive inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white font-semibold shadow-xs'
                  : 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--color-paper-border)]/60 text-[var(--color-ink-soft)]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
        </div>
      </div>

      {/* Article List or Rich Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="p-8 sm:p-14 text-center border border-[var(--color-paper-border)] rounded-2xl bg-[var(--color-surface)] space-y-4 tab-content-enter shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center shadow-xs">
            <BookOpen className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
              {searchQuery ? 'Artikel Tidak Ditemukan' : 'Belum Ada Artikel di Kategori Ini'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {searchQuery ? (
                <>
                  Tidak ditemukan tulisan dengan kata kunci &ldquo;<strong className="text-[var(--color-ink)]">{searchQuery}</strong>&rdquo;
                  {activeCategory !== 'Semua' && <> di kategori <strong>{activeCategory}</strong></>}. Coba periksa ejaan kata atau pilih topik populer di bawah.
                </>
              ) : (
                'Belum ada artikel yang dipublikasikan pada kategori ini. Silakan cek kategori lainnya.'
              )}
            </p>
          </div>

          {/* Quick Popular Keywords Suggestions */}
          {searchQuery && (
            <div className="pt-1 flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto">
              <span className="text-xs text-[var(--color-ink-soft)] mr-1">Coba topik:</span>
              {['Kesehatan Mental', 'Burnout', 'Mindfulness', 'Overthinking', 'BKI'].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSearchChange(topic)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[var(--color-paper)] hover:bg-[var(--color-accent-soft)] text-[var(--color-ink)] hover:text-[var(--color-accent)] border border-[var(--color-paper-border)] transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="btn-secondary btn-interactive text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer"
              >
                Hapus Pencarian
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Semua');
                setSearchQuery('');
                setCurrentPage(1);
                syncParams('Semua', '', 1);
              }}
              className="btn-primary btn-interactive text-xs py-2 px-4.5 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Tampilkan Semua Artikel
            </button>
          </div>
        </div>
      ) : (
        <div
          key={`${activeCategory}-${safePage}`}
          className="divide-y divide-[var(--color-paper-border)] border-y border-[var(--color-paper-border)] tab-content-enter"
          data-reveal
        >
          {paginatedArticles.map((art) => (
            <ArticleListItem key={art.id} article={art} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav
          className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          aria-label="Navigasi halaman artikel"
        >
          <div className="text-[var(--color-ink-muted)]">
            Menampilkan <span className="font-semibold text-[var(--color-ink)]">{startItem}</span> -{' '}
            <span className="font-semibold text-[var(--color-ink)]">{endItem}</span> dari{' '}
            <span className="font-semibold text-[var(--color-ink)]">{totalItems}</span> artikel
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage <= 1}
              className="btn-interactive p-2 rounded-xl border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === safePage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`btn-interactive min-w-[36px] h-9 px-2 text-xs font-semibold rounded-xl border cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-xs'
                        : 'bg-[var(--color-surface)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage >= totalPages}
              className="btn-interactive p-2 rounded-xl border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] cursor-pointer"
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
