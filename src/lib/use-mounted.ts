'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns true once mounted on client side.
 * Uses useSyncExternalStore to avoid calling setState in useEffect (React 19 / Next.js 16 compliant).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
