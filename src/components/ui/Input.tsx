import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  actionSlot?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      actionSlot,
      id: customId,
      disabled,
      required,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-[var(--color-ink-muted)] pointer-events-none flex items-center shrink-0">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              'w-full text-base sm:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70',
              'min-h-[44px] py-2.5 px-3.5 rounded-xl border transition-all duration-150',
              'bg-[var(--color-surface)] border-[var(--color-paper-border)] shadow-2xs',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:border-[var(--color-accent)]',
              leftIcon && 'pl-10',
              (rightIcon || actionSlot) && 'pr-11',
              error && 'border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500',
              disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-paper-muted)]',
              className
            )}
            {...props}
          />

          {(actionSlot || rightIcon) && (
            <div className="absolute right-3 flex items-center gap-1.5 shrink-0">
              {actionSlot}
              {!actionSlot && rightIcon && (
                <span className="text-[var(--color-ink-muted)] flex items-center">
                  {rightIcon}
                </span>
              )}
            </div>
          )}
        </div>

        {error ? (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-red-600 font-medium flex items-start gap-1.5 leading-snug"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]">{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
