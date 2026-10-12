'use client';

import React from 'react';
import { Eye, EyeOff, Star } from 'lucide-react';
import { ARTICLE_CATEGORIES } from '@/types';
import { TagChipsInput } from '../TagChipsInput';
import { Spinner } from '@/components/ui/Spinner';
import { formatIndonesianTitleCase, formatSentenceCase } from '@/lib/text-formatter';

export interface FormState {
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

export interface ArticleMetaFieldsProps {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  onTitleChange: (val: string) => void;
  onCategoryChange: (cat: string) => void;
  isTranslatingSlug: boolean;
}

export function ArticleMetaFields({
  formData,
  setFormData,
  onTitleChange,
  onCategoryChange,
  isTranslatingSlug,
}: ArticleMetaFieldsProps) {
  return (
    <>
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
          onClick={() =>
            setFormData((prev) => ({ ...prev, showOnLandingPage: !prev.showOnLandingPage }))
          }
          className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3 ${
            formData.showOnLandingPage
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-[var(--color-paper-muted)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)]'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Star
              className={`w-4 h-4 shrink-0 ${
                formData.showOnLandingPage
                  ? 'fill-amber-500 text-amber-600'
                  : 'text-[var(--color-ink-muted)]'
              }`}
            />
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, showOnLandingPage: e.target.checked }))
            }
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 shrink-0 cursor-pointer"
          />
        </div>
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
          onChange={(e) => onTitleChange(e.target.value)}
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
        <input type="hidden" name="slug" value={formData.slug} />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="block font-semibold text-[var(--color-ink)] mb-1">
          Kategori <span className="text-rose-500 font-bold ml-0.5">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => onCategoryChange(e.target.value)}
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
          onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
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
    </>
  );
}
