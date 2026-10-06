import React from 'react';
import { Briefcase } from 'lucide-react';
import { workExperiences } from '@/data/about-data';

export function AboutWorkExperience() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]"
      data-reveal
    >
      <div className="md:col-span-4">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-[var(--color-accent)]" />
          <h2
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pengalaman Kerja
          </h2>
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          Rekam jejak operasional, manajemen kasir, dan layanan pelanggan sejak 2020.
        </p>
      </div>

      <div className="md:col-span-8 space-y-6">
        {workExperiences.map((exp, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3.5 shadow-xs hover:border-[var(--color-accent-border)] transition-colors card-interactive"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
                  {exp.company}
                </h3>
                <p className="text-sm font-medium text-[var(--color-accent)]">
                  {exp.role}
                </p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-xs text-[var(--color-ink-soft)] font-medium">
                  {exp.period}
                </span>
              </div>
            </div>

            <ul className="space-y-2 pt-2 border-t border-[var(--color-paper-border)] text-sm text-[var(--color-ink-muted)]">
              {exp.highlights.map((item, hIdx) => (
                <li key={hIdx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
