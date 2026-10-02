'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  MessageSquareText, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Send,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Booking, AnonymousMessage, BookingStatus } from '@/types';
import { getAdminContactWhatsAppUrl } from '@/lib/whatsapp';

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [curhatList, setCurhatList] = useState<AnonymousMessage[]>([]);
  const [articlesCount, setArticlesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resB, resC, resA] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/curhat'),
        fetch('/api/articles'),
      ]);
      const dataB = await resB.json();
      const dataC = await resC.json();
      const dataA = await resA.json();

      if (dataB.success) setBookings(dataB.data);
      if (dataC.success) setCurhatList(dataC.data);
      if (dataA.success) setArticlesCount(dataA.data.length);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  // Metrics
  const waitingBookings = bookings.filter((b) => b.status === 'menunggu');
  const confirmedBookings = bookings.filter((b) => b.status === 'terkonfirmasi');
  const unansweredCurhat = curhatList.filter((c) => !c.isAnswered);

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Welcome Banner */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h1
            className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Selamat Datang, Amel
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            Pantau permohonan janji temu konseling, tanggapi curhat anonim sahabat, dan kelola data layanan.
          </p>
        </div>

        <button
          onClick={loadData}
          type="button"
          disabled={loading}
          className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 4 Metric Summary Cards (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Perlu Konfirmasi */}
        <Link
          href="/admin/bookings"
          className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs">Perlu Konfirmasi</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              {waitingBookings.length}
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
              <span>Janji temu baru</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
            </div>
          </div>
        </Link>

        {/* Card 2: Sesi Terkonfirmasi */}
        <Link
          href="/admin/bookings"
          className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs">Terkonfirmasi</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-medium text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-display)' }}>
              {confirmedBookings.length}
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
              <span>Jadwal aktif</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
            </div>
          </div>
        </Link>

        {/* Card 3: Curhat Menunggu */}
        <Link
          href="/admin/counseling"
          className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs">Curhat Menanti</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <MessageSquareText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              {unansweredCurhat.length}
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
              <span>Belum dibalas</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
            </div>
          </div>
        </Link>

        {/* Card 4: Artikel Terpublikasi */}
        <Link
          href="/admin/articles"
          className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] transition-all shadow-xs group card-interactive flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs">Artikel Terbit</span>
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              {articlesCount || 8}
            </div>
            <div className="text-[11px] sm:text-xs text-[var(--color-ink-muted)] mt-1 flex items-center justify-between">
              <span>Tulisan aktif</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--color-accent)]" />
            </div>
          </div>
        </Link>

      </div>

      {/* Two Column Section: Actionable Bookings & Pending Curhat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Janji Temu Butuh Konfirmasi */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-lg sm:text-xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Permohonan Janji Temu Terbaru
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Konfirmasi segera agar konseli mendapatkan kepastian jadwal.
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua ({bookings.length})
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)]">
              Memuat janji temu...
            </div>
          ) : waitingBookings.length === 0 ? (
            <div className="p-8 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-1">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-accent)] mx-auto mb-2" />
              <p className="font-semibold text-[var(--color-ink)]">Semua janji temu sudah terkonfirmasi!</p>
              <p>Tidak ada permohonan baru yang tertunda saat ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingBookings.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3 card-interactive"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)]">
                      {item.code}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
                      Menunggu Konfirmasi
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">
                      {item.name} {item.alias && item.alias !== item.name ? `(${item.alias})` : ''}
                    </h3>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                      {item.category} · {item.date} ({item.timeSlot})
                    </p>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-[var(--color-ink-muted)] italic bg-[var(--color-paper)] p-2.5 rounded-lg border border-[var(--color-paper-border)] line-clamp-2">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}

                  <div className="pt-2 border-t border-[var(--color-paper-border)] flex items-center justify-between gap-3">
                    <a
                      href={getAdminContactWhatsAppUrl({
                        clientPhone: item.phone,
                        clientName: item.alias || item.name,
                        code: item.code,
                        date: item.date,
                        slot: item.timeSlot,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent)] hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Chat WhatsApp
                    </a>

                    <button
                      onClick={() => updateBookingStatus(item.id, 'terkonfirmasi')}
                      type="button"
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Konfirmasi Sesi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Curhat Belum Dibalas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-lg sm:text-xl font-medium text-[var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Curhat Menanti Jawaban
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Pesan anonim yang membutuhkan ruang dengar dan arahan.
              </p>
            </div>
            <Link
              href="/admin/counseling"
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
            >
              Semua ({curhatList.length})
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)]">
              Memuat pesan curhat...
            </div>
          ) : unansweredCurhat.length === 0 ? (
            <div className="p-8 text-center bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl text-xs text-[var(--color-ink-muted)] space-y-1">
              <CheckCircle2 className="w-6 h-6 text-[var(--color-accent)] mx-auto mb-2" />
              <p className="font-semibold text-[var(--color-ink)]">Hebat! Semua curhat sudah terjawab.</p>
              <p>Tidak ada pesan yang menunggu balasan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unansweredCurhat.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3 card-interactive"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--color-ink)]">{c.alias}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium">
                      {c.category}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] italic leading-relaxed line-clamp-3">
                    &ldquo;{c.message}&rdquo;
                  </p>

                  <div className="pt-2 border-t border-[var(--color-paper-border)] flex justify-end">
                    <Link
                      href="/admin/counseling"
                      className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Beri Tanggapan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
