import { describe, it, expect } from 'vitest';
import { createPRNG, seededShuffle, hashStringToSeed } from '@/lib/seeded-random';

describe('Deterministic Seeded Randomization Utility (seeded-random)', () => {
  it('hashStringToSeed produces consistent 32-bit positive integer', () => {
    const seed1 = hashStringToSeed('session-abc');
    const seed2 = hashStringToSeed('session-abc');
    const seedDiff = hashStringToSeed('session-xyz');

    expect(seed1).toBe(seed2);
    expect(seed1).toBeGreaterThanOrEqual(0);
    expect(seed1).not.toBe(seedDiff);
  });

  it('createPRNG produces identical sequences for identical seeds', () => {
    const prngA = createPRNG('session-123');
    const prngB = createPRNG('session-123');

    const seqA = [prngA(), prngA(), prngA(), prngA()];
    const seqB = [prngB(), prngB(), prngB(), prngB()];

    expect(seqA).toEqual(seqB);
  });

  it('createPRNG produces different sequences for different seeds', () => {
    const prngA = createPRNG('seed-alpha');
    const prngB = createPRNG('seed-beta');

    const seqA = [prngA(), prngA(), prngA()];
    const seqB = [prngB(), prngB(), prngB()];

    expect(seqA).not.toEqual(seqB);
  });

  it('seededShuffle produces identical permuted order for identical seed', () => {
    const original = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const shuffled1 = seededShuffle(original, 'my-session');
    const shuffled2 = seededShuffle(original, 'my-session');

    expect(shuffled1).toEqual(shuffled2);
    expect(shuffled1).not.toBe(original); // Should return new array
  });

  it('seededShuffle produces different permutations for different seeds', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffledA = seededShuffle(original, 'seed-1');
    const shuffledB = seededShuffle(original, 'seed-2');

    expect(shuffledA).not.toEqual(shuffledB);
  });

  it('seededShuffle preserves all original elements without loss or duplication', () => {
    const original = ['card1', 'card2', 'card3', 'card4', 'card5'];
    const shuffled = seededShuffle(original, 'test-seed-preserve');

    expect(shuffled.length).toBe(original.length);
    expect([...shuffled].sort()).toEqual([...original].sort());
  });

  it('seededShuffle handles empty and single-element arrays gracefully', () => {
    expect(seededShuffle([], 'empty-seed')).toEqual([]);
    expect(seededShuffle(['single'], 'single-seed')).toEqual(['single']);
  });
});
