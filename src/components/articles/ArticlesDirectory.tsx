'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, BookOpen } from 'lucide-react';
import { Article, ARTICLE_CATEGORIES } from '@/types';
import { ArticleListItem } from './ArticleListItem';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { scrollContainerIntoViewIfAbove } from '@/lib/dom-utils';

const ARTICLES_PER_PAGE = 6;
const ITEMS_PER_PAGE = ARTICLES_PER_PAGE;

interface ArticlesDirectoryProps {
  initialArticles: Article[];
}

export function ArticlesDirectory({ initialArticles }: ArticlesDirectoryProps) {
  // Always initialize with SSR-safe defaults to ensure zero hydration mismatch
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize URL query parameters safely on client after hydration & on popstate
  useEffect(() => {
    try {
      sessionStorage.removeItem('articles_category');
      sessionStorage.removeItem('articles_q');
      sessionStorage.removeItem('articles_page');
    } catch {}

    const syncFromLocation = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('kategori') || params.get('category');
        const q = params.get('q');
        const page = params.get('page');

        if (cat) setActiveCategory(cat);
        else setActiveCategory('Semua');

        if (q) setSearchQuery(q);
        else setSearchQuery('');

        if (page) {
          const p = parseInt(page, 10);
          setCurrentPage(!isNaN(p) && p > 0 ? p : 1);
        } else {
          setCurrentPage(1);
        }
      } catch {}
    };

    syncFromLocation();

    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  const syncParams = useCallback((cat: string, q: string, page: number) => {
    try {
      const url = new URL(window.location.href);
      if (cat && cat !== 'Semua') {
        url.searchParams.set('category', cat);
        url.searchParams.delete('kategori');
      } else {
        url.searchParams.delete('category');
        url.searchParams.delete('kategori');
      }

      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');

      if (page > 1) url.searchParams.set('page', page.toString());
      else url.searchParams.delete('page');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, []);

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

  // Filtered articles with stable, deterministic chronological ordering (zero flicker & zero layout shift)
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

  // Debounced URL param sync for search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      syncParams(activeCategory, searchQuery, currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery, currentPage, syncParams]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    syncParams(cat, searchQuery, 1);
    scrollContainerIntoViewIfAbove('articles-directory-container', 90);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    syncParams(activeCategory, searchQuery, newPage);
    scrollContainerIntoViewIfAbove('articles-directory-container', 90);
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8 scroll-mt-20 sm:scroll-mt-24" id="articles-directory-container">
      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
              Eksplorasi Topik &amp; Kategori
            </h2>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[var(--color-ink-muted)] search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleSearchChange('');
              }}
              placeholder="Cari judul, topik, atau kata kunci..."
              className="search-input text-xs sm:text-sm !pl-9 !pr-10 w-full"
              aria-label="Cari artikel"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                type="button"
                className="search-clear-btn rounded-md text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer"
                title="Bersihkan kata kunci pencarian"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="relative -mx-1 px-1">
          <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList aria-label="Filter kategori artikel">
              {categories.map((cat) => {
                const count =
                  cat === 'Semua'
                    ? initialArticles.length
                    : initialArticles.filter((a) => a.category === cat).length;

                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    badge={
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          activeCategory === cat
                            ? 'bg-white/20 text-white font-bold'
                            : 'bg-[var(--color-paper-border)]/60 text-[var(--color-ink-soft)]'
                        }`}
                      >
                        {count}
                      </span>
                    }
                  >
                    {cat}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Article List or Rich Empty State */}
      {filteredArticles.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />}
          title={searchQuery ? 'Artikel Tidak Ditemukan' : 'Belum Ada Artikel di Kategori Ini'}
          description={
            searchQuery ? (
              activeCategory !== 'Semua' ? (
                <>
                  Tidak ditemukan tulisan dengan kata kunci &ldquo;<strong className="text-[var(--color-ink)] break-all">{searchQuery}</strong>&rdquo; di kategori <strong>{activeCategory}</strong>. Coba cari di semua topik atau periksa ejaan kata.
                </>
              ) : (
                <>
                  Tidak ditemukan tulisan dengan kata kunci &ldquo;<strong className="text-[var(--color-ink)] break-all">{searchQuery}</strong>&rdquo;. Coba periksa ejaan kata atau pilih topik populer di bawah.
                </>
              )
            ) : (
              <>
                Belum ada artikel yang dipublikasikan pada kategori <strong>{activeCategory}</strong>. Silakan cek kategori lainnya atau tampilkan seluruh artikel.
              </>
            )
          }
          suggestions={
            searchQuery
              ? ['Kesehatan Mental', 'Burnout', 'Mindfulness', 'Overthinking', 'BKI'].map((topic) => ({
                  label: topic,
                  onClick: () => handleSearchChange(topic),
                }))
              : undefined
          }
          action={
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Semua');
                setSearchQuery('');
                setCurrentPage(1);
                syncParams('Semua', '', 1);
                scrollContainerIntoViewIfAbove('articles-directory-container', 90);
              }}
              className="btn-primary btn-interactive text-xs py-2 px-4.5 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span className="sm:hidden">Semua Artikel</span>
              <span className="hidden sm:inline">Tampilkan Semua Artikel</span>
            </button>
          }
          secondaryAction={
            searchQuery && activeCategory !== 'Semua' ? (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('Semua');
                  setCurrentPage(1);
                  syncParams('Semua', searchQuery, 1);
                  scrollContainerIntoViewIfAbove('articles-directory-container', 90);
                }}
                className="btn-secondary btn-interactive text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span className="sm:hidden">Semua Topik</span>
                <span className="hidden sm:inline">Cari di Semua Topik</span>
              </button>
            ) : undefined
          }
        />
      ) : (
        <div
          key={`${activeCategory}-${safePage}`}
          className={`divide-y divide-[var(--color-paper-border)] border-t ${totalPages <= 1 ? 'border-b' : ''} border-[var(--color-paper-border)] pagination-slide-enter`}
          data-reveal
        >
          {paginatedArticles.map((art) => (
            <ArticleListItem key={art.id} article={art} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          itemLabel="artikel"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
