'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Calendar, 
  Smartphone,
  Home,
  User,
  Compass,
  ClipboardCheck,
  HeartHandshake,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePwa, triggerPwaInstall } from '@/lib/pwa-store';
import { useModalAnimation } from '@/lib/use-modal-animation';

// Ringkas tepat 6 menu navigasi dengan ikon terstandarisasi
const navItems = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Tentang', href: '/about', icon: User },
  { label: 'Layanan', href: '/services', icon: Compass },
  { label: 'Asesmen', href: '/assessment', icon: ClipboardCheck },
  { label: 'Curhat', href: '/counseling', icon: HeartHandshake },
  { label: 'Artikel', href: '/articles', icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isInstalled } = usePwa();

  const { isRendered, isExiting } = useModalAnimation({
    isOpen: open,
    durationMs: 240,
    lockScroll: false,
  });

  // Freeze background scrolling & touch interactions while mobile menu is open (zero-jump)
  useEffect(() => {
    if (!open) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Non-passive touchmove listener to completely prevent mobile background scrolling
    const handleTouchMove = (e: TouchEvent) => {
      const mobileNav = document.getElementById('mobile-nav');
      if (mobileNav && mobileNav.contains(e.target as Node)) {
        return; // Allow smooth scrolling inside the mobile menu
      }
      if (e.cancelable) {
        e.preventDefault(); // Strictly block any background drag / touch scroll
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [open]);

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

  // Close mobile menu on browser back/forward navigation
  useEffect(() => {
    const onPopState = () => setOpen(false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Helper to reliably check if a nav item is active
  const isItemActive = (href: string) => {
    if (!pathname) {
      return href === '/';
    }
    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    if (href === '/') {
      return cleanPath === '' || cleanPath === '/';
    }
    return cleanPath === href || cleanPath.startsWith(href + '/');
  };

  return (
    <>
      <header
        className={cn(
          'z-50 bg-[var(--color-paper)]/95 backdrop-blur-md border-b border-[var(--color-paper-border)] overflow-visible',
          open ? 'fixed top-0 inset-x-0' : 'sticky top-0'
        )}
        style={{
          WebkitBackdropFilter: 'blur(12px)',
        }}
        role="banner"
      >
        {/* Hardware-accelerated smooth shadow overlay (Zero repaint jitter on mobile scroll) */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none shadow-xs transition-opacity duration-300 ease-out z-[-1]',
            scrolled ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-6 overflow-visible">

          {/* Wordmark logo with elegant lift and color shift hover animation */}
          <Link
            href="/"
            className="flex items-center shrink-0 group focus-visible:outline-none select-none py-1"
            aria-label="Amelia - Beranda"
            onClick={() => setOpen(false)}
          >
            <span
              className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors duration-200 ease-out inline-block"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Amelia
            </span>
          </Link>

          {/* Desktop 6-menu navigation with refined tactile hover animations */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigasi utama">
            {navItems.map((item) => {
              const isActive = isItemActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'nav-link-interactive group cursor-pointer',
                    isActive && 'is-active'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={cn(
                      'nav-link-icon w-3.5 h-3.5 shrink-0',
                      isActive
                        ? 'text-[var(--color-accent)]'
                        : 'text-[var(--color-ink-soft)]'
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

            {/* Right Actions: Janji Temu CTA & Mobile Toggle */}
            <div className="flex items-center justify-end shrink-0 gap-2 sm:gap-3 overflow-visible">
              {/* Janji Temu CTA - Meluncur ke kanan masuk ke tombol hamburger saat dibuka, dan meluncur keluar dari kanan ke kiri saat ditutup */}
              <div
                className={cn(
                  'flex items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-0',
                  open
                    ? 'max-md:opacity-0 max-md:translate-x-7 max-md:pointer-events-none'
                    : 'max-md:opacity-100 max-md:translate-x-0 max-md:pointer-events-auto'
                )}
              >
                <Link
                  href="/schedule"
                  onClick={() => setOpen(false)}
                  tabIndex={open ? -1 : 0}
                  className="btn-interactive inline-flex items-center justify-center gap-1.5 h-8 md:h-9 px-3.5 md:px-4 text-xs md:text-sm font-semibold rounded-lg text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-xs hover:shadow-sm whitespace-nowrap select-none cursor-pointer transition-all duration-200 ease-out"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Janji Temu</span>
                </Link>
              </div>

              {/* Mobile toggle button - Desain kotak ramping & proporsional persis versi asli deploy */}
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="group flex md:!hidden relative z-10 w-8 h-8 rounded-lg border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/50 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] items-center justify-center cursor-pointer shrink-0 select-none shadow-2xs"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              >
                <Menu
                  className={cn(
                    'w-4.5 h-4.5 absolute inset-0 m-auto transition-all duration-200 ease-out transform',
                    open ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                  )}
                  aria-hidden="true"
                />
                <X
                  className={cn(
                    'w-4.5 h-4.5 absolute inset-0 m-auto transition-all duration-200 ease-out transform',
                    open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

        </div>

        {/* ── Mobile Dropdown Panel (Anchored to header, Zero Gap, Upgraded Cascading Transitions) ── */}
        {isRendered && (
          <div
            id="mobile-nav"
            className={cn(
              'md:hidden absolute top-full left-0 right-0 bg-[var(--color-paper)]/98 backdrop-blur-xl border-b border-[var(--color-paper-border)] rounded-b-2xl sm:rounded-b-3xl shadow-xl px-5 sm:px-8 pt-3 pb-5 sm:pb-6 max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain origin-top',
              isExiting ? 'nav-dropdown-exit' : 'nav-dropdown-enter'
            )}
            role="dialog"
            aria-label="Menu navigasi mobile"
            aria-modal={open}
          >
            <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
              {navItems.map((item, idx) => {
                const isActive = isItemActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    style={{ animationDelay: `${25 + idx * 25}ms` }}
                    className={cn(
                      'group px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors duration-150 flex items-center justify-between nav-item-stagger active:scale-[0.98]',
                      isActive
                        ? 'text-[var(--color-accent)] bg-[var(--color-accent-soft)] font-semibold border border-[var(--color-accent-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/90'
                        : 'text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-paper-muted)]'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors duration-150',
                          isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-soft)]'
                        )}
                        aria-hidden="true"
                      />
                      <span className="transition-colors duration-150">{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div
              className="pt-3 mt-2 border-t border-[var(--color-paper-border)] flex flex-col gap-2 nav-item-stagger"
              style={{ animationDelay: `${25 + navItems.length * 25}ms` }}
            >
              <Link
                href="/schedule"
                onClick={() => setOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] shadow-xs inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-colors duration-150 select-none cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Janji Temu Konseling</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerPwaInstall();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[var(--color-paper-border)] text-[var(--color-ink)] text-xs font-medium hover:text-[var(--color-accent)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-paper-muted)] active:scale-[0.98] transition-colors duration-150 flex items-center justify-center gap-2 select-none cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[var(--color-accent)]" />
                <span>{isInstalled ? 'Aplikasi Amelia (Terpasang)' : 'Pasang Aplikasi Amelia'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Placeholder to prevent layout shift when header becomes fixed upon opening */}
      {open && <div className="h-16 shrink-0 md:hidden" aria-hidden="true" />}

      {/* ── Pure Frosted Transparent Blur Backdrop (Zero Dark/Black Tint, Touch & Scroll Blocked) ── */}
      {isRendered && (
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'fixed inset-0 z-40 bg-transparent backdrop-blur-md md:hidden touch-none select-none pointer-events-auto cursor-pointer',
            isExiting ? 'nav-backdrop-exit' : 'nav-backdrop-enter'
          )}
          aria-hidden="true"
        />
      )}
    </>
  );
}
