import React from 'react';
import Link from 'next/link';
import { MessageCircle, Calendar } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

export function AboutCta() {
  return (
    <section
      className="p-8 sm:p-10 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs card-interactive"
      data-reveal
    >
      <div className="space-y-1.5 max-w-xl">
        <h2
          className="text-xl sm:text-2xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ingin ngobrol atau berdiskusi dengan Amel?
        </h2>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          Pintu selalu terbuka untuk sesi konseling sebaya, kolaborasi kegiatan kepemudaan, maupun komunikasi profesional.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <a
          href={getGeneralWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary btn-interactive text-sm min-h-[42px] px-5 inline-flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Langsung</span>
        </a>
        <Link
          href="/schedule"
          className="btn-secondary btn-interactive text-sm min-h-[42px] px-5 inline-flex items-center gap-2"
        >
          <Calendar className="w-4 h-4 text-[var(--color-ink-soft)]" />
          <span>Janji Temu Konseling</span>
        </Link>
      </div>
    </section>
  );
}
