import React from 'react';
import { steps } from '@/data/services-data';

export function ServicesWorkflow() {
  return (
    <section className="space-y-8 pt-12 border-t border-[var(--color-paper-border)]" data-reveal>
      <div className="max-w-2xl">
        <h2
          className="text-2xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Alur Sederhana Sesi Bimbingan
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          Proses mudah dan transparan sejak awal mendaftar sampai sesi obrolan selesai.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div
            key={s.step}
            className="p-5 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive"
          >
            <span
              className="w-7 h-7 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold text-xs flex items-center justify-center"
              aria-hidden="true"
            >
              {s.step}
            </span>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              {s.title}
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
