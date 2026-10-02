'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  CalendarDays, 
  MessageSquareText, 
  FileText, 
  LogOut
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { cn } from '@/lib/utils';

const adminNav = [
  { label: 'Ringkasan', href: '/admin', icon: LayoutDashboard },
  { label: 'Janji Temu', href: '/admin/bookings', icon: CalendarDays },
  { label: 'Ruang Curhat', href: '/admin/counseling', icon: MessageSquareText },
  { label: 'Artikel', href: '/admin/articles', icon: FileText },
];

function AdminHeader() {
  const pathname = usePathname();
  const { logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-paper)]/95 backdrop-blur-md border-b border-[var(--color-paper-border)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-paper-border)]"
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

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-paper-border)] transition-colors cursor-pointer"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
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
                  'inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all shrink-0 min-h-[36px]',
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)]">
        <AdminHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in-up">
          {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
