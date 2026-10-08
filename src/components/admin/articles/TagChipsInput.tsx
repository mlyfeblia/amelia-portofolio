'use client';

import React, { useState, useMemo } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { getDefaultTagsForCategory } from '@/data/category-tags';

export interface TagChipsInputProps {
  tagsString: string;
  onChange: (newTagsString: string) => void;
  category: string;
}

export function TagChipsInput({ tagsString, onChange, category }: TagChipsInputProps) {
  const [inputValue, setInputValue] = useState('');

  // Safely parse tagsString into a trimmed non-empty array
  const tags = useMemo(() => {
    return tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [tagsString]);

  const handleAddTag = (rawTag: string) => {
    const trimmed = rawTag.trim();
    if (!trimmed) return;

    // Check duplicate (case-insensitive)
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }

    const nextTags = [...tags, trimmed];
    onChange(nextTags.join(', '));
    setInputValue('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const nextTags = tags.filter((_, idx) => idx !== indexToRemove);
    onChange(nextTags.join(', '));
  };

  const handleResetToDefault = () => {
    const defaultTags = getDefaultTagsForCategory(category);
    onChange(defaultTags.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',');
      const toAdd = parts.slice(0, -1).map((p) => p.trim()).filter(Boolean);
      const remainder = parts[parts.length - 1];

      if (toAdd.length > 0) {
        const updated = [...tags];
        for (const t of toAdd) {
          if (!updated.some((existing) => existing.toLowerCase() === t.toLowerCase())) {
            updated.push(t);
          }
        }
        onChange(updated.join(', '));
      }
      setInputValue(remainder);
    } else {
      setInputValue(val);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {/* Header with counter and reset button */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="block text-xs sm:text-sm font-semibold text-[var(--color-ink)]">
          Tagar Artikel ({tags.length})
        </label>
        <button
          type="button"
          onClick={handleResetToDefault}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-[var(--color-accent-soft)]"
          title="Kembalikan 5 tagar bawaan sesuai kategori yang dipilih"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Kembalikan 5 Tagar Bawaan Kategori</span>
        </button>
      </div>

      <p className="text-[11px] text-[var(--color-ink-muted)]">
        5 tagar bawaan otomatis dari kategori, bisa ditambah atau dikurangi.
      </p>

      {/* Chip Pills Container */}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[var(--color-paper-muted)]/50 border border-[var(--color-paper-border)] min-h-[42px] items-center">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:border-rose-300 transition-colors"
            >
              <span className="truncate max-w-[150px] min-[360px]:max-w-[200px]">{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(index)}
                className="p-0.5 -mr-1 rounded hover:bg-rose-50 text-[var(--color-ink-muted)] hover:text-rose-600 transition-colors cursor-pointer"
                aria-label={`Hapus tagar ${tag}`}
                title={`Hapus tagar ${tag}`}
              >
                <X className="w-3 h-3 text-[var(--color-ink-muted)] hover:text-rose-600 cursor-pointer" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-[var(--color-paper-muted)]/40 border border-dashed border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)] text-center">
          Belum ada tagar. Tambahkan tagar baru di bawah atau klik tombol reset bawaan kategori.
        </div>
      )}

      {/* Input Row for adding new tags */}
      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ketik tagar baru lalu tekan Enter..."
          className="form-input flex-1 text-xs sm:text-sm py-1.5 min-w-0"
          maxLength={50}
        />
        <button
          type="button"
          onClick={() => handleAddTag(inputValue)}
          disabled={!inputValue.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-2xs cursor-pointer"
        >
          + Tambah
        </button>
      </div>
    </div>
  );
}
