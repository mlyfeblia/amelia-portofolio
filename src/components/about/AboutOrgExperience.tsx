import React from 'react';
import { Users } from 'lucide-react';
import { orgExperiences } from '@/data/about-data';

export function AboutOrgExperience() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-10 border-t border-[var(--color-paper-border)]"
      data-reveal
    >
      <div className="md:col-span-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-[var(--color-accent)]" />
          <h2
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Organisasi &amp; Volunteer
          </h2>
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
          Aktivitas kepemimpinan pemuda, pembuatan konten edukasi, dan fasilitator.
        </p>
      </div>

      <div className="md:col-span-8 space-y-6">
        {orgExperiences.map((org, idx) => (
          <div
            key={idx}
            className="p-6 sm:p-7 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-3.5 shadow-xs hover:border-[var(--color-accent-border)] transition-colors card-interactive"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)]">
                  {org.org}
                </h3>
                <p className="text-sm font-medium text-[var(--color-accent)]">
                  {org.role}
                </p>
              </div>
              <span className="text-xs text-[var(--color-ink-soft)] font-medium">
                {org.period}
              </span>
            </div>

            <ul className="space-y-2 pt-2 border-t border-[var(--color-paper-border)] text-sm text-[var(--color-ink-muted)]">
              {org.highlights.map((item, hIdx) => (
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
