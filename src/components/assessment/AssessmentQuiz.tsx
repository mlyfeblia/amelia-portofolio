'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { AssessmentQuestion } from '@/data/assessment-data';

interface AssessmentQuizProps {
  question: AssessmentQuestion;
  step: number;
  totalSteps: number;
  isTransitioning: boolean;
  onSelect: (score: number) => void;
  onPrev: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C'];

export function AssessmentQuiz({
  question,
  step,
  totalSteps,
  isTransitioning,
  onSelect,
  onPrev,
}: AssessmentQuizProps) {
  return (
    <div>
      {/* Meta indicator */}
      <div className="flex items-center justify-between gap-4 mb-5 text-xs text-[var(--color-ink-soft)] font-medium">
        <span>{question.dimension}</span>
        <span>Langkah {step + 1} dari {totalSteps}</span>
      </div>

      {/* Question */}
      <h2
        id={`question-${step}`}
        className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] mb-6 leading-snug"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {question.question}
      </h2>

      {/* Options */}
      <fieldset aria-labelledby={`question-${step}`}>
        <legend className="sr-only">Pilih salah satu jawaban yang paling mendekati kondisimu</legend>
        <div className="space-y-3">
          {question.options.map((opt, i) => (
            <button
              key={i}
              disabled={isTransitioning}
              onClick={() => onSelect(opt.score)}
              type="button"
              className="chip-interactive w-full text-left p-4 sm:p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl text-sm sm:text-base text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-all flex items-start gap-3.5 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label={`Pilihan ${OPTION_LETTERS[i]}: ${opt.text}`}
            >
              <span
                className="w-6 h-6 rounded-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] font-semibold text-xs text-[var(--color-ink-soft)] group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5 select-none transition-colors"
                aria-hidden="true"
              >
                {OPTION_LETTERS[i]}
              </span>
              <span className="leading-relaxed">
                {opt.text}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {step > 0 && (
        <div className="mt-6 pt-4 border-t border-[var(--color-paper-border)]">
          <button
            onClick={onPrev}
            type="button"
            className="text-xs font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke pertanyaan sebelumnya</span>
          </button>
        </div>
      )}
    </div>
  );
}
