'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MessageCircle, 
  Search, 
  Clock, 
  HeartHandshake,
  X
} from 'lucide-react';
import { AnonymousMessage, CURHAT_CATEGORIES } from '@/types';
import { parseIndonesianDate } from '@/lib/utils';
import { SkeletonCurhatCard } from '@/components/ui/Skeleton';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { scrollContainerIntoViewIfAbove } from '@/lib/dom-utils';
import { resolveCurhatCategory } from './CurhatForm';

const ITEMS_PER_PAGE = 5;

interface CurhatWallProps {
  messages: AnonymousMessage[];
  loading?: boolean;
}

function formatDate(dateInput?: string) {
  if (!dateInput) return '';
  try {
    const d = parseIndonesianDate(dateInput);
    if (isNaN(d.getTime())) return dateInput;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } catch {
    return dateInput;
  }
}

export function CurhatWall({ messages, loading = false }: CurhatWallProps) {
  // Always initialize with SSR-safe defaults to ensure zero hydration mismatch
  const [activeTab, setActiveTab] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const wallTopRef = useRef<HTMLDivElement>(null);

  // Derive dynamic list of all distinct categories in messages + predefined categories
  const categories = useMemo(() => {
    const set = new Set<string>(['Semua', ...CURHAT_CATEGORIES]);
    messages.forEach((m) => {
      if (m.category && m.category.trim()) {
        set.add(m.category.trim());
      }
    });
    return Array.from(set);
  }, [messages]);

  // Clean up legacy sticky sessionStorage on mount and synchronize URL params safely
  useEffect(() => {
    try {
      sessionStorage.removeItem('curhat_kategori');
      sessionStorage.removeItem('curhat_q');
      sessionStorage.removeItem('curhat_page');
    } catch {}

    const syncFromLocation = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('kategori') || params.get('category');
        const q = params.get('q');
        const page = params.get('page');

        if (cat) {
          if (cat === 'Semua' || categories.includes(cat)) {
            setActiveTab(cat);
          } else {
            setActiveTab(resolveCurhatCategory(cat));
          }
        } else {
          setActiveTab('Semua');
        }

        if (q) {
          setSearchQuery(q);
        } else {
          setSearchQuery('');
        }

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
  }, [categories]);

  const syncParams = React.useCallback((cat: string, q: string, page: number) => {
    try {
      const url = new URL(window.location.href);
      if (cat && cat !== 'Semua') url.searchParams.set('kategori', cat);
      else url.searchParams.delete('kategori');

      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');

      if (page > 1) url.searchParams.set('page', page.toString());
      else url.searchParams.delete('page');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  }, []);

  // Debounced URL param sync for search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      syncParams(activeTab, searchQuery, currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, currentPage, syncParams]);

  // Filter messages based on category, search query, and 2-tier public discovery
  const filteredMessages = useMemo(() => {
    const matched = messages.filter((item) => {
      const matchCategory = activeTab === 'Semua' || item.category === activeTab;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      const matchMessage = item.message.toLowerCase().includes(query);
      const matchAlias = item.alias.toLowerCase().includes(query);
      const matchAnswer = item.answer?.toLowerCase().includes(query) ?? false;
      const matchCat = item.category.toLowerCase().includes(query);
      return matchMessage || matchAlias || matchAnswer || matchCat;
    });

    if (searchQuery.trim()) {
      return matched;
    }

    // 2-tier public layout:
    // Tier 1 (Front): Answered messages ordered chronologically (newest first)
    // Tier 2 (Bottom): Unanswered messages placed at the end chronologically
    const answered = matched.filter((m) => m.isAnswered || Boolean(m.answer && m.answer.trim().length > 0));
    const unanswered = matched.filter((m) => !m.isAnswered && (!m.answer || m.answer.trim().length === 0));

    return [...answered, ...unanswered];
  }, [messages, activeTab, searchQuery]);

  // Pagination calculation
  const totalItems = filteredMessages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMessages = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredMessages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredMessages, safePage]);

  const handleTabChange = (cat: string) => {
    setActiveTab(cat);
    setCurrentPage(1);
    syncParams(cat, searchQuery, 1);
    scrollContainerIntoViewIfAbove('curhat-wall-container', 90);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    syncParams(activeTab, searchQuery, newPage);
    scrollContainerIntoViewIfAbove('curhat-wall-container', 90);
  };

  return (
    <div ref={wallTopRef} className="space-y-4 sm:space-y-5 scroll-mt-20 sm:scroll-mt-24" id="curhat-wall-container">
      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
              Dinding Cerita &amp; Tanggapan
            </h2>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[var(--color-ink-muted)] search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleSearchChange('');
              }}
              placeholder="Cari unek-unek / topik..."
              className="search-input w-full text-xs !pl-9 !pr-10 py-2 text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)]"
              aria-label="Cari curhat anonim"
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

        {/* Category Filter Tabs */}
        <div className="relative -mx-1 px-1">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList aria-label="Filter kategori curhat">
              {categories.map((cat) => {
                const count =
                  cat === 'Semua'
                    ? messages.length
                    : messages.filter((m) => m.category === cat).length;

                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    badge={
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          activeTab === cat
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

      {/* List of Messages / Skeletons / Empty State */}
      <div
        id={`panel-${activeTab}`}
        className="space-y-4"
      >
        {loading ? (
          <div className="space-y-4">
            <SkeletonCurhatCard />
            <SkeletonCurhatCard />
            <SkeletonCurhatCard />
          </div>
        ) : filteredMessages.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="w-6 h-6 stroke-[1.75]" />}
            title={searchQuery ? 'Cerita Tidak Ditemukan' : 'Belum Ada Curhat di Bagian Ini'}
            description={
              searchQuery ? (
                activeTab !== 'Semua' ? (
                  <>
                    Tidak ada cerita yang cocok dengan kata kunci &ldquo;<strong className="text-[var(--color-ink)] break-all">{searchQuery}</strong>&rdquo; pada kategori <strong>{activeTab}</strong>. Coba cari di semua kategori atau tulis curhat baru.
                  </>
                ) : (
                  <>
                    Tidak ada cerita yang cocok dengan kata kunci &ldquo;<strong className="text-[var(--color-ink)] break-all">{searchQuery}</strong>&rdquo;. Punya keresahan yang sama? Kamu bisa jadi yang pertama mencurahkan isi hati.
                  </>
                )
              ) : (
                activeTab !== 'Semua' ? (
                  <>
                    Jadilah orang pertama yang berbagi unek-unek di kategori <strong>{activeTab}</strong> secara anonim, aman, dan tanpa perlu login.
                  </>
                ) : (
                  'Jadilah orang pertama yang berbagi unek-unek secara anonim, aman, dan tanpa perlu login.'
                )
              )
            }
            action={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Semua');
                    setSearchQuery('');
                    setCurrentPage(1);
                    syncParams('Semua', '', 1);
                    scrollContainerIntoViewIfAbove('curhat-wall-container', 90);
                  }}
                  className="btn-primary btn-interactive text-xs py-2 px-4.5 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <span className="sm:hidden">Semua Curhat</span>
                  <span className="hidden sm:inline">Tampilkan Semua Curhat</span>
                </button>
              ) : (
                <a
                  href="#curhat-form"
                  className="btn-primary btn-interactive text-xs py-2 px-4.5 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <span className="sm:hidden">Tulis Curhat</span>
                  <span className="hidden sm:inline">Tulis Curhat Baru</span>
                </a>
              )
            }
            secondaryAction={
              searchQuery ? (
                <a
                  href="#curhat-form"
                  className="btn-secondary btn-interactive text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="sm:hidden">Tulis Curhat</span>
                  <span className="hidden sm:inline">Tulis Curhat Baru</span>
                </a>
              ) : activeTab !== 'Semua' ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Semua');
                    setSearchQuery('');
                    setCurrentPage(1);
                    syncParams('Semua', '', 1);
                    scrollContainerIntoViewIfAbove('curhat-wall-container', 90);
                  }}
                  className="btn-secondary btn-interactive text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span className="sm:hidden">Semua Kategori</span>
                  <span className="hidden sm:inline">Tampilkan Semua Kategori</span>
                </button>
              ) : undefined
            }
          />
        ) : (
          <div key={`${activeTab}-${safePage}`} className="space-y-4 pagination-slide-enter">
            {paginatedMessages.map((item) => (
              <article
                key={item.id}
                className="p-3.5 min-[340px]:p-4 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl space-y-3.5 shadow-xs transition-colors duration-200 hover:border-[var(--color-accent)]/30 flex flex-col justify-between"
              >
                <div className="space-y-3.5 min-w-0">
                  {/* Nama samaran tetap di paling atas */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-ink)] text-sm sm:text-base truncate">
                      {item.alias}
                    </span>
                  </div>

                  {/* Message Body */}
                  <blockquote className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed italic border-l-2 border-[var(--color-accent-border)] pl-3.5 break-words [overflow-wrap:anywhere]">
                    &ldquo;{item.message}&rdquo;
                  </blockquote>

                  {/* Response from Amel */}
                  {item.isAnswered && item.answer ? (
                    <div className="p-3 min-[340px]:p-4 bg-[var(--color-accent-soft)]/50 border border-[var(--color-accent-border)] rounded-xl space-y-1.5 mt-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[var(--color-accent)] flex items-center gap-1.5">
                          <HeartHandshake className="w-3.5 h-3.5 shrink-0" />
                          Tanggapan Kak Amel:
                        </span>
                        {item.answeredAt && (
                          <span className="text-[10px] text-[var(--color-ink-muted)]">
                            {formatDate(item.answeredAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 text-[11px] text-[var(--color-ink-muted)] italic flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[var(--color-ink-soft)]" />
                      <span>Sedang ditinjau oleh Kak Amel untuk ditanggapi...</span>
                    </div>
                  )}
                </div>

                {/* Di paling bawahnya waktu terus baru deh kategori */}
                <div className="pt-3 border-t border-[var(--color-paper-border)] flex flex-wrap items-center gap-1.5 min-[340px]:gap-2 text-xs text-[var(--color-ink-soft)]">
                  {item.createdAt && (
                    <>
                      <span className="text-[11px] text-[var(--color-ink-soft)] flex items-center gap-1 shrink-0 whitespace-nowrap">
                        <Clock className="w-3 h-3 text-[var(--color-ink-soft)] shrink-0" />
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-[var(--color-paper-border)] shrink-0" aria-hidden="true">&bull;</span>
                    </>
                  )}
                  <span className="text-xs font-medium text-[var(--color-accent)] truncate max-w-[130px] min-[340px]:max-w-none">
                    {item.category}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {!loading && totalPages > 1 && (
        <PaginationBar
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          itemLabel="curhatan"
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
