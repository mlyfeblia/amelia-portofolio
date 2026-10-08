import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formats } from '@/data/services-data';

export function ServicesFormats() {
  return (
    <section className="space-y-8 pt-12 border-t border-[var(--color-paper-border)]" data-reveal>
      <div className="max-w-2xl">
        <h2
          className="text-2xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Format Konsultasi yang Tersedia
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          Pilih format obrolan yang paling nyaman dan sesuai dengan kesiapanmu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {formats.map((f, i) => (
          <div
            key={i}
            className="p-4 min-[340px]:p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl sm:rounded-3xl space-y-3 flex flex-col justify-between card-interactive"
          >
            <div>
              <h3 className="text-base font-semibold text-[var(--color-ink)]">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mt-2">
                {f.desc}
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--color-paper-border)] flex flex-col min-[320px]:flex-row min-[320px]:items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[var(--color-accent)] leading-tight">{f.dur}</span>
              <Link
                href={`/schedule?format=${f.mode}`}
                className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-start min-[320px]:self-auto transition-all"
              >
                <span>Pilih Format</span>
                <ArrowRight className="w-3 h-3 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
