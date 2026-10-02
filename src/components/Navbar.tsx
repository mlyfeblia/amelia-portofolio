'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ringkas tepat 6 menu sesuai arahan pengguna
const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/tentang' },
  { label: 'Layanan', href: '/layanan' },
  { label: 'Asesmen', href: '/asesmen' },
  { label: 'Curhat', href: '/curhat' },
  { label: 'Artikel', href: '/artikel' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-[var(--color-paper)] border-b border-[var(--color-paper-border)] transition-shadow duration-200',
        scrolled ? 'shadow-xs' : ''
      )}
      role="banner"
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Wordmark logo */}
        <Link
          href="/"
          className="flex items-center shrink-0 group focus-visible:outline-none"
          aria-label="Amelia - Beranda"
        >
          <span
            className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Amelia
          </span>
        </Link>

        {/* Desktop 6-menu navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA: Janji Temu */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            href="/jadwal"
            className="btn-primary text-sm py-2 px-4.5"
          >
            Janji Temu
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-colors"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-[var(--color-paper-border)] bg-[var(--color-paper)] px-6 py-4 space-y-3"
        >
          <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-[var(--color-paper-border)] flex items-center justify-between">
            <Link
              href="/admin"
              className="text-xs text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            >
              Admin Portal
            </Link>
            <Link
              href="/jadwal"
              className="btn-primary text-xs py-2 px-3.5"
            >
              Janji Temu
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
