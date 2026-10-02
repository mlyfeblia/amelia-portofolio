'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Ringkas tepat 6 menu navigasi
const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/about' },
  { label: 'Layanan', href: '/services' },
  { label: 'Asesmen', href: '/assessment' },
  { label: 'Curhat', href: '/counseling' },
  { label: 'Artikel', href: '/articles' },
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

  // Close on Escape key press
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 bg-[var(--color-paper)] border-b border-[var(--color-paper-border)] transition-shadow duration-200',
          scrolled ? 'shadow-xs' : ''
        )}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-6">

          {/* Wordmark logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 group focus-visible:outline-none"
            aria-label="Amelia - Beranda"
            onClick={() => setOpen(false)}
          >
            <span
              className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Amelia
            </span>
          </Link>

          {/* Desktop 6-menu navigation */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigasi utama">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200',
                    isActive
                      ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold border border-[var(--color-accent-border)] shadow-xs'
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
              href="/schedule"
              className="btn-primary text-sm py-2 px-4.5"
            >
              Janji Temu
            </Link>
          </div>

          {/* Mobile toggle button */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden relative w-9 h-9 rounded-lg text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] active:bg-[var(--color-paper-border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] flex items-center justify-center"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          >
            <Menu
              className={cn(
                'w-5 h-5 absolute transition-all duration-300 ease-out transform',
                open ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
              )}
              aria-hidden="true"
            />
            <X
              className={cn(
                'w-5 h-5 absolute transition-all duration-300 ease-out transform',
                open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
              )}
              aria-hidden="true"
            />
          </button>

        </div>

        {/* ── Mobile Dropdown Panel (Anchored to header, Zero Gap, Solid Surface) ── */}
        <div
          id="mobile-nav"
          className={cn(
            'md:hidden absolute top-full left-0 right-0 bg-[var(--color-paper)] border-y border-[var(--color-paper-border)] shadow-xl transition-all duration-300 ease-out origin-top px-5 sm:px-8 py-4 max-h-[calc(100vh-5rem)] overflow-y-auto',
            open
              ? 'opacity-100 translate-y-0 pointer-events-auto visible'
              : 'opacity-0 -translate-y-2 pointer-events-none invisible'
          )}
          role="dialog"
          aria-label="Menu navigasi mobile"
          aria-modal={open}
        >
          <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 flex items-center justify-between',
                    isActive
                      ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold border border-[var(--color-accent-border)]'
                      : 'text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-paper-muted)]/70'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 mt-2 border-t border-[var(--color-paper-border)]">
            <Link
              href="/schedule"
              onClick={() => setOpen(false)}
              className="btn-primary text-sm py-2.5 px-4 w-full text-center justify-center shadow-xs"
            >
              Janji Temu Konseling
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Soft Frosted Backdrop (Translucent Blur, No Layout Shift) ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-out',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
        onTouchMove={(e) => {
          if (open) e.preventDefault();
        }}
        aria-hidden="true"
      />
    </>
  );
}
