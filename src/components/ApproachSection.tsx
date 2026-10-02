import React from 'react';

const pillars = [
  {
    num: '01',
    title: 'Tazkiyatun Nafs',
    sub: 'Pembersihan Kalbu & Orientasi Hidup',
    body: "Membimbing konseli mengenali akar gejolak batin seperti kecemasan berlebih, kekecewaan mendalam, dan ketidakpastian arah, kemudian mentransformasikannya menuju ketenangan jiwa (thuma'ninah) melalui muhasabah dan refleksi spiritual yang jernih.",
    category: 'Spiritualitas Islam',
  },
  {
    num: '02',
    title: 'Active Empathetic Listening',
    sub: 'Mendengarkan Penuh Tanpa Menghakimi',
    body: 'Menyediakan ruang aman tanpa prasangka di mana Anda bebas menumpahkan segala luka, keraguan, dan kecemasan tanpa rasa takut disalahkan atau diceramahi. Didengarkan secara utuh adalah langkah pertama proses penyembuhan.',
    category: 'Pendekatan Humanis',
  },
  {
    num: '03',
    title: 'Restrukturisasi Kognitif Islami',
    sub: 'Sinergi CBT & Konsep Husnudzon',
    body: 'Membongkar pola pikir otomatis dan distorsi kognitif yang memicu stres berulang, lalu menyusun kembali narasi berpikir sehat yang berpijak pada ikhtiar optimal serta berprasangka baik (husnudzon) terhadap ketentuan Allah.',
    category: 'Psikologi Terapan',
  },
  {
    num: '04',
    title: 'Cyber Counseling Inklusif',
    sub: 'Konseling Fleksibel, Aman & Privat',
    body: 'Memanfaatkan keunggulan era siber dengan opsi konsultasi daring (Google Meet & Chat) maupun tatap muka langsung di Cirebon. Fleksibel bagi kesibukan mahasiswa dan generasi muda dengan perlindungan privasi yang ketat.',
    category: 'Era Digital',
  },
];

export default function ApproachSection() {
  return (
    <section
      id="pendekatan"
      className="py-20 md:py-28 border-b border-[var(--color-line)]"
      aria-labelledby="approach-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
            Metode & Pendekatan
          </p>
          <h2
            id="approach-heading"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-[var(--color-ink)] leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Empat pilar keilmuan bimbingan konseling Islam.
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed">
            Menjembatani kaidah psikologi konseling kontemporer dengan kedalaman nilai wahyu untuk solusi hidup yang utuh dan menenteramkan.
          </p>
        </div>

        {/* Pillars List — Clean, spacious, with smooth hover transitions */}
        <ol
          className="space-y-0 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]"
          aria-label="Empat pilar pendekatan konseling"
        >
          {pillars.map((p) => (
            <li
              key={p.num}
              className="py-10 group hover:bg-[var(--color-paper-2)]/60 px-4 sm:px-6 rounded-xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

                {/* Big Number Identifier */}
                <div className="lg:col-span-1">
                  <span
                    className="text-3xl sm:text-4xl font-medium text-[var(--color-ink-dim)] group-hover:text-[var(--color-accent)] transition-colors duration-300"
                    style={{ fontFamily: 'var(--font-display)' }}
                    aria-hidden="true"
                  >
                    {p.num}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="lg:col-span-4 space-y-1.5">
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-1">
                    {p.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[var(--color-ink)] leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-sm font-medium text-[var(--color-ink-3)]">
                    {p.sub}
                  </p>
                </div>

                {/* Body Explanation */}
                <div className="lg:col-span-7">
                  <p className="text-base sm:text-lg text-[var(--color-ink-2)] leading-relaxed">
                    {p.body}
                  </p>
                </div>

              </div>
            </li>
          ))}
        </ol>

      </div>
    </section>
  );
}
