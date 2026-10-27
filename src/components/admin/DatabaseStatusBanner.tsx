'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { adminCache, DatabaseOperationalStatus } from '@/lib/admin-cache';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';

export function DatabaseStatusBanner() {
  const { toast } = useToast();
  const [status, setStatus] = useState<DatabaseOperationalStatus>(() => adminCache.getDatabaseStatus());
  const [checking, setChecking] = useState(false);
  const [meta, setMeta] = useState(() => adminCache.getSnapshotMeta());

  const handleSyncStatus = useCallback((newStatus: DatabaseOperationalStatus) => {
    setStatus(newStatus);
    setMeta(adminCache.getSnapshotMeta());
  }, []);

  useEffect(() => {
    // Initial silent health check on admin load
    adminCache.checkDatabaseHealth().then(handleSyncStatus);

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ status: DatabaseOperationalStatus }>;
      if (custom.detail?.status) {
        handleSyncStatus(custom.detail.status);
      }
    };

    window.addEventListener('amelia:admin-db-status-changed', handleCustomEvent);
    return () => {
      window.removeEventListener('amelia:admin-db-status-changed', handleCustomEvent);
    };
  }, [handleSyncStatus]);

  const handleRecheck = async () => {
    setChecking(true);
    try {
      const res = await adminCache.checkDatabaseHealth();
      if (res === 'online') {
        toast.success('Koneksi ke database InsForge berhasil pulih! Data terbaru kini sinkron.');
        window.dispatchEvent(new CustomEvent('amelia:admin-cache-updated', { detail: { key: 'bookings' } }));
        window.dispatchEvent(new CustomEvent('amelia:admin-cache-updated', { detail: { key: 'curhat' } }));
        window.dispatchEvent(new CustomEvent('amelia:admin-cache-updated', { detail: { key: 'articles' } }));
      } else {
        toast.error('Database InsForge masih ter-pause. Harap klik "Buka Console InsForge" dan unpause project Anda.');
      }
    } catch {
      toast.error('Gagal menghubungi server untuk verifikasi database.');
    } finally {
      setChecking(false);
    }
  };

  // If database is online, render nothing
  if (status === 'online') {
    return null;
  }

  const formatSnapshotDate = (timestamp: number | null) => {
    if (!timestamp) return 'Sesi ini';
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timestamp));
    } catch {
      return 'Tersimpan';
    }
  };

  return (
    <aside
      role="alert"
      aria-live="polite"
      className="bg-amber-500/15 border-b border-amber-500/30 text-[var(--color-ink)] backdrop-blur-md px-3 sm:px-8 lg:px-10 py-3 transition-all duration-300 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Indicator & Description */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/25 text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                InsForge Ter-Pause / Nonaktif
              </span>

              <span className="text-xs text-[var(--color-ink-muted)]">
                • Mode Cadangan Lokal (Hanya Baca)
              </span>

              {meta.lastSaved && (
                <span className="hidden sm:inline-block text-xs text-[var(--color-ink-muted)]">
                  (Snapshot: {formatSnapshotDate(meta.lastSaved)})
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[var(--color-ink)] leading-relaxed">
              Database InsForge sedang dibekukan karena masa inaktivitas. Panel admin tetap menampilkan data dari 
              <strong> Cadangan Lokal</strong> agar Anda tetap dapat membaca riwayat. Harap aktifkan kembali di console InsForge 
              agar booking baru bisa masuk dan status dapat diperbarui.
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col min-[340px]:flex-row items-stretch min-[340px]:items-center gap-2 w-full md:w-auto shrink-0 pt-1 md:pt-0">
          <button
            type="button"
            onClick={handleRecheck}
            disabled={checking}
            className={cn(
              "btn-interactive inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-amber-500/40 bg-[var(--color-surface)] hover:bg-amber-500/15 text-[var(--color-ink)] shadow-2xs transition-all flex-1 md:flex-initial",
              checking && "opacity-70 cursor-wait"
            )}
            title="Periksa apakah InsForge sudah menyala kembali"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-amber-600", checking && "animate-spin")} />
            <span>{checking ? 'Memeriksa...' : 'Cek Ulang Koneksi'}</span>
          </button>

          <a
            href="https://insforge.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-interactive inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all flex-1 md:flex-initial"
            title="Buka dashboard InsForge untuk klik unpause/resume project"
          >
            <span>Buka Console InsForge</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </aside>
  );
}
