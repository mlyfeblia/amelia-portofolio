import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Compass, MessageCircleHeart } from 'lucide-react';

interface ArticleSidebarProps {
  currentCategory: string;
}

export function ArticleSidebar({ currentCategory }: ArticleSidebarProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24">
      {/* Profile Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] space-y-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[var(--color-accent-border)] bg-[var(--color-accent-soft)] shrink-0 shadow-2xs">
            <Image
              src="/amelia.webp"
              alt="Amelia"
              fill
              className="object-cover object-top"
              sizes="48px"
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
            href="/schedule"
            className="w-full btn-primary btn-interactive py-2 text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwalkan Konsultasi</span>
          </Link>
          <Link
            href="/counseling"
            className="w-full btn-secondary btn-interactive py-2 text-xs font-medium rounded-lg inline-flex items-center justify-center gap-1.5"
          >
            <MessageCircleHeart className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Kirim Cerita Anonim</span>
          </Link>
        </div>
      </div>

      {/* Topics Guidance Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-paper-muted)]/60 border border-[var(--color-paper-border)] space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-ink)]">
          <Compass className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>Fokus Topik</span>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
          Tulisan ini berada di bawah kategori <strong className="text-[var(--color-ink)]">{currentCategory}</strong>. Seluruh materi disusun secara mandiri dengan rujukan literatur psikologi dan nilai tazkiyatun nafs.
        </p>
        <div className="pt-1">
          <Link
            href="/articles"
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
          >
            <span>Jelajahi kategori lain</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
