'use client';

import { useState, useEffect } from 'react';

export interface UseModalAnimationOptions {
  isOpen: boolean;
  durationMs?: number; // default: 200ms
}

export interface UseModalAnimationResult {
  isRendered: boolean;
  isExiting: boolean;
  backdropClass: string;
  windowClass: string;
}

/**
 * Standardized hook to manage smooth enter and exit transitions for modals and dialogs.
 * Uses React 19 state-during-render patterns (no synchronous setState in effects, no ref render access)
 * to keep the component mounted during exit animation before unmounting cleanly.
 */
export function useModalAnimation({
  isOpen,
  durationMs = 200,
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

  return {
    isRendered,
    isExiting,
    backdropClass: isExiting ? 'modal-backdrop-exit' : 'modal-backdrop-enter',
    windowClass: isExiting ? 'modal-window-exit' : 'modal-window-enter',
  };
}
