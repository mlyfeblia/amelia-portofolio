import React from 'react';
import { PhoneCall, HeartPulse, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrisisHotlineDisclaimerProps {
  className?: string;
  variant?: 'subtle' | 'card';
}

export function CrisisHotlineDisclaimer({
  className,
  variant = 'card',
}: CrisisHotlineDisclaimerProps) {
  if (variant === 'subtle') {
    return (
      <div
        className={cn(
          'text-xs text-[var(--color-ink-soft)] leading-relaxed rounded-xl p-3.5 bg-[var(--color-paper-muted)]/70 border border-[var(--color-paper-border)] flex items-start gap-2.5',
          className
        )}
      >
        <HeartPulse className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p>
            <strong>Penting:</strong> Konseling sebaya bukan layanan gawat darurat psikiatri.
            Jika kamu atau kerabat sedang dalam krisis emosional ekstrem atau dorongan menyakiti diri,
            segera hubungi <strong>Layanan Darurat 119</strong> atau{' '}
            <a
              href="tel:119"
              className="font-semibold text-rose-700 underline underline-offset-2 hover:text-rose-900 inline-flex items-center gap-0.5"
            >
              Hotline SEJIWA Kemenkes 119 ext. 8
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="note"
      aria-label="Informasi Bantuan Darurat Kesehatan Jiwa"
      className={cn(
        'rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-rose-50/70 via-amber-50/50 to-[var(--color-paper)] border border-rose-200/70 shadow-2xs text-[var(--color-ink)] space-y-2.5',
        className
      )}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-800">
        <HeartPulse className="w-4 h-4 text-rose-600" aria-hidden="true" />
        <span>Etika Pendampingan & Bantuan Darurat</span>
      </div>

      <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
        Ruang curhat dan sesi konseling sebaya ini ditujukan untuk bimbingan refleksi kehidupan, manajemen stres,
        dan penguatan emosional non-kritis. Jika kamu sedang menghadapi krisis emosional berat, rasa putus asa mendalam,
        atau situasi yang mengancam keselamatan diri, kamu berhak mendapatkan pertolongan medis segera.
      </p>

      <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
        <a
          href="tel:119"
          className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-medium shadow-2xs transition-all"
        >
          <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
          <span>Hubungi Hotline SEJIWA (119 ext. 8)</span>
        </a>

        <span className="text-[var(--color-ink-soft)] text-xs">
          Gratis & Layanan 24 Jam Bebas Pulsa Nasional
        </span>
      </div>
    </div>
  );
}
