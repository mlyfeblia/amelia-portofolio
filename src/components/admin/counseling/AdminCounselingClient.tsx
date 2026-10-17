'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnonymousMessage, CURHAT_CATEGORIES } from '@/types';
import dynamic from 'next/dynamic';
import { CounselingHeader } from '@/components/admin/counseling/CounselingHeader';
import { CounselingFilters } from '@/components/admin/counseling/CounselingFilters';
import { CounselingList } from '@/components/admin/counseling/CounselingList';

const CounselingDeleteModal = dynamic(
  () => import('@/components/admin/counseling/CounselingDeleteModal').then((m) => m.CounselingDeleteModal),
  { ssr: false }
);

const ITEMS_PER_PAGE = 6;

export function AdminCounselingClient() {
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters - Always initialize with SSR-safe defaults to avoid hydration mismatch
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'unanswered' | 'answered'>('semua');
  const [visibilityFilter, setVisibilityFilter] = useState<'semua' | 'public' | 'private'>('semua');
  const [landingFilter, setLandingFilter] = useState<'semua' | 'landing'>('semua');
  const [dateFilter, setDateFilter] = useState('');

  // Synchronize query parameters and session storage safely post-hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || sessionStorage.getItem('admin_counseling_q');
        const k = params.get('kategori') || sessionStorage.getItem('admin_counseling_kategori');
        const s = params.get('status') || sessionStorage.getItem('admin_counseling_status');
        const v = params.get('vis') || sessionStorage.getItem('admin_counseling_vis');
        const l = params.get('landing') || sessionStorage.getItem('admin_counseling_landing');
        const d = params.get('tgl') || sessionStorage.getItem('admin_counseling_tgl');

        if (q) setSearch(q);
        if (k) setCategoryFilter(k);
        if (s === 'unanswered' || s === 'answered') setStatusFilter(s);
        if (v === 'public' || v === 'private') setVisibilityFilter(v);
        if (l === 'landing') setLandingFilter('landing');
        if (d) setDateFilter(d);
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const syncFilterParams = (
    s: 'semua' | 'unanswered' | 'answered',
    k: string,
    v: 'semua' | 'public' | 'private',
    l: 'semua' | 'landing',
    d: string,
    q: string
  ) => {
    try {
      if (s && s !== 'semua') sessionStorage.setItem('admin_counseling_status', s);
      else sessionStorage.removeItem('admin_counseling_status');

      if (k && k !== 'Semua') sessionStorage.setItem('admin_counseling_kategori', k);
      else sessionStorage.removeItem('admin_counseling_kategori');

      if (v && v !== 'semua') sessionStorage.setItem('admin_counseling_vis', v);
      else sessionStorage.removeItem('admin_counseling_vis');

      if (l && l !== 'semua') sessionStorage.setItem('admin_counseling_landing', l);
      else sessionStorage.removeItem('admin_counseling_landing');

      if (d) sessionStorage.setItem('admin_counseling_tgl', d);
      else sessionStorage.removeItem('admin_counseling_tgl');

      if (q.trim()) sessionStorage.setItem('admin_counseling_q', q.trim());
      else sessionStorage.removeItem('admin_counseling_q');

      const url = new URL(window.location.href);
      if (s && s !== 'semua') url.searchParams.set('status', s);
      else url.searchParams.delete('status');

      if (k && k !== 'Semua') url.searchParams.set('kategori', k);
      else url.searchParams.delete('kategori');

      if (v && v !== 'semua') url.searchParams.set('vis', v);
      else url.searchParams.delete('vis');

      if (l && l !== 'semua') url.searchParams.set('landing', l);
      else url.searchParams.delete('landing');

      if (d) url.searchParams.set('tgl', d);
      else url.searchParams.delete('tgl');

      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, categoryFilter, visibilityFilter, landingFilter, dateFilter, val);
  };
  const handleStatusChange = (val: 'semua' | 'unanswered' | 'answered') => {
    setStatusFilter(val);
    setCurrentPage(1);
    syncFilterParams(val, categoryFilter, visibilityFilter, landingFilter, dateFilter, search);
  };
  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, val, visibilityFilter, landingFilter, dateFilter, search);
  };
  const handleVisibilityChange = (val: 'semua' | 'public' | 'private') => {
    setVisibilityFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, categoryFilter, val, landingFilter, dateFilter, search);
  };
  const handleLandingChange = (val: 'semua' | 'landing') => {
    setLandingFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, categoryFilter, visibilityFilter, val, dateFilter, search);
  };
  const handleDateChange = (val: string) => {
    setDateFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, categoryFilter, visibilityFilter, landingFilter, val, search);
  };

  // Replying & Action States
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingLandingId, setTogglingLandingId] = useState<string | null>(null);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<AnonymousMessage | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const loadCurhat = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/curhat');
      const data = await res.json();
      if (data.success) {
        setCurhatList(data.data);
      }
    } catch (e) {
      console.error('Failed to load curhat:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/curhat')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setCurhatList(data.data);
        }
      })
      .catch((e) => {
        console.error('Failed to load curhat:', e);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Reply submit
  const handleSaveReply = async (
    id: string,
    text: string,
    isPublic: boolean,
    showOnLandingPage: boolean
  ) => {
    try {
      const res = await fetch(`/api/curhat/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: text, isPublic, showOnLandingPage }),
      });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  answer: text,
                  isAnswered: true,
                  isPublic,
                  showOnLandingPage,
                  answeredAt: new Date().toISOString(),
                }
              : c
          )
        );
        setReplyingId(null);
      }
    } catch (e) {
      console.error('Failed to answer curhat:', e);
    }
  };

  // Quick toggle privacy
  const handleTogglePrivacy = async (item: AnonymousMessage) => {
    const nextPublic = !item.isPublic;
    // If making private, also disable landing page visibility
    const nextLanding = nextPublic ? item.showOnLandingPage : false;

    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/curhat/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: nextPublic, showOnLandingPage: nextLanding }),
      });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) =>
          prev.map((c) =>
            c.id === item.id ? { ...c, isPublic: nextPublic, showOnLandingPage: nextLanding } : c
          )
        );
      }
    } catch (e) {
      console.error('Failed to toggle curhat privacy:', e);
    } finally {
      setTogglingId(null);
    }
  };

  // Quick toggle Landing Page showcase
  const handleToggleLanding = async (item: AnonymousMessage) => {
    const nextLanding = !(item.showOnLandingPage ?? false);
    // If turning on landing page, ensure it is also public
    const nextPublic = nextLanding ? true : item.isPublic;

    setTogglingLandingId(item.id);
    try {
      const res = await fetch(`/api/curhat/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnLandingPage: nextLanding, isPublic: nextPublic }),
      });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) =>
          prev.map((c) =>
            c.id === item.id ? { ...c, showOnLandingPage: nextLanding, isPublic: nextPublic } : c
          )
        );
      }
    } catch (e) {
      console.error('Failed to toggle landing page showcase:', e);
    } finally {
      setTogglingLandingId(null);
    }
  };

  // Delete curhat
  const handleConfirmDelete = async (item: AnonymousMessage) => {
    try {
      const res = await fetch(`/api/curhat/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) => prev.filter((c) => c.id !== item.id));
        setDeleteModalOpen(false);
        setTimeout(() => setDeleteItem(null), 300);
      }
    } catch (e) {
      console.error('Failed to delete curhat:', e);
    }
  };

  // Dynamic Categories list
  const categoriesList = useMemo(() => {
    const set = new Set<string>(['Semua', ...CURHAT_CATEGORIES]);
    curhatList.forEach((c) => {
      if (c.category && c.category.trim()) {
        set.add(c.category.trim());
      }
    });
    return Array.from(set);
  }, [curhatList]);

  // Available unique dates from createdAt sorted descending with Indonesian labels
  const availableDates = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    curhatList.forEach((c) => {
      if (c.createdAt) {
        // extract YYYY-MM-DD
        const dateKey = c.createdAt.slice(0, 10);
        if (dateKey) {
          dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
        }
      }
    });

    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    return Object.keys(dateCounts)
      .sort((a, b) => b.localeCompare(a))
      .map((dateStr) => {
        let formattedLabel = dateStr;
        try {
          const [y, m, d] = dateStr.split('-').map(Number);
          if (y && m && d) {
            const dt = new Date(y, m - 1, d);
            formattedLabel = new Intl.DateTimeFormat('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }).format(dt);
          }
        } catch {}

        const isToday = dateStr === todayStr;
        const label = isToday ? `Hari Ini (${formattedLabel})` : formattedLabel;

        return {
          value: dateStr,
          label,
          count: dateCounts[dateStr],
        };
      });
  }, [curhatList]);

  const filteredMessages = useMemo(() => {
    const list = curhatList.filter((c) => {
      const matchesCategory = categoryFilter === 'Semua' || c.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'unanswered' && !c.isAnswered) ||
        (statusFilter === 'answered' && c.isAnswered);
      const matchesVisibility =
        visibilityFilter === 'semua' ||
        (visibilityFilter === 'public' && c.isPublic) ||
        (visibilityFilter === 'private' && !c.isPublic);
      const matchesLanding =
        landingFilter === 'semua' ||
        (landingFilter === 'landing' && c.showOnLandingPage);

      const matchesDate = !dateFilter || (c.createdAt && c.createdAt.startsWith(dateFilter));

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.alias.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        (c.answer && c.answer.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesVisibility && matchesLanding && matchesDate && matchesSearch;
    });

    // Action-First Priority Triage:
    // 1. Unanswered messages (!c.isAnswered) come FIRST (sorted newest to oldest)
    // 2. Answered messages come AFTER (sorted newest to oldest)
    return [...list].sort((a, b) => {
      const aUnanswered = !a.isAnswered && (!a.answer || a.answer.trim().length === 0);
      const bUnanswered = !b.isAnswered && (!b.answer || b.answer.trim().length === 0);

      if (aUnanswered && !bUnanswered) return -1;
      if (!aUnanswered && bUnanswered) return 1;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [curhatList, categoryFilter, statusFilter, visibilityFilter, landingFilter, dateFilter, search]);

  const unansweredCount = curhatList.filter((c) => !c.isAnswered).length;
  const answeredCount = curhatList.filter((c) => c.isAnswered).length;
  const publicCount = curhatList.filter((c) => c.isPublic).length;
  const privateCount = curhatList.filter((c) => !c.isPublic).length;
  const landingCount = curhatList.filter((c) => c.showOnLandingPage).length;

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('semua');
    setVisibilityFilter('semua');
    setLandingFilter('semua');
    setCategoryFilter('Semua');
    setDateFilter('');
    setCurrentPage(1);
    syncFilterParams('semua', 'Semua', 'semua', 'semua', '', '');
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    statusFilter !== 'semua' ||
    visibilityFilter !== 'semua' ||
    landingFilter !== 'semua' ||
    categoryFilter !== 'Semua' ||
    dateFilter.trim()
  );

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMessages = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredMessages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMessages, safePage]);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <CounselingHeader
        totalCount={curhatList.length}
        unansweredCount={unansweredCount}
        answeredCount={answeredCount}
        loading={loading}
        onRefresh={loadCurhat}
      />

      <CounselingFilters
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        visibilityFilter={visibilityFilter}
        onVisibilityChange={handleVisibilityChange}
        landingFilter={landingFilter}
        onLandingFilterChange={handleLandingChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        availableDates={availableDates}
        categories={categoriesList}
        counts={{
          total: curhatList.length,
          unanswered: unansweredCount,
          answered: answeredCount,
          publicCount,
          privateCount,
          landingCount,
        }}
      />

      <CounselingList
        curhatList={paginatedMessages}
        loading={loading}
        replyingId={replyingId}
        togglingId={togglingId}
        togglingLandingId={togglingLandingId}
        search={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        visibilityFilter={visibilityFilter}
        landingFilter={landingFilter}
        dateFilter={dateFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onStartReply={(item) => setReplyingId(item.id)}
        onCancelReply={() => setReplyingId(null)}
        onSaveReply={handleSaveReply}
        onTogglePrivacy={handleTogglePrivacy}
        onToggleLanding={handleToggleLanding}
        onDelete={(item) => {
          setDeleteItem(item);
          setDeleteModalOpen(true);
        }}
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filteredMessages.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <CounselingDeleteModal
        isOpen={deleteModalOpen}
        item={deleteItem}
        onClose={() => {
          setDeleteModalOpen(false);
          setTimeout(() => setDeleteItem(null), 300);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
