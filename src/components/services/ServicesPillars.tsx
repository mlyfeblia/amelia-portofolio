import React from 'react';
import { pillars } from '@/data/services-data';

export function ServicesPillars() {
  return (
    <section className="space-y-8 pt-8 border-t border-[var(--color-paper-border)]" data-reveal>
      <div className="max-w-2xl">
        <h2
          className="text-2xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Empat Pilar Pendekatan Amel
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">
          Prinsip utama yang selalu aku jaga dalam setiap sesi bimbingan bersama teman-teman konseli.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((p) => (
          <div
            key={p.num}
            className="p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive"
          >
            <span className="text-sm font-semibold text-[var(--color-accent)] block">
              Pilar {p.num}
            </span>
            <h3 className="text-lg font-semibold text-[var(--color-ink)]">
              {p.title}
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
