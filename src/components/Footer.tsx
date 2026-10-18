import React from 'react';
import Link from 'next/link';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';
import FooterVersion from '@/components/FooterVersion';
import FooterInstallButton from '@/components/FooterInstallButton';

const footerNav = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/about' },
  { label: 'Layanan', href: '/services' },
  { label: 'Asesmen', href: '/assessment' },
  { label: 'Curhat', href: '/counseling' },
  { label: 'Artikel', href: '/articles' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-[var(--color-ink)] text-white"
      role="contentinfo"
      aria-label="Informasi situs Amelia"
    >
      {/* Main Footer Links */}
      <div className="py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

          {/* Col 1: Bio */}
          <div className="md:col-span-5 space-y-3">
            <span
              className="text-2xl font-medium text-white block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Amelia
            </span>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm pt-1">
              Ruang aman bimbingan konseling sebaya dan portofolio profesional Amelia. Mengedepankan ketulusan, kerahasiaan amanah, dan pelayanan yang hangat.
            </p>
            <div className="pt-3 border-t border-white/10 max-w-sm">
              <FooterInstallButton />
            </div>
          </div>

          {/* Col 2: Navigation */}
          <nav className="md:col-span-3 space-y-3" aria-label="Menu navigasi footer">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
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
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Kontak &amp; Informasi
            </p>
            <address className="not-italic text-sm text-white/80 space-y-2">
              <p>
                WhatsApp:{' '}
                <a
                  href={getGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Hubungi Amelia melalui WhatsApp di +62 822-1044-5785"
                  className="text-white hover:underline underline-offset-2"
                >
                  +62 822-1044-5785
                </a>
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:mlyfeblia150207@gmail.com"
                  aria-label="Kirim pesan email ke Amelia di mlyfeblia150207@gmail.com"
                  className="text-white hover:underline underline-offset-2"
                >
                  mlyfeblia150207@gmail.com
                </a>
              </p>
              <p>
                Instagram:{' '}
                <a
                  href="https://www.instagram.com/mlyfeb.lia"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Buka profil Instagram resmi Amelia (@mlyfeb.lia)"
                  className="text-white hover:underline underline-offset-2"
                >
                  @mlyfeb.lia
                </a>
              </p>
              <p className="text-xs text-white/75 pt-1">
                Cirebon, Jawa Barat, Indonesia
              </p>
            </address>

            <div className="pt-2">
              <Link
                href="/admin"
                aria-label="Akses portal masuk pengelola konselor"
                className="text-xs text-white/75 hover:text-white transition-colors"
              >
                Portal Admin Konselor &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t border-white/10 pt-6 pb-6 sm:py-5"
        style={{ paddingBottom: 'max(1.5rem, calc(1.25rem + env(safe-area-inset-bottom, 0px)))' }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-xs text-white/75 tracking-tight">
              &copy; {year} Amelia. Seluruh hak cipta dilindungi.
            </p>
            <span className="hidden sm:inline text-white/30">&bull;</span>
            <FooterVersion />
          </div>
          <p className="text-[11.5px] sm:text-xs text-white/65 leading-relaxed max-w-sm sm:max-w-none">
            Kerahasiaan konseli dijaga sesuai kode etik bimbingan konseling.
          </p>
        </div>
      </div>
    </footer>
  );
}
