'use client';

import { useEffect, useCallback } from 'react';

/**
 * Standardized hook to protect users from accidental data loss.
 * Attaches a browser beforeunload listener when forms or editors contain unsaved changes (dirty state).
 */
export function useUnsavedChangesWarning(
  isDirty: boolean,
  message: string = 'Perubahan yang Anda buat belum disimpan. Yakin ingin meninggalkan halaman?'
) {
  useEffect(() => {
    if (!isDirty || typeof window === 'undefined') return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Standard browsers show their own localized message
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  const confirmDiscard = useCallback(
    (onConfirm: () => void) => {
      if (!isDirty) {
        onConfirm();
        return;
      }

      if (typeof window !== 'undefined') {
        const confirmed = window.confirm(message);
        if (confirmed) {
          onConfirm();
        }
      }
    },
    [isDirty, message]
  );

  return { confirmDiscard };
}
