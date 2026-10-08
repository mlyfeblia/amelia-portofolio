'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  CornerDownLeft,
  Copy,
  Check,
  Minus,
  Code as CodeIcon,
  Strikethrough,
} from 'lucide-react';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface ArticleMarkdownCheatsheetProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertExample?: (example: string) => void;
}

interface CheatsheetItem {
  name: string;
  syntax: string;
  example: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  renderPreview: () => React.ReactNode;
}

const CHEATSHEET_SECTIONS: {
  title: string;
  items: CheatsheetItem[];
}[] = [
  {
    title: 'Gaya Teks & Penekanan',
    items: [
      {
        name: 'Tebal (Bold)',
        syntax: '**teks tebal**',
        example: '**kesehatan mental**',
        description: 'Bungkus teks dengan tanda bintang ganda (**) untuk menegaskan poin penting.',
        icon: Bold,
        renderPreview: () => (
          <span className="font-semibold text-[var(--color-ink)]">kesehatan mental</span>
        ),
      },
      {
        name: 'Miring (Italic)',
        syntax: '*teks miring*',
        example: '*self-compassion*',
        description: 'Bungkus teks dengan tanda bintang tunggal (*) untuk istilah asing atau penekanan halus.',
        icon: Italic,
        renderPreview: () => (
          <span className="italic font-serif text-[var(--color-ink)]">self-compassion</span>
        ),
      },
      {
        name: 'Garis Bawah (Underline)',
        syntax: '<u>teks bergaris bawah</u>',
        example: '<u>penting untuk diingat</u>',
        description: 'Gunakan tag <u>...</u> untuk kata atau frasa yang perlu digarisbawahi secara spesifik.',
        icon: UnderlineIcon,
        renderPreview: () => (
          <span className="underline underline-offset-4 decoration-[var(--color-accent)] font-medium">
            penting untuk diingat
          </span>
        ),
      },
      {
        name: 'Coret (Strikethrough)',
        syntax: '~~teks dicoret~~',
        example: '~~kebiasaan menunda~~',
        description: 'Gunakan tanda tilde ganda (~~) untuk teks yang dicoret atau dikoreksi.',
        icon: Strikethrough,
        renderPreview: () => (
          <del className="line-through text-[var(--color-ink-muted)]">kebiasaan menunda</del>
        ),
      },
      {
        name: 'Kode Singkat (Inline Code)',
        syntax: '`istilah/kode`',
        example: '`mindfulness`',
        description: 'Gunakan tanda backtick (`) untuk istilah khusus, kode, atau singkatan teknis.',
        icon: CodeIcon,
        renderPreview: () => (
          <code className="px-1.5 py-0.5 rounded bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] font-mono text-xs text-[var(--color-accent)]">
            mindfulness
          </code>
        ),
      },
    ],
  },
  {
    title: 'Subjudul & Struktur Halaman',
    items: [
      {
        name: 'Subjudul Utama (H2)',
        syntax: '## Judul Bagian',
        example: '## Menemukan Ketenangan Jiwa',
        description: 'Awali baris dengan dua tanda pagar (## ) untuk membagi artikel menjadi bagian utama.',
        icon: Heading2,
        renderPreview: () => (
          <span className="text-base font-medium text-[var(--color-ink)] font-serif block">
            Menemukan Ketenangan Jiwa
          </span>
        ),
      },
      {
        name: 'Sub-bagian Detail (H3)',
        syntax: '### Sub-topik',
        example: '### Langkah 1: Muhasabah Diri',
        description: 'Awali baris dengan tiga tanda pagar (### ) untuk rincian topik di bawah subjudul H2.',
        icon: Heading3,
        renderPreview: () => (
          <span className="text-sm font-semibold text-[var(--color-ink)] block">
            Langkah 1: Muhasabah Diri
          </span>
        ),
      },
      {
        name: 'Garis Pembatas (Divider)',
        syntax: '---',
        example: '---',
        description: 'Tulis tiga tanda hubung (---) di baris baru untuk membuat garis pemisah antar bagian cerita.',
        icon: Minus,
        renderPreview: () => <hr className="border-[var(--color-paper-border)] my-1" />,
      },
    ],
  },
  {
    title: 'Daftar, Kutipan & Tautan',
    items: [
      {
        name: 'Butir Poin (Unordered List)',
        syntax: '- Poin pertama\n- Poin kedua',
        example: '- Menerima emosi apa adanya\n- Berdoa dengan tulus',
        description: 'Awali setiap baris dengan strip (- ) untuk daftar tanpa urutan angka.',
        icon: List,
        renderPreview: () => (
          <ul className="space-y-1 pl-1">
            <li className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
              <span>Menerima emosi apa adanya</span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0" />
              <span>Berdoa dengan tulus</span>
            </li>
          </ul>
        ),
      },
      {
        name: 'Penomoran (Ordered List)',
        syntax: '1. Langkah pertama\n2. Langkah kedua',
        example: '1. Kenali pemicu cemas\n2. Tarik napas perlahan',
        description: 'Awali setiap baris dengan angka dan titik (1. , 2. ) untuk panduan berurutan.',
        icon: ListOrdered,
        renderPreview: () => (
          <ol className="space-y-1 pl-1">
            <li className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>Kenali pemicu cemas</span>
            </li>
            <li className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[10px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span>Tarik napas perlahan</span>
            </li>
          </ol>
        ),
      },
      {
        name: 'Kutipan Reflektif (Blockquote)',
        syntax: '> Kalimat mutiara atau firman',
        example: '> "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram." (QS. Ar-Ra\'d: 28)',
        description: 'Awali baris dengan tanda lebih besar (> ) untuk kutipan hikmah, hadis, atau dalil.',
        icon: Quote,
        renderPreview: () => (
          <div className="pl-3 border-l-2 border-[var(--color-accent)] italic bg-[var(--color-accent-soft)]/40 py-1 pr-2 rounded-r-lg text-xs font-serif text-[var(--color-ink)]">
            &ldquo;Hati menjadi tenteram dengan mengingat-Nya.&rdquo;
          </div>
        ),
      },
      {
        name: 'Tautan Web (Link)',
        syntax: '[Nama Tautan](https://url-tujuan.com)',
        example: '[Jadwal Konseling](/schedule)',
        description: 'Bungkus teks nama tautan dalam [ ] lalu alamat URL dalam ( ). Mendukung tautan internal dan eksternal.',
        icon: LinkIcon,
        renderPreview: () => (
          <span className="text-[var(--color-accent)] font-medium underline underline-offset-4">
            Jadwal Konseling
          </span>
        ),
      },
    ],
  },
  {
    title: 'Baris Baru & Pemisahan Paragraf',
    items: [
      {
        name: 'Baris Baru (Soft Line Break)',
        syntax: 'Tekan Enter 1x',
        example: 'Kalimat baris satu\nKalimat baris dua langsung di bawahnya',
        description: 'Tekan Enter sekali untuk turun ke baris baru tanpa jeda spasi paragraf yang terlalu jauh.',
        icon: CornerDownLeft,
        renderPreview: () => (
          <div className="text-xs leading-relaxed text-[var(--color-ink)]">
            Kalimat baris satu
            <br />
            Kalimat baris dua langsung di bawahnya
          </div>
        ),
      },
      {
        name: 'Paragraf Baru (Jeda Antar Paragraf)',
        syntax: 'Tekan Enter 2x (Baris Kosong)',
        example: 'Paragraf pertama selesai.\n\nParagraf kedua dimulai dengan jarak nyaman.',
        description: 'Tekan Enter dua kali (menyisakan 1 baris kosong) untuk memulai paragraf narasi baru.',
        icon: CornerDownLeft,
        renderPreview: () => (
          <div className="space-y-2 text-xs leading-relaxed text-[var(--color-ink)]">
            <div>Paragraf pertama selesai.</div>
            <div className="text-[var(--color-ink-muted)]">Paragraf kedua berjarak lega.</div>
          </div>
        ),
      },
    ],
  },
];

export function ArticleMarkdownCheatsheet({
  isOpen,
  onClose,
  onInsertExample,
}: ArticleMarkdownCheatsheetProps) {
  const mounted = useMounted();
  const { isRendered, backdropClass, windowClass } = useModalAnimation({ isOpen });
  const [copiedSyntax, setCopiedSyntax] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async (syntax: string) => {
    try {
      await navigator.clipboard.writeText(syntax);
      setCopiedSyntax(syntax);
      setTimeout(() => setCopiedSyntax(null), 1800);
    } catch {
      // fallback
    }
  };

  if (!mounted || !isRendered) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-0 sm:p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheatsheet-title"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/45 backdrop-blur-sm touch-none select-none pointer-events-auto transition-opacity',
          backdropClass
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          'relative z-10 w-full h-[95dvh] sm:h-[85vh] sm:max-w-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto',
          windowClass
        )}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3
                id="cheatsheet-title"
                className="text-base sm:text-lg font-medium text-[var(--color-ink)] truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Petunjuk Format Markdown
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] truncate">
                Panduan penulisan artikel, gaya teks, subjudul, dan baris baru
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="btn-interactive p-2 rounded-xl text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer shrink-0"
            aria-label="Tutup petunjuk format"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 overscroll-contain text-xs sm:text-sm">
          {/* Quick Tip Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--color-accent-soft)]/50 border border-[var(--color-accent-border)] flex items-start gap-3 text-xs leading-relaxed text-[var(--color-ink)]">
            <CornerDownLeft className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--color-accent)] mb-0.5">
                Tips Baris Baru &amp; Pengetikan:
              </p>
              <p className="text-[var(--color-ink-muted)]">
                Anda dapat menggunakan <strong>tombol toolbar di atas area pengetikan</strong> untuk menyisipkan format secara otomatis, atau mengetikkan simbol markdown di bawah ini secara langsung. Baris baru (<kbd className="px-1 py-0.5 rounded bg-[var(--color-paper)] border text-[10px] font-mono">Enter</kbd>) kini tersimpan dan tampil sempurna di halaman publik.
              </p>
            </div>
          </div>

          {CHEATSHEET_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-2">
                <span>{section.title}</span>
                <span className="flex-1 h-px bg-[var(--color-paper-border)]" />
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isCopied = copiedSyntax === item.example;

                  return (
                    <div
                      key={item.name}
                      className="p-3 sm:p-3.5 rounded-2xl border border-[var(--color-paper-border)] bg-[var(--color-paper)]/40 hover:bg-[var(--color-paper)] transition-colors flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-xs text-[var(--color-ink)]">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onInsertExample && (
                            <button
                              type="button"
                              onClick={() => {
                                onInsertExample(item.example);
                                onClose();
                              }}
                              className="px-2 py-1 text-[11px] font-medium rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
                              title="Sisipkan ke dalam artikel"
                            >
                              Gunakan
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopy(item.example)}
                            className="p-1 sm:px-2 sm:py-1 text-[11px] font-medium rounded-lg bg-[var(--color-surface)] border border-[var(--color-paper-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Salin contoh sintaks"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="hidden sm:inline text-emerald-600 text-[10px]">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="hidden sm:inline text-[10px]">Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] leading-relaxed">
                        {item.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[var(--color-paper-border)]/60 text-xs">
                        {/* Sintaks Input */}
                        <div className="bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-paper-border)] flex flex-col justify-center">
                          <span className="text-[10px] text-[var(--color-ink-muted)] mb-0.5 font-medium">
                            Ketikkan:
                          </span>
                          <code className="font-mono text-[11px] text-[var(--color-accent)] break-all whitespace-pre-wrap">
                            {item.syntax}
                          </code>
                        </div>

                        {/* Hasil Tampilan */}
                        <div className="bg-[var(--color-surface)] p-2 rounded-xl border border-[var(--color-paper-border)] flex flex-col justify-center">
                          <span className="text-[10px] text-[var(--color-ink-muted)] mb-0.5 font-medium">
                            Hasil Tampilan:
                          </span>
                          <div className="py-0.5">{item.renderPreview()}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[var(--color-paper-border)] bg-[var(--color-surface)] flex items-center justify-end shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-interactive h-9 px-5 rounded-xl text-xs font-semibold bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-all cursor-pointer"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
