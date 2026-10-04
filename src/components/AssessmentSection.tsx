'use client';

import React, { useState, useCallback, useRef } from 'react';
import { assessmentQuestions, assessmentResults } from '@/data/assessment-data';
import { AssessmentQuiz } from './assessment/AssessmentQuiz';
import { AssessmentResult } from './assessment/AssessmentResult';

export default function AssessmentSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = useCallback((score: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setAnswers((prev) => {
      const updated = [...prev];
      updated[step] = score;
      return updated;
    });

    setTimeout(() => {
      if (step < assessmentQuestions.length - 1) {
        setStep((prev) => prev + 1);
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          if (rect.top < 0) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      } else {
        setDone(true);
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      setIsTransitioning(false);
    }, 120);
  }, [step, isTransitioning]);

  const handleReset = useCallback(() => {
    setStep(0);
    setAnswers([]);
    setDone(false);
    setIsTransitioning(false);
  }, []);

  const total = answers.reduce((a, b) => a + b, 0);
  const result = done
    ? assessmentResults.find((r) => total >= r.range[0] && total <= r.range[1]) ?? assessmentResults[2]
    : null;

  const progress = Math.round(((step + (done ? 1 : 0)) / assessmentQuestions.length) * 100);

  return (
    <div
      ref={containerRef}
      className="border border-[var(--color-paper-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden shadow-xs"
      role="region"
      aria-label={done ? 'Hasil asesmen jiwa' : `Pertanyaan ${step + 1} dari ${assessmentQuestions.length}`}
    >
      {/* Progress bar */}
      <div
        className="h-1.5 bg-[var(--color-paper-muted)]"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Kemajuan asesmen: ${progress}%`}
      >
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6 sm:p-10">
        {!done ? (
          <AssessmentQuiz
            question={assessmentQuestions[step]}
            step={step}
            totalSteps={assessmentQuestions.length}
            isTransitioning={isTransitioning}
            onSelect={handleSelect}
            onPrev={() => setStep((s) => s - 1)}
          />
        ) : result ? (
          <AssessmentResult
            result={result}
            totalScore={total}
            onReset={handleReset}
          />
        ) : null}
      </div>
    </div>
  );
}
