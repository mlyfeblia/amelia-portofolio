'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ExternalLink, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  RefreshCw,
  Edit3,
  X,
  Save,
  AlertCircle,
  Eye,
  FileEdit
} from 'lucide-react';
import { Article } from '@/types';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [editForm, setEditForm] = useState<{
    title: string;
    slug: string;
    category: string;
    readTime: string;
    excerpt: string;
    content: string;
    tags: string;
  }>({
    title: '',
    slug: '',
    category: '',
    readTime: '',
    excerpt: '',
    content: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadArticles = async () => {
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
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (editingArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [editingArticle]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingArticle) {
        closeEditModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingArticle]);

  const openEditModal = (art: Article) => {
    setEditingArticle(art);
    setActiveTab('edit');
    setEditForm({
      title: art.title,
      slug: art.slug,
      category: art.category,
      readTime: art.readTime,
      excerpt: art.excerpt,
      content: art.content,
      tags: (art.tags || []).join(', '),
    });
    setSaveSuccess(false);
    setSaveError('');
  };

  const closeEditModal = () => {
    setEditingArticle(null);
    setActiveTab('edit');
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    if (!editForm.title.trim()) {
      setSaveError('Judul artikel tidak boleh kosong.');
      return;
    }
    if (!editForm.slug.trim()) {
      setSaveError('Slug URL tidak boleh kosong.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const tagsArray = editForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: editForm.title.trim(),
        slug: editForm.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        category: editForm.category.trim(),
        readTime: editForm.readTime.trim(),
        excerpt: editForm.excerpt.trim(),
        content: editForm.content.trim(),
        tags: tagsArray,
      };

      const res = await fetch(`/api/articles/${editingArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan perubahan artikel.');
      }

      setArticles((prev) =>
        prev.map((a) => (a.id === editingArticle.id ? { ...a, ...payload } : a))
      );
      setSaveSuccess(true);
      setTimeout(() => {
        closeEditModal();
      }, 900);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Kelola Artikel &amp; Publikasi
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            Total {articles.length} artikel terbit. Anda dapat mengubah judul, isi, kategori, waktu baca, dan slug.
          </p>
        </div>

        <button
          onClick={loadArticles}
          disabled={loading}
          className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      {/* Editorial Standards Checklist */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--color-ink-muted)]">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
          <span>Judul H1 Ideal 10–14 Kata</span>
        </div>
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
          <span>Slug Bersih 3–5 Kata Bahasa Inggris</span>
        </div>
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
          <span>Paragraf Pendek 2–3 Kalimat</span>
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)]">
          Memuat artikel...
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)]">
          Belum ada artikel terbit.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-4 card-interactive"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[var(--color-accent)] px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
                      {art.category}
                    </span>
                    <span className="text-[var(--color-paper-border)]">&bull;</span>
                    <span className="text-[var(--color-ink-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                    <span className="text-[var(--color-paper-border)]">&bull;</span>
                    <span className="text-[var(--color-ink-muted)] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {art.publishedAt}
                    </span>
                  </div>

                  <h2
                    className="text-base sm:text-xl font-medium text-[var(--color-ink)] leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {art.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed line-clamp-2">
                    {art.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-start justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-paper-border)]">
                  <button
                    onClick={() => openEditModal(art)}
                    type="button"
                    className="btn-primary text-xs py-2 px-3.5 inline-flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah Artikel</span>
                  </button>

                  <Link
                    href={`/articles/${art.slug}`}
                    target="_blank"
                    className="btn-secondary text-xs py-2 px-3 inline-flex items-center justify-center gap-1"
                    title="Buka tampilan web"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Slug & Tags Footer */}
              <div className="pt-3 border-t border-[var(--color-paper-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)] font-mono text-[11px] overflow-hidden text-ellipsis">
                  <span className="shrink-0">Slug:</span>
                  <code className="px-2 py-0.5 rounded bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)] truncate max-w-[240px] sm:max-w-none">
                    /articles/{art.slug}
                  </code>
                </div>

                {art.tags && art.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {art.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[10px] text-[var(--color-ink-muted)]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── Edit Article Modal (Responsive Mobile Bottom-Sheet & Desktop Dialog) ── */}
      {editingArticle && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="w-full sm:max-w-3xl max-h-[92dvh] sm:max-h-[90vh] bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[var(--color-paper-border)] flex items-center justify-between gap-4 bg-[var(--color-surface)] shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3
                    className="text-lg sm:text-xl font-medium text-[var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Ubah Artikel
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    ID: {editingArticle.id}
                  </p>
                </div>
              </div>

              {/* View Toggle Tabs */}
              <div className="flex items-center gap-1 bg-[var(--color-paper)] p-1 rounded-xl border border-[var(--color-paper-border)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Formulir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Pratinjau</span>
                </button>
                <button
                  onClick={closeEditModal}
                  type="button"
                  className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer ml-1"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {activeTab === 'edit' ? (
              <form onSubmit={handleSaveArticle} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
                
                {saveSuccess && (
                  <div className="p-3 bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)] rounded-xl font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Artikel berhasil diperbarui dan tersimpan!</span>
                  </div>
                )}

                {saveError && (
                  <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block font-semibold text-[var(--color-ink)] mb-1">
                    Judul Artikel (H1)
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Judul artikel 10-14 kata..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                  />
                </div>

                {/* Slug & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[var(--color-ink)] mb-1">
                      Slug URL (Bahasa Inggris 3–5 kata)
                    </label>
                    <input
                      type="text"
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      placeholder="misal: finding-inner-peace-digital-era"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] font-mono text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-ink)] mb-1">
                      Kategori &amp; Rubrik
                    </label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="misal: Kesehatan Mental Islami"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Read Time & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[var(--color-ink)] mb-1">
                      Estimasi Waktu Baca
                    </label>
                    <input
                      type="text"
                      value={editForm.readTime}
                      onChange={(e) => setEditForm({ ...editForm, readTime: e.target.value })}
                      placeholder="misal: 5 menit baca"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-ink)] mb-1">
                      Tag (Pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="misal: CBT, Tazkiyatun Nafs, BKI"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block font-semibold text-[var(--color-ink)] mb-1">
                    Ringkasan / Excerpt Singkat
                  </label>
                  <textarea
                    rows={2}
                    value={editForm.excerpt}
                    onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
                    placeholder="Ringkasan 1-2 kalimat untuk preview card..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] resize-none text-xs sm:text-sm"
                  />
                </div>

                {/* Content (Markdown) */}
                <div>
                  <label className="block font-semibold text-[var(--color-ink)] mb-1">
                    Konten Lengkap Artikel (Format Markdown)
                  </label>
                  <textarea
                    rows={8}
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    placeholder="Tuliskan isi artikel..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] font-mono text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] leading-relaxed"
                  />
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
                    Gunakan <code>## Subjudul</code> untuk H2, <code>### Poin</code> untuk H3, <code>**teks**</code> untuk tebal, dan beri jarak baris ganda antar paragraf.
                  </p>
                </div>

                {/* Sticky Form Actions Footer */}
                <div className="pt-4 border-t border-[var(--color-paper-border)] flex items-center justify-end gap-3 sticky bottom-0 bg-[var(--color-surface)] pb-1">
                  <button
                    onClick={closeEditModal}
                    type="button"
                    className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                  </button>
                </div>

              </form>
            ) : (
              /* Preview Tab */
              <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-[var(--color-paper)]">
                <div className="space-y-2 pb-4 border-b border-[var(--color-paper-border)]">
                  <span className="font-semibold text-xs text-[var(--color-accent)] px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
                    {editForm.category || 'Kategori'}
                  </span>
                  <h1
                    className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {editForm.title || 'Judul Artikel'}
                  </h1>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    Waktu baca: {editForm.readTime || '5 menit'} &bull; Slug: /articles/{editForm.slug}
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {editForm.content.split(/\n\s*\n/).map((para, i) => {
                    const trimmed = para.trim();
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h2
                          key={i}
                          className="text-base sm:text-lg font-medium text-[var(--color-ink)] pt-3 pb-1"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {trimmed.replace(/^##\s+/, '')}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={i} className="text-sm sm:text-base font-semibold text-[var(--color-ink)] pt-2">
                          {trimmed.replace(/^###\s+/, '')}
                        </h3>
                      );
                    }
                    return <p key={i}>{trimmed}</p>;
                  })}
                </div>

                <div className="pt-4 border-t border-[var(--color-paper-border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Kembali ke Edit</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
