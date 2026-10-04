'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { Booking } from '@/types';
import { getAdminContactWhatsAppUrl } from '@/lib/whatsapp';
import { SkeletonBookingCard } from '@/components/ui/Skeleton';

interface OverviewRecentBookingsProps {
  bookings: Booking[];
  loading: boolean;
  onConfirm: (id: string) => void;
}

export function OverviewRecentBookings({
  bookings,
  loading,
  onConfirm,
}: OverviewRecentBookingsProps) {
  const waitingBookings = bookings.filter((b) => b.status === 'menunggu');

  return (
    <div className="lg:col-span-7 space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-base sm:text-lg font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Permohonan Janji Temu Terbaru
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--color-ink-muted)]">
            Konfirmasi segera agar konseli mendapatkan kepastian jadwal.
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
        >
          Semua ({bookings.length})
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          <SkeletonBookingCard />
          <SkeletonBookingCard />
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
              className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3 transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-semibold px-2 py-0.5 rounded bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[var(--color-accent)] text-[11px]">
                  {item.code}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700">
                  Menunggu Konfirmasi
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                  {item.name} {item.alias && item.alias !== item.name ? `(${item.alias})` : ''}
                </h3>
                <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                  {item.category} &bull; {item.date} ({item.timeSlot})
                </p>
              </div>

              {item.notes && (
                <p className="text-xs text-[var(--color-ink-muted)] italic bg-[var(--color-paper)] p-2.5 rounded-lg border border-[var(--color-paper-border)] line-clamp-2">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}

              <div className="pt-2 border-t border-[var(--color-paper-border)] flex items-center justify-between gap-2">
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
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => onConfirm(item.id)}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer shadow-xs"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
