'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  durationMs: number;
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

const DURATION_BY_TYPE: Record<ToastType, number> = {
  success: 3500,
  info: 4000,
  error: 6000,
};

/**
 * Individual Toast card component with hover-pause and exit animation support.
 */
function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const remainingTimeRef = useRef<number>(item.durationMs);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (item.isExiting) return;

    if (isHovered) {
      if (timerRef.current) clearTimeout(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    } else {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onDismiss(item.id);
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHovered, item.id, item.isExiting, onDismiss]);

  return (
    <div
      role="status"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'pointer-events-auto w-full max-w-sm flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg text-xs font-medium transition-all backdrop-blur-md select-none',
        item.isExiting ? 'toast-exit' : 'toast-enter',
        item.type === 'success' &&
          'bg-[var(--color-surface)]/95 border-[var(--color-accent-border)] text-[var(--color-ink)] shadow-[var(--color-accent)]/5',
        item.type === 'error' &&
          'bg-[var(--color-surface)]/95 border-[var(--color-error-border)] text-[var(--color-error)] shadow-red-900/5',
        item.type === 'info' &&
          'bg-[var(--color-surface)]/95 border-[var(--color-accent-border)] text-[var(--color-ink)] shadow-slate-900/5'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {item.type === 'success' && (
          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
        )}
        {item.type === 'error' && (
          <AlertCircle className="w-4 h-4 text-[var(--color-error)] shrink-0" aria-hidden="true" />
        )}
        {item.type === 'info' && (
          <Info className="w-4 h-4 text-[var(--color-accent)] shrink-0" aria-hidden="true" />
        )}
        <span className="leading-snug text-xs sm:text-sm break-words flex-1 text-left">
          {item.message}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="p-1 rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors cursor-pointer shrink-0"
        aria-label="Tutup pemberitahuan"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Standardized application-wide Toast provider.
 * Displays lightweight, accessible notifications with adaptive durations and hover-pause.
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
      if (!message.trim()) return;

      const durationMs = DURATION_BY_TYPE[type] || 3500;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setToasts((prev) => {
        // Prevent duplicate spam of identical message while visible
        if (prev.some((t) => t.message === message && !t.isExiting)) {
          return prev;
        }
        return [...prev.slice(-2), { id, message, type, durationMs, isExiting: false }];
      });
    },
    []
  );

  // Listen for global custom events from background tasks/offline workers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCustomToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: ToastType; message?: string }>;
      if (customEvent.detail?.message) {
        addToast(customEvent.detail.message, customEvent.detail.type || 'info');
      }
    };

    window.addEventListener('amelia:show-toast', handleCustomToast);
    return () => window.removeEventListener('amelia:show-toast', handleCustomToast);
  }, [addToast]);

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
          <ToastCard key={t.id} item={t} onDismiss={dismissToast} />
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
