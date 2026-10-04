'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Article } from '@/types';
import { ArticleHeader } from '@/components/admin/articles/ArticleHeader';
import { ArticleFilters } from '@/components/admin/articles/ArticleFilters';
import { ArticleList } from '@/components/admin/articles/ArticleList';
import { ArticleFormModal } from '@/components/admin/articles/ArticleFormModal';
import { ArticleDeleteModal } from '@/components/admin/articles/ArticleDeleteModal';

export function AdminArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'published' | 'draft'>('semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Action States
  const [togglingId, setTogglingId] = useState<string | null>(null);
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
    articles.forEach((a) => {
      if (a.isPublished ?? true) {
        published++;
      } else {
        draft++;
      }
    });
    return {
      total: articles.length,
      published,
      draft,
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

      const matchesCategory = selectedCategory === 'Semua' || art.category === selectedCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.slug.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.excerpt.toLowerCase().includes(q) ||
        (art.tags && art.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [articles, statusFilter, selectedCategory, search]);

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
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categoriesList}
        counts={statusCounts}
      />

      <ArticleList
        articles={filteredArticles}
        loading={loading}
        togglingId={togglingId}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onTogglePublish={handleTogglePublish}
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
