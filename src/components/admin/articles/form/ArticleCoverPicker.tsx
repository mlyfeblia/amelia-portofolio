'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  ImageIcon,
  Trash2,
  Images,
  Upload,
  Check,
  UploadCloud,
} from 'lucide-react';
import { CURATED_ARTICLE_IMAGES } from '@/data/curated-article-images';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export interface ArticleCoverPickerProps {
  coverImage: string;
  onSelectCoverImage: (url: string) => void;
  onOpenDeleteModal: () => void;
}

export function ArticleCoverPicker({
  coverImage,
  onSelectCoverImage,
  onOpenDeleteModal,
}: ArticleCoverPickerProps) {
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

      onSelectCoverImage(data.url);
    } catch (err: unknown) {
      setCoverUploadError(err instanceof Error ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
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
        {coverImage && (
          <button
            type="button"
            onClick={onOpenDeleteModal}
            className="text-[11px] font-medium text-[var(--color-error)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Hapus Foto Sampul</span>
          </button>
        )}
      </div>

      {/* Current Image Preview Banner */}
      {coverImage && (
        <div className="relative aspect-video sm:aspect-21/9 w-full rounded-xl overflow-hidden border border-[var(--color-paper-border)] shadow-2xs bg-[var(--color-paper-muted)]/50 group">
          <Image
            src={coverImage}
            alt="Pratinjau Foto Sampul"
            fill
            className="object-cover"
            unoptimized={coverImage.startsWith('http')}
            sizes="(max-width: 768px) 100vw, 700px"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 sm:p-3 flex items-center justify-between gap-2">
            <span className="text-[11px] text-white/90 truncate font-mono max-w-[70%]">
              {coverImage}
            </span>
            <span className="text-[10px] bg-emerald-600/95 text-white font-semibold px-2 py-0.5 rounded-full shrink-0 shadow-xs">
              Foto Aktif
            </span>
          </div>
        </div>
      )}

      {/* Source Tabs: Galeri Kurasi & Unggah */}
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
          <span className="truncate">
            Galeri
            <span className="hidden min-[340px]:inline"> Kurasi (9 Pilihan)</span>
            <span className="hidden min-[290px]:inline min-[340px]:hidden"> Kurasi</span>
          </span>
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
          <span className="truncate">
            Unggah<span className="hidden min-[340px]:inline"> / Drag &amp; Drop</span>
          </span>
        </button>
      </div>

      {/* Tab 1: Galeri Kurasi (9 Pilihan) */}
      {coverSourceTab === 'gallery' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CURATED_ARTICLE_IMAGES.map((img) => {
              const isSelected = coverImage === img.url;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => onSelectCoverImage(img.url)}
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
                Seret &amp; lepas gambar di sini, atau{' '}
                <span className="text-[var(--color-accent)] underline">klik untuk memilih</span>
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
  );
}
