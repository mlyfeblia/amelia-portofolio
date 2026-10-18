'use client';

import React, { useState, useEffect, useRef, useId } from 'react';

export interface UseModalAnimationOptions {
  isOpen: boolean;
  durationMs?: number; // default: 220ms
  onClose?: () => void;
  closeOnEscape?: boolean; // default: true
  lockScroll?: boolean; // default: true
  type?: 'dialog' | 'sheet'; // default: 'dialog'
  containerRef?: React.RefObject<HTMLElement | null>;
  restoreFocus?: boolean; // default: true
  autoFocusFirst?: boolean; // default: true
}

export interface UseModalAnimationResult {
  isRendered: boolean;
  isExiting: boolean;
  backdropClass: string;
  windowClass: string;
}

// Modal Stack Registry for nested modal handling
const modalStack: string[] = [];

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
    const style = window.getComputedStyle(el);
    if (el.scrollHeight > el.clientHeight) {
      const overflowY = style.overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return true;
      }
    }
    if (el.scrollWidth > el.clientWidth) {
      const overflowX = style.overflowX;
      if (overflowX === 'auto' || overflowX === 'scroll') {
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
 * Focus Trap hook for WCAG 2.1 AA dialog accessibility.
 * Traps Tab and Shift+Tab navigation within containerRef and optionally auto-focuses first element.
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  isActive: boolean,
  autoFocusFirst = true
) {
  useEffect(() => {
    if (!isActive || typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    // Auto-focus first interactive element inside container
    if (autoFocusFirst) {
      const focusTimer = setTimeout(() => {
        const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          container.focus();
        }
      }, 50);

      return () => clearTimeout(focusTimer);
    }
  }, [containerRef, isActive, autoFocusFirst]);

  useEffect(() => {
    if (!isActive || typeof window === 'undefined') return;

    const handleTabKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;

      const focusableSelector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      ).filter((el) => el.offsetParent !== null); // only visible elements

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKeyDown);
    return () => window.removeEventListener('keydown', handleTabKeyDown);
  }, [containerRef, isActive]);
}

/**
 * Standardized hook to manage smooth enter and exit transitions for modals and dialogs.
 * Uses React 19 state-during-render patterns (no synchronous setState in effects, no ref render access)
 * to keep the component mounted during exit animation before unmounting cleanly.
 * Also manages centralized non-destructive background scroll locking, modal stack, return focus, and Escape key handling.
 */
export function useModalAnimation({
  isOpen,
  durationMs = 220,
  onClose,
  closeOnEscape = true,
  lockScroll = true,
  type = 'dialog',
  containerRef,
  restoreFocus = true,
  autoFocusFirst = true,
}: UseModalAnimationOptions): UseModalAnimationResult {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);

  const uniqueId = useId();
  const modalId = `modal_${uniqueId.replace(/:/g, '')}`;

  const triggerElementRef = useRef<HTMLElement | null>(null);

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

  // Record trigger element on opening
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      triggerElementRef.current = document.activeElement as HTMLElement | null;
    }
  }, [isOpen]);

  // Modal stack registration (top-most modal responds to Escape)
  useEffect(() => {
    if (!isRendered || isExiting) return;

    const id = modalId;
    if (!modalStack.includes(id)) {
      modalStack.push(id);
    }

    return () => {
      const idx = modalStack.indexOf(id);
      if (idx !== -1) {
        modalStack.splice(idx, 1);
      }
    };
  }, [isRendered, isExiting, modalId]);

  // Handle timed unmount and return focus when exit transition completes
  useEffect(() => {
    if (!isExiting) return;

    const timer = setTimeout(() => {
      setIsRendered(false);
      setIsExiting(false);

      if (restoreFocus && triggerElementRef.current) {
        try {
          if (typeof triggerElementRef.current.focus === 'function') {
            triggerElementRef.current.focus({ preventScroll: true });
          }
        } catch {}
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isExiting, durationMs, restoreFocus]);

  // Non-destructive background scroll locking (preserves sticky headers under backdrop)
  useEffect(() => {
    if (!lockScroll || !isRendered || typeof window === 'undefined') return;

    const releaseLock = acquireModalScrollLock();
    return () => {
      releaseLock();
    };
  }, [lockScroll, isRendered]);

  // Centralized Escape key handling (strictly top-of-stack modal only)
  useEffect(() => {
    if (!closeOnEscape || !isOpen || !onClose || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Only trigger onClose if this modal is at the top of the stack
        if (modalStack.length > 0 && modalStack[modalStack.length - 1] === modalId) {
          event.stopPropagation();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, isOpen, onClose, modalId]);

  // Focus trap if containerRef is provided
  useFocusTrap(
    containerRef ?? { current: null },
    Boolean(containerRef && isRendered && !isExiting),
    autoFocusFirst
  );

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
