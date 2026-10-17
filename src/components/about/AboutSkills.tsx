import React from 'react';
import { Target, FileSpreadsheet, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { hardSkills, softSkills } from '@/data/about-data';

export function AboutSkills() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]"
      data-reveal
    >
      <div className="md:col-span-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-[var(--color-accent)]" />
          <h2
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Keahlian &amp; Kompetensi
          </h2>
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          Paduan keterampilan teknis operasional dan kecakapan interpersonal.
        </p>
      </div>

      <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
        {/* Hard Skills */}
        <div className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-paper-border)]">
            <FileSpreadsheet className="w-4 h-4 text-[var(--color-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider">
              Keahlian Teknis (Hard Skills)
            </h3>
          </div>
          <ul className="space-y-2.5 text-sm text-[var(--color-ink-muted)]">
            {hardSkills.map((skill, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Soft Skills */}
        <div className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--color-paper-border)]">
            <HeartHandshake className="w-4 h-4 text-[var(--color-accent)]" />
            <h3 className="text-sm font-semibold text-[var(--color-ink)] uppercase tracking-wider">
              Keahlian Interpersonal (Soft Skills)
            </h3>
          </div>
          <ul className="space-y-2.5 text-sm text-[var(--color-ink-muted)]">
            {softSkills.map((skill, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] mt-0.5 shrink-0" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
