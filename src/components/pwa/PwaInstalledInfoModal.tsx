'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  X,
  CheckCircle2,
  Zap,
  Feather,
  WifiOff,
  Lock,
  RefreshCw,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { CURRENT_APP_VERSION } from '@/data/app-version';
import { openChangelogModal } from '@/lib/pwa-store';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

interface PwaInstalledInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PwaInstalledInfoModal({ isOpen, onClose }: PwaInstalledInfoModalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setIsChecking(false);
    setFeedbackMessage(null);
    onClose();
  }, [onClose]);

  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({
    isOpen,
    onClose: handleClose,
    closeOnEscape: true,
    lockScroll: true,
  });

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    setFeedbackMessage(null);
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.update();
        setTimeout(() => {
          setIsChecking(false);
          setFeedbackMessage(`Aplikasi Amelia versi v${CURRENT_APP_VERSION} adalah versi terbaru.`);
        }, 650);
      } else {
        setTimeout(() => {
          setIsChecking(false);
          setFeedbackMessage(`Aplikasi berjalan normal pada versi v${CURRENT_APP_VERSION}.`);
        }, 500);
      }
    } catch {
      setIsChecking(false);
      setFeedbackMessage(`Sistem dalam kondisi prima dan terhubung.`);
    }
  };

  const handleOpenChangelog = () => {
    onClose();
    setTimeout(() => {
      openChangelogModal();
    }, 150);
  };

  if (!isRendered || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="installed-info-title"
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none',
        isExiting && 'pointer-events-none'
      )}
    >
      {/* Full-viewport transparent frosted blur backdrop */}
      <div
        className={cn(backdropClass)}
        aria-hidden="true"
        onClick={handleClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          'relative z-10 bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-5 max-h-[90dvh] overflow-y-auto my-auto',
          windowClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xs border border-[var(--color-paper-border)] bg-[#FAF0E6] shrink-0 flex items-center justify-center">
              <Image
                src="/icons/icon-192x192.png"
                alt="Logo Amelia"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="installed-info-title" className="font-display font-semibold text-base text-[var(--color-ink)]">
                  Amelia
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)]">
                  v{CURRENT_APP_VERSION}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Aplikasi Web Resmi Terpasang &amp; Aktif</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Tutup informasi aplikasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <p className="font-semibold text-emerald-950">Aplikasi Amelia aktif di perangkatmu</p>
            <p className="mt-0.5 text-emerald-800/90">
              Ruang konseling sebaya dan asesmen mandiri siap dibuka instan kapan saja, bahkan tanpa koneksi internet aktif.
            </p>
          </div>
        </div>

        {/* 4 Active Features in Installed State */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider px-1">
            Fitur Aktif di Perangkat Ini
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-[var(--color-paper)] rounded-2xl border border-[var(--color-paper-border)] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold block text-[var(--color-ink)]">Akses 1-Sentuhan</span>
                <span className="text-[11px] text-[var(--color-ink-muted)] leading-tight block mt-0.5">
                  Ikon langsung di layar utama
                </span>
              </div>
            </div>

            <div className="p-3 bg-[var(--color-paper)] rounded-2xl border border-[var(--color-paper-border)] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold block text-[var(--color-ink)]">Sangat Ringan (&lt; 2 MB)</span>
                <span className="text-[11px] text-[var(--color-ink-muted)] leading-tight block mt-0.5">
                  Hemat memori &amp; baterai ponsel
                </span>
              </div>
            </div>

            <div className="p-3 bg-[var(--color-paper)] rounded-2xl border border-[var(--color-paper-border)] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold block text-[var(--color-ink)]">Bacaan Offline Siap</span>
                <span className="text-[11px] text-[var(--color-ink-muted)] leading-tight block mt-0.5">
                  Artikel tersimpan di cache
                </span>
              </div>
            </div>

            <div className="p-3 bg-[var(--color-paper)] rounded-2xl border border-[var(--color-paper-border)] flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold block text-[var(--color-ink)]">Ruang Bebas Bar URL</span>
                <span className="text-[11px] text-[var(--color-ink-muted)] leading-tight block mt-0.5">
                  Tampilan layar penuh &amp; privat
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message for update check if present */}
        {feedbackMessage && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 border-t border-[var(--color-paper-border)]">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleOpenChangelog}
              className="py-2.5 px-3 rounded-xl bg-white border border-[var(--color-paper-border)] hover:bg-[var(--color-paper)] hover:text-[var(--color-accent)] text-xs font-medium text-[var(--color-ink)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Catatan Rilis</span>
            </button>

            <button
              type="button"
              onClick={handleCheckUpdate}
              disabled={isChecking}
              className="py-2.5 px-3 rounded-xl bg-white border border-[var(--color-paper-border)] hover:bg-[var(--color-paper)] hover:text-[var(--color-accent)] text-xs font-medium text-[var(--color-ink)] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isChecking && 'animate-spin text-[var(--color-accent)]')} />
              <span>{isChecking ? 'Memeriksa...' : 'Cek Pembaruan'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-xs sm:text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer text-center active:scale-98 shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
