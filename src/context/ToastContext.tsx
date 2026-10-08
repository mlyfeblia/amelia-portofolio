'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  isExiting?: boolean;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Standardized application-wide Toast provider.
 * Displays lightweight, accessible notifications with smooth enter/exit animations.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, message, type, isExiting: false }]);

      setTimeout(() => {
        dismissToast(id);
      }, 3500);
    },
    [dismissToast]
  );

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Viewport */}
      <aside
        aria-label="Pemberitahuan Sistem"
        aria-live="polite"
        className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[99999] flex flex-col items-center sm:items-end gap-2.5 pointer-events-none select-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto w-full max-w-sm flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg text-xs font-medium transition-all backdrop-blur-md',
              t.isExiting ? 'toast-exit' : 'toast-enter',
              t.type === 'success' && 'bg-[var(--color-surface)]/95 border-[var(--color-accent-border)] text-[var(--color-ink)] shadow-[var(--color-accent)]/5',
              t.type === 'error' && 'bg-[var(--color-surface)]/95 border-[var(--color-error-border)] text-[var(--color-error)] shadow-red-900/5',
              t.type === 'info' && 'bg-[var(--color-surface)]/95 border-[var(--color-accent-border)] text-[var(--color-ink)] shadow-slate-900/5'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-[var(--color-error)] shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-[var(--color-accent)] shrink-0" />}
              <span className="leading-snug text-xs sm:text-sm break-words flex-1 text-left">{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="p-1 rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer shrink-0"
              aria-label="Tutup pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        success: (msg: string) => console.log('[Toast Success]:', msg),
        error: (msg: string) => console.error('[Toast Error]:', msg),
        info: (msg: string) => console.log('[Toast Info]:', msg),
      },
    };
  }
  return context;
}
