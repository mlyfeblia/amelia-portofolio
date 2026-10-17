import React from 'react';
import Link from 'next/link';
import { Briefcase, Users, GraduationCap, ArrowRight } from 'lucide-react';

export function TrackRecordSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)] bg-[var(--color-surface)]" data-reveal>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-10 lg:space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dedikasi di Lapangan, Organisasi, dan Akademik
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] mt-1.5 max-w-2xl leading-relaxed">
              Pengalaman nyata mengasah empati, ketelitian pengolahan keuangan, dan keterampilan kepemimpinan.
            </p>
          </div>
          <Link
            href="/about"
            className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-start sm:self-auto transition-all"
          >
            <span>Lihat Profil Lengkap di Tentang</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Pengalaman Kerja Operasional */}
          <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 flex flex-col justify-between card-interactive group">
            <div className="space-y-3">
              <div className="card-icon-pop w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)]/50 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 transition-transform duration-200" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                Operasional Kasir &amp; Layanan Pelanggan
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Pengalaman di PT Sinar Kreasi Jaya (SKY Games), Kedai SK Kupat Tahu, dan Usaha Cireng Kuah Mandiri. Terbiasa mengelola transaksi presisi, laporan kas Excel, serta pelayanan prima ratusan pelanggan.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--color-paper-border)] text-xs text-[var(--color-ink-soft)] font-medium">
              2020 - Sekarang · Kasir &amp; Logistik
            </div>
          </div>

          {/* Card 2: Organisasi & Konten Digital */}
          <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 flex flex-col justify-between card-interactive group">
            <div className="space-y-3">
              <div className="card-icon-pop w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)]/50 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 transition-transform duration-200" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                Duta Inspirasi &amp; Fasilitator Parlemen
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Duta Inspirasi Indonesia (Media &amp; Content Creator), Fasilitator Youth Parliamentary Cirebon, Duta Inisiatif Jabar, dan Wakil Ketua Iremas Jami Al-Falah &amp; Rohis.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--color-paper-border)] text-xs text-[var(--color-ink-soft)] font-medium">
              Public Speaking · Content Creator · Fasilitator
            </div>
          </div>

          {/* Card 3: Pendidikan & Bimbingan Konseling */}
          <div className="p-6 lg:p-7 bg-[var(--color-paper)] border border-[var(--color-paper-border)] rounded-xl space-y-4 flex flex-col justify-between card-interactive group">
            <div className="space-y-3">
              <div className="card-icon-pop w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent-border)]/50 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 transition-transform duration-200" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                S1 Bimbingan Konseling UIN Siber
              </h3>
              <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Menempuh studi di UIN Siber Syekh Nurjati Cirebon dengan fondasi pendidikan keagamaan kuat dari MAN 4 Cirebon. Memadukan psikologi konseling dengan kehangatan nilai Islam.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--color-paper-border)] text-xs text-[var(--color-ink-soft)] font-medium">
              Semester 3 · Konselor Sebaya · Nilai Islami
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
