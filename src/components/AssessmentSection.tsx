'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, RotateCcw, CheckCircle, MessageCircle } from 'lucide-react';
import { getAssessmentWhatsAppUrl } from '@/lib/whatsapp';

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
      { text: 'Tenang dan jernih, fokus terjaga, dan rutinitas terlaksana dengan baik.', score: 3 },
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
      { text: "Merasakan thuma'ninah, ibadah dan refleksi menjadi sumber kedamaian utama.", score: 3 },
      { text: 'Fluktuatif, terkadang tenang namun sering tergesa-gesa dan kurang fokus.', score: 2 },
      { text: 'Hampa, gelisah, atau dibayangi rasa bersalah dan ketakutan yang tak kunjung reda.', score: 1 },
    ],
  },
  {
    id: 4,
    dimension: 'Dukungan & Ruang Berbagi',
    question: 'Apakah Anda memiliki tempat atau orang yang aman untuk berbagi isi hati tanpa dihakimi?',
    options: [
      { text: 'Ada, sahabat atau keluarga selalu siap mendengar dan memvalidasi perasaan.', score: 3 },
      { text: 'Hanya sebagian kecil yang diceritakan; sisanya saya simpan rapat sendirian.', score: 2 },
      { text: 'Tidak ada sama sekali, saya memikul semua beban dan kesedihan sendirian.', score: 1 },
    ],
  },
  {
    id: 5,
    dimension: 'Manajemen Energi & Istirahat',
    question: 'Bagaimana kualitas tidur dan tingkat kelelahan fisik maupun mental yang Anda rasakan?',
    options: [
      { text: 'Tidur cukup dan teratur, bangun dengan energi yang siap memulai hari.', score: 3 },
      { text: 'Terkadang sulit tidur atau sering terjaga, lelah di sore hari namun masih terkendali.', score: 2 },
      { text: 'Sangat kelelahan (burnout), insomnia berulang, bangun tidur tetap merasa lesu.', score: 1 },
    ],
  },
  {
    id: 6,
    dimension: 'Penerimaan Diri & Ekspektasi',
    question: 'Saat hasil yang dicapai belum sesuai dengan ekspektasi pribadi, apa reaksi Anda?',
    options: [
      { text: 'Memahami bahwa kegagalan adalah proses belajar dan tetap menghargai usaha sendiri.', score: 3 },
      { text: 'Sempat membandingkan diri dengan pencapaian orang lain, meski akhirnya bisa menerima.', score: 2 },
      { text: 'Merasa diri tidak berharga, tenggelam dalam rasa bersalah dan minder berkepanjangan.', score: 1 },
    ],
  },
  {
    id: 7,
    dimension: 'Kejelasan Arah & Harapan',
    question: 'Bagaimana pandangan dan rasa optimisme Anda terhadap langkah masa depan saat ini?',
    options: [
      { text: 'Memiliki visi yang cukup terarah dan optimis melangkah setahap demi setahap.', score: 3 },
      { text: 'Terkadang diliputi keraguan tentang pilihan studi atau karier, namun tetap berjalan.', score: 2 },
      { text: 'Merasa tersesat, masa depan terasa menakutkan, dan bingung harus melangkah ke mana.', score: 1 },
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
    range: [17, 21],
    level: 'Jiwa Stabil & Adaptif',
    category: "Fase Nafs Muthma'innah (Hati yang Tenang)",
    body: 'Kondisi mental dan spiritual Anda berada dalam harmoni yang positif. Anda memiliki ketahanan batin yang baik dalam menghadapi tekanan serta mampu melihat dinamika hidup dengan kacamata yang sehat.',
    recs: [
      'Pertahankan rutinitas dzikir dan muhasabah sebagai jangkar kestabilan hati.',
      'Sesi bimbingan bersama Amel dapat difokuskan untuk pengembangan potensi diri dan pemetaan karier.',
      'Jadilah ruang pendengar yang hangat bagi orang-orang terdekat yang membutuhkan.',
    ],
  },
  {
    range: [12, 16],
    level: 'Perlu Ruang Jeda & Curhat',
    category: 'Fase Nafs Lawwamah (Reflektif & Rentan Lelah)',
    body: 'Ada beban emosional dan pikiran yang mulai menumpuk serta menguras energi psikologis Anda. Sinyal kegelisahan ini wajar terjadi, namun perlu diurai dengan bijak sebelum berkembang menjadi kejenuhan (burnout).',
    recs: [
      'Latih pernapasan sadar dan berikan jeda dari paparan media sosial yang memicu perbandingan sosial.',
      'Tuliskan isi pikiran yang mengganjal dalam jurnal refleksi untuk mengurai benang kusut di kepala.',
      'Sangat dianjurkan mengambil satu sesi bimbingan bersama Amel untuk melegakan beban pikiran.',
    ],
  },
  {
    range: [7, 11],
    level: 'Sinyal Kelelahan Hati',
    category: 'Memerlukan Pendampingan Hangat & Validasi',
    body: 'Hati dan pikiran Anda sedang mengalami kelelahan yang nyata, dan ini sangat valid untuk diakui. Memendam segala hal sendirian bukan tanda kekuatan, melainkan beban yang menuntut pertolongan. Anda berhak didengar dengan penuh kelembutan.',
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
            {/* Meta indicator */}
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
                    className="w-full text-left p-4 sm:p-5 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-lg text-sm sm:text-base text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors flex items-start gap-3.5 group cursor-pointer"
                    aria-label={`Pilihan ${optionLetters[i]}: ${opt.text}`}
                  >
                    <span
                      className="w-6 h-6 rounded-md bg-[var(--color-surface)] border border-[var(--color-paper-border)] font-semibold text-xs text-[var(--color-ink-soft)] group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5 select-none transition-colors"
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
                  className="text-xs font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-semibold mb-2">
                  <span>Skor Anda: {total} / 21</span>
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
                onClick={handleReset}
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
                    totalScore: total,
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
        )}
      </div>
    </div>
  );
}
