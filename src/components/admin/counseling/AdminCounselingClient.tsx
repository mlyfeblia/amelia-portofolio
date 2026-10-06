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

export function AdminCounselingClient() {
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'unanswered' | 'answered'>('semua');
  const [visibilityFilter, setVisibilityFilter] = useState<'semua' | 'public' | 'private'>('semua');
  const [landingFilter, setLandingFilter] = useState<'semua' | 'landing'>('semua');

  // Sync filters from URL and sessionStorage on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('status') || sessionStorage.getItem('admin_counseling_status');
      const k = params.get('kategori') || sessionStorage.getItem('admin_counseling_kategori');
      const v = params.get('vis') || sessionStorage.getItem('admin_counseling_vis');
      const l = params.get('landing') || sessionStorage.getItem('admin_counseling_landing');
      const q = params.get('q') || sessionStorage.getItem('admin_counseling_q');

      if (s) setStatusFilter(s as 'semua' | 'unanswered' | 'answered');
      if (k) setCategoryFilter(k);
      if (v) setVisibilityFilter(v as 'semua' | 'public' | 'private');
      if (l) setLandingFilter(l as 'semua' | 'landing');
      if (q) setSearch(q);
    } catch {}
  }, []);

  const syncFilterParams = (
    s: 'semua' | 'unanswered' | 'answered',
    k: string,
    v: 'semua' | 'public' | 'private',
    l: 'semua' | 'landing',
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

      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    syncFilterParams(statusFilter, categoryFilter, visibilityFilter, landingFilter, val);
  };
  const handleStatusChange = (val: 'semua' | 'unanswered' | 'answered') => {
    setStatusFilter(val);
    syncFilterParams(val, categoryFilter, visibilityFilter, landingFilter, search);
  };
  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    syncFilterParams(statusFilter, val, visibilityFilter, landingFilter, search);
  };
  const handleVisibilityChange = (val: 'semua' | 'public' | 'private') => {
    setVisibilityFilter(val);
    syncFilterParams(statusFilter, categoryFilter, val, landingFilter, search);
  };
  const handleLandingChange = (val: 'semua' | 'landing') => {
    setLandingFilter(val);
    syncFilterParams(statusFilter, categoryFilter, visibilityFilter, val, search);
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
        setDeleteItem(null);
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

  const filtered = useMemo(() => {
    return curhatList.filter((c) => {
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

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.alias.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        (c.answer && c.answer.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesVisibility && matchesLanding && matchesSearch;
    });
  }, [curhatList, categoryFilter, statusFilter, visibilityFilter, landingFilter, search]);

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
    syncFilterParams('semua', 'Semua', 'semua', 'semua', '');
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    statusFilter !== 'semua' ||
    visibilityFilter !== 'semua' ||
    landingFilter !== 'semua' ||
    categoryFilter !== 'Semua'
  );

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
        curhatList={filtered}
        loading={loading}
        replyingId={replyingId}
        togglingId={togglingId}
        togglingLandingId={togglingLandingId}
        search={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        visibilityFilter={visibilityFilter}
        landingFilter={landingFilter}
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
      />

      <CounselingDeleteModal
        isOpen={deleteModalOpen}
        item={deleteItem}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteItem(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
