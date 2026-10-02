import React from 'react';
import { Heart, Lock, Sparkles, BookOpen } from 'lucide-react';

export default function AboutSection() {
  return (
    <section
      id="tentang"
      className="py-20 md:py-28 bg-[var(--color-surface)] border-b border-[var(--color-line)]"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <p className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
            Mengenal Konselor
          </p>
          <h2
            id="about-heading"
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium text-[var(--color-ink)] leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mendengar tanpa menghakimi, mendampingi dengan hati.
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-ink-2)] leading-relaxed">
            Perjalanan hidup sering kali menghadapkan kita pada jalan bercabang, keraguan diri, atau beban emosional yang terlalu berat untuk dipikul sendirian.
          </p>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Narrative & Philosophy */}
          <div className="lg:col-span-7 space-y-6 text-base sm:text-lg text-[var(--color-ink-2)] leading-relaxed">
            <p>
              Saya adalah mahasiswi aktif <strong className="text-[var(--color-ink)] font-semibold">Bimbingan Konseling Islam (BKI)</strong> di kampus pelopor siber nasional, <strong className="text-[var(--color-ink)] font-semibold">UIN Siber Syekh Nurjati Cirebon</strong>. Latar belakang ini membentuk sudut pandang saya bahwa konseling di era modern membutuhkan fleksibilitas digital tanpa pernah mengorbankan kehangatan manusiawi.
            </p>
            <p>
              Dalam setiap sesi, saya memadukan pendekatan kognitif perilaku (<em>Cognitive Behavioral Therapy</em>) dengan kearifan penyucian jiwa Islami (<em>Tazkiyatun Nafs</em>). Tujuannya bukan sekadar meredakan gejala cemas di permukaan, melainkan mengembalikan ketenteraman batin (<em>thuma&apos;ninah</em>) dan membantu Anda menemukan arah hidup yang lebih bermakna.
            </p>

            {/* Pull Quote with clean styling */}
            <blockquote
              className="my-8 p-6 sm:p-8 bg-[var(--color-paper-2)] border-l-4 border-[var(--color-accent)] rounded-r-xl"
              aria-label="Kutipan prinsip bimbingan Amel"
            >
              <p
                className="text-xl sm:text-2xl font-medium text-[var(--color-ink)] leading-snug italic"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                &ldquo;Tugas konselor bukanlah memaksakan solusi, melainkan menyediakan lentera agar Anda dapat melihat jalan keluar Anda sendiri dengan terang.&rdquo;
              </p>
              <cite className="block not-italic text-sm font-semibold text-[var(--color-accent)] mt-3">
                — Amelia, Konselor Sebaya BKI
              </cite>
            </blockquote>

            <p>
              Setiap cerita yang Anda bagikan diterima seutuhnya dengan prinsip <em>unconditional positive regard</em> — tidak ada penghakiman atas masa lalu atau keraguan Anda.
            </p>
          </div>

          {/* Right Column: Key Principles Cards */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-4)] mb-2">
              Prinsip Layanan Konseling
            </p>

            {[
              {
                icon: Heart,
                title: 'Empati Penuh & Tanpa Syarat',
                desc: 'Ruang yang tulus mendengarkan luka batin tanpa stigma moral atau ceramah menggurui.',
              },
              {
                icon: Lock,
                title: 'Amanah & Kerahasiaan Mutlak',
                desc: 'Seluruh identitas, rekam percakapan, dan materi konseling dijaga ketat sesuai kode etik BKI.',
              },
              {
                icon: Sparkles,
                title: 'Sinergi Psikologi & Spiritualitas',
                desc: 'Menemukan titik temu antara ikhtiar rasional-psikologis dan tawakkal penyejuk kalbu.',
              },
              {
                icon: BookOpen,
                title: 'Aksesibel & Terbuka',
                desc: 'Sesi fleksibel secara daring maupun tatap muka langsung di wilayah Cirebon.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 sm:p-6 bg-[var(--color-paper)] border border-[var(--color-line)] rounded-xl card-hover-lift flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-ink)] mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--color-ink-3)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
