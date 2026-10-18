'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormErrorMessageProps {
  message?: string | null;
  onClose?: () => void;
  autoDismissMs?: number;
  className?: string;
  showProgress?: boolean;
}

export function FormErrorMessage({
  message,
  onClose,
  autoDismissMs = 6000,
  className,
  showProgress = true,
}: FormErrorMessageProps) {
  const [cachedMessage, setCachedMessage] = useState<string>(message || '');
  const [isRendered, setIsRendered] = useState<boolean>(Boolean(message));
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isHovered, _setIsHovered] = useState<boolean>(false);

  // Safe hover setter that guards against touchscreen/mobile emulation
  const setIsHovered = useCallback((val: boolean) => {
    if (val) {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches
      ) {
        return; // Do not pause on touchscreens/mobile devices
      }
    }
    _setIsHovered(val);
  }, []);

  // Listen to window scroll & touch movements to ensure hover state is instantly cleared on mobile
  useEffect(() => {
    const handleScrollOrTouch = () => {
      _setIsHovered(false);
    };
    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
    };
  }, []);

  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingTimeRef = useRef<number>(autoDismissMs);
  const startTimeRef = useRef<number>(0);

  // Synchronize state during render when message prop changes
  const [prevMessage, setPrevMessage] = useState<string | null | undefined>(message);
  if (message !== prevMessage) {
    setPrevMessage(message);
    if (message) {
      setCachedMessage(message);
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered) {
      setIsExiting(true);
    }
  }

  // Trigger graceful exit animation and notify parent
  const startExit = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (isExiting) return;

      // Immediately notify parent so controlled state (e.g. error) becomes empty
      onClose?.();

      // Start local exit animation
      setIsExiting(true);

      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 220); // 220ms animation matches CSS formErrorExit duration
    },
    [isExiting, onClose]
  );

  // Handle timers and exit transitions when message prop transitions
  useEffect(() => {
    // Case 1: New or updated truthy message arrives from parent
    if (message) {
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }
      remainingTimeRef.current = autoDismissMs;
      startTimeRef.current = Date.now();
    }
    // Case 2: Parent cleared the message, wait for exit animation to complete unmount
    else if (isExiting) {
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = setTimeout(() => {
        setIsRendered(false);
        setIsExiting(false);
      }, 220);
    }
  }, [message, isExiting, autoDismissMs]);

  // Auto-dismiss countdown with hover-pause
  useEffect(() => {
    if (!isRendered || isExiting || autoDismissMs <= 0 || !onClose) {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
      return;
    }

    if (isHovered) {
      // Pause countdown on mouse hover
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(500, remainingTimeRef.current - elapsed);
    } else {
      // Resume countdown when mouse leaves
      startTimeRef.current = Date.now();
      autoDismissTimerRef.current = setTimeout(() => {
        startExit();
      }, remainingTimeRef.current);
    }

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
    };
  }, [isRendered, isExiting, isHovered, autoDismissMs, onClose, startExit]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current);
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
    };
  }, []);

  if (!isRendered || !cachedMessage) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => _setIsHovered(false)}
      onTouchMove={() => _setIsHovered(false)}
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-2xs select-none transition-all',
        'text-xs sm:text-sm text-[var(--color-error)] bg-[var(--color-error-soft)] border-[var(--color-error-border)]',
        isExiting ? 'form-error-exit' : 'form-error-enter',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2.5 p-3 sm:p-3.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--color-error)]" aria-hidden="true" />
          <p className="font-medium text-[var(--color-error)] text-xs sm:text-sm leading-relaxed min-w-0 flex-1 break-words [overflow-wrap:anywhere] [word-break:break-word]">
            {cachedMessage}
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={startExit}
            className="p-1 -mr-1 -mt-0.5 rounded-lg text-[var(--color-error)] hover:bg-[var(--color-error)]/12 hover:text-[var(--color-error)] active:scale-95 transition-all cursor-pointer select-none shrink-0"
            aria-label="Tutup pesan peringatan"
            title="Tutup pesan"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Subtle auto-dismiss countdown line */}
      {showProgress && autoDismissMs > 0 && !isExiting && (
        <div className="h-0.5 w-full bg-[var(--color-error)]/10 overflow-hidden">
          <div
            className="h-full bg-[var(--color-error)]/35 transition-all"
            style={{
              animation: `formErrorProgress ${autoDismissMs}ms linear forwards`,
              animationPlayState: isHovered ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  );
}
