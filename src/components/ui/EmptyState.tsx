import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  variant?: 'paper' | 'card' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT_MAP = {
  paper: 'bg-[var(--color-paper-muted)]/50 border border-[var(--color-paper-border)]',
  card: 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs',
  ghost: 'bg-transparent border border-dashed border-[var(--color-paper-border)]',
};

const SIZE_MAP = {
  sm: 'py-8 px-4',
  md: 'py-12 sm:py-16 px-4 sm:px-6',
  lg: 'py-16 sm:py-24 px-6 sm:px-8',
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      variant = 'card',
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center rounded-2xl w-full mx-auto select-none transition-all',
          VARIANT_MAP[variant],
          SIZE_MAP[size],
          className
        )}
        {...props}
      >
        {/* Calming icon container */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] flex items-center justify-center text-[var(--color-ink-muted)] mb-4 shadow-2xs">
          {icon || <Search className="w-6 h-6 stroke-[1.75]" />}
        </div>

        {/* Empathetic Title */}
        <h3
          className="text-base sm:text-lg font-semibold text-[var(--color-ink)] tracking-tight max-w-md"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h3>

        {/* Empathetic Description */}
        {description && (
          <div className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] max-w-md leading-relaxed">
            {description}
          </div>
        )}

        {/* Action Button Row */}
        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
