'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnonymousMessage } from '@/types';
import { CounselingHeader } from '@/components/admin/counseling/CounselingHeader';
import { CounselingFilters } from '@/components/admin/counseling/CounselingFilters';
import { CounselingList } from '@/components/admin/counseling/CounselingList';
import { CounselingDeleteModal } from '@/components/admin/counseling/CounselingDeleteModal';

const CATEGORIES = [
  'Semua',
  'Quarter-Life Crisis',
  'Kecemasan & Ibadah',
  'Akademik & Burnout',
  'Keluarga & Relasi',
  'Umum',
];

export function AdminCounselingClient() {
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'unanswered' | 'answered'>('semua');
  const [visibilityFilter, setVisibilityFilter] = useState<'semua' | 'public' | 'private'>('semua');

  // Replying & Action States
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
  const handleSaveReply = async (id: string, text: string, isPublic: boolean) => {
    try {
      const res = await fetch(`/api/curhat/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: text, isPublic }),
      });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, answer: text, isAnswered: true, isPublic, answeredAt: new Date().toISOString() }
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
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/curhat/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: nextPublic }),
      });
      const data = await res.json();
      if (data.success) {
        setCurhatList((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, isPublic: nextPublic } : c))
        );
      }
    } catch (e) {
      console.error('Failed to toggle curhat privacy:', e);
    } finally {
      setTogglingId(null);
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
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.alias.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        (c.answer && c.answer.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesVisibility && matchesSearch;
    });
  }, [curhatList, categoryFilter, statusFilter, visibilityFilter, search]);

  const unansweredCount = curhatList.filter((c) => !c.isAnswered).length;
  const answeredCount = curhatList.filter((c) => c.isAnswered).length;
  const publicCount = curhatList.filter((c) => c.isPublic).length;
  const privateCount = curhatList.filter((c) => !c.isPublic).length;

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
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        visibilityFilter={visibilityFilter}
        onVisibilityChange={setVisibilityFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={CATEGORIES}
        counts={{
          total: curhatList.length,
          unanswered: unansweredCount,
          answered: answeredCount,
          publicCount,
          privateCount,
        }}
      />

      <CounselingList
        curhatList={filtered}
        loading={loading}
        replyingId={replyingId}
        togglingId={togglingId}
        onStartReply={(item) => setReplyingId(item.id)}
        onCancelReply={() => setReplyingId(null)}
        onSaveReply={handleSaveReply}
        onTogglePrivacy={handleTogglePrivacy}
        onDelete={(item) => {
          setDeleteItem(item);
          setDeleteModalOpen(true);
        }}
      />

      <CounselingDeleteModal
        item={deleteItem}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteItem(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
