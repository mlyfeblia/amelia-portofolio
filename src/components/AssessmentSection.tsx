'use client';

import React, { useState, useCallback } from 'react';
import { ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';

interface Question {
  id: number;
  dimension: string;
  question: string;
  options: { text: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    dimension: 'Kondisi Kognitif & Pikiran',
    question: 'Bagaimana ritme pikiran Anda dalam 7 hari terakhir?',
    options: [
      { text: 'Tenang dan jernih — fokus terjaga, rutinitas terlaksana dengan baik.', score: 3 },
      { text: 'Sering overthinking dan cemas sesekali, namun masih mampu beraktivitas.', score: 2 },
      { text: 'Pikiran terasa bising, kalut, dan sangat sulit untuk menemukan ketenangan.', score: 1 },
    ],
  },
  {
    id: 2,
    dimension: 'Resiliensi Emosional',
    question: 'Ketika rencana hidup terhambat atau ada masalah tak terduga, apa yang terjadi?',
    options: [
      { text: 'Menerima keadaan dengan lapang dada, berikhtiar kembali, dan berserah diri.', score: 3 },
      { text: 'Sempat merasa down beberapa saat, namun perlahan bisa bangkit kembali.', score: 2 },
      { text: 'Mudah panik, menyalahkan diri sendiri secara ekstrem, atau merasa buntu total.', score: 1 },
    ],
  },
  {
    id: 3,
    dimension: 'Ketenangan Jiwa & Spiritualitas',
    question: 'Bagaimana perasaan Anda saat berada dalam keheningan atau menjalankan ibadah?',
    options: [
      { text: "Merasakan thuma'ninah — ibadah dan refleksi menjadi sumber kedamaian utama.", score: 3 },
      { text: 'Fluktuatif — terkadang tenang, namun sering tergesa-gesa dan kurang fokus.', score: 2 },
      { text: 'Hampa, gelisah, atau dibayangi rasa bersalah dan ketakutan yang tak kunjung reda.', score: 1 },
    ],
  },
  {
    id: 4,
    dimension: 'Dukungan & Ruang Berbagi',
    question: 'Apakah Anda memiliki tempat atau orang yang aman untuk berbagi isi hati tanpa dihakimi?',
    options: [
      { text: 'Ada — sahabat atau keluarga yang selalu siap mendengar dan memvalidasi perasaan.', score: 3 },
      { text: 'Hanya sebagian kecil yang diceritakan; sisanya saya simpan rapat sendirian.', score: 2 },
      { text: 'Tidak ada sama sekali — saya memikul semua beban dan kesedihan sendirian.', score: 1 },
    ],
  },
];

interface Result {
  range: [number, number];
  level: string;
  category: string;
  body: string;
  recs: string[];
}

const results: Result[] = [
  {
    range: [10, 12],
    level: 'Jiwa Cukup Seimbang & Adaptif',
    category: "Fase Nafs Muthma'innah",
    body: 'Kondisi mental dan spiritual Anda berada dalam harmoni yang positif. Anda memiliki ketahanan batin yang baik dalam menghadapi tekanan serta mampu melihat dinamika hidup dengan kacamata yang sehat.',
    recs: [
      'Pertahankan rutinitas dzikir dan muhasabah sebagai jangkar kestabilan hati.',
      'Sesi konseling dapat dimanfaatkan untuk pengembangan potensi diri dan arahan karier masa depan.',
      'Jadilah ruang pendengar yang hangat bagi orang-orang terdekat yang membutuhkan.',
    ],
  },
  {
    range: [7, 9],
    level: 'Membutuhkan Ruang Jeda & Curhat',
    category: 'Fase Nafs Lawwamah (Reflektif Berlebih)',
    body: 'Ada beban emosional dan pikiran yang mulai menumpuk serta menguras energi psikologis Anda. Sinyal kegelisahan ini wajar terjadi, namun perlu diurai dengan bijak sebelum berkembang menjadi kejenuhan (burnout).',
    recs: [
      'Latih pernapasan sadar dan berikan jeda dari paparan media sosial yang memicu perbandingan sosial.',
      'Tuliskan isi pikiran yang mengganjal dalam jurnal refleksi atau kotak curhat anonim.',
      'Sangat dianjurkan mengambil satu sesi bimbingan bersama Amel untuk mengurai benang kusut di kepala.',
    ],
  },
  {
    range: [4, 6],
    level: 'Sinyal Kelelahan Hati (Perlu Pendamping)',
    category: 'Memerlukan Pendampingan Hangat',
    body: 'Hati dan pikiran Anda sedang mengalami kelelahan yang nyata — dan ini sangat valid untuk diakui. Memendam segala hal sendirian bukan tanda kekuatan, melainkan beban yang menuntut pertolongan. Anda berhak didengar dengan penuh kelembutan.',
    recs: [
      'Berhenti menyalahkan diri sendiri atas situasi di luar kendali Anda.',
      'Berikan izin bagi diri sendiri untuk beristirahat secara fisik dan mental tanpa rasa bersalah.',
      'Jadwalkan sesi konseling privat dengan Amel sebagai langkah awal memulihkan ketenangan batin.',
    ],
  },
];

export default function AssessmentSection() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const handleSelect = useCallback((score: number) => {
    const updated = [...answers];
    updated[step] = score;
    setAnswers(updated);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }, [step, answers]);

  const handleReset = useCallback(() => {
    setStep(0);
    setAnswers([]);
    setDone(false);
  }, []);

  const total = answers.reduce((a, b) => a + b, 0);
  const result = done
    ? results.find((r) => total >= r.range[0] && total <= r.range[1]) ?? results[2]
    : null;

  const progress = Math.round(((step + (done ? 1 : 0)) / questions.length) * 100);
  const optionLetters = ['A', 'B', 'C'];

  return (
    <div
      className="border border-[var(--color-paper-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden shadow-xs"
      role="region"
      aria-label={done ? 'Hasil asesmen jiwa' : `Pertanyaan ${step + 1} dari ${questions.length}`}
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
          <div>
            {/* Meta indicator without eyebrow */}
            <div className="flex items-center justify-between gap-4 mb-5 text-xs text-[var(--color-ink-soft)] font-medium">
              <span>{questions[step].dimension}</span>
              <span>Langkah {step + 1} dari {questions.length}</span>
            </div>

            {/* Question */}
            <h2
              id={`question-${step}`}
              className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] mb-6 leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {questions[step].question}
            </h2>

            {/* Options */}
            <fieldset aria-labelledby={`question-${step}`}>
              <legend className="sr-only">Pilih salah satu jawaban yang paling mendekati kondisimu</legend>
              <div className="space-y-3">
                {questions[step].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt.score)}
                    type="button"
                    className="w-full text-left p-4 sm:p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg text-sm sm:text-base text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors flex items-start gap-3.5"
                    aria-label={`Pilihan ${optionLetters[i]}: ${opt.text}`}
                  >
                    <span
                      className="w-6 h-6 rounded-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] font-semibold text-xs text-[var(--color-ink-soft)] flex items-center justify-center shrink-0 mt-0.5 select-none"
                      aria-hidden="true"
                    >
                      {optionLetters[i]}
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
                  onClick={() => setStep(step - 1)}
                  type="button"
                  className="text-xs font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
                >
                  &larr; Kembali ke pertanyaan sebelumnya
                </button>
              </div>
            )}
          </div>
        ) : result && (
          /* Result state */
          <div className="space-y-6" aria-live="polite">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[var(--color-paper-border)]">
              <div>
                <span className="text-xs text-[var(--color-ink-soft)] font-medium block mb-1">
                  Hasil Refleksi Diri
                </span>
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
                onClick={handleReset}
                type="button"
                className="btn-secondary text-xs py-2 px-3 self-start sm:self-center"
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

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-[var(--color-ink-muted)]">
                Ingin berdiskusi lebih mendalam bersama Amel?
              </p>
              <a
                href="/jadwal"
                className="btn-primary text-sm"
              >
                Jadwalkan Konseling Sekarang
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
