'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCcw, CheckCircle, MessageCircle } from 'lucide-react';
import { AssessmentResultData } from '@/data/assessment-data';
import { getAssessmentWhatsAppUrl } from '@/lib/whatsapp';

interface AssessmentResultProps {
  result: AssessmentResultData;
  totalScore: number;
  onReset: () => void;
}

export function AssessmentResult({
  result,
  totalScore,
  onReset,
}: AssessmentResultProps) {
  return (
    <div className="space-y-6 animate-fade-in-up" aria-live="polite">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[var(--color-paper-border)]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-semibold mb-2">
            <span>Skor Anda: {totalScore} / 21</span>
          </div>
          <h3
            className="text-xl sm:text-2xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {result.level}
          </h3>
          <p className="text-sm font-semibold text-[var(--color-accent)] mt-0.5">
            {result.category}
          </p>
        </div>

        <button
          onClick={onReset}
          type="button"
          className="btn-secondary text-xs py-2 px-3 self-start sm:self-center cursor-pointer"
          aria-label="Ulangi asesmen dari awal"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Ulangi Asesmen
        </button>
      </div>

      <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
        {result.body}
      </p>

      {/* Recommendations */}
      <div className="p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg space-y-2.5">
        <p className="text-xs font-semibold text-[var(--color-ink)] uppercase tracking-wider">
          Saran Pendampingan:
        </p>
        <ul className="space-y-2 text-sm text-[var(--color-ink-muted)]" role="list">
          {result.recs.map((rec, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Ingin berdiskusi dan mendalami hasil ini bersama Amel?
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <a
            href={getAssessmentWhatsAppUrl({
              level: result.level,
              category: result.category,
              totalScore,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm inline-flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            Konsultasi via WhatsApp
          </a>
          <Link
            href="/schedule"
            className="btn-primary text-sm inline-flex items-center justify-center gap-2"
          >
            Jadwalkan Sesi Konseling
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
