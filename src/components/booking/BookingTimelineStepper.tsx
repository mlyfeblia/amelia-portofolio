'use client';

import React from 'react';
import { Clock, CalendarCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { BookingStatus } from '@/types';

interface BookingTimelineStepperProps {
  status: BookingStatus;
  date: string;
  timeSlot: string;
}

export function BookingTimelineStepper({ status, date, timeSlot }: BookingTimelineStepperProps) {
  if (status === 'dibatalkan') {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Fase: Janji Temu Dibatalkan / Memerlukan Reschedule</span>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Sesi untuk tanggal {date} ({timeSlot}) telah dibatalkan atau perlu penyesuaian jadwal ulang. Kamu dapat mengonfirmasi jadwal pengganti langsung via WhatsApp atau mengajukan janji temu baru kapan saja.
        </p>
      </div>
    );
  }

  const steps = [
    {
      id: 1,
      name: 'Permohonan Terkirim',
      desc: 'Menunggu peninjauan slot oleh Amel',
      icon: Clock,
      isCompleted: status === 'terkonfirmasi' || status === 'selesai',
      isCurrent: status === 'menunggu',
    },
    {
      id: 2,
      name: 'Terkonfirmasi & Siap',
      desc: 'Jadwal disetujui, tautan sesi disiapkan',
      icon: CalendarCheck,
      isCompleted: status === 'selesai',
      isCurrent: status === 'terkonfirmasi',
    },
    {
      id: 3,
      name: 'Sesi Selesai',
      desc: 'Konseling tuntas & langkah bertumbuh',
      icon: CheckCircle2,
      isCompleted: status === 'selesai',
      isCurrent: false,
    },
  ];

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] px-1">
        <span className="font-semibold text-[var(--color-ink)]">Perjalanan Sesi Konseling:</span>
        <span className="font-medium text-[var(--color-accent)]">
          {status === 'menunggu' && 'Fase 1 dari 3: Menunggu Verifikasi'}
          {status === 'terkonfirmasi' && 'Fase 2 dari 3: Jadwal Terkonfirmasi'}
          {status === 'selesai' && 'Fase 3 dari 3: Konseling Selesai'}
        </span>
      </div>

      {/* Stepper Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          let containerClasses = 'bg-[var(--color-paper)] border-[var(--color-paper-border)] text-[var(--color-ink-muted)]';
          let iconClasses = 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)]';

          if (step.isCurrent) {
            containerClasses = 'bg-[var(--color-accent-soft)] border-[var(--color-accent-border)] text-[var(--color-accent)] ring-1 ring-[var(--color-accent-soft)] shadow-xs';
            iconClasses = 'bg-[var(--color-accent)] text-white';
          } else if (step.isCompleted) {
            containerClasses = 'bg-emerald-50/70 border-emerald-200 text-emerald-900';
            iconClasses = 'bg-emerald-600 text-white';
          }

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${containerClasses}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${iconClasses}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold truncate text-[var(--color-ink)]">
                    {step.name}
                  </span>
                  {idx < 2 && (
                    <ArrowRight className="w-3 h-3 text-[var(--color-ink-muted)]/40 hidden sm:inline shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-[var(--color-ink-muted)] mt-0.5 leading-snug line-clamp-2">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
