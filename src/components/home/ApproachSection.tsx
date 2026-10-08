import React from 'react';
import Link from 'next/link';
import { Heart, Lock, ShieldCheck, MessageCircle, ArrowRight } from 'lucide-react';

export function ApproachSection() {
  return (
    <section className="py-16 sm:py-24 border-b border-[var(--color-paper-border)]" data-reveal>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 lg:gap-16 items-start">
          <div className="md:col-span-5 space-y-4">
            <h2
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-medium text-[var(--color-ink)] leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mendengar tanpa menghakimi, mendampingi dengan hati.
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-ink-muted)] leading-relaxed">
              Setiap orang berhak punya safe space untuk melepaskan beban pikiran yang selama ini dipendam sendirian. Kamu tidak harus memikul semuanya seorang diri.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs shrink-0 self-start sm:self-auto transition-all"
              >
                <span>Kenali Lebih Dekat Sosok Amel</span>
                <ArrowRight className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
              <Heart className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                Penerimaan Tanpa Syarat
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Menerima seluruh cerita dan kerapuhanmu tanpa prasangka atau penghakiman moral.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
              <Lock className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                Kerahasiaan Terjaga Mutlak
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Identitas dan materi konseling terlindungi sepenuhnya sesuai kode etik bimbingan.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
              <ShieldCheck className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                Integrasi Nilai &amp; Adab
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Menghubungkan ikhtiar kognitif praktis dengan kedamaian batin melalui muhasabah.
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-[var(--color-surface)] border border-[var(--color-paper-border)] rounded-xl space-y-2 card-interactive">
              <MessageCircle className="w-5 h-5 text-[var(--color-accent)]" />
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-ink)]">
                Akses Daring Fleksibel
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Dapat diakses secara virtual dari mana pun kamu berada tanpa batasan jarak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
