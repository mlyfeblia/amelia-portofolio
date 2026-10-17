import React from 'react';
import { GraduationCap } from 'lucide-react';
import { educations } from '@/data/about-data';

export function AboutEducation() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]"
      data-reveal
    >
      <div className="md:col-span-4">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-[var(--color-accent)]" />
          <h2
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pendidikan
          </h2>
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          Fondasi pendidikan keagamaan kuat dan ilmu bimbingan konseling.
        </p>
      </div>

      <div className="md:col-span-8 space-y-4">
        {educations.map((edu, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2.5 shadow-2xs hover:border-[var(--color-accent-border)] transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
                {edu.institution}
              </h3>
              <span className="text-xs text-[var(--color-ink-soft)] font-medium">
                {edu.period}
              </span>
            </div>
            <p className="text-sm font-medium text-[var(--color-accent)]">
              {edu.degree}
            </p>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {edu.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
