import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, MessageCircle } from 'lucide-react';
import { AnonymousMessage } from '@/types';

function formatDate(isoString?: string) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } catch {
    return '';
  }
}

interface CurhatPreviewSectionProps {
  messages: AnonymousMessage[];
}

export function CurhatPreviewSection({ messages }: CurhatPreviewSectionProps) {
  if (messages.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]" data-reveal>
      <div className="max-w-7xl mx-auto px-3.5 min-[340px]:px-5 sm:px-8 lg:px-10 space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <h2
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Ruang Curhat Anonim
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1.5">
              Kutipan tanya jawab santai seputar kegelisahan hidup yang dijawab langsung oleh Amel.
            </p>
          </div>
          <Link
            href="/counseling"
            className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-start sm:self-auto transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
            <span>Buka Seluruh Cerita Curhat</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
          </Link>
        </div>

        <div
          className={`grid grid-cols-1 ${
            messages.length === 3
              ? 'md:grid-cols-3'
              : messages.length >= 4
              ? 'sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4'
              : 'md:grid-cols-2'
          } gap-6 lg:gap-8`}
        >
          {messages.map((item) => (
            <div
              key={item.id}
              className="p-4 min-[340px]:p-5 sm:p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 shadow-2xs hover:border-[var(--color-accent-border)] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3.5 min-w-0">
                {/* Nama samaran tetap di paling atas */}
                <span className="font-semibold text-[var(--color-ink)] text-sm sm:text-base block truncate">
                  {item.alias}
                </span>

                <blockquote className="text-sm sm:text-base text-[var(--color-ink-muted)] italic leading-relaxed break-words [overflow-wrap:anywhere]">
                  &ldquo;{item.message}&rdquo;
                </blockquote>

                {item.answer && (
                  <div className="pt-3 border-t border-[var(--color-paper-border)] space-y-1.5">
                    <span className="text-xs font-semibold text-[var(--color-accent)] block uppercase tracking-wider">
                      Tanggapan Amel:
                    </span>
                    <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed line-clamp-3 break-words [overflow-wrap:anywhere]">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>

              {/* Di paling bawahnya waktu terus baru deh kategori */}
              <div className="pt-3 border-t border-[var(--color-paper-border)] flex flex-wrap items-center gap-1.5 min-[340px]:gap-2 text-xs text-[var(--color-ink-soft)]">
                {item.createdAt && (
                  <>
                    <span className="text-[11px] text-[var(--color-ink-soft)] flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <Clock className="w-3 h-3 text-[var(--color-ink-soft)] shrink-0" />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="text-[var(--color-paper-border)] shrink-0" aria-hidden="true">&bull;</span>
                  </>
                )}
                <span className="text-xs font-medium text-[var(--color-accent)] truncate max-w-[130px] min-[340px]:max-w-none">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
