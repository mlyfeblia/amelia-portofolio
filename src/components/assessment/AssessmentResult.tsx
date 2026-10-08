'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  RotateCcw,
  CheckCircle2,
  MessageCircle,
  BarChart2,
  Brain,
  HeartPulse,
  Compass,
  Users,
} from 'lucide-react';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';
import { AssessmentResultData, DimensionScoreResult, DimensionKey } from '@/data/assessment-data';
import { getAssessmentWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface AssessmentResultProps {
  result: AssessmentResultData;
  totalScore: number;
  maxScore: number;
  dimensionScores: DimensionScoreResult[];
  onReset: () => void;
}

function getDimensionIcon(key: DimensionKey) {
  switch (key) {
    case 'pikiran':
      return <Brain className="w-4 h-4 shrink-0" aria-hidden="true" />;
    case 'emosi':
      return <HeartPulse className="w-4 h-4 shrink-0" aria-hidden="true" />;
    case 'spiritual':
      return <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />;
    case 'sosial':
      return <Users className="w-4 h-4 shrink-0" aria-hidden="true" />;
    default:
      return null;
  }
}

export function AssessmentResult({
  result,
  totalScore,
  maxScore,
  dimensionScores,
  onReset,
}: AssessmentResultProps) {
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Format dimension breakdown for WhatsApp sharing
  const dimensionSummaryText = dimensionScores
    .map((d) => `• ${d.shortName}: ${d.score}/${d.maxScore} (${d.percentage}%)`)
    .join('\n');

  const getStatusBadge = (status: DimensionScoreResult['status']) => {
    switch (status) {
      case 'optimal':
        return {
          label: 'Optimal',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          barClass: 'bg-emerald-600',
        };
      case 'moderate':
        return {
          label: 'Terkendali',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          barClass: 'bg-amber-600',
        };
      case 'need_attention':
      default:
        return {
          label: 'Perhatian',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          barClass: 'bg-rose-600',
        };
    }
  };

  return (
    <div className="space-y-8 tab-content-enter" aria-live="polite">
      {/* ── Top Hero Evaluation Banner ──────────────────────────────── */}
      <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-[var(--color-paper)] to-[var(--color-paper-muted)]/40 border border-[var(--color-paper-border)] shadow-xs space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <h2
              className="text-xl sm:text-3xl lg:text-[2rem] font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {result.level}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Score Box */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[var(--color-paper-border)] shadow-2xs flex sm:flex-col items-center justify-between sm:justify-center text-center shrink-0 w-full sm:w-auto sm:min-w-[130px] gap-2 sm:gap-1">
            <div className="text-left sm:text-center">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--color-ink-soft)] uppercase tracking-wider block">
                Skor Total
              </span>
              <div className="font-mono text-xl sm:text-3xl font-bold text-[var(--color-accent)] mt-0.5">
                {totalScore}<span className="text-xs sm:text-sm font-normal text-[var(--color-ink-muted)]">/{maxScore}</span>
              </div>
            </div>
            <span className="text-xs font-medium text-[var(--color-ink-muted)]">
              {percentage}% Stabil
            </span>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <div className="pt-3.5 sm:pt-4 border-t border-[var(--color-paper-border)]/70 text-xs sm:text-sm text-[var(--color-ink)]/90 leading-relaxed">
          {result.body}
        </div>
      </div>

      {/* ── 4 Dimensions Breakdown Visual Grid ────────────────────── */}
      <div className="space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-lg font-semibold text-[var(--color-ink)]">
              Evaluasi 4 Dimensi Kesejahteraan Jiwa
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs text-[var(--color-ink-muted)]">
            Maks. 6 Poin Per Dimensi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {dimensionScores.map((dim) => {
            const meta = getStatusBadge(dim.status);
            return (
              <div
                key={dim.key}
                className="card-interactive group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[var(--color-paper-border)] space-y-3 sm:space-y-3.5 shadow-2xs hover:border-[var(--color-accent)] hover:shadow-md transition-all duration-200 cursor-default"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-paper)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--color-paper-border)] group-hover:bg-[var(--color-accent-soft)] group-hover:scale-105 transition-all duration-200">
                      {getDimensionIcon(dim.key)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--color-ink)] leading-snug">
                        {dim.name}
                      </h4>
                      <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 font-mono">
                        {dim.score} / {dim.maxScore} Poin ({dim.percentage}%)
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border shrink-0',
                      meta.badgeClass
                    )}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Dimension Progress Bar */}
                <div className="h-2 w-full bg-[var(--color-paper-muted)] rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-500 rounded-full', meta.barClass)}
                    style={{ width: `${Math.max(dim.percentage, 6)}%` }}
                  />
                </div>

                {/* Dimension Specific Insight */}
                <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed pt-2 border-t border-[var(--color-paper-border)]/60">
                  {dim.advice}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Recommendations ────────────────────────────────────────── */}
      <div className="p-4 sm:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-3.5 shadow-2xs hover:border-[var(--color-accent)]/40 transition-colors">
        <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
          Saran Pendampingan &amp; Langkah Terarah:
        </p>
        <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-[var(--color-ink)]/90" role="list">
          {result.recs.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5 sm:gap-3">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" aria-hidden="true" />
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Actions & CTA Bar ──────────────────────────────────── */}
      <div className="pt-2">
        {/* CTA Consultation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2 border-t border-[var(--color-paper-border)]/60">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
            <a
              href={getAssessmentWhatsAppUrl({
                level: result.level,
                totalScore,
                maxScore,
                dimensionsSummary: dimensionSummaryText,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="group btn-secondary btn-interactive text-xs sm:text-sm py-2.5 px-4 inline-flex items-center justify-center gap-2 rounded-xl hover:-translate-y-0.5 hover:shadow-xs hover:border-[#25D366]/40 hover:bg-[#25D366]/10 transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] transition-transform duration-200 group-hover:scale-110 shrink-0" />
              <span>Konsultasi WhatsApp</span>
            </a>
            <Link
              href="/schedule"
              className="group btn-primary btn-interactive text-xs sm:text-sm py-2.5 px-4 inline-flex items-center justify-center gap-2 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <Calendar className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3 shrink-0" />
              <span>Jadwalkan Konseling</span>
            </Link>
          </div>

          <button
            onClick={() => setShowResetConfirmModal(true)}
            type="button"
            className="group btn-secondary btn-interactive text-xs sm:text-sm py-2.5 px-4 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto hover:-translate-y-0.5 hover:shadow-2xs transition-all duration-200 order-2 sm:order-1"
            aria-label="Ulangi asesmen dari awal"
          >
            <RotateCcw className="w-4 h-4 text-[var(--color-ink-soft)] transition-transform duration-300 group-hover:-rotate-90 shrink-0" aria-hidden="true" />
            <span>Ulangi Asesmen</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Assessment */}
      <ConfirmDecisionModal
        isOpen={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        onConfirm={() => {
          setShowResetConfirmModal(false);
          onReset();
        }}
        title="Ulangi Asesmen dari Awal?"
        description="Jawaban saat ini akan dikosongkan untuk memulai evaluasi baru. Hasil evaluasi yang telah tuntas tetap tersimpan aman di tab Riwayat perangkat ini."
        confirmLabel="Ya, Ulangi Asesmen"
        variant="neutral"
        icon={<RotateCcw className="w-5 h-5 text-[var(--color-ink-muted)]" />}
      />
    </div>
  );
}
