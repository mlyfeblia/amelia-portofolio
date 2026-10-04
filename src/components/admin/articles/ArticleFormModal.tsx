'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Save, 
  FileEdit, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Article } from '@/types';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const POPULAR_CATEGORIES = [
  'Kesehatan Mental Islami',
  'Manajemen Emosi',
  'Hubungan & Keluarga',
  'Kepercayaan Diri',
  'Edukasi Konseling',
  'Self-Improvement'
];

interface FormState {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string;
  isPublished: boolean;
}

const INITIAL_FORM: FormState = {
  title: '',
  slug: '',
  category: 'Kesehatan Mental Islami',
  readTime: '5 menit baca',
  excerpt: '',
  content: '',
  tags: 'Kesehatan Mental, BKI, Self Growth',
  isPublished: true,
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getInitialFormState(mode: 'create' | 'edit', initialArticle: Article | null): FormState {
  if (mode === 'edit' && initialArticle) {
    return {
      title: initialArticle.title,
      slug: initialArticle.slug,
      category: initialArticle.category,
      readTime: initialArticle.readTime,
      excerpt: initialArticle.excerpt,
      content: initialArticle.content,
      tags: (initialArticle.tags || []).join(', '),
      isPublished: initialArticle.isPublished !== false,
    };
  }
  return INITIAL_FORM;
}

interface ArticleFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialArticle: Article | null;
  onClose: () => void;
  onSuccess: (savedArticle: Article, mode: 'create' | 'edit') => void;
}

