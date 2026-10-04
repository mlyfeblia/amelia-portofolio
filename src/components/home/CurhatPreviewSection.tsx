import React from 'react';
import Link from 'next/link';
import { AnonymousMessage } from '@/types';

interface CurhatPreviewSectionProps {
  messages: AnonymousMessage[];
}

export function CurhatPreviewSection({ messages }: CurhatPreviewSectionProps) {
  if (messages.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]" data-reveal>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
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
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline shrink-0 inline-flex items-center gap-1"
          >
            Kirim curhat &amp; baca semua tanggapan &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {messages.map((item) => (
            <div
              key={item.id}
              className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 card-interactive"
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-semibold text-[var(--color-ink)]">{item.alias}</span>
                <span className="text-[var(--color-accent)] font-medium px-2.5 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
                  {item.category}
                </span>
              </div>

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
          ))}
        </div>
      </div>
    </section>
  );
}
