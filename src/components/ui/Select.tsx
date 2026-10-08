'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  clearable?: boolean;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export function Select({
  options,
  value: controlledValue,
  defaultValue = '',
  onChange,
  placeholder = 'Pilih salah satu...',
  label,
  error,
  helperText,
  disabled = false,
  clearable = false,
  icon,
  className = '',
  id: customId,
  name,
  required = false,
}: SelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const listboxId = `${selectId}-listbox`;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const selectedOption = options.find((opt) => opt.value === currentValue);

  const openSelect = useCallback(() => {
    if (disabled) return;
    const idx = options.findIndex((opt) => opt.value === currentValue);
    setHighlightedIndex(idx >= 0 ? idx : 0);
    setIsOpen(true);
  }, [disabled, options, currentValue]);

  const closeSelect = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (val: string) => {
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onChange?.(val);
      closeSelect();
      buttonRef.current?.focus();
    },
    [disabled, isControlled, onChange, closeSelect]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledValue('');
      }
      onChange?.('');
      closeSelect();
      buttonRef.current?.focus();
    },
    [disabled, isControlled, onChange, closeSelect]
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeSelect();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeSelect]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const highlightedEl = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, highlightedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            const opt = options[highlightedIndex];
            if (!opt.disabled) {
              handleSelect(opt.value);
            }
          }
        } else {
          openSelect();
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          openSelect();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (next < options.length && options[next].disabled) {
              next++;
            }
            return next < options.length ? next : prev;
          });
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) {
          openSelect();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (isOpen) {
          const firstNonDisabled = options.findIndex((opt) => !opt.disabled);
          if (firstNonDisabled >= 0) setHighlightedIndex(firstNonDisabled);
        }
        break;
      }
      case 'End': {
        e.preventDefault();
        if (isOpen) {
          for (let i = options.length - 1; i >= 0; i--) {
            if (!options[i].disabled) {
              setHighlightedIndex(i);
              break;
            }
          }
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        closeSelect();
        buttonRef.current?.focus();
        break;
      }
      case 'Tab': {
        if (isOpen) {
          closeSelect();
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[var(--color-ink)] mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Hidden input for HTML form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
        />
      )}

      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 ? `${selectId}-opt-${highlightedIndex}` : undefined
        }
        aria-invalid={!!error}
        disabled={disabled}
        onClick={() => !disabled && (isOpen ? closeSelect() : openSelect())}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full flex items-center justify-between text-left text-sm',
          'min-h-[44px] px-3.5 py-2 rounded-xl border transition-all duration-150',
          'bg-[var(--color-surface)] text-[var(--color-ink)]',
          'border-[var(--color-paper-border)] shadow-2xs cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:border-[var(--color-accent)]',
          error
            ? 'border-red-400 focus-visible:ring-red-400'
            : 'hover:border-[var(--color-ink-soft)]',
          disabled && 'opacity-60 cursor-not-allowed bg-[var(--color-paper-muted)] pointer-events-none'
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="text-[var(--color-ink-muted)] shrink-0">{icon}</span>}
          {selectedOption ? (
            <span className="truncate flex items-center gap-2">
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="text-[var(--color-ink)] font-medium">{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-[var(--color-ink-muted)]/70">{placeholder}</span>
          )}
        </span>

        <span className="flex items-center gap-1.5 ml-2 shrink-0">
          {clearable && currentValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer"
              aria-label="Bersihkan pilihan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-[var(--color-ink-muted)] transition-transform duration-200',
              isOpen && 'rotate-180 text-[var(--color-accent)]'
            )}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Popover Listbox */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-label={label || placeholder}
          className={cn(
            'absolute z-50 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl p-1',
            'bg-[var(--color-surface)] border border-[var(--color-paper-border)]',
            'shadow-lg focus:outline-none scroll-smooth'
          )}
        >
          {options.length === 0 ? (
            <li className="px-3.5 py-3 text-xs text-[var(--color-ink-muted)] text-center">
              Tidak ada pilihan tersedia
            </li>
          ) : (
            options.map((opt, idx) => {
              const isSelected = opt.value === currentValue;
              const isHighlighted = idx === highlightedIndex;

              return (
                <li
                  key={opt.value}
                  id={`${selectId}-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  onClick={() => {
                    if (!opt.disabled) handleSelect(opt.value);
                  }}
                  onMouseEnter={() => {
                    if (!opt.disabled) setHighlightedIndex(idx);
                  }}
                  className={cn(
                    'relative flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-lg cursor-pointer transition-colors select-none',
                    opt.disabled && 'opacity-40 cursor-not-allowed',
                    isSelected && 'font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)]',
                    !isSelected && isHighlighted && 'bg-[var(--color-paper-muted)] text-[var(--color-ink)]',
                    !isSelected && !isHighlighted && 'text-[var(--color-ink)]'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <div className="truncate">
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[11px] text-[var(--color-ink-muted)] font-normal truncate">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[var(--color-accent)] shrink-0 ml-2" aria-hidden="true" />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}

      {/* Error or Helper text */}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">{helperText}</p>
      ) : null}
    </div>
  );
}
