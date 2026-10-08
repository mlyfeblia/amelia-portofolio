import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type SectionVariant = 'paper' | 'surface' | 'muted' | 'accent' | 'accentSoft';
export type SectionPadding = 'none' | 'sm' | 'md' | 'lg';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article' | 'aside';
  variant?: SectionVariant;
  padding?: SectionPadding;
  container?: boolean;
  containerClassName?: string;
}

const VARIANT_MAP: Record<SectionVariant, string> = {
  paper: 'bg-[var(--color-paper)] text-[var(--color-ink)]',
  surface: 'bg-[var(--color-surface)] text-[var(--color-ink)] border-y border-[var(--color-paper-border)]',
  muted: 'bg-[var(--color-paper-muted)] text-[var(--color-ink)] border-y border-[var(--color-paper-border)]',
  accent: 'bg-[var(--color-accent)] text-white',
  accentSoft: 'bg-[var(--color-accent-soft)]/60 text-[var(--color-ink)] border-y border-[var(--color-accent-border)]/50',
};

const PADDING_MAP: Record<SectionPadding, string> = {
  none: '',
  sm: 'py-8 sm:py-12 md:py-14',
  md: 'py-12 sm:py-20 md:py-24', // Standard rhythmic landing page padding
  lg: 'py-16 sm:py-24 md:py-32',
};

export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      as: Component = 'section',
      variant = 'paper',
      padding = 'md',
      container = true,
      containerClassName,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn('relative w-full', VARIANT_MAP[variant], PADDING_MAP[padding], className)}
        {...props}
      >
        {container ? (
          <div className={cn('max-w-7xl mx-auto px-4 sm:px-8 lg:px-10', containerClassName)}>
            {children}
          </div>
        ) : (
          children
        )}
      </Component>
    );
  }
);

Section.displayName = 'Section';
