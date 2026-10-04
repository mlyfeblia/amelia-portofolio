import React from 'react';

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'accent' | 'white' | 'ink' | 'muted';
  label?: string;
}

const SIZE_MAP = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-9 h-9',
};

const VARIANT_MAP = {
  accent: 'text-[var(--color-accent)]',
  white: 'text-white',
  ink: 'text-[var(--color-ink)]',
  muted: 'text-[var(--color-ink-muted)]',
};

export function Spinner({
  size = 'md',
  variant = 'accent',
  label = 'Memuat...',
  className = '',
  ...props
}: SpinnerProps) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.accent;

  return (
    <span className="inline-flex items-center justify-center shrink-0" role="status" aria-label={label}>
      <svg
        className={`spinner-smooth ${sizeClass} ${variantClass} ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
