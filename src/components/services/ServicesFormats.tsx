import React from 'react';
import Link from 'next/link';
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
            className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3 flex flex-col justify-between card-interactive"
          >
            <div>
              <h3 className="text-base font-semibold text-[var(--color-ink)]">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mt-2">
                {f.desc}
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--color-paper-border)] flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--color-accent)]">{f.dur}</span>
              <Link href="/schedule" className="font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1">
                Pilih format &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
