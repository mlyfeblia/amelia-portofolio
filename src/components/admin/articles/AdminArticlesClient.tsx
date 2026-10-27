'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Article } from '@/types';
import { parseIndonesianDate } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { ArticleHeader } from '@/components/admin/articles/ArticleHeader';
import { ArticleFilters } from '@/components/admin/articles/ArticleFilters';
import { ArticleList } from '@/components/admin/articles/ArticleList';

const ArticleFormModal = dynamic(
  () => import('@/components/admin/articles/ArticleFormModal').then((m) => m.ArticleFormModal),
  { ssr: false }
);

const ArticleDeleteModal = dynamic(
  () => import('@/components/admin/articles/ArticleDeleteModal').then((m) => m.ArticleDeleteModal),
  { ssr: false }
);

const ArticleDraftsModal = dynamic(
  () => import('@/components/admin/articles/ArticleDraftsModal').then((m) => m.ArticleDraftsModal),
  { ssr: false }
);

import { ArticleDraftItem, useArticleDrafts } from '@/lib/draft-store';
import { useToast } from '@/context/ToastContext';
import { adminCache, useAdminRevalidate } from '@/lib/admin-cache';
import { scrollContainerIntoViewIfAbove } from '@/lib/dom-utils';

const ITEMS_PER_PAGE = 6;

