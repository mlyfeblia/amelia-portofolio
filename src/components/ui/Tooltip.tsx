'use client';

import React, { useState, useRef, useId } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  wrapperClassName?: string;
}

/**
 * Standardized, accessible, lightweight Tooltip component.
 * Features smooth micro-animation (.tooltip-enter) and keyboard focus accessibility.
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 120,
  className,
  wrapperClassName,
}: TooltipProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  return (
    <span
      className={cn("relative inline-flex items-center", wrapperClassName)}
      aria-describedby={isVisible && content ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isVisible && content && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none px-2.5 py-1 text-[11px] font-medium text-white bg-[var(--color-ink)] rounded-lg shadow-md whitespace-nowrap tooltip-enter select-none',
            positionClasses[position],
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
