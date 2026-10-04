import React from 'react';

export function AboutStory() {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-6 border-t border-[var(--color-paper-border)]"
      data-reveal
    >
      <div className="md:col-span-4">
        <h2
          className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Cerita &amp; Prinsip Hidup
        </h2>
        <p className="text-sm text-[var(--color-ink-soft)] mt-2 leading-relaxed">
          Memadukan kerja keras di lapangan dengan kehangatan mendengar.
        </p>
      </div>
      <div className="md:col-span-8 space-y-4 text-[var(--color-ink-muted)] leading-relaxed">
        <p className="text-base sm:text-lg text-[var(--color-ink)] font-normal leading-relaxed">
          Sejak tahun 2020, aku terbiasa berinteraksi langsung dengan banyak orang melalui pekerjaan pelayanan pelanggan, kasir, dan kewirausahaan. Rutinitas ini mengajarkanku cara mendengarkan secara jeli, teliti mengelola tanggung jawab, dan tetap ramah dalam situasi yang padat.
        </p>
        <p className="text-sm sm:text-base">
          Bekal pendidikan keagamaan di MAN 4 Cirebon serta keaktifan di organisasi pemuda makin memperkuat niatku untuk berkarier di ranah bimbingan konseling. Bagiku, mendengarkan seseorang yang sedang terluka butuh kesabaran penuh dan hati yang bersih dari prasangka.
        </p>

        <blockquote className="my-5 pl-5 border-l-2 border-[var(--color-accent)] italic text-[var(--color-ink)] bg-[var(--color-paper-muted)]/50 py-3.5 px-4 rounded-r-xl">
          &ldquo;Setiap orang punya perjuangannya masing-masing. Tugasku bukan menghakimi pilihanmu, melainkan menemanimu menemukan kembali arah dan ketenangan di dalam dada.&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