export function AdminArticlesClient() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>(() => adminCache.getArticles() || []);
  const [loading, setLoading] = useState(() => !adminCache.getArticles());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States - Always initialize with SSR-safe defaults to avoid hydration mismatch
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'published' | 'draft'>('semua');
  const [landingFilter, setLandingFilter] = useState<'semua' | 'landing'>('semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [dateFilter, setDateFilter] = useState('');

  // Synchronize query parameters and session storage safely post-hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || sessionStorage.getItem('admin_articles_q');
        const s = params.get('status') || sessionStorage.getItem('admin_articles_status');
        const l = params.get('landing') || sessionStorage.getItem('admin_articles_landing');
        const k = params.get('kategori') || sessionStorage.getItem('admin_articles_kategori');
        const d = params.get('tgl') || sessionStorage.getItem('admin_articles_tgl');

        if (q) setSearch(q);
        if (s === 'published' || s === 'draft') setStatusFilter(s);
        if (l === 'landing') setLandingFilter('landing');
        if (k) setSelectedCategory(k);
        if (d) setDateFilter(d);
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const syncFilterParams = (
    s: 'semua' | 'published' | 'draft',
    l: 'semua' | 'landing',
    k: string,
    d: string,
    q: string
  ) => {
    try {
      if (s && s !== 'semua') sessionStorage.setItem('admin_articles_status', s);
      else sessionStorage.removeItem('admin_articles_status');

      if (l && l !== 'semua') sessionStorage.setItem('admin_articles_landing', l);
      else sessionStorage.removeItem('admin_articles_landing');

      if (k && k !== 'Semua') sessionStorage.setItem('admin_articles_kategori', k);
      else sessionStorage.removeItem('admin_articles_kategori');

      if (d) sessionStorage.setItem('admin_articles_tgl', d);
      else sessionStorage.removeItem('admin_articles_tgl');

      if (q.trim()) sessionStorage.setItem('admin_articles_q', q.trim());
      else sessionStorage.removeItem('admin_articles_q');

      const url = new URL(window.location.href);
      if (s && s !== 'semua') url.searchParams.set('status', s);
      else url.searchParams.delete('status');

      if (l && l !== 'semua') url.searchParams.set('landing', l);
      else url.searchParams.delete('landing');

      if (k && k !== 'Semua') url.searchParams.set('kategori', k);
      else url.searchParams.delete('kategori');

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
    syncFilterParams(statusFilter, landingFilter, selectedCategory, dateFilter, val);
    scrollContainerIntoViewIfAbove('admin-articles-list-container');
  };
  const handleStatusChange = (val: 'semua' | 'published' | 'draft') => {
    setStatusFilter(val);
    setCurrentPage(1);
    syncFilterParams(val, landingFilter, selectedCategory, dateFilter, search);
    scrollContainerIntoViewIfAbove('admin-articles-list-container');
  };
  const handleLandingChange = (val: 'semua' | 'landing') => {
    setLandingFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, val, selectedCategory, dateFilter, search);
    scrollContainerIntoViewIfAbove('admin-articles-list-container');
  };
  const handleStatusAndLandingChange = (
    status: 'semua' | 'published' | 'draft',
    landing: 'semua' | 'landing'
  ) => {
    setStatusFilter(status);
    setLandingFilter(landing);
    setCurrentPage(1);
    syncFilterParams(status, landing, selectedCategory, dateFilter, search);
    scrollContainerIntoViewIfAbove('admin-articles-list-container');
  };
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, landingFilter, val, dateFilter, search);
    scrollContainerIntoViewIfAbove('admin-articles-list-container');
  };
  const handleDateChange = (val: string) => {
    setDateFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, landingFilter, selectedCategory, val, search);
    scrollContainerIntoViewIfAbove('admin-articles-list-container');
  };

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [draftsModalOpen, setDraftsModalOpen] = useState(false);
  const [selectedDraftForForm, setSelectedDraftForForm] = useState<ArticleDraftItem | null>(null);

  const savedDrafts = useArticleDrafts();

  // Action States
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [togglingLandingId, setTogglingLandingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);

  const loadArticles = useCallback(async (signalArg?: unknown) => {
    const signal = signalArg instanceof AbortSignal ? signalArg : undefined;
    try {
      const res = await fetch('/api/articles', { signal });

      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('amelia:admin-session-expired'));
        }
        return;
      }

      const data = await res.json();
      if (data.dbStatus === 'paused') {
        adminCache.setDatabaseStatus('paused');
      } else if (data.dbStatus === 'online') {
        adminCache.setDatabaseStatus('online');
      }

      if (data.success && Array.isArray(data.data)) {
        setArticles(data.data);
        adminCache.setArticles(data.data);
      } else {
        const cached = adminCache.getArticles();
        if (cached && cached.length > 0) setArticles(cached);
      }
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') {
        console.error('Failed to load articles:', e);
        adminCache.setDatabaseStatus('paused');
        const cached = adminCache.getArticles();
        if (cached && cached.length > 0) setArticles(cached);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    async function fetchData() {
      try {
        const res = await fetch('/api/articles', { signal: controller.signal });

        if (res.status === 401) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('amelia:admin-session-expired'));
          }
          return;
        }

        const data = await res.json();
        if (data.dbStatus === 'paused') {
          adminCache.setDatabaseStatus('paused');
        } else if (data.dbStatus === 'online') {
          adminCache.setDatabaseStatus('online');
        }

        if (!ignore && data.success && Array.isArray(data.data)) {
          setArticles(data.data);
          adminCache.setArticles(data.data);
        } else if (!ignore) {
          const cached = adminCache.getArticles();
          if (cached && cached.length > 0) setArticles(cached);
        }
      } catch (e: unknown) {
        if ((e as Error)?.name !== 'AbortError') {
          console.error('Failed to load articles:', e);
          adminCache.setDatabaseStatus('paused');
          if (!ignore) {
            const cached = adminCache.getArticles();
            if (cached && cached.length > 0) setArticles(cached);
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Automatic silent background revalidation on tab re-entry and cross-tab sync
  useAdminRevalidate('articles', loadArticles);

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingArticle(null);
    setSelectedDraftForForm(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (art: Article) => {
    setFormMode('edit');
    setEditingArticle(art);
    setSelectedDraftForForm(null);
    setFormModalOpen(true);
  };

  const handleSelectDraftFromModal = (draft: ArticleDraftItem) => {
    setSelectedDraftForForm(draft);
    setFormMode('create');
    setEditingArticle(null);
    setDraftsModalOpen(false);
    setFormModalOpen(true);
  };

  const handleNewDraftFromModal = () => {
    setSelectedDraftForForm(null);
    setFormMode('create');
    setEditingArticle(null);
    setDraftsModalOpen(false);
    setFormModalOpen(true);
  };

  const handleFormSuccess = (savedArticle: Article, mode: 'create' | 'edit') => {
    setArticles((prev) => {
      const next = mode === 'create'
        ? [savedArticle, ...prev]
        : prev.map((a) => (a.id === savedArticle.id ? savedArticle : a));
      adminCache.setArticles(next);
      return next;
    });
    toast.success(
      mode === 'create'
        ? 'Artikel baru berhasil disimpan.'
        : 'Perubahan artikel berhasil disimpan.'
    );
  };

  const handleTogglePublish = async (art: Article) => {
    if (adminCache.getDatabaseStatus() === 'paused') {
      toast.error('Database InsForge sedang ter-pause. Harap aktifkan kembali di InsForge Console.');
      return;
    }
    const nextStatus = !(art.isPublished ?? true);
    const patchBody: Record<string, unknown> = { isPublished: nextStatus };
    if (!nextStatus) {
      patchBody.showOnLandingPage = false;
    }
    setTogglingId(art.id);
    try {
      const res = await fetch(`/api/articles/${art.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setArticles((prev) => {
          const next = prev.map((a) => (a.id === art.id ? data.data : a));
          adminCache.setArticles(next);
          return next;
        });
        toast.success(
          nextStatus
            ? 'Artikel berhasil diterbitkan ke publik.'
            : 'Artikel dikembalikan menjadi status draf.'
        );
      } else {
        toast.error('Gagal mengubah status publikasi artikel.');
      }
    } catch (e) {
      console.error('Failed to toggle article publish status:', e);
      toast.error('Gagal mengubah status publikasi artikel.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleLanding = async (art: Article) => {
    if (adminCache.getDatabaseStatus() === 'paused') {
      toast.error('Database InsForge sedang ter-pause. Harap aktifkan kembali di InsForge Console.');
      return;
    }
    const nextVal = !art.showOnLandingPage;
    const patchBody: Record<string, unknown> = { showOnLandingPage: nextVal };
    if (nextVal) {
      patchBody.isPublished = true;
    }
    setTogglingLandingId(art.id);
    try {
      const res = await fetch(`/api/articles/${art.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchBody),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setArticles((prev) => {
          const next = prev.map((a) => (a.id === art.id ? data.data : a));
          adminCache.setArticles(next);
          return next;
        });
        toast.success(
          nextVal
            ? 'Artikel disorot di beranda utama.'
            : 'Sorotan beranda artikel dinonaktifkan.'
        );
      } else {
        toast.error('Gagal mengubah status sorotan beranda.');
      }
    } catch (e) {
      console.error('Failed to toggle article landing showcase:', e);
      toast.error('Gagal mengubah status sorotan beranda.');
    } finally {
      setTogglingLandingId(null);
    }
  };

  const handleOpenDelete = (art: Article) => {
    setDeletingArticle(art);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (art: Article) => {
    if (adminCache.getDatabaseStatus() === 'paused') {
      toast.error('Database InsForge sedang ter-pause. Harap aktifkan kembali di InsForge Console agar artikel dapat dihapus.');
      return;
    }
    try {
      const res = await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => {
          const next = prev.filter((a) => a.id !== art.id);
          adminCache.setArticles(next);
          return next;
        });
        setDeleteModalOpen(false);
        setTimeout(() => setDeletingArticle(null), 300);
        toast.info(`Artikel "${art.title}" berhasil dihapus.`);
      } else {
        toast.error('Gagal menghapus artikel.');
      }
    } catch (e) {
      console.error('Failed to delete article:', e);
      toast.error('Gagal menghapus artikel.');
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    let published = 0;
    let draft = 0;
    let landingCount = 0;
    articles.forEach((a) => {
      if (a.isPublished ?? true) {
        published++;
      } else {
        draft++;
      }
      if (a.showOnLandingPage) {
        landingCount++;
      }
    });
    return {
      total: articles.length,
      published,
      draft,
      landingCount,
    };
  }, [articles]);

  // Dynamic Categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['Semua', ...Array.from(set)];
  }, [articles]);

  // Available unique dates from publishedAt sorted descending with Indonesian labels
  const availableDates = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    articles.forEach((a) => {
      if (a.publishedAt) {
        const dt = parseIndonesianDate(a.publishedAt);
        if (!isNaN(dt.getTime())) {
          const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(dt);
          if (dateKey) {
            dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
          }
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
  }, [articles]);

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    const list = articles.filter((art) => {
      const isPublic = art.isPublished ?? true;
      const matchesStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'published' && isPublic) ||
        (statusFilter === 'draft' && !isPublic);

      const matchesLanding =
        landingFilter === 'semua' || (landingFilter === 'landing' && art.showOnLandingPage);

      const matchesCategory = selectedCategory === 'Semua' || art.category === selectedCategory;

      const matchesDate = !dateFilter || (() => {
        if (!art.publishedAt) return false;
        const dt = parseIndonesianDate(art.publishedAt);
        if (isNaN(dt.getTime())) return art.publishedAt.includes(dateFilter);
        const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(dt);
        return dateKey === dateFilter;
      })();

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.slug.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesStatus && matchesLanding && matchesCategory && matchesDate && matchesSearch;
    });

    // Action-First Priority Triage:
    // 1. In 'semua' view, Draft articles (!art.isPublished) come first for quick authoring review
    // 2. Published articles come next
    // 3. Within each group, sort by publishedAt/date descending
    return [...list].sort((a, b) => {
      const aDraft = !(a.isPublished ?? true);
      const bDraft = !(b.isPublished ?? true);

      if (statusFilter === 'semua') {
        if (aDraft && !bDraft) return -1;
        if (!aDraft && bDraft) return 1;
      }

      const dateA = a.publishedAt ? parseIndonesianDate(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? parseIndonesianDate(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [articles, statusFilter, landingFilter, selectedCategory, dateFilter, search]);

  const handleResetFilters = () => {
    try {
      sessionStorage.removeItem('admin_articles_status');
      sessionStorage.removeItem('admin_articles_landing');
      sessionStorage.removeItem('admin_articles_kategori');
      sessionStorage.removeItem('admin_articles_tgl');
      sessionStorage.removeItem('admin_articles_q');
      window.history.replaceState({}, '', window.location.pathname);
    } catch {}
    setSearch('');
    setStatusFilter('semua');
    setLandingFilter('semua');
    setSelectedCategory('Semua');
    setDateFilter('');
    setCurrentPage(1);
    scrollContainerIntoViewIfAbove('admin-articles-list-container');
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    statusFilter !== 'semua' ||
    landingFilter !== 'semua' ||
    selectedCategory !== 'Semua' ||
    dateFilter.trim()
  );

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedArticles = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, safePage]);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <ArticleHeader
        totalCount={articles.length}
        publishedCount={statusCounts.published}
        draftArticleCount={statusCounts.draft}
        loading={loading}
        onRefresh={loadArticles}
        onCreateNew={handleOpenCreate}
        onOpenDrafts={() => setDraftsModalOpen(true)}
        draftCount={savedDrafts.length}
      />

      <ArticleFilters
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        landingFilter={landingFilter}
        onLandingFilterChange={handleLandingChange}
        onStatusAndLandingChange={handleStatusAndLandingChange}
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        availableDates={availableDates}
        categories={categoriesList}
        counts={statusCounts}
        hasActiveFilters={hasActiveFilters}
        totalResults={filteredArticles.length}
        onResetFilters={handleResetFilters}
      />

      <ArticleList
        articles={paginatedArticles}
        loading={loading}
        togglingId={togglingId}
        togglingLandingId={togglingLandingId}
        search={search}
        statusFilter={statusFilter}
        selectedCategory={selectedCategory}
        landingFilter={landingFilter}
        dateFilter={dateFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onTogglePublish={handleTogglePublish}
        onToggleLanding={handleToggleLanding}
        onCreateNew={handleOpenCreate}
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={filteredArticles.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <ArticleFormModal
        isOpen={formModalOpen}
        mode={formMode}
        initialArticle={editingArticle}
        initialDraft={selectedDraftForForm}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedDraftForForm(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <ArticleDeleteModal
        article={deletingArticle}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setTimeout(() => setDeletingArticle(null), 300);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ArticleDraftsModal
        isOpen={draftsModalOpen}
        onClose={() => setDraftsModalOpen(false)}
        onSelectDraft={handleSelectDraftFromModal}
        onNewDraft={handleNewDraftFromModal}
        currentDraftId={selectedDraftForForm?.id}
      />
    </div>
  );
}
