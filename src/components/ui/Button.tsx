'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export type ButtonAsButtonProps = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    href?: undefined;
  };

export type ButtonAsLinkProps = BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    href: string;
    target?: string;
    rel?: string;
    download?: string | boolean;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] border border-transparent shadow-xs hover:shadow-sm focus-visible:ring-[var(--color-accent)]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent-border)] hover:bg-[var(--color-accent-soft)]/60 border border-[var(--color-paper-border)] shadow-2xs focus-visible:ring-[var(--color-accent)]',
  outline:
    'bg-transparent text-[var(--color-ink)] hover:text-[var(--color-accent)] hover:bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] hover:border-[var(--color-ink-muted)] focus-visible:ring-[var(--color-accent)]',
  ghost:
    'bg-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] border border-transparent focus-visible:ring-[var(--color-accent)]',
  danger:
    'bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-xs hover:shadow-sm focus-visible:ring-red-600',
  accent:
    'bg-[var(--color-accent-soft)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white border border-[var(--color-accent-border)] shadow-2xs focus-visible:ring-[var(--color-accent)]',
};

const SIZE_MAP: Record<ButtonSize, string> = {
  xs: 'min-h-[28px] px-2.5 py-1 text-xs rounded-md gap-1.5',
  sm: 'min-h-[36px] px-3.5 py-1.5 text-xs sm:text-sm rounded-lg gap-2',
  md: 'min-h-[44px] px-4 sm:px-5 py-2.5 text-sm sm:text-base rounded-xl gap-2.5 font-medium',
  lg: 'min-h-[52px] px-6 py-3.5 text-base sm:text-lg rounded-xl gap-3 font-semibold',
};

const SPINNER_SIZE_MAP: Record<ButtonSize, 'xs' | 'sm' | 'md' | 'lg'> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

const SPINNER_VARIANT_MAP: Record<ButtonVariant, 'white' | 'ink' | 'accent' | 'muted'> = {
  primary: 'white',
  secondary: 'ink',
  outline: 'ink',
  ghost: 'muted',
  danger: 'white',
  accent: 'accent',
};

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className,
      children,
      href,
      ...restProps
    } = props;

    const isDisabled = disabled || isLoading;

    const baseClasses = cn(
      'inline-flex items-center justify-center font-medium select-none cursor-pointer text-center',
      'transition-all duration-150 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'active:scale-[0.98]',
      VARIANT_MAP[variant],
      SIZE_MAP[size],
      fullWidth && 'w-full',
      isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none active:scale-100 shadow-none',
      className
    );

    const spinner = (
      <Spinner
        size={SPINNER_SIZE_MAP[size]}
        variant={SPINNER_VARIANT_MAP[variant]}
        label={loadingText || 'Memuat...'}
      />
    );

    const content = (
      <>
        {isLoading ? (
          spinner
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {isLoading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children && <span>{children}</span>
        )}
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </>
    );

    if (href !== undefined) {
      const linkProps = { ...restProps } as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      delete (linkProps as Record<string, unknown>).type;

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          aria-disabled={isDisabled ? 'true' : undefined}
          tabIndex={isDisabled ? -1 : undefined}
          className={baseClasses}
          {...linkProps}
        >
          {content}
        </Link>
      );
    }

    const {
      type = 'button',
      ...buttonProps
    } = restProps as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        className={baseClasses}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';
