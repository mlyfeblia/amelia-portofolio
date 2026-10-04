import type { Metadata } from 'next';
import { WifiOff, HeartHandshake, PhoneCall } from 'lucide-react';
import OfflineActions from '@/components/pwa/OfflineActions';

export const metadata: Metadata = {
  title: 'Sedang Offline | Amelia',
  description: 'Anda sedang berada dalam mode offline. Konten yang telah dicache tetap dapat diakses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-12 selection:bg-[var(--color-accent-soft)] selection:text-[var(--color-accent)]"
    >
      <div className="max-w-xl mx-auto w-full my-auto py-8">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] text-xs font-semibold text-[var(--color-ink-muted)] mb-8 tracking-wide">
          <WifiOff className="w-3.5 h-3.5 text-[var(--color-ink-soft)]" aria-hidden="true" />
          <span>Mode Offline Terdeteksi</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--color-ink)] leading-tight mb-4">
          Sambungan terputus, namun ruang ini tetap ada.
        </h1>

        <p className="text-[var(--color-ink-muted)] text-base sm:text-lg leading-relaxed mb-8">
          Perangkat Anda saat ini belum terhubung ke internet. Berkat teknologi Progressive Web App (PWA), artikel
          dan halaman yang pernah Anda buka sebelumnya tetap dapat dibaca secara mandiri.
        </p>

        {/* Calming Mindfulness / Counselor Card */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--color-paper-border)] shadow-xs mb-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-lg font-medium text-[var(--color-ink)] mb-1">
                Jeda Sejenak (Tazkiyatun Nafs)
              </h2>
              <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed mb-3">
                Kehilangan sinyal sering kali menjadi waktu terbaik untuk rehat sejenak dari kebisingan layar.
                Tarik napas perlahan dalam 4 hitungan, tahan 4 hitungan, dan hembuskan perlahan.
              </p>
              <span className="inline-block text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2.5 py-1 rounded-md">
                Ketenangan hati dimulai dari jeda sadar
              </span>
            </div>
          </div>
        </div>

        {/* Client Interactive Actions */}
        <OfflineActions />

        {/* Contact info for urgent counseling */}
        <div className="pt-6 border-t border-[var(--color-paper-border)] flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
          <span>Kontak Konseling Mandiri:</span>
          <a
            href="https://wa.me/6282210445785"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[var(--color-accent)] hover:underline font-medium"
          >
            <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
            <span>+62 822-1044-5785</span>
          </a>
        </div>
      </div>

      <footer className="text-center text-xs text-[var(--color-ink-soft)] py-4">
        © {new Date().getFullYear()} Amelia · Bimbingan Konseling UIN Siber Syekh Nurjati Cirebon
      </footer>
    </main>
  );
}
