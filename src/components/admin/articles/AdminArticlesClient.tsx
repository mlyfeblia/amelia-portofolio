'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Article } from '@/types';
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

const ITEMS_PER_PAGE = 6;

export function AdminArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [search, setSearch] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || sessionStorage.getItem('admin_articles_q') || '';
    } catch {
      return '';
    }
  });

  const [statusFilter, setStatusFilter] = useState<'semua' | 'published' | 'draft'>(() => {
    if (typeof window === 'undefined') return 'semua';
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('status') || sessionStorage.getItem('admin_articles_status');
      if (s === 'published' || s === 'draft') return s;
    } catch {}
    return 'semua';
  });

  const [landingFilter, setLandingFilter] = useState<'semua' | 'landing'>(() => {
    if (typeof window === 'undefined') return 'semua';
    try {
      const params = new URLSearchParams(window.location.search);
      const l = params.get('landing') || sessionStorage.getItem('admin_articles_landing');
      if (l === 'landing') return 'landing';
    } catch {}
    return 'semua';
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window === 'undefined') return 'Semua';
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('kategori') || sessionStorage.getItem('admin_articles_kategori') || 'Semua';
    } catch {
      return 'Semua';
    }
  });

  const [dateFilter, setDateFilter] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('tgl') || sessionStorage.getItem('admin_articles_tgl') || '';
    } catch {
      return '';
    }
  });

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
  };
  const handleStatusChange = (val: 'semua' | 'published' | 'draft') => {
    setStatusFilter(val);
    setCurrentPage(1);
    syncFilterParams(val, landingFilter, selectedCategory, dateFilter, search);
  };
  const handleLandingChange = (val: 'semua' | 'landing') => {
    setLandingFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, val, selectedCategory, dateFilter, search);
  };
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, landingFilter, val, dateFilter, search);
  };
  const handleDateChange = (val: string) => {
    setDateFilter(val);
    setCurrentPage(1);
    syncFilterParams(statusFilter, landingFilter, selectedCategory, val, search);
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

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (e) {
      console.error('Failed to load articles:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/articles')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success) {
          setArticles(data.data);
        }
      })
      .catch((e) => {
        console.error('Failed to load articles:', e);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

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
    if (mode === 'create') {
      setArticles((prev) => [savedArticle, ...prev]);
    } else {
      setArticles((prev) =>
        prev.map((a) => (a.id === savedArticle.id ? savedArticle : a))
      );
    }
  };

  const handleTogglePublish = async (art: Article) => {
    const nextStatus = !(art.isPublished ?? true);
    setTogglingId(art.id);
    try {
      const res = await fetch(`/api/articles/${art.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: nextStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? data.data : a))
        );
      }
    } catch (e) {
      console.error('Failed to toggle article publish status:', e);
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleLanding = async (art: Article) => {
    const nextVal = !art.showOnLandingPage;
    setTogglingLandingId(art.id);
    try {
      const res = await fetch(`/api/articles/${art.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnLandingPage: nextVal }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setArticles((prev) =>
          prev.map((a) => (a.id === art.id ? data.data : a))
        );
      }
    } catch (e) {
      console.error('Failed to toggle article landing showcase:', e);
    } finally {
      setTogglingLandingId(null);
    }
  };

  const handleOpenDelete = (art: Article) => {
    setDeletingArticle(art);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (art: Article) => {
    try {
      const res = await fetch(`/api/articles/${art.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => prev.filter((a) => a.id !== art.id));
        setDeleteModalOpen(false);
        setDeletingArticle(null);
      }
    } catch (e) {
      console.error('Failed to delete article:', e);
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

  // Available unique dates from publishedAt sorted descending
  const availableDates = useMemo(() => {
    const dateCounts: Record<string, number> = {};
    articles.forEach((a) => {
      if (a.publishedAt && a.publishedAt.trim()) {
        const val = a.publishedAt.trim();
        dateCounts[val] = (dateCounts[val] || 0) + 1;
      }
    });

    return Object.keys(dateCounts)
      .sort((a, b) => b.localeCompare(a))
      .map((dateStr) => ({
        value: dateStr,
        label: dateStr,
        count: dateCounts[dateStr],
      }));
  }, [articles]);

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const isPublic = art.isPublished ?? true;
      const matchesStatus =
        statusFilter === 'semua' ||
        (statusFilter === 'published' && isPublic) ||
        (statusFilter === 'draft' && !isPublic);

      const matchesLanding =
        landingFilter === 'semua' || (landingFilter === 'landing' && art.showOnLandingPage);

      const matchesCategory = selectedCategory === 'Semua' || art.category === selectedCategory;
      const matchesDate = !dateFilter || (art.publishedAt && art.publishedAt.includes(dateFilter));

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
  }, [articles, statusFilter, landingFilter, selectedCategory, dateFilter, search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('semua');
    setLandingFilter('semua');
    setSelectedCategory('Semua');
    setDateFilter('');
    setCurrentPage(1);
    syncFilterParams('semua', 'semua', 'Semua', '', '');
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
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategoryChange}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        availableDates={availableDates}
        categories={categoriesList}
        counts={statusCounts}
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
          setDeletingArticle(null);
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
