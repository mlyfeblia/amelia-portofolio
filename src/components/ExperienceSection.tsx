import React from 'react';
import { Award, Briefcase, GraduationCap } from 'lucide-react';

const experiences = [
  {
    year: '2024',
    role: 'Konselor Sebaya Aktif',
    org: 'UIN Siber Syekh Nurjati Cirebon',
    desc: 'Memberikan bimbingan terstruktur dan pendampingan empatik kepada mahasiswa baru dalam menghadapi transisi perkuliahan, stres adaptasi, dan tuntutan akademik digital.',
    type: 'Praktik Konseling',
  },
  {
    year: '2023',
    role: 'Fasilitator Kelompok Dukungan',
    org: "Program Mahad Al-Jami'ah UIN Siber Cirebon",
    desc: 'Memandu sesi diskusi kelompok bertema resiliensi spiritual, manajemen waktu, dan pencegahan kejenuhan mental (burnout) di kalangan santri mahasiswa.',
    type: 'Fasilitator',
  },
  {
    year: '2023 – 2024',
    role: 'Riset: Cyber Counseling Islami',
    org: 'Kajian Akademik Mandiri BKI',
    desc: 'Mengkaji efektivitas media komunikasi siber dalam konseling Islam untuk meningkatkan kesejahteraan psikologis dan religiusitas mahasiswa generasi Z.',
    type: 'Akademik & Riset',
  },
];

const certifications = [
  {
    title: 'Pelatihan Dasar Konselor Sebaya & Kode Etik',
    issuer: 'Pusat Layanan Bimbingan & Konseling UIN Siber Cirebon',
    year: '2023',
  },
  {
    title: 'Workshop Terapi Kognitif Berbasis Nilai Islam (CBT-I)',
    issuer: 'Fakultas Dakwah & Komunikasi Islam',
    year: '2024',
  },
  {
    title: 'Seminar Nasional Cyber Counseling & Kesehatan Mental',
    issuer: 'Asosiasi Bimbingan dan Konseling Indonesia (ABKIN)',
    year: '2024',
  },
  {
    title: 'Pendidikan & Pelatihan Pendampingan Krisis Emosional',
    issuer: 'Divisi BKI Mahad Al-Jami\'ah',
    year: '2023',
  },
];

export default function ExperienceSection() {
  return (
    <section
      id="pengalaman"
      className="py-20 md:py-28 bg-[var(--color-surface)] border-b border-[var(--color-line)]"
      aria-labelledby="experience-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
            Kredensial &amp; Rekam Jejak
          </p>
          <h2
            id="experience-heading"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-[var(--color-ink)] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pengalaman praktik dan sertifikasi.
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed">
            Menjaga kompetensi dan integritas konseling melalui pelatihan formal, riset berkelanjutan, serta pengalaman pendampingan nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Timeline Pengalaman */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-line)]">
              <Briefcase className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                Pengalaman Praktik Konseling
              </h3>
            </div>

            <ol className="space-y-6" aria-label="Riwayat pengalaman praktik konseling">
              {experiences.map((exp, i) => (
                <li
                  key={i}
                  className="p-6 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl card-hover-lift space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                      {exp.type}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--color-ink-4)]">
                      {exp.year}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-[var(--color-ink)]">
                      {exp.role}
                    </h4>
                    <p className="text-sm font-semibold text-[var(--color-accent)] mt-0.5">
                      {exp.org}
                    </p>
                  </div>

                  <p className="text-base text-[var(--color-ink-2)] leading-relaxed">
                    {exp.desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Right Column: Sertifikasi & Pelatihan */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-line)]">
              <Award className="w-5 h-5 text-[var(--color-accent)]" aria-hidden="true" />
              <h3 className="text-lg font-bold text-[var(--color-ink)]">
                Sertifikasi &amp; Pelatihan
              </h3>
            </div>

            <ul className="space-y-4" role="list">
              {certifications.map((cert, i) => (
                <li
                  key={i}
                  className="p-5 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl card-hover-lift space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-semibold text-[var(--color-ink)] leading-snug">
                      {cert.title}
                    </h4>
                    <span className="text-xs font-bold text-[var(--color-accent)] shrink-0 px-2 py-0.5 rounded bg-[var(--color-accent-bg)]">
                      {cert.year}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-ink-3)]">
                    {cert.issuer}
                  </p>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
