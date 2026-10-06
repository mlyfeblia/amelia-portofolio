'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  CalendarDays, 
  MessageSquareText, 
  FileText, 
  LogOut,
  Clock,
  RotateCw
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { cn } from '@/lib/utils';

const AdminSessionModal = dynamic(
  () => import('./AdminSessionModal').then((m) => m.AdminSessionModal),
  { ssr: false }
);

const adminNav = [
  { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
  { label: 'Janji Temu', href: '/admin/bookings', icon: CalendarDays },
  { label: 'Ruang Curhat', href: '/admin/counseling', icon: MessageSquareText },
  { label: 'Artikel', href: '/admin/articles', icon: FileText },
];

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function AdminHeader() {
  const pathname = usePathname();
  const { logout, remainingSeconds, refreshSession } = useAdminAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-paper)]/95 backdrop-blur-md border-b border-[var(--color-paper-border)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="btn-interactive inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] py-1.5 px-2.5 rounded-lg hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-paper-border)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Web Utama</span>
              <span className="sm:hidden">Web</span>
            </Link>

            <span className="text-[var(--color-paper-border)] select-none">|</span>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="text-lg sm:text-xl font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Amelia
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 30-Minute Session Countdown Widget - Clickable on mobile & desktop to open session modal */}
            <button
              type="button"
              onClick={() => setShowSessionModal(true)}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs',
                remainingSeconds <= 120
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse hover:bg-red-100'
                  : remainingSeconds <= 300
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] border-[var(--color-paper-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
              )}
              title="Klik untuk melihat status sesi atau memperpanjang batas waktu 30 menit."
              aria-label={`Sesi tersisa ${formatTimer(remainingSeconds)}. Klik untuk membuka dialog perpanjangan sesi.`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Sesi: {formatTimer(remainingSeconds)}</span>
            </button>

            {/* Quick extend session button for desktop */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              type="button"
              className="btn-interactive hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] border border-[var(--color-paper-border)] cursor-pointer disabled:opacity-50"
              title="Perpanjang sesi 30 menit ke depan"
            >
              <RotateCw className={cn('w-3 h-3', refreshing && 'animate-spin')} />
              <span>Perpanjang</span>
            </button>

            {/* Session Details Modal Dialog */}
            <AdminSessionModal
              isOpen={showSessionModal}
              onClose={() => setShowSessionModal(false)}
              remainingSeconds={remainingSeconds}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            {/* Logout button */}
            <button
              onClick={logout}
              type="button"
              className="btn-interactive inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-error)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-paper-border)] cursor-pointer"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation bar */}
        <nav
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 -mb-px border-t border-[var(--color-paper-border)] no-scrollbar"
          aria-label="Navigasi admin"
        >
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'chip-interactive inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full shrink-0 min-h-[36px]',
                  isActive
                    ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
                    : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
        <AdminHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 page-enter">
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
