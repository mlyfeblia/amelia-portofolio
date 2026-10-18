'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Standardized client-side cooldown countdown hook for rate-limited forms and actions.
 * Automatically ticks down every second and clears itself when reaching 0.
 */
export function useCooldownTimer() {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const startCooldown = useCallback((seconds: number) => {
    setCooldownSeconds(Math.max(1, Math.round(seconds)));
  }, []);

  const clearCooldown = useCallback(() => {
    setCooldownSeconds(0);
  }, []);

  return {
    cooldownSeconds,
    isCoolingDown: cooldownSeconds > 0,
    startCooldown,
    clearCooldown,
  };
}
