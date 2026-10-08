'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { 
  X, 
  Save, 
  FileEdit, 
  Eye, 
  EyeOff,
  Star, 
  CheckCircle2, 
  AlertCircle,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  BookOpen,
  Upload,
  UploadCloud,
  ImageIcon,
  Trash2,
  Images,
  Check,
  RotateCcw,
  FolderArchive,
  CheckSquare,
  Globe,
} from 'lucide-react';
import { Article, ARTICLE_CATEGORIES } from '@/types';
import { CURATED_ARTICLE_IMAGES } from '@/data/curated-article-images';
import { getDefaultTagsForCategory } from '@/data/category-tags';
import { TagChipsInput } from './TagChipsInput';
import { generateEnglishArticleSlug } from '@/lib/slug-generator';
import { formatIndonesianTitleCase, formatSentenceCase } from '@/lib/text-formatter';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import { ArticleMarkdownRenderer } from '@/components/articles/ArticleMarkdownRenderer';
import { ArticleMarkdownCheatsheet } from './ArticleMarkdownCheatsheet';
import { ArticleDraftItem, saveDraft, useArticleDrafts } from '@/lib/draft-store';
import { ArticleDraftsModal } from './ArticleDraftsModal';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';

interface FormState {
  title: string;
  slug: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string;
  isPublished: boolean;
  showOnLandingPage: boolean;
  coverImage: string;
}

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
      tags: initialDraft.tags || getDefaultTagsForCategory(initialDraft.category || 'Kesehatan Mental Islami').join(', '),
      isPublished: false,
      showOnLandingPage: initialDraft.showOnLandingPage ?? false,
      coverImage: initialDraft.coverImage || getCuratedImageForCategory(initialDraft.category || 'Kesehatan Mental Islami'),
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
      tags: (initialArticle.tags && initialArticle.tags.length > 0)
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

  const storageKey = mode === 'edit' && initialArticle 
    ? `amel_article_draft_${initialArticle.id}` 
    : 'amel_article_draft_new';

  const [formData, setFormData] = useState<FormState>(() => {
    const base = getInitialFormState(mode, initialArticle, initialDraft);
    if (initialDraft) {
      return base;
    }
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && (parsed.title || parsed.content)) {
            return { ...base, ...parsed };
          }
        }
      } catch {
        // localStorage may fail in private mode
      }
    }
    return base;
  });

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

  // Cover image selector states (default active: 'gallery' with 9 choices)
  const [coverSourceTab, setCoverSourceTab] = useState<'gallery' | 'upload'>('gallery');
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCoverUploadError('Berkas harus berupa gambar (PNG, JPG, WebP, dll).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverUploadError('Ukuran gambar maksimal 5MB.');
      return;
    }

    setCoverUploadError('');
    setIsUploadingCover(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengunggah gambar');
      }

      // Uploaded image takes precedence
      setFormData((prev) => ({ ...prev, coverImage: data.url }));
    } catch (err: unknown) {
      setCoverUploadError(err instanceof Error ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return 'Draf tersimpan dimuat';
      } catch {
        // ignore
      }
    }
    return null;
  });

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

    // If edit mode and title is unchanged from original article, preserve initial slug
    if (mode === 'edit' && initialArticle && formattedTitle.trim() === initialArticle.title.trim()) {
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

    // In edit mode, if title matches original article title, preserve initial slug
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

      // Update tags if empty or equals the default tags of the previous category
      const prevDefaults = getDefaultTagsForCategory(prev.category);
      const currentTags = prev.tags.split(',').map((t) => t.trim()).filter(Boolean);
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

  // Content change auto-calculates reading time
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

      // Persist to database as draft as well if title & content are ready
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
      coverImage: draft.coverImage || getCuratedImageForCategory(draft.category || 'Kesehatan Mental Islami'),
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
      coverImage: formData.coverImage.trim() || undefined,
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
      {/* Modal Header (Sticky) */}
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
            <span className="truncate">Formulir<span className="hidden min-[340px]:inline"> Edit</span></span>
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
            <span className="truncate">Preview<span className="hidden min-[340px]:inline"> Web</span></span>
          </button>
        </div>
      </div>

      {/* Modal Body */}
      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden tab-content-enter">
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

            {/* Visibility & Landing Page Toggle Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Visibility Toggle Card */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 ${
                  formData.isPublished
                    ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent-border)] text-[var(--color-ink)]'
                    : 'bg-[var(--color-paper-muted)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {formData.isPublished ? (
                    <Eye className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[var(--color-ink-soft)] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-semibold block text-xs">
                      {formData.isPublished ? 'Status: Publik' : 'Status: Draf'}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-muted)] block truncate">
                      {formData.isPublished ? 'Tayang di /articles' : 'Hanya terlihat admin'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] shrink-0 cursor-pointer"
                />
              </div>

              {/* Landing Page Showcase Toggle Card */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, showOnLandingPage: !prev.showOnLandingPage }))}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 ${
                  formData.showOnLandingPage
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-[var(--color-paper-muted)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Star className={`w-4 h-4 shrink-0 ${formData.showOnLandingPage ? 'fill-amber-500 text-amber-600' : 'text-[var(--color-ink-muted)]'}`} />
                  <div className="min-w-0">
                    <span className="font-semibold block text-xs">
                      {formData.showOnLandingPage ? '★ Sorot di Beranda' : 'Tidak di Beranda'}
                    </span>
                    <span className="text-[11px] text-[var(--color-ink-muted)] block truncate">
                      Disorot langsung di beranda utama
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showOnLandingPage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, showOnLandingPage: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 shrink-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Foto Sampul Artikel (Cover Image) */}
            <div className="space-y-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--color-paper)]/70 border border-[var(--color-paper-border)]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <label className="block font-semibold text-[var(--color-ink)] text-xs sm:text-sm">
                      Foto Sampul Artikel
                    </label>
                  </div>
                  <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5">
                    Hanya dirender di dalam halaman artikel detail (tidak muncul di direktori /articles)
                  </p>
                </div>
                {formData.coverImage && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteCoverModalOpen(true)}
                    className="text-[11px] font-medium text-[var(--color-error)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Foto Sampul</span>
                  </button>
                )}
              </div>

              {/* Current Image Preview Banner */}
              {formData.coverImage && (
                <div className="relative aspect-video sm:aspect-21/9 w-full rounded-xl overflow-hidden border border-[var(--color-paper-border)] shadow-2xs bg-[var(--color-paper-muted)]/50 group">
                  <Image
                    src={formData.coverImage}
                    alt="Pratinjau Foto Sampul"
                    fill
                    className="object-cover"
                    unoptimized={formData.coverImage.startsWith('http')}
                    sizes="(max-width: 768px) 100vw, 700px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 sm:p-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-white/90 truncate font-mono max-w-[70%]">
                      {formData.coverImage}
                    </span>
                    <span className="text-[10px] bg-emerald-600/95 text-white font-semibold px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                      Foto Aktif
                    </span>
                  </div>
                </div>
              )}

              {/* Only 2 Source Tabs: Galeri Kurasi (Default) & Unggah / Drag & Drop */}
              <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-paper-border)] text-xs">
                <button
                  type="button"
                  onClick={() => setCoverSourceTab('gallery')}
                  className={cn(
                    'flex-1 py-1.5 px-1.5 min-[340px]:px-2 rounded-lg font-medium inline-flex items-center justify-center gap-1 min-[340px]:gap-1.5 transition-colors cursor-pointer text-center',
                    coverSourceTab === 'gallery'
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold shadow-2xs'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  )}
                >
                  <Images className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Galeri<span className="hidden min-[340px]:inline"> Kurasi (9 Pilihan)</span><span className="hidden min-[290px]:inline min-[340px]:hidden"> Kurasi</span></span>
                </button>
                <button
                  type="button"
                  onClick={() => setCoverSourceTab('upload')}
                  className={cn(
                    'flex-1 py-1.5 px-1.5 min-[340px]:px-2 rounded-lg font-medium inline-flex items-center justify-center gap-1 min-[340px]:gap-1.5 transition-colors cursor-pointer text-center',
                    coverSourceTab === 'upload'
                      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold shadow-2xs'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  )}
                >
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Unggah<span className="hidden min-[340px]:inline"> / Drag &amp; Drop</span></span>
                </button>
              </div>

              {/* Tab 1: Galeri Kurasi (9 Pilihan) */}
              {coverSourceTab === 'gallery' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CURATED_ARTICLE_IMAGES.map((img) => {
                      const isSelected = formData.coverImage === img.url;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, coverImage: img.url }))}
                          className={cn(
                            'group relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer flex flex-col justify-between',
                            isSelected
                              ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] bg-[var(--color-accent-soft)]/50 shadow-xs'
                              : 'border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] bg-[var(--color-surface)]'
                          )}
                        >
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-1.5 bg-[var(--color-paper-muted)]">
                            <Image
                              src={img.url}
                              alt={img.alt}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, 220px"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="px-1 pb-1 min-w-0">
                            <p className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                              {img.title}
                            </p>
                            <p className="text-[9px] text-[var(--color-ink-muted)] truncate">
                              {img.category}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[var(--color-ink-muted)] italic text-center">
                    Pilih salah satu dari 9 tema visual di atas untuk langsung menetapkannya sebagai sampul artikel.
                  </p>
                </div>
              )}

              {/* Tab 2: Unggah / Drag & Drop */}
              {coverSourceTab === 'upload' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(true);
                  }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'p-4 sm:p-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all',
                    isDraggingCover
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]/60 scale-[1.01]'
                      : 'border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-surface)]'
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  {isUploadingCover ? (
                    <div className="py-2 flex flex-col items-center gap-2">
                      <Spinner size="sm" variant="accent" label="Mengunggah foto..." />
                      <p className="text-xs text-[var(--color-ink-soft)] font-medium">
                        Mengunggah &amp; mengoptimalkan berkas WebP...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] mb-2 shadow-2xs">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-[var(--color-ink)]">
                        Seret &amp; lepas gambar di sini, atau <span className="text-[var(--color-accent)] underline">klik untuk memilih</span>
                      </p>
                      <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">
                        Mendukung PNG, JPG, WebP (Maks. 5MB &bull; Kompresi WebP otomatis)
                      </p>
                    </>
                  )}
                  {coverUploadError && (
                    <p className="text-[11px] text-[var(--color-error)] mt-2 font-medium">
                      {coverUploadError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold text-[var(--color-ink)] mb-1">
                Judul Artikel <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <input
                type="text"
                maxLength={200}
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={() => {
                  setFormData((prev) => ({
                    ...prev,
                    title: formatIndonesianTitleCase(prev.title),
                  }));
                }}
                placeholder="Contoh: Menemukan Kedamaian Batin Melalui Doa dan Refleksi"
                className="form-input text-xs sm:text-sm py-2"
                required
              />
              {formData.slug && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <p className="text-[10px] text-[var(--color-ink-muted)] font-mono truncate max-w-full">
                    Tautan publik: /articles/{formData.slug}
                  </p>
                  {isTranslatingSlug && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50/90 border border-amber-200/60 px-1.5 py-0.5 rounded font-mono shrink-0 animate-pulse">
                      <Spinner size="xs" className="w-2.5 h-2.5 text-amber-600" />
                      Menerjemahkan slug...
                    </span>
                  )}
                </div>
              )}
              {/* Slug is stored in state and passed as hidden input */}
              <input type="hidden" name="slug" value={formData.slug} />
            </div>

            {/* Category Dropdown & Hidden Read Time */}
            <div>
              <label className="block font-semibold text-[var(--color-ink)] mb-1">
                Kategori <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="form-input text-xs sm:text-sm py-2 cursor-pointer bg-[var(--color-surface)]"
                required
              >
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input type="hidden" name="readTime" value={formData.readTime} />
            </div>

            {/* Tags */}
            <div>
              <TagChipsInput
                tagsString={formData.tags}
                onChange={(newTags) => setFormData((prev) => ({ ...prev, tags: newTags }))}
                category={formData.category}
              />
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-[var(--color-ink)]">
                  Ringkasan Singkat (Kutipan) <span className="text-rose-500 font-bold ml-0.5">*</span>
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
                onBlur={() => {
                  setFormData((prev) => ({
                    ...prev,
                    excerpt: formatSentenceCase(prev.excerpt),
                  }));
                }}
                placeholder="Tuliskan 1-2 kalimat pengantar artikel..."
                className="form-input text-xs sm:text-sm py-2 resize-y min-h-[64px] max-h-[160px]"
                required
              />
            </div>

            {/* Content (Markdown) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="block font-semibold text-[var(--color-ink)]">
                    Konten Artikel (Markdown) <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--color-ink-soft)] font-medium">
                    Waktu baca: <strong className="text-[var(--color-accent)]">{formData.readTime}</strong> ({contentWordCount} kata)
                  </span>
                </div>
                <span className="text-[10px] text-[var(--color-ink-muted)] hidden sm:inline">
                  Sorot teks lalu klik tombol untuk format instan
                </span>
              </div>

              {/* Formatting Toolbar */}
              <div
                onWheel={(e) => {
                  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
                className="flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-t-xl border-b-0 select-none overflow-x-auto no-scrollbar scroll-smooth"
                role="toolbar"
                aria-label="Format Markdown Toolbar"
              >
                {/* Bold */}
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**', 'teks tebal')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Tebal (**teks**)"
                  aria-label="Tebal"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                {/* Italic */}
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*', 'teks miring')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Miring (*teks*)"
                  aria-label="Miring"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                {/* Underline */}
                <button
                  type="button"
                  onClick={() => insertFormatting('<u>', '</u>', 'teks bergaris bawah')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Garis Bawah (<u>teks</u>)"
                  aria-label="Garis Bawah"
                >
                  <UnderlineIcon className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-[var(--color-paper-border)] mx-0.5 shrink-0" aria-hidden="true" />

                {/* Heading 2 */}
                <button
                  type="button"
                  onClick={() => insertBlockFormatting('## ', 'Subjudul Bagian')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Subjudul Utama (## )"
                  aria-label="Subjudul H2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>

                {/* Heading 3 */}
                <button
                  type="button"
                  onClick={() => insertBlockFormatting('### ', 'Sub-bagian')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Sub-bagian (### )"
                  aria-label="Sub-bagian H3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>

                {/* Quote */}
                <button
                  type="button"
                  onClick={() => insertBlockFormatting('> ', 'Kutipan reflektif')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Kutipan (> )"
                  aria-label="Kutipan"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-[var(--color-paper-border)] mx-0.5 shrink-0" aria-hidden="true" />

                {/* List */}
                <button
                  type="button"
                  onClick={() => insertBlockFormatting('- ', 'Poin pertama')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Daftar Butir Poin (- )"
                  aria-label="Butir Poin"
                >
                  <List className="w-3.5 h-3.5" />
                </button>

                {/* List Ordered */}
                <button
                  type="button"
                  onClick={() => insertBlockFormatting('1. ', 'Langkah pertama')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Daftar Penomoran (1. )"
                  aria-label="Penomoran"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>

                {/* Link */}
                <button
                  type="button"
                  onClick={() => insertFormatting('[', '](https://alamat-web.com)', 'Nama Tautan')}
                  className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                  title="Sisipkan Tautan Web ([teks](url))"
                  aria-label="Tautan"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-[var(--color-paper-border)] mx-0.5 shrink-0" aria-hidden="true" />

                {/* Blok Semua */}
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="shrink-0 px-2 py-1 text-[11px] font-semibold rounded-lg inline-flex items-center gap-1 sm:gap-1.5 text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] shadow-2xs"
                  title="Pilih / Blok Seluruh Teks Konten (Ctrl+A)"
                  aria-label="Pilih / Blok Seluruh Teks Konten (Ctrl+A)"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
                  <span className="hidden min-[340px]:inline">Blok Semua</span>
                </button>

                {/* Cheatsheet Button */}
                <button
                  type="button"
                  onClick={() => setIsCheatsheetOpen(true)}
                  className="ml-auto shrink-0 px-2 min-[340px]:px-2.5 py-1 text-[11px] font-semibold rounded-lg inline-flex items-center gap-1 sm:gap-1.5 bg-[var(--color-surface)] border border-[var(--color-accent-border)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors cursor-pointer shadow-2xs"
                  title="Buka petunjuk format Markdown lengkap"
                  aria-label="Petunjuk Format"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Petunjuk Format</span>
                  <span className="hidden min-[340px]:inline sm:hidden">Panduan</span>
                </button>
              </div>

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
              className="btn-interactive h-9 px-2.5 min-[340px]:px-3.5 sm:px-4 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] hover:border-[var(--color-accent-border)] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-2xs flex-1 min-[340px]:flex-initial"
              title="Simpan tulisan ke Kotak Kumpulan Draf"
            >
              <FolderArchive className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
              <span>Simpan<span className="hidden min-[340px]:inline"> sebagai</span> Draf</span>
            </button>

            {/* Terbitkan Sekarang / Simpan Perubahan */}
            <button
              type="submit"
              disabled={saving}
              className="btn-interactive h-9 px-3.5 min-[340px]:px-4 sm:px-6 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap w-full min-[360px]:w-auto"
            >
              {saving ? (
                <>
                  <Spinner size="xs" variant="white" label="Menyimpan artikel..." />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 shrink-0" />
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[var(--color-paper)] tab-content-enter">
          <div className="p-3 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1 overscroll-contain">
            {/* Foto Sampul Pratinjau */}
            {formData.coverImage && (
              <div className="relative aspect-video sm:aspect-21/9 w-full rounded-2xl overflow-hidden mb-4 border border-[var(--color-paper-border)] shadow-xs bg-[var(--color-paper-muted)]/50">
                <Image
                  src={formData.coverImage}
                  alt={formData.title || 'Foto Sampul Artikel'}
                  fill
                  className="object-cover"
                  unoptimized={formData.coverImage.startsWith('http')}
                  sizes="(max-width: 768px) 100vw, 700px"
                />
              </div>
            )}

            <div className="space-y-2 pb-3 border-b border-[var(--color-paper-border)]">
              <h1
                className="text-lg sm:text-2xl font-medium text-[var(--color-ink)] leading-snug"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formData.title || 'Judul Artikel'}
              </h1>
              {formData.excerpt && (
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                  {(initialArticle?.publishedAt || 'Hari ini')} — {formData.excerpt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="font-semibold text-xs text-[var(--color-accent)]">
                  {formData.category || 'Kategori'}
                </span>
                <span className="text-[var(--color-paper-border)]">&bull;</span>
                <span className="text-xs text-[var(--color-ink-muted)]">
                  {formData.isPublished ? 'Publik' : 'Draf'}
                </span>
                {formData.showOnLandingPage && (
                  <>
                    <span className="text-[var(--color-paper-border)]">&bull;</span>
                    <span className="text-xs text-amber-700 inline-flex items-center gap-1 font-medium">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
                      <span>Beranda</span>
                    </span>
                  </>
                )}
                <span className="text-[var(--color-paper-border)]">&bull;</span>
                <span className="text-xs text-[var(--color-ink-muted)]">
                  {formData.readTime || '5 menit baca'}
                </span>
                <span className="text-[var(--color-paper-border)]">&bull;</span>
                <span className="text-xs text-[var(--color-ink-muted)] font-mono">
                  /articles/{formData.slug || 'url'}
                </span>
              </div>
            </div>

            {/* Canonical Article Markdown Preview */}
            <div className="pt-2 pb-6">
              {formData.content.trim() ? (
                <ArticleMarkdownRenderer content={formData.content} />
              ) : (
                <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] italic">
                  Belum ada konten artikel untuk ditampilkan di pratinjau.
                </p>
              )}
            </div>
          </div>

          <div className="p-2.5 min-[340px]:p-3.5 sm:p-4 border-t border-[var(--color-paper-border)] flex flex-wrap items-center justify-end gap-2 sm:gap-3 bg-[var(--color-surface)] shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
            <button
              onClick={onClose}
              type="button"
              className="h-9 sm:h-9 px-4 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer inline-flex items-center justify-center whitespace-nowrap flex-1 sm:flex-initial"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className="h-9 sm:h-9 px-4 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <FileEdit className="w-4 h-4 shrink-0" />
              <span>Kembali ke Formulir</span>
            </button>
          </div>
        </div>
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
        title="Hapus Foto Sampul Artikel?"
        description="Foto sampul ini akan dihilangkan dari artikel. Anda dapat memilih kembali dari galeri kurasi atau mengunggah foto baru kapan saja."
        confirmLabel="Ya, Hapus Sampul"
        variant="danger"
        itemDetail={
          formData.coverImage ? (
            <div className="text-xs text-[var(--color-ink-muted)] truncate">
              URL: <span className="font-mono">{formData.coverImage}</span>
            </div>
          ) : null
        }
      />

      {/* Konfirmasi Terbitkan / Simpan Artikel Modal */}
      <ConfirmDecisionModal
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={async () => {
          setShowSubmitConfirm(false);
          await handleSaveArticle();
        }}
        title={
          formData.isPublished
            ? (mode === 'edit' ? 'Simpan & Terbitkan Artikel?' : 'Terbitkan Artikel Baru?')
            : (mode === 'edit' ? 'Simpan Perubahan Draf?' : 'Simpan sebagai Draf?')
        }
        description={
          formData.isPublished
            ? 'Artikel ini akan langsung ditayangkan secara publik dan dapat dibaca oleh seluruh pengunjung website.'
            : 'Artikel ini akan disimpan sebagai draf privat di arsip pengelola dan belum dapat diakses oleh publik.'
        }
        confirmLabel={
          formData.isPublished
            ? (mode === 'edit' ? 'Ya, Simpan & Terbitkan' : 'Ya, Terbitkan Artikel')
            : 'Ya, Simpan Draf'
        }
        variant={formData.isPublished ? 'primary' : 'neutral'}
        icon={formData.isPublished ? <Globe className="w-5 h-5 text-[var(--color-accent)]" /> : <Save className="w-5 h-5 text-[var(--color-accent)]" />}
        loading={saving}
        itemDetail={
          <div className="space-y-1">
            <div className="font-semibold text-[var(--color-ink)] line-clamp-1">
              {formData.title}
            </div>
            <div className="text-[11px] text-[var(--color-ink-muted)] flex flex-wrap items-center gap-1.5">
              <span>Kategori: {formData.category}</span>
              <span>&bull;</span>
              <span>{formData.readTime || calculateReadTime(formData.content)}</span>
              {formData.showOnLandingPage && (
                <>
                  <span>&bull;</span>
                  <span className="text-amber-700 font-medium">★ Sorotan Beranda</span>
                </>
              )}
            </div>
          </div>
        }
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
      {/* Dedicated Full-Screen Backdrop Layer - Pure Transparent Blur */}
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
          'relative z-10 w-full h-[100dvh] sm:h-auto sm:max-w-3xl sm:max-h-[90vh] flex flex-col pointer-events-auto',
          windowClass
        )}
      >
        <ArticleFormModalContent
          key={initialDraft ? `draft-${initialDraft.id}` : activeArticle?.id ?? 'create-new'}
          mode={mode}
          initialArticle={activeArticle}
          initialDraft={initialDraft}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>,
    document.body
  );
}
