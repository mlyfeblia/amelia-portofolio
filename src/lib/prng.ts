/**
 * Pure deterministic PRNG and Fisher-Yates shuffle utilities
 * Safe for both Server Components (SSR/RSC) and Client Components
 */

/**
 * 32-bit FNV-1a string hashing function to produce deterministic numeric seed
 */
export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/**
 * Mulberry32 PRNG generator
 * Returns a function that outputs deterministic pseudo-random float between [0, 1)
 */
export function createPRNG(seed: string | number): () => number {
  let a = typeof seed === 'number' ? (seed >>> 0) : hashStringToSeed(seed);
  return function () {
    let t = (a += 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic Fisher-Yates array shuffle based on seed
 * Leaves original array immutable
 */
export function seededShuffle<T>(array: readonly T[], seed: string | number): T[] {
  if (array.length <= 1) return [...array];
  const result = [...array];
  const rng = createPRNG(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }

  return result;
}
