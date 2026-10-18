import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActiveFilterItem {
  label: string;
  value: string;
}

export interface SuggestionItem {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  activeFilters?: ActiveFilterItem[];
  suggestions?: SuggestionItem[];
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  variant?: 'card' | 'paper' | 'ghost' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  headingLevel?: 'h2' | 'h3' | 'h4';
}

const VARIANT_MAP = {
  card: 'bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-2xs',
  paper: 'bg-[var(--color-paper-muted)]/60 border border-[var(--color-paper-border)]',
  ghost: 'bg-transparent border border-dashed border-[var(--color-paper-border)]',
  minimal: 'bg-transparent border-0 shadow-none',
};

const SIZE_MAP = {
  sm: 'p-5 sm:p-7',
  md: 'p-7 sm:p-12',
  lg: 'p-9 sm:p-16',
};

const ICON_CONTAINER_SIZE = {
  sm: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl mb-3',
  md: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mb-4',
  lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-3xl mb-5',
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      activeFilters,
      suggestions,
      action,
      secondaryAction,
      variant = 'card',
      size = 'md',
      headingLevel = 'h3',
      className,
      ...props
    },
    ref
  ) => {
    const HeadingTag = headingLevel;

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(
          'flex flex-col items-center justify-center text-center rounded-2xl sm:rounded-3xl w-full mx-auto select-none transition-all tab-content-enter',
          VARIANT_MAP[variant],
          SIZE_MAP[size],
          className
        )}
        {...props}
      >
        {/* Calming icon container */}
        <div
          className={cn(
            'bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] flex items-center justify-center text-[var(--color-accent)] shadow-2xs shrink-0 transition-transform duration-200 group-hover:scale-105',
            ICON_CONTAINER_SIZE[size]
          )}
          aria-hidden="true"
        >
          {icon || <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />}
        </div>

        {/* Empathetic Display Title */}
        <HeadingTag
          className={cn(
            'font-medium text-[var(--color-ink)] tracking-tight max-w-lg mx-auto leading-snug',
            size === 'sm' && 'text-sm sm:text-base',
            size === 'md' && 'text-base sm:text-lg',
            size === 'lg' && 'text-lg sm:text-2xl'
          )}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </HeadingTag>

        {/* Empathetic Description */}
        {description && (
          <div
            className={cn(
              'mt-2 text-[var(--color-ink-muted)] max-w-md sm:max-w-lg mx-auto leading-relaxed',
              size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm'
            )}
          >
            {description}
          </div>
        )}

        {/* Active Filter Chips (if filter/search returned 0 results) */}
        {activeFilters && activeFilters.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto">
            {activeFilters.map((filter, idx) => (
              <span
                key={`${filter.label}-${idx}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-paper)] border border-[var(--color-paper-border)] text-[11px] text-[var(--color-ink-soft)] font-medium shadow-2xs"
              >
                <span className="text-[var(--color-ink-muted)]">{filter.label}:</span>
                <span className="font-semibold text-[var(--color-ink)] truncate max-w-[160px] sm:max-w-[200px]">
                  &ldquo;{filter.value}&rdquo;
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Search Suggestions (if query yielded no match) */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto">
            <span className="text-xs text-[var(--color-ink-soft)] mr-1">Coba kata kunci:</span>
            {suggestions.map((sugg) => (
              <button
                key={sugg.label}
                type="button"
                onClick={sugg.onClick}
                className="px-2.5 py-1 text-xs rounded-lg bg-[var(--color-paper)] hover:bg-[var(--color-accent-soft)] text-[var(--color-ink)] hover:text-[var(--color-accent)] border border-[var(--color-paper-border)] transition-colors cursor-pointer font-medium"
              >
                {sugg.label}
              </button>
            ))}
          </div>
        )}

        {/* Action Button Row */}
        {(action || secondaryAction) && (
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md mx-auto">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
