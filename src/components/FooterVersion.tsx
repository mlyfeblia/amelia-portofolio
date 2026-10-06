'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { CURRENT_APP_VERSION } from '@/data/app-version';
import { openChangelogModal } from '@/lib/pwa-store';

export default function FooterVersion() {
  return (
    <button
      type="button"
      onClick={() => openChangelogModal()}
      className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/60 hover:text-white transition-colors cursor-pointer group py-1"
      title="Lihat catatan pembaruan aplikasi"
      aria-label={`Versi aplikasi saat ini: ${CURRENT_APP_VERSION}. Klik untuk melihat catatan pembaruan.`}
    >
      <Tag className="w-3 h-3 text-[var(--color-accent-soft)] group-hover:text-white transition-colors" />
      <span>v{CURRENT_APP_VERSION}</span>
      <span className="text-white/40">&bull;</span>
      <span className="underline decoration-white/20 group-hover:decoration-white/80 underline-offset-2">
        Catatan Pembaruan
      </span>
    </button>
  );
}
