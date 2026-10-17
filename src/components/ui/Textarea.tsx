import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charCount?: number;
  maxCharCount?: number;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      charCount,
      maxCharCount,
      id: customId,
      disabled,
      required,
      className,
      containerClassName,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className={cn('w-full', containerClassName)}>
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-[var(--color-ink)]"
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          {maxCharCount !== undefined && charCount !== undefined && (
            <span
              className={cn(
                'text-[11px] font-mono',
                charCount > maxCharCount
                  ? 'text-red-600 font-semibold'
                  : 'text-[var(--color-ink-muted)]'
              )}
            >
              {charCount} / {maxCharCount}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full text-base sm:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70',
            'p-3.5 rounded-xl border transition-all duration-150',
            'bg-[var(--color-surface)] border-[var(--color-paper-border)] shadow-2xs resize-y',
            'overscroll-contain scroll-isolated cursor-text select-text',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:border-[var(--color-accent)]',
            error && 'border-red-400 focus-visible:ring-red-500 focus-visible:border-red-500',
            disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-paper-muted)]',
            className
          )}
          {...props}
        />

        {error ? (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
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

Textarea.displayName = 'Textarea';
