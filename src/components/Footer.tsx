import React from 'react';
import Link from 'next/link';
import { getGeneralWhatsAppUrl } from '@/lib/whatsapp';

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
            <address className="not-italic text-sm text-white/75 space-y-2">
              <p>
                WhatsApp:{' '}
                <a
                  href={getGeneralWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline underline-offset-2"
                >
                  +62 822-1044-5785
                </a>
              </p>
              <p>
                Email:{' '}
                <a
                  href="mailto:mlyfeblia150207@gmail.com"
                  className="text-white hover:underline underline-offset-2"
                >
                  mlyfeblia150207@gmail.com
                </a>
              </p>
              <p>
                LinkedIn:{' '}
                <a
                  href="https://linkedin.com/in/amelia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline underline-offset-2"
                >
                  linkedin.com/in/amelia
                </a>
              </p>
              <p className="text-xs text-white/55 pt-1">
                Cirebon, Jawa Barat, Indonesia
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
      <div className="border-t border-white/10 py-6 sm:py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center sm:justify-between gap-2.5 sm:gap-4 text-center sm:text-left">
          <p className="text-xs text-white/60 tracking-tight">
            &copy; {year} Amelia. Seluruh hak cipta dilindungi.
          </p>
          <p className="text-[11.5px] sm:text-xs text-white/40 leading-relaxed max-w-sm sm:max-w-none">
            Kerahasiaan konseli dijaga sesuai kode etik bimbingan konseling.
          </p>
        </div>
      </div>
    </footer>
  );
}
