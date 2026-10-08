'use client';

import React, { useEffect, useRef, useId, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { cn } from '@/lib/utils';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  zIndex?: string;
  className?: string;
  children: React.ReactNode;
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] sm:max-w-6xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  zIndex = 'z-[10000]',
  className,
  children,
}: ModalProps) {
  const mounted = useMounted();
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const descId = `${modalId}-desc`;
  const windowRef = useRef<HTMLDivElement>(null);

  const { isRendered, backdropClass, windowClass } = useModalAnimation({ isOpen });

  // Body & document scroll lock & Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap / focus restoration
  useEffect(() => {
    if (isOpen && windowRef.current) {
      const focusableElements = windowRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  if (!mounted || !isRendered) {
    return null;
  }

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className={cn('fixed inset-0 flex items-center justify-center p-3 sm:p-5', zIndex)}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-[var(--color-ink)]/50 backdrop-blur-sm transition-opacity duration-200',
          backdropClass
        )}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div
        ref={windowRef}
        className={cn(
          'relative w-full bg-[var(--color-surface)] border border-[var(--color-paper-border)]',
          'rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col',
          'max-h-[90vh] transition-all duration-200',
          SIZE_MAP[size],
          windowClass,
          className
        )}
      >
        {/* Header if title is provided directly */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-2">
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="text-base sm:text-lg font-semibold text-[var(--color-ink)] tracking-tight"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p id={descId} className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="chip-interactive p-1.5 -mr-1.5 rounded-full text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] cursor-pointer transition-colors"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}

/* ─────────────────────────────────────────────────────────────
 * Modal Compound Components
 * ───────────────────────────────────────────────────────────── */

export const ModalHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-5 sm:px-6 pt-5 sm:pt-6 pb-3 flex flex-col space-y-1.5', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-base sm:text-lg font-semibold text-[var(--color-ink)] tracking-tight', className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
ModalTitle.displayName = 'ModalTitle';

export const ModalDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
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
ModalDescription.displayName = 'ModalDescription';

export const ModalContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-5 sm:px-6 py-3 overflow-y-auto no-scrollbar space-y-4 flex-1', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalContent.displayName = 'ModalContent';

export const ModalFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-5 sm:px-6 py-4 bg-[var(--color-paper-muted)]/50 border-t border-[var(--color-paper-border)]',
          'flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModalFooter.displayName = 'ModalFooter';
