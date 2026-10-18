'use client';

import { useEffect, useRef } from 'react';

/**
 * Standardized keyboard shortcut hook for search inputs.
 * Pressing '/' focuses and selects the search input (when not already editing another input).
 * Pressing 'Escape' inside the input clears it and blurs.
 */
export function useSearchShortcut() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return inputRef;
}