function ArticleFormModalContent({
  mode,
  initialArticle,
  onClose,
  onSuccess,
}: Omit<ArticleFormModalProps, 'isOpen'>) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [formData, setFormData] = useState<FormState>(() =>
    getInitialFormState(mode, initialArticle)
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleTitleChange = (val: string) => {
    if (mode === 'create' && (!formData.slug || formData.slug === generateSlug(formData.title))) {
      setFormData((prev) => ({
        ...prev,
        title: val,
        slug: generateSlug(val),
      }));
    } else {
      setFormData((prev) => ({ ...prev, title: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setSaveError('Judul artikel wajib diisi.');
      return;
    }
    if (!formData.slug.trim()) {
      setSaveError('Slug URL wajib diisi.');
      return;
    }
    if (!formData.content.trim()) {
      setSaveError('Konten artikel tidak boleh kosong.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      category: formData.category.trim() || 'Kesehatan Mental Islami',
      readTime: formData.readTime.trim() || '5 menit baca',
      excerpt: formData.excerpt.trim() || formData.content.trim().slice(0, 160) + '...',
      content: formData.content.trim(),
      tags: tagsArray,
      isPublished: formData.isPublished,
    };

    try {
      if (mode === 'create') {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal menambahkan artikel.');
        }
        setSaveSuccess(true);
        setTimeout(() => {
          onSuccess(data.data, 'create');
          onClose();
        }, 600);
      } else if (mode === 'edit' && initialArticle) {
        const res = await fetch(`/api/articles/${initialArticle.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal menyimpan perubahan artikel.');
        }
        setSaveSuccess(true);
        setTimeout(() => {
          onSuccess({ ...initialArticle, ...payload }, 'edit');
          onClose();
        }, 600);
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full bg-[var(--color-surface)] sm:border sm:border-[var(--color-paper-border)] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Modal Header (Sticky) */}
      <div className="p-4 sm:p-5 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)] shrink-0 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3
              className="text-base sm:text-lg font-medium text-[var(--color-ink)] truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {mode === 'create' ? 'Tulis Artikel Baru' : 'Ubah Artikel'}
            </h3>
            <p className="text-[11px] text-[var(--color-ink-muted)] truncate">
              {mode === 'create'
                ? 'Edukasi dan refleksi bimbingan konseling Islam'
                : `ID: ${initialArticle?.id}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-[var(--color-paper)] p-0.5 rounded-xl border border-[var(--color-paper-border)]">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`chip-interactive px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Formulir</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`chip-interactive px-3 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="btn-interactive p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
              aria-label="Tutup formulir"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tabs (Full Width Segmented Control) */}
        <div className="sm:hidden flex items-center bg-[var(--color-paper)] p-1 rounded-xl border border-[var(--color-paper-border)]">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`chip-interactive flex-1 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs font-bold'
                : 'text-[var(--color-ink-muted)]'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Formulir Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`chip-interactive flex-1 py-1.5 text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[var(--color-surface)] text-[var(--color-accent)] shadow-xs font-bold'
                : 'text-[var(--color-ink-muted)]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Web</span>
          </button>
        </div>
      </div>

      {/* Modal Body */}
      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1 overscroll-contain">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Artikel berhasil disimpan dan disinkronkan ke basis data!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Visibility Toggle Card */}
            <div
              onClick={() => setFormData((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
              className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 ${
                formData.isPublished
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {formData.isPublished ? (
                  <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <EyeOff className="w-4 h-4 text-zinc-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="font-semibold block text-xs">
                    {formData.isPublished ? 'Status: Publikasikan ke Website' : 'Status: Simpan sebagai Draf'}
                  </span>
                  <span className="text-[11px] text-[var(--color-ink-muted)] block truncate">
                    {formData.isPublished
                      ? 'Artikel tayang langsung dan dapat dibaca di halaman /articles'
                      : 'Artikel tersembunyi dari pengunjung publik, hanya terlihat oleh admin'}
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-[var(--color-ink)] mb-1">
                Judul Artikel (H1) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={200}
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Menemukan Kedamaian Batin Melalui Doa dan Refleksi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                required
              />
            </div>

            {/* Slug & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="min-w-0">
                <label className="block font-semibold text-[var(--color-ink)] mb-1">
                  Slug URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="menemukan-kedamaian-batin"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] font-mono text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
                <p className="text-[10px] text-[var(--color-ink-muted)] mt-1 truncate">
                  /articles/{formData.slug || 'slug'}
                </p>
              </div>

              <div className="min-w-0">
                <label className="block font-semibold text-[var(--color-ink)] mb-1">
                  Kategori / Rubrik
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Pilih atau ketik kategori..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                />
                {/* Quick Category Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {POPULAR_CATEGORIES.slice(0, 4).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: c }))}
                      className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-paper)] hover:bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border border-[var(--color-paper-border)] cursor-pointer whitespace-nowrap"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Read Time & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="min-w-0">
                <label className="block font-semibold text-[var(--color-ink)] mb-1">
                  Estimasi Waktu Baca
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  placeholder="misal: 5 menit baca"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                />
              </div>

              <div className="min-w-0">
                <label className="block font-semibold text-[var(--color-ink)] mb-1">
                  Tagar (Pisahkan koma)
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Kecemasan, BKI, Self Love"
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-[var(--color-ink)]">
                  Ringkasan Singkat (Excerpt)
                </label>
                {formData.excerpt.length > 0 && (
                  <span className="text-[10px] text-[var(--color-ink-muted)]">
                    {formData.excerpt.length}/400
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                maxLength={400}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Tuliskan 1-2 kalimat pengantar artikel..."
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] resize-y min-h-[64px] max-h-[160px] text-xs sm:text-sm"
              />
            </div>

            {/* Content (Markdown) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-[var(--color-ink)]">
                  Konten Lengkap (Markdown) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-[var(--color-ink-muted)]">
                  ## Subjudul &bull; - Poin &bull; **Tebal**
                </span>
              </div>
              <textarea
                rows={7}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tuliskan narasi lengkap artikel di sini... (gunakan ## untuk Subjudul, - untuk poin-poin)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] font-mono text-xs text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] leading-relaxed resize-y min-h-[160px] sm:min-h-[220px]"
                required
              />
            </div>
          </div>

          {/* Sticky Form Actions Footer */}
          <div className="p-3.5 sm:p-4 border-t border-[var(--color-paper-border)] flex items-center justify-end gap-3 bg-[var(--color-surface)] shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
            <button
              onClick={onClose}
              type="button"
              className="btn-interactive h-11 sm:h-9 px-5 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-interactive h-11 sm:h-9 px-6 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap flex-1 sm:flex-initial"
            >
              {saving ? (
                <>
                  <Spinner size="xs" variant="white" label="Menyimpan artikel..." />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {mode === 'create'
                      ? formData.isPublished
                        ? 'Terbitkan Sekarang'
                        : 'Simpan Draf'
                      : 'Simpan Perubahan'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Preview Tab */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[var(--color-paper)]">
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
            <div className="space-y-2 pb-3 border-b border-[var(--color-paper-border)]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[var(--color-accent)] px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
                  {formData.category || 'Kategori'}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  formData.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {formData.isPublished ? 'Status: Publik' : 'Status: Draf'}
                </span>
              </div>
              <h1
                className="text-lg sm:text-2xl font-medium text-[var(--color-ink)] leading-snug"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formData.title || 'Judul Artikel'}
              </h1>
              <p className="text-xs text-[var(--color-ink-muted)]">
                Waktu baca: {formData.readTime || '5 menit baca'} &bull; Slug: /articles/{formData.slug || 'url'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {formData.content ? (
                formData.content.split(/\n\s*\n/).map((para, i) => {
                  const trimmed = para.trim();
                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2
                        key={i}
                        className="text-sm sm:text-base font-medium text-[var(--color-ink)] pt-2 pb-0.5"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {trimmed.replace(/^##\s+/, '')}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={i} className="text-xs sm:text-sm font-semibold text-[var(--color-ink)] pt-1">
                        {trimmed.replace(/^###\s+/, '')}
                      </h3>
                    );
                  }
                  return <p key={i}>{trimmed}</p>;
                })
              ) : (
                <p className="text-[var(--color-ink-muted)] italic">Belum ada konten artikel.</p>
              )}
            </div>
          </div>

          <div className="p-3.5 sm:p-4 border-t border-[var(--color-paper-border)] flex items-center justify-end gap-3 bg-[var(--color-surface)] shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
            <button
              onClick={onClose}
              type="button"
              className="h-11 sm:h-9 px-5 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className="h-11 sm:h-9 px-5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <FileEdit className="w-4 h-4" />
              <span>Kembali ke Formulir</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ArticleFormModal({
  isOpen,
  mode,
  initialArticle,
  onClose,
  onSuccess,
}: ArticleFormModalProps) {
  const mounted = useMounted();
  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({ isOpen });

  // Cache initialArticle so during exit transition the modal content doesn't flicker or lose state
  const [cachedArticle, setCachedArticle] = useState<Article | null>(initialArticle);
  if (initialArticle && initialArticle !== cachedArticle) {
    setCachedArticle(initialArticle);
  }
  const activeArticle = initialArticle ?? cachedArticle;

  // Lock body & document scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isRendered) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Dedicated Full-Screen Backdrop Layer */}
      <div
        className={cn(
          'fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity touch-none select-none',
          backdropClass
        )}
        aria-hidden="true"
        onClick={() => !isExiting && onClose()}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div
        className={cn(
          'relative z-10 w-full h-[100dvh] sm:h-auto sm:max-w-3xl sm:max-h-[90vh] flex flex-col pointer-events-auto',
          windowClass
        )}
      >
        <ArticleFormModalContent
          key={activeArticle?.id ?? 'create-new'}
          mode={mode}
          initialArticle={activeArticle}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>,
    document.body
  );
}
