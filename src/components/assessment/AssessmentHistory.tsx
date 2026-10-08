'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Trash2,
  ChevronDown,
  MessageCircle,
  HeartHandshake,
  CheckCircle2,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  HeartPulse,
  Compass,
  Users,
} from 'lucide-react';
import {
  useDeviceAssessments,
  deleteDeviceAssessment,
  DeviceAssessmentRecord,
} from '@/lib/assessment-storage';
import dynamic from 'next/dynamic';
import { getAssessmentWhatsAppUrl } from '@/lib/whatsapp';
import type { DimensionKey } from '@/data/assessment-data';

const AssessmentDeleteModal = dynamic(
  () => import('./AssessmentDeleteModal').then((m) => m.AssessmentDeleteModal),
  { ssr: false }
);

interface AssessmentHistoryProps {
  onStartNew: () => void;
}

function getDimensionIcon(key: DimensionKey) {
  switch (key) {
    case 'pikiran':
      return <Brain className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    case 'emosi':
      return <HeartPulse className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    case 'spiritual':
      return <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    case 'sosial':
      return <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />;
    default:
      return null;
  }
}

export function AssessmentHistory({ onStartNew }: AssessmentHistoryProps) {
  const records = useDeviceAssessments();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTargetRecord, setDeleteTargetRecord] = useState<DeviceAssessmentRecord | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCopyHistory = async (record: DeviceAssessmentRecord) => {
    const dimSummary = record.dimensions
      .map((d) => `• ${d.shortName}: ${d.score}/${d.maxScore} (${d.percentage}%)`)
      .join('\n');

    const textToCopy = `*RIWAYAT ASESMEN KESEJAHTERAAN JIWA (AMELIA)*\n` +
      `Tanggal: ${record.dateFormatted}\n` +
      `Hasil: ${record.level}\n` +
      `Skor Total: ${record.totalScore}/${record.maxScore} (${record.percentage}%)\n\n` +
      `*Rincian Dimensi:*\n${dimSummary}\n\n` +
      `Refleksi mandiri via amelia-portofolio.`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(record.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  if (records.length === 0) {
    return (
      <div className="py-12 sm:py-16 text-center space-y-5 tab-content-enter">
        <div className="w-16 h-16 rounded-3xl bg-[var(--color-paper)] border border-[var(--color-paper-border)] mx-auto flex items-center justify-center text-[var(--color-accent)] shadow-2xs">
          <HeartHandshake className="w-8 h-8" aria-hidden="true" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3
            className="text-xl sm:text-2xl font-medium text-[var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Belum Ada Riwayat di Perangkat Ini
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
            Setelah kamu menyelesaikan asesmen kesejahteraan jiwa, rekaman evaluasi 4 dimensi akan tersimpan otomatis dan privat di perangkat ini buat bantu kamu memantau perkembangan batin secara berkala.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartNew}
            className="btn-primary btn-interactive text-xs sm:text-sm py-2.5 px-6 rounded-xl cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            Mulai Asesmen Mandiri Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 tab-content-enter">
      {/* ── List of Records ─────────────────────────────────────────── */}
      {records.map((record, index) => {
          const isExpanded = expandedId === record.id;
          const isCopied = copiedId === record.id;

          // Compare with previous older assessment if available
          const prevRecord = records[index + 1];
          const scoreDiff = prevRecord ? record.totalScore - prevRecord.totalScore : null;

          const dimSummary = record.dimensions
            .map((d) => `• ${d.shortName}: ${d.score}/${d.maxScore} (${d.percentage}%)`)
            .join('\n');

          return (
            <div
              key={record.id}
              className="card-interactive group rounded-2xl sm:rounded-3xl border border-[var(--color-paper-border)] bg-white overflow-hidden shadow-2xs hover:border-[var(--color-accent)] hover:shadow-md transition-all duration-200 space-y-0"
            >
              {/* Card Summary Header: Title at top, metadata below */}
              <div className="p-4 sm:p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <h4
                    className="text-base sm:text-xl font-medium text-[var(--color-ink)] leading-snug"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {record.level}
                  </h4>

                  {/* Action buttons (Copy & Delete) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyHistory(record)}
                      className="btn-icon-interactive p-1.5 sm:p-2 rounded-xl text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors cursor-pointer"
                      title="Salin ringkasan evaluasi ini"
                      aria-label="Salin ringkasan riwayat"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600 animate-pop-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetRecord(record)}
                      className="p-1.5 sm:p-2 rounded-xl text-[var(--color-ink-soft)] hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all duration-200 cursor-pointer"
                      title="Hapus rekaman ini"
                      aria-label="Hapus rekaman ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-center gap-1.5 text-[var(--color-ink-soft)]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{record.dateFormatted}</span>
                  </div>

                  <span className="text-[var(--color-paper-border)]" aria-hidden="true">&bull;</span>
                  <span className="font-medium text-[var(--color-ink)]">
                    Skor: {record.totalScore}/{record.maxScore} ({record.percentage}%)
                  </span>

                  {scoreDiff !== null && (
                    <>
                      <span className="text-[var(--color-paper-border)]" aria-hidden="true">&bull;</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700">
                        {scoreDiff > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="text-emerald-700">+{scoreDiff} Poin</span>
                          </>
                        ) : scoreDiff < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
                            <span className="text-rose-700">{scoreDiff} Poin</span>
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3 text-stone-500 shrink-0" />
                            <span>Tetap</span>
                          </>
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* Dimension mini pills with matching icons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
                  {record.dimensions.map((dim) => (
                    <div
                      key={dim.key}
                      className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[var(--color-paper)] border border-[var(--color-paper-border)]/70 text-xs space-y-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-[var(--color-ink-muted)]">
                        {getDimensionIcon(dim.key)}
                        <span className="text-[11px] font-medium truncate">{dim.shortName}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-[var(--color-ink)]">
                        <span className="font-mono text-sm">{dim.score}/{dim.maxScore}</span>
                        <span className="text-[10px] text-[var(--color-ink-soft)] font-normal">{dim.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expand / Collapse toggle & WhatsApp action */}
                <div className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-[var(--color-paper-border)]/60">
                  <button
                    type="button"
                    onClick={() => toggleExpand(record.id)}
                    aria-expanded={isExpanded}
                    className="btn-secondary btn-interactive px-2.5 py-1 text-[11px] min-[340px]:text-xs font-medium rounded-lg border border-[var(--color-paper-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 text-[var(--color-ink)] hover:text-[var(--color-accent)] inline-flex items-center justify-between sm:justify-start gap-1.5 cursor-pointer shadow-2xs transition-all duration-200"
                  >
                    <span className="leading-snug transition-colors duration-200">
                      {isExpanded ? 'Sembunyikan Rincian' : 'Lihat Rekomendasi & Catatan Lengkap'}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-in-out ${
                        isExpanded ? 'rotate-180 text-[var(--color-accent)]' : 'rotate-0 text-[var(--color-ink-muted)]'
                      }`}
                    />
                  </button>

                  <a
                    href={getAssessmentWhatsAppUrl({
                      level: record.level,
                      totalScore: record.totalScore,
                      maxScore: record.maxScore,
                      dimensionsSummary: dimSummary,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-interactive px-2.5 py-1 text-[11px] min-[340px]:text-xs font-semibold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs transition-all duration-200"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>Konsultasikan</span>
                  </a>
                </div>
              </div>

              {/* Expandable Details Section with Smooth Accordion Animation */}
              <div
                className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded
                    ? 'grid-rows-[1fr] opacity-100 border-t border-[var(--color-paper-border)]'
                    : 'grid-rows-[0fr] opacity-0 border-t-0'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="p-4 sm:p-6 bg-[var(--color-paper)]/70 space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
                    <div>
                      <h5 className="font-semibold text-[var(--color-ink)] mb-1">
                        Catatan Evaluasi:
                      </h5>
                      <p className="text-[var(--color-ink-muted)] leading-relaxed">
                        {record.summary}
                      </p>
                    </div>

                    {record.recs && record.recs.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-semibold text-[var(--color-ink)]">
                          Saran Langkah Refleksi:
                        </h5>
                        <ul className="space-y-1.5 text-[var(--color-ink-muted)]" role="list">
                          {record.recs.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Link
                        href="/schedule"
                        className="btn-primary text-xs py-2 px-3.5 rounded-xl inline-flex items-center justify-center gap-1.5 w-full sm:w-auto hover:shadow-md transition-all duration-200"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Jadwalkan Sesi Konseling</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {/* Standardized Verification Modal for Assessment History Deletion */}
      <AssessmentDeleteModal
        isOpen={Boolean(deleteTargetRecord)}
        record={deleteTargetRecord}
        onClose={() => setDeleteTargetRecord(null)}
        onConfirm={(id) => {
          deleteDeviceAssessment(id);
          setDeleteTargetRecord(null);
        }}
      />
    </div>
  );
}
