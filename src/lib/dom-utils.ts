/**
 * DOM utility helpers for accessible focus, smooth scrolling, and form UX.
 */

/**
 * Detects whether the user prefers reduced motion from system/browser settings.
 * Returns 'auto' (instant jump) if reduced motion is preferred, or 'smooth' otherwise.
 */
export function getPreferredScrollBehavior(): ScrollBehavior {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return 'auto';
  }
  return 'smooth';
}

/**
 * Smoothly scrolls the viewport to the target element and shifts keyboard focus.
 * Respects user's prefers-reduced-motion setting.
 * Designed for form validation errors, accessible UX, and mobile screen alignment.
 */
export function focusAndScrollToField(
  id: string,
  options: { block?: ScrollLogicalPosition; delayMs?: number } = {}
) {
  if (typeof window === 'undefined') return;

  const delay = options.delayMs ?? 50;

  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: getPreferredScrollBehavior(),
      block: options.block ?? 'center',
    });

    if (typeof (el as HTMLElement).focus === 'function') {
      (el as HTMLElement).focus({ preventScroll: true });
    }
  }, delay);
}

/**
 * Smoothly scrolls the container into view if its top has scrolled above the viewport.
 * Respects user's prefers-reduced-motion setting.
 * Ideal for filter changes, pagination resets, and table state updates.
 */
export function scrollContainerIntoViewIfAbove(id: string, offsetBuffer = 80) {
  if (typeof window === 'undefined') return;

  const el = document.getElementById(id);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  if (rect.top < offsetBuffer) {
    el.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
  }
}
