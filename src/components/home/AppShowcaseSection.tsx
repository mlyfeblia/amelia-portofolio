'use client';

import React from 'react';
import Image from 'next/image';
import {
  Download,
  Share2,
  CheckCircle2,
  Zap,
  WifiOff,
  Feather,
  Lock,
} from 'lucide-react';
import { usePwa, triggerPwaInstall, openIosModal } from '@/lib/pwa-store';
import { useMounted } from '@/lib/use-mounted';

export function AppShowcaseSection() {
  const { isInstalled, isIOS } = usePwa();
  const mounted = useMounted();
  const showInstalled = mounted && isInstalled;
  const isIosDevice = mounted && isIOS;

  return (
    <section
      id="app-showcase"
      className="py-16 sm:py-24 border-b border-[var(--color-paper-border)] bg-[var(--color-paper)] relative overflow-hidden"
      data-reveal
    >
      {/* Subtle organic background glow */}
      <div
        className="absolute top-1/2 -right-36 w-96 h-96 bg-[var(--color-accent-soft)] rounded-full blur-3xl pointer-events-none opacity-50"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Feature Narrative & Actions */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <h2
                className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-[var(--color-ink)] leading-[1.18] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ruang Konseling &amp; Refleksi, Selalu Siap di Genggaman
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed max-w-xl">
                Pasang aplikasi web resmi Amelia langsung di ponsel atau komputermu. Kamu bisa nikmati ruang curhat anonim, asesmen mandiri, dan bacaan refleksi tanpa perlu unduh aplikasi berat dari Play Store atau App Store.
              </p>
            </div>

            {/* 4 Core Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5 pt-1">
              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] flex items-start gap-3.5 card-interactive">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--color-ink)] leading-snug">Akses Instan 1-Sentuhan</h3>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    Buka langsung dari beranda layar (Home Screen) tanpa perlu membuka browser dan mengetik alamat web.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] flex items-start gap-3.5 card-interactive">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--color-ink)] leading-snug">Dukungan Bacaan Offline</h3>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    Artikel refleksi dan panduan konseling tetap tersimpan rapi untuk dibaca saat kuota habis atau sinyal darurat.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] flex items-start gap-3.5 card-interactive">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <Feather className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--color-ink)] leading-snug">Super Ringan (&lt; 2 MB)</h3>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    Sangat hemat memori perangkat, tanpa update berulang yang memakan puluhan gigabyte penyimpanan.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] flex items-start gap-3.5 card-interactive">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--color-ink)] leading-snug">Ruang Aman &amp; Privat</h3>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    Tampilan layar penuh tanpa bilah alamat, menjaga privasimu saat berbagi cerita curhat.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2" suppressHydrationWarning>
              {showInstalled ? (
                <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Aplikasi Telah Terpasang di Perangkat Ini</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => triggerPwaInstall()}
                    className="btn-primary btn-interactive min-h-[46px] px-6 text-sm inline-flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Pasang Aplikasi Sekarang</span>
                  </button>

                  <button
                    type="button"
                    onClick={openIosModal}
                    className="btn-secondary btn-interactive min-h-[46px] px-5 text-sm inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[var(--color-ink-soft)]" aria-hidden="true" />
                    <span suppressHydrationWarning>{isIosDevice ? 'Cara Pasang di iOS (Safari)' : 'Panduan Pasang iPhone'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Realistic Smartphone Mockup with Large QR Code */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[310px]">
              {/* Outer phone casing */}
              <div className="relative w-full aspect-[9/18.5] bg-[#1a231f] rounded-[42px] p-3 shadow-2xl border-4 border-[#2d3a33] ring-1 ring-black/20 flex flex-col overflow-hidden">
                {/* Speaker pill notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black/80 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800" />
                </div>

                {/* Inner Phone Screen */}
                <div className="relative w-full h-full rounded-[34px] bg-[var(--color-paper)] overflow-hidden flex flex-col text-[var(--color-ink)] select-none">
                  {/* Status Bar */}
                  <div className="pt-6 px-5 pb-2 flex items-center justify-between text-[10px] font-semibold text-[var(--color-ink-muted)]">
                    <span>09:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px]">4G</span>
                      <div className="w-4 h-2 rounded-xs border border-[var(--color-ink-muted)] p-0.5">
                        <div className="w-full h-full bg-[var(--color-ink)] rounded-xs" />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="px-4 py-3 border-b border-[var(--color-paper-border)] flex items-center justify-between bg-white/60 backdrop-blur-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-[var(--color-paper-border)] bg-[#FAF0E6] shrink-0 shadow-2xs">
                        <Image
                          src="/icons/icon-192x192.png"
                          alt="Logo Aplikasi Amelia"
                          width={28}
                          height={28}
                          priority
                          unoptimized
                          decoding="sync"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-display text-xs font-semibold text-[var(--color-ink)] block leading-tight">
                          Amelia
                        </span>
                        <span className="text-[9px] text-[var(--color-ink-muted)] block leading-none">
                          Bimbingan Konseling Islam
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </div>

                  {/* App Content: Big QR Code for Instant Mobile Install */}
                  <div className="p-4 flex-1 flex flex-col justify-between items-center text-center">
                    <div>
                      <h4 className="font-display text-xs font-semibold text-[var(--color-ink)] leading-tight">
                        Scan untuk Memasang
                      </h4>
                      <p className="text-[10px] text-[var(--color-ink-muted)] leading-tight mt-1 max-w-[210px] mx-auto">
                        Arahkan kamera ponselmu ke kode ini untuk langsung memasang aplikasi di HP.
                      </p>
                    </div>

                    {/* Prominent QR Code */}
                    <div className="w-44 h-44 bg-white p-2.5 rounded-2xl border border-[var(--color-paper-border)] shadow-md flex items-center justify-center my-auto">
                      <Image
                        src="/qr-app.svg"
                        alt="QR Code Pemasangan Aplikasi Amelia"
                        width={160}
                        height={160}
                        priority
                        unoptimized
                        decoding="sync"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Status hint below QR */}
                    <div className="w-full p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                      <span className="text-[9.5px] font-medium text-emerald-800">
                        Otomatis Muncul Pilihan Pasang
                      </span>
                    </div>
                  </div>

                  {/* Bottom Navigation Bar */}
                  <div className="px-4 py-2 border-t border-[var(--color-paper-border)] bg-white/90 flex items-center justify-around text-[9px] text-[var(--color-ink-muted)]">
                    <span className="font-semibold text-[var(--color-accent)]">Beranda</span>
                    <span>Layanan</span>
                    <span>Curhat</span>
                    <span>Artikel</span>
                  </div>

                  {/* Home indicator bar */}
                  <div className="py-1.5 flex justify-center bg-white/90">
                    <div className="w-24 h-1 rounded-full bg-stone-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
