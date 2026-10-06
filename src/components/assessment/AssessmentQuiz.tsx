'use client';

import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { AssessmentQuestion } from '@/data/assessment-data';
import { cn } from '@/lib/utils';

interface AssessmentQuizProps {
  question: AssessmentQuestion;
  step: number;
  totalSteps?: number;
  direction?: 'next' | 'prev';
  selectedScore?: number;
  isTransitioning: boolean;
  onSelect: (score: number) => void;
  onPrev: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function AssessmentQuiz({
  question,
  step,
  direction = 'next',
  selectedScore,
  isTransitioning,
  onSelect,
  onPrev,
}: AssessmentQuizProps) {
  const animationClass = direction === 'next' ? 'quiz-slide-next' : 'quiz-slide-prev';

  return (
    <div key={step} className={cn('space-y-4 sm:space-y-6', animationClass)}>
      {/* ── Question Header ───────────────────────── */}
      <div className="pb-3 border-b border-[var(--color-paper-border)]/60">
        <h2
          id={`question-${step}`}
          className="text-lg sm:text-2xl lg:text-[1.75rem] font-medium text-[var(--color-ink)] leading-snug tracking-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {question.question}
        </h2>
      </div>

      {/* ── Option Cards with Tactile Hover Physics ────────────────── */}
      <fieldset aria-labelledby={`question-${step}`}>
        <legend className="sr-only">Pilihan respon untuk pertanyaan {step + 1}</legend>
        <div className="space-y-2.5 sm:space-y-3 pt-0.5" role="radiogroup">
          {question.options.map((opt, i) => {
            const isSelected = selectedScore === opt.score;
            return (
              <button
                key={`${question.id}-${opt.score}`}
                disabled={isTransitioning}
                onClick={() => onSelect(opt.score)}
                type="button"
                className={cn(
                  'card-interactive group w-full text-left p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border flex items-start gap-3 sm:gap-4 cursor-pointer active:scale-[0.98] transition-all duration-150',
                  isSelected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)]/20 shadow-sm'
                    : 'border-[var(--color-paper-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/35 hover:shadow-xs bg-white'
                )}
                aria-label={`Pilihan ${OPTION_LETTERS[i]}: ${opt.text}`}
              >
                {/* Letter Badge with Hover Scale & Color Flip */}
                <span
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 select-none transition-all duration-200 border',
                    isSelected
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-2xs scale-105'
                      : 'bg-[var(--color-paper)] border-[var(--color-paper-border)] text-[var(--color-ink-soft)] group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:scale-105'
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? <Check className="w-4 h-4 text-white stroke-[2.5]" /> : OPTION_LETTERS[i]}
                </span>

                <span className="text-[13px] sm:text-base text-[var(--color-ink)] leading-relaxed flex-1 pt-0.5 group-hover:text-[var(--color-ink)] transition-colors">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* ── Navigation Bottom Bar ──────────────────── */}
      {step > 0 && (
        <div className="pt-2 border-t border-[var(--color-paper-border)]/60 flex items-center justify-start min-h-[44px]">
          <button
            onClick={onPrev}
            type="button"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] py-1.5 px-2.5 sm:px-3 rounded-xl hover:bg-[var(--color-accent-soft)] transition-all duration-200 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
            <span>
              <span className="sm:hidden">Pertanyaan sebelumnya</span>
              <span className="hidden sm:inline">Kembali ke pertanyaan sebelumnya</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
