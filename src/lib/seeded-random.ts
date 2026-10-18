'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { hashStringToSeed, createPRNG, seededShuffle } from './prng';

export { hashStringToSeed, createPRNG, seededShuffle };

/**
 * React hook to manage visit-level seed for discovery shuffle
 * Guarantees zero SSR hydration mismatch by retaining initial order on server,
 * then generating a fresh, stable permutation on each page entrance/mount.
 * While on the page (paging, tabs, searching), the seed remains rock-solid stable.
 * When leaving the page and coming back, a new fresh seed is automatically generated.
 */
export function useVisitSeed(keyPrefix: string = 'visit'): {
  seed: string;
  refreshSeed: () => void;
  isReady: boolean;
} {
  const [seed, setSeed] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const freshSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setSeed(freshSeed);
      setIsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [keyPrefix]);

  const refreshSeed = useCallback(() => {
    const newSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSeed(newSeed);
  }, []);

  return { seed, refreshSeed, isReady };
}

/**
 * Backward-compatible session seed hook, using visit-level freshness
 */
export function useSessionSeed(storageKey: string): {
  seed: string;
  refreshSeed: () => void;
  isReady: boolean;
} {
  return useVisitSeed(storageKey);
}

/**
 * React hook for list-based seeded discovery
 */
export function useSeededDiscovery<T>(
  items: T[],
  storageKey: string,
  options: { enabled?: boolean } = { enabled: true }
): {
  items: T[];
  refreshDiscovery: () => void;
  isReady: boolean;
} {
  const { seed, refreshSeed, isReady } = useSessionSeed(storageKey);
  const isEnabled = options.enabled ?? true;

  const discoveredItems = useMemo(() => {
    if (!isEnabled || !seed || !isReady) {
      return items;
    }
    return seededShuffle(items, seed);
  }, [items, seed, isReady, isEnabled]);

  return {
    items: discoveredItems,
    refreshDiscovery: refreshSeed,
    isReady,
  };
}
