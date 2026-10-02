import React from 'react';
import Link from 'next/link';

const footerNav = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang Amel', href: '/tentang' },
  { label: 'Layanan Konseling', href: '/layanan' },
  { label: 'Asesmen Jiwa', href: '/asesmen' },
  { label: 'Kotak Curhat', href: '/curhat' },
  { label: 'Kumpulan Artikel', href: '/artikel' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-[var(--color-ink)] text-white"
      role="contentinfo"
      aria-label="Informasi situs Amelia"
    >
      {/* Top Banner CTA */}
      <div className="border-b border-white/10 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-medium text-white mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Butuh teman bicara dan didengarkan?
            </h2>
            <p className="text-sm text-white/75 max-w-lg leading-relaxed">
              Setiap sesi berlangsung amanah, privat, dan tanpa penghakiman. Mulai langkah pertama pemulihan batin Anda.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/jadwal"
              className="btn-white text-sm"
            >
              Jadwalkan Sesi
            </Link>
            <Link
              href="/curhat"
              className="btn-ghost-white text-sm"
            >
              Curhat Anonim
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* Col 1: Bio */}
          <div className="md:col-span-5 space-y-3">
            <span
              className="text-2xl font-medium text-white block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Amelia
            </span>
            <p className="text-xs text-white/60 tracking-wider">
              BIMBINGAN KONSELING ISLAM · UIN SIBER SYEKH NURJATI CIREBON
            </p>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm pt-1">
              Konselor sebaya yang memadukan psikologi modern dengan kedalaman nilai spiritual Islam (<em>Tazkiyatun Nafs</em>) untuk mendampingi kesehatan mental generasi siber.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <nav className="md:col-span-3" aria-label="Menu navigasi footer">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              Navigasi Halaman
            </p>
            <ul className="space-y-2 text-sm" role="list">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white/75 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3: Contact */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
              Kontak Konsultasi
            </p>
            <address className="not-italic text-sm text-white/75 space-y-2">
              <p>
                WhatsApp:{' '}
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline underline-offset-2"
                >
                  0812-3456-7890
                </a>
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:amel.bki@uinssc.ac.id"
                  className="text-white hover:underline underline-offset-2"
                >
                  amel.bki@uinssc.ac.id
                </a>
              </p>
              <p className="text-xs text-white/55 pt-1">
                Fakultas Dakwah &amp; Komunikasi Islam, UIN Siber Syekh Nurjati Cirebon, Jawa Barat
              </p>
            </address>

            <div className="pt-2">
              <Link
                href="/admin"
                className="text-xs text-white/40 hover:text-white/75 transition-colors"
              >
                Portal Admin Konselor &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>&copy; {year} Amelia. Seluruh hak cipta dilindungi.</p>
          <p>Kerahasiaan konseli dijaga sesuai kode etik bimbingan konseling.</p>
        </div>
      </div>
    </footer>
  );
}
