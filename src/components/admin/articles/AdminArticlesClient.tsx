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

export function AdminArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'published' | 'draft'>('semua');
  const [landingFilter, setLandingFilter] = useState<'semua' | 'landing'>('semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Sync filters from URL and sessionStorage on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('status') || sessionStorage.getItem('admin_articles_status');
      const l = params.get('landing') || sessionStorage.getItem('admin_articles_landing');
      const k = params.get('kategori') || sessionStorage.getItem('admin_articles_kategori');
      const q = params.get('q') || sessionStorage.getItem('admin_articles_q');

      if (s) setStatusFilter(s as 'semua' | 'published' | 'draft');
      if (l) setLandingFilter(l as 'semua' | 'landing');
      if (k) setSelectedCategory(k);
      if (q) setSearch(q);
    } catch {}
  }, []);

  const syncFilterParams = (
    s: 'semua' | 'published' | 'draft',
    l: 'semua' | 'landing',
    k: string,
    q: string
  ) => {
    try {
      if (s && s !== 'semua') sessionStorage.setItem('admin_articles_status', s);
      else sessionStorage.removeItem('admin_articles_status');

      if (l && l !== 'semua') sessionStorage.setItem('admin_articles_landing', l);
      else sessionStorage.removeItem('admin_articles_landing');

      if (k && k !== 'Semua') sessionStorage.setItem('admin_articles_kategori', k);
      else sessionStorage.removeItem('admin_articles_kategori');

      if (q.trim()) sessionStorage.setItem('admin_articles_q', q.trim());
      else sessionStorage.removeItem('admin_articles_q');

      const url = new URL(window.location.href);
      if (s && s !== 'semua') url.searchParams.set('status', s);
      else url.searchParams.delete('status');

      if (l && l !== 'semua') url.searchParams.set('landing', l);
      else url.searchParams.delete('landing');

      if (k && k !== 'Semua') url.searchParams.set('kategori', k);
      else url.searchParams.delete('kategori');

      if (q.trim()) url.searchParams.set('q', q.trim());
      else url.searchParams.delete('q');

      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    syncFilterParams(statusFilter, landingFilter, selectedCategory, val);
  };
  const handleStatusChange = (val: 'semua' | 'published' | 'draft') => {
    setStatusFilter(val);
    syncFilterParams(val, landingFilter, selectedCategory, search);
  };
  const handleLandingChange = (val: 'semua' | 'landing') => {
    setLandingFilter(val);
    syncFilterParams(statusFilter, val, selectedCategory, search);
  };
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    syncFilterParams(statusFilter, landingFilter, val, search);
  };

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

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
    setFormModalOpen(true);
  };

  const handleOpenEdit = (art: Article) => {
    setFormMode('edit');
    setEditingArticle(art);
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
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.slug.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesStatus && matchesLanding && matchesCategory && matchesSearch;
    });
  }, [articles, statusFilter, landingFilter, selectedCategory, search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('semua');
    setLandingFilter('semua');
    setSelectedCategory('Semua');
    syncFilterParams('semua', 'semua', 'Semua', '');
  };

  const hasActiveFilters = Boolean(
    search.trim() ||
    statusFilter !== 'semua' ||
    landingFilter !== 'semua' ||
    selectedCategory !== 'Semua'
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <ArticleHeader
        totalCount={articles.length}
        loading={loading}
        onRefresh={loadArticles}
        onCreateNew={handleOpenCreate}
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
        categories={categoriesList}
        counts={statusCounts}
      />

      <ArticleList
        articles={filteredArticles}
        loading={loading}
        togglingId={togglingId}
        togglingLandingId={togglingLandingId}
        search={search}
        statusFilter={statusFilter}
        selectedCategory={selectedCategory}
        landingFilter={landingFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onTogglePublish={handleTogglePublish}
        onToggleLanding={handleToggleLanding}
        onCreateNew={handleOpenCreate}
      />

      <ArticleFormModal
        isOpen={formModalOpen}
        mode={formMode}
        initialArticle={editingArticle}
        onClose={() => setFormModalOpen(false)}
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
    </div>
  );
}
