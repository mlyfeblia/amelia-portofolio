'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useId,
} from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
  registerTrigger: (value: string, element: HTMLElement | null) => void;
  getTriggerElement: (value: string) => HTMLElement | null;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return ctx;
}

/* ─────────────────────────────────────────────────────────────
 * 1. Root: <Tabs>
 * ───────────────────────────────────────────────────────────── */
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  className,
  children,
  id: customId,
  ...props
}: TabsProps) {
  const generatedId = useId();
  const baseId = customId || generatedId;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const triggersMap = useRef<Map<string, HTMLElement>>(new Map());

  const registerTrigger = useCallback((val: string, el: HTMLElement | null) => {
    if (el) {
      triggersMap.current.set(val, el);
    } else {
      triggersMap.current.delete(val);
    }
  }, []);

  const getTriggerElement = useCallback((val: string) => {
    return triggersMap.current.get(val) || null;
  }, []);

  const handleChange = useCallback(
    (nextVal: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextVal);
      }
      onValueChange?.(nextVal);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        onChange: handleChange,
        registerTrigger,
        getTriggerElement,
        baseId,
      }}
    >
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────
 * 2. List: <TabsList> (with horizontal auto-center, arrows, wheel)
 * ───────────────────────────────────────────────────────────── */
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pills' | 'segmented' | 'underline';
  showArrows?: boolean;
  showFades?: boolean;
  autoCenter?: boolean;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      variant = 'pills',
      showArrows = true,
      showFades = true,
      autoCenter = true,
      className,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const { value, getTriggerElement, onChange } = useTabsContext();

    const internalListRef = useRef<HTMLDivElement>(null);
    const listRef = (forwardedRef as React.RefObject<HTMLDivElement>) || internalListRef;

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = useCallback(() => {
      const el = listRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, [listRef]);

    const centerActiveTab = useCallback(
      (smooth = true) => {
        if (!autoCenter) return;
        const container = listRef.current;
        const trigger = getTriggerElement(value);
        if (!container || !trigger) return;

        const containerWidth = container.clientWidth;
        const triggerLeft = trigger.offsetLeft;
        const triggerWidth = trigger.clientWidth;
        const targetLeft = triggerLeft - containerWidth / 2 + triggerWidth / 2;

        container.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: smooth ? 'smooth' : 'auto',
        });
      },
      [autoCenter, getTriggerElement, listRef, value]
    );

    const scrollStep = (direction: 'left' | 'right') => {
      const el = listRef.current;
      if (!el) return;
      const offset = direction === 'left' ? -200 : 200;
      el.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 220);
    };

    // Non-passive native wheel listener to isolate scroll to the horizontal tabs slider and prevent simultaneous page scrolling
    useEffect(() => {
      const el = listRef.current;
      if (!el) return;

      const onNativeWheel = (e: WheelEvent) => {
        // Only intercept if the tabs list has horizontal overflow to scroll
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 1) return;

        const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (delta === 0) return;

        // Prevent simultaneous vertical page scrolling while mouse is over horizontal slider
        e.preventDefault();

        // Immediately scroll the slider horizontally
        el.scrollBy({ left: delta, behavior: 'auto' });
        checkScroll();
      };

      el.addEventListener('wheel', onNativeWheel, { passive: false });
      return () => {
        el.removeEventListener('wheel', onNativeWheel);
      };
    }, [checkScroll, listRef]);

    // Auto-center when active tab value changes
    useEffect(() => {
      const frameId = requestAnimationFrame(() => {
        centerActiveTab(true);
      });
      const timer = setTimeout(() => {
        centerActiveTab(false);
        checkScroll();
      }, 300);

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(timer);
      };
    }, [value, centerActiveTab, checkScroll]);

    // Resize observer & scroll listener
    useEffect(() => {
      const el = listRef.current;
      if (!el) return;

      checkScroll();

      const handleResize = () => {
        checkScroll();
        centerActiveTab(false);
      };

      window.addEventListener('resize', handleResize, { passive: true });
      const resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);

      return () => {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
      };
    }, [checkScroll, centerActiveTab, listRef]);

    // Keyboard arrow navigation across tabs in the list
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

      const container = listRef.current;
      if (!container) return;

      const triggers = Array.from(
        container.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
      );
      if (triggers.length === 0) return;

      const currentIndex = triggers.findIndex((btn) => btn.getAttribute('data-value') === value);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % triggers.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      }

      const nextTrigger = triggers[nextIndex];
      const nextValue = nextTrigger.getAttribute('data-value');
      if (nextValue) {
        e.preventDefault();
        onChange(nextValue);
        nextTrigger.focus();
      }
    };

    const variantStyles = {
      pills: 'gap-1.5 sm:gap-2 py-1',
      segmented: 'bg-[var(--color-paper-muted)] p-1 rounded-xl gap-1 border border-[var(--color-paper-border)]',
      underline: 'gap-4 border-b border-[var(--color-paper-border)] -mb-px',
    };

    return (
      <div className="relative w-full">
        {/* Subtle gradient edge fades */}
        {showFades && canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--color-paper)] to-transparent z-[5] transition-opacity duration-200"
            aria-hidden="true"
          />
        )}
        {showFades && canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--color-paper)] to-transparent z-[5] transition-opacity duration-200"
            aria-hidden="true"
          />
        )}

        {/* Scroll navigation arrows for desktop */}
        {showArrows && canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollStep('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-md text-[var(--color-ink)] hover:text-[var(--color-accent)] items-center justify-center transition-all cursor-pointer select-none active:scale-95"
            aria-label="Geser tab ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {showArrows && canScrollRight && (
          <button
            type="button"
            onClick={() => scrollStep('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-md text-[var(--color-ink)] hover:text-[var(--color-accent)] items-center justify-center transition-all cursor-pointer select-none active:scale-95"
            aria-label="Geser tab ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={listRef}
          role="tablist"
          onScroll={checkScroll}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex items-center overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] rounded-lg',
            variantStyles[variant],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

/* ─────────────────────────────────────────────────────────────
 * 3. Trigger: <TabsTrigger>
 * ───────────────────────────────────────────────────────────── */
export interface BaseTabsTriggerProps {
  value: string;
  href?: string;
  variant?: 'pills' | 'segmented' | 'underline';
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export type TabsTriggerProps = BaseTabsTriggerProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseTabsTriggerProps>;

export const TabsTrigger = forwardRef<HTMLButtonElement | HTMLAnchorElement, TabsTriggerProps>(
  (
    {
      value: triggerValue,
      href,
      variant = 'pills',
      badge,
      icon,
      className,
      children,
      disabled = false,
      onClick,
      ...props
    },
    forwardedRef
  ) => {
    const { value: activeValue, onChange, registerTrigger, baseId } = useTabsContext();
    const isActive = activeValue === triggerValue;
    const internalRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
    const btnRef = (forwardedRef as React.RefObject<HTMLButtonElement | HTMLAnchorElement>) || internalRef;

    const tabId = `${baseId}-tab-${triggerValue}`;
    const panelId = `${baseId}-panel-${triggerValue}`;

    useEffect(() => {
      registerTrigger(triggerValue, btnRef.current as HTMLElement | null);
      return () => registerTrigger(triggerValue, null);
    }, [registerTrigger, triggerValue, btnRef]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onChange(triggerValue);
      onClick?.(e as React.MouseEvent<HTMLButtonElement>);
    };

    const variantStyles = {
      pills: cn(
        'chip-interactive inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-xl shrink-0 min-h-[34px] sm:min-h-[36px] transition-all duration-150',
        isActive
          ? 'bg-[var(--color-accent)] text-white shadow-xs font-semibold'
          : 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)]'
      ),
      segmented: cn(
        'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg shrink-0 transition-all duration-150 min-h-[36px] sm:min-h-[32px]',
        isActive
          ? 'bg-[var(--color-surface)] text-[var(--color-ink)] shadow-2xs font-semibold'
          : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)]/50'
      ),
      underline: cn(
        'inline-flex items-center gap-2 pb-2.5 pt-1 text-xs sm:text-sm font-medium border-b-2 shrink-0 transition-all duration-150 min-h-[44px] sm:min-h-[40px]',
        isActive
          ? 'border-[var(--color-accent)] text-[var(--color-accent)] font-semibold'
          : 'border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-paper-border)]'
      ),
    };

    if (href !== undefined) {
      const anchorProps = { ...props } as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      delete (anchorProps as Record<string, unknown>).type;

      return (
        <Link
          ref={btnRef as React.Ref<HTMLAnchorElement>}
          href={href}
          id={tabId}
          role="tab"
          aria-selected={isActive}
          aria-current={isActive ? 'page' : undefined}
          aria-controls={panelId}
          data-value={triggerValue}
          tabIndex={isActive ? 0 : -1}
          onClick={handleClick}
          className={cn(
            'cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
            variantStyles[variant],
            disabled && 'opacity-40 cursor-not-allowed pointer-events-none active:scale-100',
            className
          )}
          {...anchorProps}
        >
          {icon && <span className="shrink-0 flex items-center">{icon}</span>}
          <span>{children}</span>
          {badge !== undefined && <span className="shrink-0 flex items-center">{badge}</span>}
        </Link>
      );
    }

    return (
      <button
        ref={btnRef as React.Ref<HTMLButtonElement>}
        id={tabId}
        type="button"
        role="tab"
        aria-selected={isActive}
        aria-controls={panelId}
        data-value={triggerValue}
        disabled={disabled}
        tabIndex={isActive ? 0 : -1}
        onClick={handleClick}
        className={cn(
          'cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
          variantStyles[variant],
          disabled && 'opacity-40 cursor-not-allowed pointer-events-none active:scale-100',
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0 flex items-center">{icon}</span>}
        <span>{children}</span>
        {badge !== undefined && <span className="shrink-0 flex items-center">{badge}</span>}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

/* ─────────────────────────────────────────────────────────────
 * 4. Content: <TabsContent>
 * ───────────────────────────────────────────────────────────── */
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

export function TabsContent({
  value: contentValue,
  forceMount = false,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext();
  const isActive = activeValue === contentValue;

  const tabId = `${baseId}-tab-${contentValue}`;
  const panelId = `${baseId}-panel-${contentValue}`;

  if (!isActive && !forceMount) {
    return null;
  }

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={!isActive}
      tabIndex={0}
      className={cn(
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] rounded-xl',
        isActive ? 'block' : 'hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
