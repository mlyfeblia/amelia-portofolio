'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ClipboardList, History } from 'lucide-react';
import {
  AssessmentQuestion,
  assessmentQuestions,
  assessmentResults,
  computeDimensionScoresById,
  sampleAssessmentQuestions,
  DimensionScoreResult,
} from '@/data/assessment-data';
import { AssessmentQuiz } from './assessment/AssessmentQuiz';
import { AssessmentResult } from './assessment/AssessmentResult';
import { AssessmentHistory } from './assessment/AssessmentHistory';
import { saveDeviceAssessment, useDeviceAssessments } from '@/lib/assessment-storage';
import { getPreferredScrollBehavior } from '@/lib/dom-utils';

interface AssessmentSectionProps {
  initialTab?: 'quiz' | 'history';
}

export default function AssessmentSection({ initialTab }: AssessmentSectionProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSavedRef = useRef<boolean>(false);
  const [sessionSeed, setSessionSeed] = useState<string>('initial-seed');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(() => assessmentQuestions.slice(0, 8));
  // Always initialize with SSR-safe defaults based on props
  const [activeTab, setActiveTab] = useState<'quiz' | 'history'>(initialTab || 'quiz');
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [answersById, setAnswersById] = useState<Record<number, number>>({});
  const [done, setDone] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Synchronize prop changes during render
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    if (initialTab) setActiveTab(initialTab);
  }

  // Listen to browser navigation events & sync post-hydration on mount
  useEffect(() => {
    const handlePopState = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const tabParam = searchParams.get('tab');
        const hash = window.location.hash;

        if (tabParam === 'history' || hash === '#history' || hash === '#riwayat') {
          setActiveTab('history');
        } else {
          setActiveTab('quiz');
        }
      } catch {}
    };

    handlePopState();

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleTabChange = (tab: 'quiz' | 'history') => {
    setActiveTab(tab);
    try {
      sessionStorage.removeItem('assessment_active_tab');
      const url = new URL(window.location.href);
      if (tab === 'history') {
        url.searchParams.set('tab', 'history');
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  // Acak sampling 8 pertanyaan atau pulihkan draf kuis yang belum selesai pasca-rekoneksi/rotasi
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const rawDraft = sessionStorage.getItem('amelia_quiz_draft_v1');
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft);
          if (
            parsed &&
            typeof parsed.step === 'number' &&
            parsed.answersById &&
            typeof parsed.sessionSeed === 'string'
          ) {
            setSessionSeed(parsed.sessionSeed);
            setQuestions(sampleAssessmentQuestions(parsed.sessionSeed));
            setStep(parsed.step);
            setAnswersById(parsed.answersById);
            return;
          }
        }
        const freshSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        setSessionSeed(freshSeed);
        setQuestions(sampleAssessmentQuestions(freshSeed));
      } catch {
        const fallback = `${Date.now()}`;
        setSessionSeed(fallback);
        setQuestions(sampleAssessmentQuestions(fallback));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const deviceAssessments = useDeviceAssessments();
  const historyCount = deviceAssessments.length;

  const answeredValues = Object.values(answersById);
  const totalScore = answeredValues.reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 3; // 8 * 3 = 24

  const result = done
    ? assessmentResults.find((r) => totalScore >= r.range[0] && totalScore <= r.range[1]) ?? assessmentResults[1]
    : null;

  const dimensionScores: DimensionScoreResult[] = done ? computeDimensionScoresById(answersById, questions) : [];

  // Automatically save completed assessment to device history (anti-duplicate with hasSavedRef)
  useEffect(() => {
    if (done && result && answeredValues.length === questions.length && !hasSavedRef.current) {
      hasSavedRef.current = true;
      const scores = computeDimensionScoresById(answersById, questions);
      saveDeviceAssessment({
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        level: result.level,
        category: result.category,
        summary: result.summary,
        dimensions: scores,
        recs: result.recs,
      });
      try {
        sessionStorage.removeItem('amelia_quiz_draft_v1');
      } catch {}
    }
  }, [done, result, totalScore, maxScore, answeredValues.length, questions, answersById]);

  const handleSelect = useCallback(
    (score: number) => {
      if (isTransitioning) return;
      const currentQuestion = questions[step];
      if (!currentQuestion) return;

      setIsTransitioning(true);
      setDirection('next');

      const nextAnswers = {
        ...answersById,
        [currentQuestion.id]: score,
      };
      setAnswersById(nextAnswers);

      const nextStep = Math.min(step + 1, questions.length - 1);
      try {
        sessionStorage.setItem(
          'amelia_quiz_draft_v1',
          JSON.stringify({
            step: nextStep,
            answersById: nextAnswers,
            sessionSeed,
          })
        );
      } catch {}

      // Tactile delay: let user see the selected state before sliding to next question
      setTimeout(() => {
        if (step < questions.length - 1) {
          setStep((prev) => prev + 1);
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            if (rect.top < 72) {
              containerRef.current.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
            }
          }
        } else {
          setDone(true);
          if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
          }
        }
        setIsTransitioning(false);
      }, 190);
    },
    [step, isTransitioning, questions, answersById, sessionSeed]
  );

  const handlePrev = useCallback(() => {
    if (step > 0) {
      setDirection('prev');
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleReset = useCallback(() => {
    hasSavedRef.current = false;
    try {
      sessionStorage.removeItem('amelia_quiz_draft_v1');
      sessionStorage.removeItem('amelia_assessment_session_seed');
    } catch {}
    const freshSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setSessionSeed(freshSeed);
    setQuestions(sampleAssessmentQuestions(freshSeed));
    setDirection('next');
    setStep(0);
    setAnswersById({});
    setDone(false);
    setIsTransitioning(false);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.top < 72) {
        containerRef.current.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
      }
    }
  }, []);

  const progress = Math.round(((step + (done ? 1 : 0)) / questions.length) * 100);

  return (
    <div
      ref={containerRef}
      className="bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      role="region"
      aria-label="Asesmen Kesejahteraan Jiwa Amelia"
    >
      {/* ── Top Header with Unified Segmented Navigation Bar ─────────── */}
      <div className="relative px-4 py-3.5 sm:px-8 sm:py-5 border-b border-[var(--color-paper-border)] bg-[var(--color-paper)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Segmented Tab Controls: Fixed at top on mobile (order-1) so position NEVER shifts */}
        <div
          className="order-1 sm:order-2 w-full sm:w-auto grid grid-cols-2 sm:flex items-center p-1 rounded-xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] shrink-0 self-stretch sm:self-auto"
          role="tablist"
          aria-label="Pilihan tampilan asesmen"
        >
          <button
            type="button"
            role="tab"
            id="tab-quiz"
            aria-controls="panel-quiz"
            aria-selected={activeTab === 'quiz'}
            onClick={() => handleTabChange('quiz')}
            className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 min-[360px]:px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] min-[360px]:text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border text-center select-none ${
              activeTab === 'quiz'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-paper-border)] shadow-xs'
                : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/70 hover:shadow-2xs active:scale-[0.98]'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
            <span className="truncate">Mulai Asesmen</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-history"
            aria-controls="panel-history"
            aria-selected={activeTab === 'history'}
            onClick={() => handleTabChange('history')}
            className={`group relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 min-[360px]:px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] min-[360px]:text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border text-center select-none ${
              activeTab === 'history'
                ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border-[var(--color-paper-border)] shadow-xs'
                : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/70 hover:shadow-2xs active:scale-[0.98]'
            }`}
          >
            <History className="w-4 h-4 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
            <span className="truncate">
              <span className="inline sm:hidden">Riwayat</span>
              <span className="hidden sm:inline">Riwayat di Perangkat</span>
            </span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-[var(--color-accent)] text-white shrink-0">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Title and Subtitle: order-2 on mobile, order-1 on desktop */}
        <div className="order-2 sm:order-1 space-y-0.5 min-h-[42px] sm:min-h-0 flex flex-col justify-center">
          <h2
            className="text-base sm:text-xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {activeTab === 'quiz'
              ? !done
                ? 'Refleksi Mandiri 4 Dimensi'
                : 'Hasil Evaluasi Kesejahteraan Jiwa'
              : 'Riwayat Asesmen di Perangkat'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
            {activeTab === 'quiz'
              ? !done
                ? `Langkah ${step + 1} dari ${questions.length} • ${questions[step]?.dimensionName ?? ''}`
                : 'Analisis komprehensif 4 pilar psikologis & spiritualitas BKI'
              : 'Pantau perkembangan dan perbandingan skor batin antar waktu secara privat'}
          </p>
        </div>

        {/* Clean 2px progress highlight along border with 0 gap */}
        {activeTab === 'quiz' && !done && (
          <div
            className="absolute -bottom-[1px] left-0 h-[2px] bg-[var(--color-accent)] transition-all duration-300 ease-out z-10"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Kemajuan asesmen: ${progress}%`}
          />
        )}
      </div>

      {/* ── Main Unified Card Body with Smooth Tab Content Transitions ── */}
      <div className="p-4 sm:p-8 md:p-10">
        <div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="tab-content-enter"
        >
          {activeTab === 'quiz' ? (
            !done ? (
              <AssessmentQuiz
                question={questions[step] ?? assessmentQuestions[step]}
                step={step}
                totalSteps={questions.length}
                direction={direction}
                selectedScore={questions[step] ? answersById[questions[step].id] : undefined}
                isTransitioning={isTransitioning}
                onSelect={handleSelect}
                onPrev={handlePrev}
              />
            ) : result ? (
              <AssessmentResult
                result={result}
                totalScore={totalScore}
                maxScore={maxScore}
                dimensionScores={dimensionScores}
                onReset={handleReset}
              />
            ) : null
          ) : (
            <AssessmentHistory
              onStartNew={() => {
                handleReset();
                handleTabChange('quiz');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
