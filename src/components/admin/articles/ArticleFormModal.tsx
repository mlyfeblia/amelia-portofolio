'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  FileEdit,
  Eye,
  CheckCircle2,
  AlertCircle,
  FolderArchive,
  RotateCcw,
} from 'lucide-react';
import { Article } from '@/types';
import { CURATED_ARTICLE_IMAGES } from '@/data/curated-article-images';
import { getDefaultTagsForCategory } from '@/data/category-tags';
import { generateEnglishArticleSlug } from '@/lib/slug-generator';
import { formatIndonesianTitleCase } from '@/lib/text-formatter';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import { ArticleMarkdownCheatsheet } from './ArticleMarkdownCheatsheet';
import { ArticleDraftItem, saveDraft, useArticleDrafts } from '@/lib/draft-store';
import { ArticleDraftsModal } from './ArticleDraftsModal';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';
import {
  ArticleMetaFields,
  FormState,
} from './form/ArticleMetaFields';
import { ArticleCoverPicker } from './form/ArticleCoverPicker';
import { ArticleEditorToolbar } from './form/ArticleEditorToolbar';
import { ArticlePreviewTab } from './form/ArticlePreviewTab';

function getCuratedImageForCategory(category: string): string {
  const direct = CURATED_ARTICLE_IMAGES.find(
    (img) => img.category.toLowerCase() === category.toLowerCase()
  );
  if (direct) return direct.url;

  if (category.includes('Spiritual') || category.includes('Pengembangan')) {
    const spiritual = CURATED_ARTICLE_IMAGES.find((img) => img.id === 'mindfulness-islamic');
    if (spiritual) return spiritual.url;
  }
  if (category.includes('Cyber') || category.includes('Sebaya')) {
    const peer = CURATED_ARTICLE_IMAGES.find(
      (img) => img.id === 'peer-listening' || img.id === 'counseling'
    );
    if (peer) return peer.url;
  }
  if (category.includes('Quarter-Life') || category.includes('Growth')) {
    const growth = CURATED_ARTICLE_IMAGES.find(
      (img) => img.id === 'future-hope' || img.id === 'self-growth'
    );
    if (growth) return growth.url;
  }
  return CURATED_ARTICLE_IMAGES[0]?.url || '/images/articles/mental-health.webp';
}

function calculateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} menit baca`;
}

const INITIAL_FORM: FormState = {
  title: '',
  slug: '',
  category: 'Kesehatan Mental Islami',
  readTime: '1 menit baca',
  excerpt: '',
  content: '',
  tags: getDefaultTagsForCategory('Kesehatan Mental Islami').join(', '),
  isPublished: true,
  showOnLandingPage: false,
  coverImage: getCuratedImageForCategory('Kesehatan Mental Islami'),
};

function getInitialFormState(
  mode: 'create' | 'edit',
  initialArticle: Article | null,
  initialDraft?: ArticleDraftItem | null
): FormState {
  if (initialDraft) {
    return {
      title: initialDraft.title,
      slug: initialDraft.slug || generateEnglishArticleSlug(initialDraft.title),
      category: initialDraft.category || 'Kesehatan Mental Islami',
      readTime: initialDraft.readTime || '1 menit baca',
      excerpt: initialDraft.excerpt,
      content: initialDraft.content,
      tags:
        initialDraft.tags ||
        getDefaultTagsForCategory(initialDraft.category || 'Kesehatan Mental Islami').join(', '),
      isPublished: false,
      showOnLandingPage: initialDraft.showOnLandingPage ?? false,
      coverImage:
        initialDraft.coverImage ||
        getCuratedImageForCategory(initialDraft.category || 'Kesehatan Mental Islami'),
    };
  }
  if (mode === 'edit' && initialArticle) {
    return {
      title: initialArticle.title,
      slug: initialArticle.slug,
      category: initialArticle.category,
      readTime: initialArticle.readTime,
      excerpt: initialArticle.excerpt,
      content: initialArticle.content,
      tags:
        initialArticle.tags && initialArticle.tags.length > 0
          ? initialArticle.tags.join(', ')
          : getDefaultTagsForCategory(initialArticle.category).join(', '),
      isPublished: initialArticle.isPublished !== false,
      showOnLandingPage: initialArticle.showOnLandingPage ?? false,
      coverImage: initialArticle.coverImage || getCuratedImageForCategory(initialArticle.category),
    };
  }
  return INITIAL_FORM;
}

export interface ArticleFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialArticle: Article | null;
  initialDraft?: ArticleDraftItem | null;
  onClose: () => void;
  onSuccess: (savedArticle: Article, mode: 'create' | 'edit') => void;
}

function ArticleFormModalContent({
  mode,
  initialArticle,
  initialDraft,
  onClose,
  onSuccess,
}: Omit<ArticleFormModalProps, 'isOpen'>) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeDraftId, setActiveDraftId] = useState<string | null>(initialDraft?.id || null);
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [draftToast, setDraftToast] = useState<string | null>(null);

  const savedDrafts = useArticleDrafts();

  const storageKey =
    mode === 'edit' && initialArticle
      ? `amel_article_draft_${initialArticle.id}`
      : 'amel_article_draft_new';

  const [formData, setFormData] = useState<FormState>(() =>
    getInitialFormState(mode, initialArticle, initialDraft)
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteCoverModalOpen, setIsDeleteCoverModalOpen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isTranslatingSlug, setIsTranslatingSlug] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const contentWordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const isRestoredRef = useRef(false);

  // Restore saved draft safely on mount post-hydration
  useEffect(() => {
    if (initialDraft) {
      isRestoredRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && (parsed.title || parsed.content)) {
            setFormData((prev) => ({ ...prev, ...parsed }));
            setLastSavedTime('Draf tersimpan dimuat');
          }
        }
      } catch {
        // localStorage may fail in private mode
      }
      isRestoredRef.current = true;
    }, 0);

    return () => clearTimeout(timer);
  }, [initialDraft, storageKey]);

  const insertFormatting = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = formData.content;
    const selectedText = currentValue.substring(start, end);

    const textToWrap = selectedText || defaultText;
    const replacement = `${prefix}${textToWrap}${suffix}`;

    const newContent =
      currentValue.substring(0, start) + replacement + currentValue.substring(end);
    const calculatedReadTime = calculateReadTime(newContent);

    setFormData((prev) => ({ ...prev, content: newContent, readTime: calculatedReadTime }));

    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      contentRef.current.focus();
      if (selectedText) {
        contentRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        );
      } else {
        contentRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + defaultText.length
        );
      }
    });
  };

  const insertBlockFormatting = (prefix: string, defaultText = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = formData.content;
    const selectedText = currentValue.substring(start, end);

    const needsLeadingNewline = start > 0 && currentValue[start - 1] !== '\n';
    const cleanPrefix = needsLeadingNewline ? `\n\n${prefix}` : prefix;

    const textToWrap = selectedText || defaultText;
    const replacement = `${cleanPrefix}${textToWrap}\n`;

    const newContent =
      currentValue.substring(0, start) + replacement + currentValue.substring(end);
    const calculatedReadTime = calculateReadTime(newContent);

    setFormData((prev) => ({ ...prev, content: newContent, readTime: calculatedReadTime }));

    requestAnimationFrame(() => {
      if (!contentRef.current) return;
      contentRef.current.focus();
      const selectionStartPos = start + cleanPrefix.length;
      contentRef.current.setSelectionRange(
        selectionStartPos,
        selectionStartPos + textToWrap.length
      );
    });
  };

  const handleSelectAll = () => {
    if (!contentRef.current) return;
    contentRef.current.focus();
    contentRef.current.select();
  };

  // Debounced autosave to localStorage (800ms)
  useEffect(() => {
    if (!isRestoredRef.current) return;
    const timer = setTimeout(() => {
      try {
        if (formData.title.trim() || formData.content.trim()) {
          localStorage.setItem(storageKey, JSON.stringify(formData));
          const now = new Intl.DateTimeFormat('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
          }).format(new Date());
          setLastSavedTime(now);

          // If working on an active draft from Kotak Draf, sync it
          if (activeDraftId) {
            saveDraft({
              id: activeDraftId,
              title: formData.title.trim(),
              slug: formData.slug.trim(),
              category: formData.category,
              readTime: formData.readTime,
              excerpt: formData.excerpt.trim(),
              content: formData.content.trim(),
              tags: formData.tags.trim(),
              coverImage: formData.coverImage,
              showOnLandingPage: formData.showOnLandingPage,
            });
          }
        } else {
          localStorage.removeItem(storageKey);
          setLastSavedTime(null);
        }
      } catch {
        // ignore storage errors
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData, storageKey, activeDraftId]);

  // Real-time title edit auto-formats Title Case & provides synchronous fallback slug
  const handleTitleChange = (val: string) => {
    const formattedTitle = formatIndonesianTitleCase(val);

    if (
      mode === 'edit' &&
      initialArticle &&
      formattedTitle.trim() === initialArticle.title.trim()
    ) {
      setFormData((prev) => ({
        ...prev,
        title: formattedTitle,
        slug: initialArticle.slug,
      }));
      return;
    }

    const autoSlug = generateEnglishArticleSlug(formattedTitle);
    setFormData((prev) => ({
      ...prev,
      title: formattedTitle,
      slug: autoSlug || prev.slug,
    }));
  };

  // Debounced pure English slug translation (450ms) via /api/translate
  useEffect(() => {
    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      return;
    }

    if (mode === 'edit' && initialArticle && trimmedTitle === initialArticle.title.trim()) {
      return;
    }

    let isMounted = true;

    const timer = setTimeout(async () => {
      setIsTranslatingSlug(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: trimmedTitle }),
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && data.success && data.slug) {
            setFormData((prev) => {
              if (prev.title.trim() === trimmedTitle) {
                return { ...prev, slug: data.slug };
              }
              return prev;
            });
          }
        }
      } catch {
        // Fallback synchronous slug is already present
      } finally {
        if (isMounted) {
          setIsTranslatingSlug(false);
        }
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [formData.title, mode, initialArticle]);

  // Category change auto pre-selects curated image if no custom cover is set
  const handleCategoryChange = (newCategory: string) => {
    setFormData((prev) => {
      const isCuratedOrEmpty =
        !prev.coverImage || CURATED_ARTICLE_IMAGES.some((img) => img.url === prev.coverImage);
      const nextCover = isCuratedOrEmpty ? getCuratedImageForCategory(newCategory) : prev.coverImage;

      const prevDefaults = getDefaultTagsForCategory(prev.category);
      const currentTags = prev.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const isDefaultTags =
        currentTags.length === prevDefaults.length &&
        currentTags.every((t, i) => t.toLowerCase() === prevDefaults[i].toLowerCase());

      const nextTags =
        !prev.tags.trim() || isDefaultTags
          ? getDefaultTagsForCategory(newCategory).join(', ')
          : prev.tags;

      return {
        ...prev,
        category: newCategory,
        coverImage: nextCover,
        tags: nextTags,
      };
    });
  };

  const handleContentChange = (val: string) => {
    const calculatedReadTime = calculateReadTime(val);
    setFormData((prev) => ({
      ...prev,
      content: val,
      readTime: calculatedReadTime,
    }));
  };

  const handleSaveAsDraft = async () => {
    try {
      const saved = saveDraft({
        id: activeDraftId || undefined,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category: formData.category,
        readTime: formData.readTime,
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        tags: formData.tags.trim(),
        coverImage: formData.coverImage,
        showOnLandingPage: formData.showOnLandingPage,
      });

      setActiveDraftId(saved.id);

      const now = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(new Date());
      setDraftToast(`Draf tersimpan di Kotak Draf pk ${now}`);
      setTimeout(() => setDraftToast(null), 3500);

      if (formData.title.trim() && formData.content.trim()) {
        try {
          await handleSaveArticle(false);
        } catch {
          // Local draft is safely preserved
        }
      }
    } catch {
      setDraftToast('Gagal menyimpan ke Kotak Draf.');
    }
  };

  const handleSelectDraft = (draft: ArticleDraftItem) => {
    setFormData({
      title: draft.title,
      slug: draft.slug || generateEnglishArticleSlug(draft.title),
      category: draft.category || 'Kesehatan Mental Islami',
      readTime: draft.readTime || calculateReadTime(draft.content),
      excerpt: draft.excerpt,
      content: draft.content,
      tags: draft.tags,
      isPublished: false,
      showOnLandingPage: draft.showOnLandingPage,
      coverImage:
        draft.coverImage ||
        getCuratedImageForCategory(draft.category || 'Kesehatan Mental Islami'),
    });
    setActiveDraftId(draft.id);
    setDraftToast(`Draf "${draft.title || 'Tanpa Judul'}" dimuat ke editor.`);
    setTimeout(() => setDraftToast(null), 3000);
  };

  const handleNewDraft = () => {
    setFormData(INITIAL_FORM);
    setActiveDraftId(null);
    setDraftToast('Memulai formulir draf baru.');
    setTimeout(() => setDraftToast(null), 2500);
  };

  const handleResetDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      setFormData(getInitialFormState(mode, initialArticle, initialDraft));
      setLastSavedTime(null);
    } catch {}
    setIsResetConfirmOpen(false);
  };

  const handleSaveArticle = async (publishOverride?: boolean) => {
    const isPublish = publishOverride !== undefined ? publishOverride : formData.isPublished;

    if (!formData.title.trim()) {
      setSaveError('Judul artikel wajib diisi.');
      return;
    }
    let activeSlug = formData.slug.trim();
    if (!activeSlug) {
      activeSlug = generateEnglishArticleSlug(formData.title.trim());
    }
    if (!activeSlug) {
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
      slug: activeSlug,
      category: formData.category.trim() || 'Kesehatan Mental Islami',
      readTime: formData.readTime.trim() || calculateReadTime(formData.content),
      excerpt: formData.excerpt.trim() || formData.content.trim().slice(0, 160) + '...',
      content: formData.content.trim(),
      tags: tagsArray,
      isPublished: isPublish,
      showOnLandingPage: formData.showOnLandingPage,
      coverImage: formData.coverImage,
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
        try {
          localStorage.removeItem(storageKey);
        } catch {}
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
        try {
          localStorage.removeItem(storageKey);
        } catch {}
        setSaveSuccess(true);
        setTimeout(() => {
          onSuccess({ ...initialArticle, ...payload, isPublished: isPublish }, 'edit');
          onClose();
        }, 600);
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setSaveError('Judul artikel wajib diisi.');
      return;
    }
    let activeSlug = formData.slug.trim();
    if (!activeSlug) {
      activeSlug = generateEnglishArticleSlug(formData.title.trim());
    }
    if (!activeSlug) {
      setSaveError('Slug URL wajib diisi.');
      return;
    }
    if (!formData.content.trim()) {
      setSaveError('Konten artikel tidak boleh kosong.');
      return;
    }
    setSaveError('');
    setShowSubmitConfirm(true);
  };

  return (
    <div className="w-full h-full bg-[var(--color-surface)] sm:border sm:border-[var(--color-paper-border)] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
      {/* Modal Header */}
      <div className="p-3 min-[340px]:p-3.5 sm:p-5 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)] shrink-0 space-y-2 min-[340px]:space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between gap-2 min-[340px]:gap-2.5 sm:gap-3">
          <div className="min-w-0">
            <h3
              className="text-sm min-[340px]:text-base sm:text-lg font-medium text-[var(--color-ink)] truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {mode === 'create' ? 'Tulis Artikel Baru' : 'Ubah Artikel'}
            </h3>
            <p className="text-[10px] min-[340px]:text-[11px] text-[var(--color-ink-muted)] truncate">
              {activeDraftId
                ? 'Sedang mengedit dari Kotak Draf'
                : mode === 'create'
                ? 'Edukasi dan refleksi bimbingan konseling Islam'
                : `ID: ${initialArticle?.id}`}
            </p>
          </div>

          <div className="flex items-center gap-1 min-[340px]:gap-1.5 sm:gap-2 shrink-0">
            {/* Kotak Draf Button */}
            <button
              type="button"
              onClick={() => setIsDraftsModalOpen(true)}
              className="btn-interactive inline-flex items-center gap-1 sm:gap-1.5 px-2 min-[340px]:px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-all cursor-pointer shadow-2xs"
              title="Buka Kotak Kumpulan Draf Artikel"
            >
              <FolderArchive className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
              <span>Draf</span>
              {savedDrafts.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  {savedDrafts.length}
                </span>
              )}
            </button>

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
              className="btn-interactive p-1.5 sm:p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer"
              aria-label="Tutup formulir"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
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
            <span className="truncate">Formulir Edit</span>
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
            <span className="truncate">Preview Web</span>
          </button>
        </div>
      </div>

      {/* Modal Body */}
      {activeTab === 'edit' ? (
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden tab-content-enter"
        >
          <div className="p-3 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs sm:text-sm flex-1 overscroll-contain">
            {draftToast && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{draftToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftToast(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)] rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-accent)]" />
                <span>Artikel berhasil disimpan dan disinkronkan ke basis data!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-[var(--color-error-soft)] text-[var(--color-error)] border border-[var(--color-error-border)] rounded-xl font-medium flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Autosave Status Banner & Reset Draft */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {lastSavedTime ? (
                    <span className="text-emerald-700 font-medium">
                      {lastSavedTime.includes(':')
                        ? `Draf tersimpan otomatis pk ${lastSavedTime}`
                        : lastSavedTime}
                    </span>
                  ) : (
                    <span>Autosave aktif (perubahan disimpan lokal otomatis)</span>
                  )}
                </span>
              </div>
              {lastSavedTime && (
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="text-[11px] text-[var(--color-error)] hover:underline cursor-pointer inline-flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Draf</span>
                </button>
              )}
            </div>

            {/* Subcomponent: ArticleMetaFields */}
            <ArticleMetaFields
              formData={formData}
              setFormData={setFormData}
              onTitleChange={handleTitleChange}
              onCategoryChange={handleCategoryChange}
              isTranslatingSlug={isTranslatingSlug}
            />

            {/* Subcomponent: ArticleCoverPicker */}
            <ArticleCoverPicker
              coverImage={formData.coverImage}
              onSelectCoverImage={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
              onOpenDeleteModal={() => setIsDeleteCoverModalOpen(true)}
            />

            {/* Content (Markdown) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="block font-semibold text-[var(--color-ink)]">
                    Konten Artikel (Markdown) <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--color-ink-soft)] font-medium">
                    Waktu baca:{' '}
                    <strong className="text-[var(--color-accent)]">{formData.readTime}</strong> (
                    {contentWordCount} kata)
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-ink-muted)] hidden sm:inline">
                  Sorot teks lalu klik tombol untuk format instan
                </span>
              </div>

              {/* Subcomponent: ArticleEditorToolbar */}
              <ArticleEditorToolbar
                onInsertFormatting={insertFormatting}
                onInsertBlockFormatting={insertBlockFormatting}
                onSelectAll={handleSelectAll}
                onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
              />

              <textarea
                ref={contentRef}
                rows={8}
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Tuliskan narasi lengkap artikel di sini... (tekan Enter untuk baris baru, gunakan tombol toolbar di atas untuk memformat teks)"
                className="form-input font-sans text-xs sm:text-sm text-[var(--color-ink)] py-2.5 leading-relaxed resize-y min-h-[180px] sm:min-h-[250px] rounded-t-none border-t-[var(--color-paper-border)] focus:border-[var(--color-accent)]"
                required
              />
            </div>
          </div>

          {/* Sticky Form Actions Footer */}
          <div className="p-2.5 min-[340px]:p-3 sm:p-4 border-t border-[var(--color-paper-border)] flex flex-wrap items-center justify-end gap-1.5 min-[340px]:gap-2 sm:gap-3 bg-[var(--color-surface)] shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
            <button
              onClick={onClose}
              type="button"
              className="btn-interactive h-9 px-3 sm:px-4 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center whitespace-nowrap flex-1 min-[340px]:flex-initial"
            >
              Batal
            </button>

            {/* Simpan sebagai Draf */}
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={saving}
              className="btn-interactive h-9 px-2.5 sm:px-3.5 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap flex-1 min-[340px]:flex-initial shadow-2xs disabled:opacity-50"
              title="Simpan draf artikel ke Kotak Draf"
            >
              <FolderArchive className="w-3.5 h-3.5 shrink-0" />
              <span>Simpan Draf</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="btn-interactive h-9 px-3.5 sm:px-5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs active:scale-98 flex-1 min-[340px]:flex-initial"
            >
              {saving ? (
                <>
                  <Spinner size="xs" variant="white" label="Menyimpan..." />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 shrink-0" />
                  <span>{mode === 'create' ? 'Terbitkan Artikel' : 'Simpan Perubahan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Subcomponent: ArticlePreviewTab */
        <ArticlePreviewTab
          formData={formData}
          publishedAt={initialArticle?.publishedAt}
          onClose={onClose}
          onBackToEdit={() => setActiveTab('edit')}
        />
      )}

      {/* Cheatsheet Modal Guide */}
      <ArticleMarkdownCheatsheet
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
        onInsertExample={(example) => insertFormatting('\n' + example + '\n', '', '')}
      />

      {/* Kotak Kumpulan Draf Modal */}
      <ArticleDraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        onSelectDraft={handleSelectDraft}
        onNewDraft={handleNewDraft}
        currentDraftId={activeDraftId}
      />

      {/* Konfirmasi Reset Draf Modal */}
      <ConfirmDecisionModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetDraft}
        title="Hapus dan Reset Draf Lokal?"
        description="Semua perubahan teks, kategori, dan foto pada draf ini akan dihapus dan dikembalikan ke kondisi awal."
        confirmLabel="Ya, Reset Draf"
        variant="danger"
      />

      {/* Konfirmasi Hapus Foto Sampul Modal */}
      <ConfirmDecisionModal
        isOpen={isDeleteCoverModalOpen}
        onClose={() => setIsDeleteCoverModalOpen(false)}
        onConfirm={() => {
          setFormData((prev) => ({ ...prev, coverImage: '' }));
          setIsDeleteCoverModalOpen(false);
        }}
        title="Hapus Foto Sampul?"
        description="Foto sampul artikel ini akan dihapus dari tampilan artikel."
        confirmLabel="Ya, Hapus"
        variant="danger"
      />

      {/* Konfirmasi Submit Modal */}
      <ConfirmDecisionModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={async () => {
          setShowSubmitConfirm(false);
          await handleSaveArticle();
        }}
        title={mode === 'create' ? 'Terbitkan Artikel Baru?' : 'Simpan Perubahan Artikel?'}
        description={
          mode === 'create'
            ? `Artikel "${formData.title}" akan diterbitkan dan disinkronkan ke basis data.`
            : `Perubahan pada artikel "${formData.title}" akan disimpan ke basis data.`
        }
        confirmLabel={mode === 'create' ? 'Ya, Terbitkan' : 'Ya, Simpan'}
        variant="accent"
      />
    </div>
  );
}

export function ArticleFormModal({
  isOpen,
  mode,
  initialArticle,
  initialDraft,
  onClose,
  onSuccess,
}: ArticleFormModalProps) {
  const mounted = useMounted();
  const { isRendered, backdropClass, windowClass } = useModalAnimation({ isOpen });

  if (!mounted || !isRendered) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'fixed inset-0 bg-transparent backdrop-blur-md touch-none select-none pointer-events-auto',
          backdropClass
        )}
        aria-hidden="true"
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      <div
        className={cn(
          'relative z-10 w-full sm:max-w-4xl h-full sm:h-[90vh] flex flex-col pointer-events-auto my-auto select-text',
          windowClass
        )}
      >
        <ArticleFormModalContent
          mode={mode}
          initialArticle={initialArticle}
          initialDraft={initialDraft}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>,
    document.body
  );
}
