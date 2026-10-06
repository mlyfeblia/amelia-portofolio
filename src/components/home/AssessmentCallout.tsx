import React from 'react';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';

export function AssessmentCallout() {
  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]" data-reveal>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="p-8 sm:p-12 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xs card-interactive">
          <div className="space-y-2.5 max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Asesmen Kesejahteraan Jiwa Mandiri
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Hanya butuh dua menit untuk jeda sejenak dan merefleksikan diri. Kenali ritme pikiran, kestabilan emosi, serta tingkat burnout yang sedang kamu rasakan.
            </p>
          </div>
          <Link
            href="/assessment"
            className="btn-primary btn-interactive min-h-[46px] px-6 text-sm shrink-0 inline-flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Mulai Asesmen Diri</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
