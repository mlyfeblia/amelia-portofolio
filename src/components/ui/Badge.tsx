import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'accent' | 'warning' | 'danger' | 'info';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const VARIANT_MAP = {
  neutral: 'bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border-[var(--color-paper-border)]',
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-border)]',
  warning: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
  danger: 'bg-rose-500/10 text-rose-700 border-rose-500/25',
  info: 'bg-sky-500/10 text-sky-700 border-sky-500/25',
};

const DOT_COLOR_MAP = {
  neutral: 'bg-[var(--color-ink-soft)]',
  accent: 'bg-[var(--color-accent)]',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
};

const SIZE_MAP = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-1',
  sm: 'text-xs px-2.5 py-0.5 gap-1.5',
  md: 'text-xs sm:text-sm px-3 py-1 gap-2',
};

export function Badge({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  icon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.neutral;
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.sm;
  const dotColorClass = DOT_COLOR_MAP[variant] || DOT_COLOR_MAP.neutral;

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full shrink-0 select-none ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full pulse-dot ${dotColorClass}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
