'use client';

import React from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePwa, triggerPwaInstall, openInstalledInfoModal } from '@/lib/pwa-store';
import { useMounted } from '@/lib/use-mounted';

export default function FooterInstallButton() {
  const { isInstalled } = usePwa();
  const mounted = useMounted();
  const installed = mounted && isInstalled;

  const handleClick = () => {
    if (installed) {
      openInstalledInfoModal();
    } else {
      triggerPwaInstall();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-soft)] hover:text-white transition-colors cursor-pointer group py-1 text-left select-none"
      title={installed ? 'Aplikasi Web sudah terpasang (Klik untuk melihat info)' : 'Pasang Aplikasi Web Resmi Amelia'}
      aria-label={installed ? 'Aplikasi Web sudah terpasang di perangkat ini. Klik untuk melihat informasi aplikasi.' : 'Pasang aplikasi web resmi Amelia'}
    >
      {installed ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Aplikasi Terpasang</span>
          <span className="text-[10px] bg-white/10 group-hover:bg-white/20 px-1.5 py-0.5 rounded text-white/80 transition-colors ml-0.5">
            Info &rarr;
          </span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 text-[var(--color-accent-soft)] group-hover:text-white transition-colors shrink-0" aria-hidden="true" />
          <span>Pasang Web App</span>
        </>
      )}
    </button>
  );
}
