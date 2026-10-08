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
  Clock
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { cn } from '@/lib/utils';
import { ConfirmDecisionModal } from '@/components/ui/ConfirmDecisionModal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const activeNav = adminNav.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/admin' && (pathname ? pathname.startsWith(item.href) : false))
  );
  const activeHref = activeNav?.href || '/admin';

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
      <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-10">
        
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="btn-interactive inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] px-2.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/40 shadow-2xs shrink-0 transition-all"
              title="Kembali ke Web Utama"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden min-[320px]:inline sm:hidden">Web</span>
              <span className="hidden sm:inline">Web Utama</span>
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

          <div className="flex items-center gap-1.5 min-[340px]:gap-2 sm:gap-3">
            {/* 30-Minute Session Countdown Widget - Clickable on mobile & desktop to open session modal */}
            <button
              type="button"
              onClick={() => setShowSessionModal(true)}
              className={cn(
                'inline-flex items-center gap-1 min-[340px]:gap-1.5 px-2 min-[340px]:px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all duration-200 cursor-pointer active:scale-95 shadow-2xs shrink-0',
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
              <span className="hidden min-[340px]:inline">Sesi: </span>
              <span>{formatTimer(remainingSeconds)}</span>
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
              onClick={() => setShowLogoutConfirm(true)}
              type="button"
              className="btn-interactive inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:text-rose-600 px-2.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] hover:border-rose-200 hover:bg-rose-50/60 shadow-2xs cursor-pointer shrink-0 transition-all"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>

            {/* Logout Confirmation Modal */}
            <ConfirmDecisionModal
              isOpen={showLogoutConfirm}
              onClose={() => setShowLogoutConfirm(false)}
              onConfirm={() => {
                setShowLogoutConfirm(false);
                logout();
              }}
              title="Keluar dari Sesi Pengelola?"
              description="Anda perlu memasukkan PIN konselor kembali untuk mengakses seluruh panel pengelola Amelia BKI."
              confirmLabel="Ya, Keluar"
              variant="danger"
              icon={<LogOut className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Sub-navigation bar slider */}
        <div className="relative -mx-1 px-1 border-t border-[var(--color-paper-border)] pt-1 pb-1">
          <Tabs value={activeHref}>
            <TabsList className="py-1 -mb-px" aria-label="Navigasi admin">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.href}
                    value={item.href}
                    href={item.href}
                    icon={<Icon className="w-3.5 h-3.5" />}
                  >
                    {item.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

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
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 lg:px-10 py-5 sm:py-8 space-y-5 sm:space-y-8 page-enter">
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
