'use client';

import { useState, useEffect } from 'react';

export interface UseModalAnimationOptions {
  isOpen: boolean;
  durationMs?: number; // default: 220ms
  onClose?: () => void;
  closeOnEscape?: boolean; // default: true
  lockScroll?: boolean; // default: true
  type?: 'dialog' | 'sheet'; // default: 'dialog'
}

export interface UseModalAnimationResult {
  isRendered: boolean;
  isExiting: boolean;
  backdropClass: string;
  windowClass: string;
}

// Centralized non-destructive background scroll locking
// Intercepts wheel, touchmove, and keyboard scrolling on the background
// while keeping document.body and document.documentElement un-locked so that
// position: sticky headers (AdminHeader at z-30, Navbar at z-50) remain docked
// at top: 0 under the backdrop without disappearing or jumping.
let activeModalCount = 0;
let cleanupScrollLock: (() => void) | null = null;

function isInsideScrollable(target: EventTarget | null): boolean {
  let el = target as HTMLElement | null;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el.scrollHeight > el.clientHeight) {
      const overflowY = window.getComputedStyle(el).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

function acquireModalScrollLock() {
  activeModalCount++;
  if (activeModalCount === 1 && typeof window !== 'undefined') {
    const handleWheel = (e: WheelEvent) => {
      if (!isInsideScrollable(e.target)) {
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isInsideScrollable(e.target)) {
        if (e.cancelable) e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      const scrollKeys = ['Space', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (scrollKeys.includes(e.code) || scrollKeys.includes(e.key)) {
        if (!isInsideScrollable(e.target)) {
          if (e.cancelable) e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    cleanupScrollLock = () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      cleanupScrollLock = null;
    };
  }

  return () => {
    activeModalCount = Math.max(0, activeModalCount - 1);
    if (activeModalCount === 0 && cleanupScrollLock) {
      cleanupScrollLock();
    }
  };
}

/**
 * Standardized hook to manage smooth enter and exit transitions for modals and dialogs.
 * Uses React 19 state-during-render patterns (no synchronous setState in effects, no ref render access)
 * to keep the component mounted during exit animation before unmounting cleanly.
 * Also manages centralized non-destructive background scroll locking and Escape key handling.
 */
export function useModalAnimation({
  isOpen,
  durationMs = 220,
  onClose,
  closeOnEscape = true,
  lockScroll = true,
  type = 'dialog',
}: UseModalAnimationOptions): UseModalAnimationResult {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  // Synchronize state during render when isOpen prop transitions
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsRendered(true);
      setIsExiting(false);
    } else if (isRendered) {
      setIsExiting(true);
    }
  }

  // Handle timed unmount when exit transition is active
  useEffect(() => {
    if (!isExiting) return;

    const timer = setTimeout(() => {
      setIsRendered(false);
      setIsExiting(false);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isExiting, durationMs]);

  // Non-destructive background scroll locking (preserves sticky headers under backdrop)
  useEffect(() => {
    if (!lockScroll || !isRendered || typeof window === 'undefined') return;

    const releaseLock = acquireModalScrollLock();
    return () => {
      releaseLock();
    };
  }, [lockScroll, isRendered]);

  // Centralized Escape key handling
  useEffect(() => {
    if (!closeOnEscape || !isOpen || !onClose || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, isOpen, onClose]);

  const windowAnimationClass =
    type === 'sheet'
      ? isExiting
        ? 'modal-sheet-exit'
        : 'modal-sheet-enter'
      : isExiting
        ? 'modal-window-exit'
        : 'modal-window-enter';

  return {
    isRendered,
    isExiting,
    backdropClass: `fixed inset-0 bg-transparent backdrop-blur-md modal-backdrop-layer ${
      isExiting ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
    }`,
    windowClass: windowAnimationClass,
  };
}
