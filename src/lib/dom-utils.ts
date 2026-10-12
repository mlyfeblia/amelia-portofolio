/**
 * DOM utility helpers for accessible focus, smooth scrolling, and form UX.
 */

/**
 * Smoothly scrolls the viewport to the target element and shifts keyboard focus.
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
      behavior: 'smooth',
      block: options.block ?? 'center',
    });

    if (typeof (el as HTMLElement).focus === 'function') {
      (el as HTMLElement).focus({ preventScroll: true });
    }
  }, delay);
}
