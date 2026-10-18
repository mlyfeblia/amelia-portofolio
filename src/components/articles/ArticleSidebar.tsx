import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Compass, MessageCircleHeart, ArrowRight } from 'lucide-react';

interface ArticleSidebarProps {
  currentCategory: string;
}

export function ArticleSidebar({ currentCategory }: ArticleSidebarProps) {
  return (
    <aside className="space-y-6" aria-label="Informasi Penulis dan Topik">
      {/* Profile Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] space-y-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[var(--color-accent-border)] bg-[var(--color-surface)] shrink-0 shadow-2xs">
            <Image
              src="/amelia.webp"
              alt="Amelia"
              fill
              className="object-cover object-top"
              sizes="48px"
              unoptimized
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">
              Amelia (Amel)
            </h3>
            <p className="text-xs text-[var(--color-ink-soft)] line-clamp-1">
              Konselor Sebaya BKI
            </p>
          </div>
        </div>

        <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
          Mahasiswi Bimbingan Konseling Islam di UIN Siber Cirebon. Menulis tentang kesehatan mental, refleksi diri, dan ketenangan jiwa dari sudut pandang islami.
        </p>

        <div className="pt-2 border-t border-[var(--color-paper-border)] space-y-2">
          <Link
            href={`/schedule?kategori=${encodeURIComponent(currentCategory)}`}
            className="w-full btn-primary btn-interactive py-2 text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwalkan Konsultasi</span>
          </Link>
          <Link
            href={`/counseling?kategori=${encodeURIComponent(currentCategory)}`}
            className="w-full btn-secondary btn-interactive py-2 text-xs font-medium rounded-lg inline-flex items-center justify-center gap-1.5"
          >
            <MessageCircleHeart className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Kirim Cerita Anonim</span>
          </Link>
        </div>
      </div>

      {/* Topics Guidance Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-paper-muted)]/60 border border-[var(--color-paper-border)] space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)]">
          <Compass className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Fokus Topik</span>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
          Tulisan ini berada di bawah kategori{' '}
          <Link
            href={`/articles?category=${encodeURIComponent(currentCategory)}`}
            className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] underline decoration-[var(--color-paper-border)] hover:decoration-[var(--color-accent)] underline-offset-2 transition-colors"
          >
            {currentCategory}
          </Link>
          . Seluruh materi disusun secara mandiri dengan rujukan literatur psikologi dan nilai tazkiyatun nafs.
        </p>
        <div className="pt-1">
          <Link
            href="/articles"
            className="btn-secondary btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-ink)] hover:text-[var(--color-accent)] bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/50 shadow-2xs transition-all"
          >
            <span>Jelajahi Kategori Lain</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--color-ink-muted)] shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
