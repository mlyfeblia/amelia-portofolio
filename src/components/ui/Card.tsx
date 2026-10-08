import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'paper' | 'muted' | 'accent' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverEffect?: boolean;
}

const CARD_VARIANT_MAP: Record<CardVariant, string> = {
  default: 'bg-[var(--color-surface)] border-[var(--color-paper-border)] text-[var(--color-ink)] shadow-2xs',
  paper: 'bg-[var(--color-paper)] border-[var(--color-paper-border)] text-[var(--color-ink)] shadow-2xs',
  muted: 'bg-[var(--color-paper-muted)] border-[var(--color-paper-border)] text-[var(--color-ink)]',
  accent: 'bg-[var(--color-accent-soft)]/50 border-[var(--color-accent-border)] text-[var(--color-ink)]',
  interactive:
    'bg-[var(--color-surface)] border-[var(--color-paper-border)] text-[var(--color-ink)] shadow-2xs hover:shadow-md hover:border-[var(--color-accent-border)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
};

const PADDING_MAP: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hoverEffect = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border',
          CARD_VARIANT_MAP[variant],
          PADDING_MAP[padding],
          hoverEffect &&
            'hover:shadow-md hover:border-[var(--color-accent-border)] hover:-translate-y-0.5 transition-all duration-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
        {children}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'font-semibold text-base sm:text-lg text-[var(--color-ink)] leading-snug tracking-tight',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('text-[var(--color-ink)]', className)} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-4 border-t border-[var(--color-paper-border)]/70 mt-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';
