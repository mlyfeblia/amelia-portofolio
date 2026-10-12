'use client';

import React from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  CheckSquare,
  BookOpen,
} from 'lucide-react';

export interface ArticleEditorToolbarProps {
  onInsertFormatting: (prefix: string, suffix?: string, defaultText?: string) => void;
  onInsertBlockFormatting: (prefix: string, defaultText?: string) => void;
  onSelectAll: () => void;
  onOpenCheatsheet: () => void;
}

export function ArticleEditorToolbar({
  onInsertFormatting,
  onInsertBlockFormatting,
  onSelectAll,
  onOpenCheatsheet,
}: ArticleEditorToolbarProps) {
  return (
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
        onClick={() => onInsertFormatting('**', '**', 'teks tebal')}
        className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
        title="Tebal (**teks**)"
        aria-label="Tebal"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => onInsertFormatting('*', '*', 'teks miring')}
        className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
        title="Miring (*teks*)"
        aria-label="Miring"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => onInsertFormatting('<u>', '</u>', 'teks bergaris bawah')}
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
        onClick={() => onInsertBlockFormatting('## ', 'Subjudul Bagian')}
        className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
        title="Subjudul Utama (## )"
        aria-label="Subjudul H2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      {/* Heading 3 */}
      <button
        type="button"
        onClick={() => onInsertBlockFormatting('### ', 'Sub-bagian')}
        className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
        title="Sub-bagian (### )"
        aria-label="Sub-bagian H3"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </button>

      {/* Quote */}
      <button
        type="button"
        onClick={() => onInsertBlockFormatting('> ', 'Kutipan reflektif')}
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
        onClick={() => onInsertBlockFormatting('- ', 'Poin pertama')}
        className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
        title="Daftar Butir Poin (- )"
        aria-label="Butir Poin"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      {/* List Ordered */}
      <button
        type="button"
        onClick={() => onInsertBlockFormatting('1. ', 'Langkah pertama')}
        className="shrink-0 p-1.5 rounded-lg text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
        title="Daftar Penomoran (1. )"
        aria-label="Penomoran"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      {/* Link */}
      <button
        type="button"
        onClick={() => onInsertFormatting('[', '](https://alamat-web.com)', 'Nama Tautan')}
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
        onClick={onSelectAll}
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
        onClick={onOpenCheatsheet}
        className="ml-auto shrink-0 px-2 min-[340px]:px-2.5 py-1 text-[11px] font-semibold rounded-lg inline-flex items-center gap-1 sm:gap-1.5 bg-[var(--color-surface)] border border-[var(--color-accent-border)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors cursor-pointer shadow-2xs"
        title="Buka petunjuk format Markdown lengkap"
        aria-label="Petunjuk Format"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Petunjuk Format</span>
        <span className="hidden min-[340px]:inline sm:hidden">Panduan</span>
      </button>
    </div>
  );
}
