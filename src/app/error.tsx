'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCcw, Home, MessageCircle, AlertTriangle } from 'lucide-react';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to client console or monitoring service safely
    console.error('Unhandled route error caught by boundary:', error);
  }, [error]);

  return (
    <>
      <Navbar />
      <main
        id="main-content"
        className="min-h-[calc(100vh-4rem)] bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col justify-center py-12 sm:py-16 md:py-20 page-enter"
        tabIndex={-1}
      >
        <div className="max-w-xl mx-auto px-5 sm:px-8 w-full text-center space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 tracking-wide shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kendala Teknis Sementara</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-[var(--color-ink)] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Terjadi Kendala Memuat Halaman Ini
            </h1>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Mohon maaf atas ketidaknyamanan ini. Terjadi gangguan sistem yang tidak terduga saat memproses permintaan Anda. Data dan kerahasiaan Anda tetap aman terjaga.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="btn-primary min-h-[46px] px-6 text-sm inline-flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" aria-hidden="true" />
              <span>Coba Muat Ulang</span>
            </button>

            <Link
              href="/"
              className="btn-secondary min-h-[46px] px-5 text-sm inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-[var(--color-ink-soft)]" aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </Link>

            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary min-h-[46px] px-5 text-sm inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" aria-hidden="true" />
              <span>Bantuan WhatsApp</span>
            </a>
          </div>

          {/* Technical reference code if available */}
          {error.digest && (
            <div className="pt-6 border-t border-[var(--color-paper-border)]">
              <p className="text-[11px] text-[var(--color-ink-soft)] font-mono">
                Kode Referensi Gangguan: <span className="select-all">{error.digest}</span>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
