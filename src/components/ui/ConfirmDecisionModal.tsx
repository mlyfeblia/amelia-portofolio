'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { useMounted } from '@/lib/use-mounted';
import { useModalAnimation } from '@/lib/use-modal-animation';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export interface ConfirmDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'accent' | 'neutral';
  icon?: React.ReactNode;
  itemDetail?: React.ReactNode;
  loading?: boolean;
  zIndex?: string;
}

export function ConfirmDecisionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'primary',
  icon,
  itemDetail,
  loading = false,
  zIndex = 'z-[11000]',
}: ConfirmDecisionModalProps) {
  const mounted = useMounted();
  const [internalLoading, setInternalLoading] = useState(false);
  const isActionLoading = loading || internalLoading;
  const dialogWindowRef = React.useRef<HTMLDivElement>(null);

  const baseId = React.useId();
  const titleId = `confirm-decision-title-${baseId.replace(/:/g, '')}`;
  const descId = `confirm-decision-desc-${baseId.replace(/:/g, '')}`;

  const { isRendered, isExiting, backdropClass, windowClass } = useModalAnimation({
    isOpen,
    onClose,
    closeOnEscape: !isActionLoading,
    lockScroll: true,
    containerRef: dialogWindowRef,
  });

  // Retain props during exit animation to prevent content collapse or visual flicker
  const cachedPropsRef = React.useRef({
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant,
    icon,
    itemDetail,
  });

  useEffect(() => {
    if (isOpen) {
      cachedPropsRef.current = {
        title,
        description,
        confirmLabel,
        cancelLabel,
        variant,
        icon,
        itemDetail,
      };
    }
  }, [isOpen, title, description, confirmLabel, cancelLabel, variant, icon, itemDetail]);

  // Retain props during exit animation using React state to prevent content collapse
  const [cachedProps, setCachedProps] = useState({
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant,
    icon,
    itemDetail,
  });

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setCachedProps({
      title,
      description,
      confirmLabel,
      cancelLabel,
      variant,
      icon,
      itemDetail,
    });
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  if (!mounted || !isRendered) return null;

  const activeTitle = (isOpen ? title : cachedProps.title) || cachedProps.title;
  const activeDescription = (isOpen ? description : cachedProps.description) || cachedProps.description;
  const activeConfirmLabel = (isOpen ? confirmLabel : cachedProps.confirmLabel) || cachedProps.confirmLabel;
  const activeCancelLabel = (isOpen ? cancelLabel : cachedProps.cancelLabel) || cachedProps.cancelLabel;
  const activeVariant = isOpen ? variant : cachedProps.variant;
  const activeIcon = (isOpen ? icon : cachedProps.icon) ?? cachedProps.icon;
  const activeItemDetail = (isOpen ? itemDetail : cachedProps.itemDetail) ?? cachedProps.itemDetail;

  // Icon container variant styling
  let iconBoxClass = 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border border-[var(--color-accent)]/20';
  let defaultIcon = <HelpCircle className="w-5 h-5 shrink-0" />;

  if (activeVariant === 'danger') {
    iconBoxClass = 'bg-rose-50 text-rose-600 border border-rose-100';
    defaultIcon = <AlertTriangle className="w-5 h-5 shrink-0" />;
  } else if (activeVariant === 'warning') {
    iconBoxClass = 'bg-amber-50 text-amber-600 border border-amber-100';
    defaultIcon = <AlertCircle className="w-5 h-5 shrink-0" />;
  } else if (activeVariant === 'neutral') {
    iconBoxClass = 'bg-[var(--color-surface)] text-[var(--color-ink-muted)] border border-[var(--color-paper-border)]';
  }

  // Confirm button variant styling
  let confirmBtnClass = 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white';
  if (activeVariant === 'danger') {
    confirmBtnClass = 'bg-rose-600 hover:bg-rose-700 text-white';
  } else if (activeVariant === 'warning') {
    confirmBtnClass = 'bg-amber-600 hover:bg-amber-700 text-white';
  } else if (activeVariant === 'neutral') {
    confirmBtnClass = 'bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/90 text-white';
  }

  const handleConfirmClick = async () => {
    try {
      const res = onConfirm();
      if (res instanceof Promise) {
        setInternalLoading(true);
        await res;
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center p-2.5 min-[340px]:p-4 sm:p-6 overflow-hidden select-none',
        zIndex || 'z-[11000]',
        isExiting && 'pointer-events-none'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {/* Backdrop */}
      <div
        className={cn(backdropClass)}
        aria-hidden="true"
        onClick={() => {
          if (!isActionLoading) onClose();
        }}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      />

      {/* Window */}
      <div
        ref={dialogWindowRef}
        className={cn(
          'relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-2xl min-[340px]:rounded-3xl p-3.5 min-[340px]:p-5 sm:p-6 shadow-2xl border border-[var(--color-paper-border)] flex flex-col gap-3.5 min-[340px]:gap-4 sm:gap-5 my-auto select-text pointer-events-auto',
          windowClass
        )}
      >
        {/* Header with Icon and Text */}
        <div className="flex items-start gap-2.5 min-[340px]:gap-3 sm:gap-3.5">
          <div className={cn('w-9 h-9 min-[340px]:w-10 min-[340px]:h-10 sm:w-11 sm:h-11 rounded-xl min-[340px]:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs', iconBoxClass)}>
            {activeIcon || defaultIcon}
          </div>
          <div className="space-y-1 min-w-0 flex-1 pt-0.5">
            <h3
              id={titleId}
              className="text-sm min-[340px]:text-base sm:text-lg font-medium text-[var(--color-ink)] leading-snug break-words"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {activeTitle}
            </h3>
            <p
              id={descId}
              className="text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed break-words"
            >
              {activeDescription}
            </p>
          </div>
        </div>

        {/* Optional Item Detail */}
        {activeItemDetail && (
          <div className="bg-[var(--color-paper)] p-3 min-[340px]:p-3.5 sm:p-4 rounded-xl min-[340px]:rounded-2xl border border-[var(--color-paper-border)] text-xs text-[var(--color-ink-muted)] break-words">
            {activeItemDetail}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse min-[340px]:grid min-[340px]:grid-cols-2 gap-2 sm:gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isActionLoading}
            className="w-full py-2.5 sm:py-3 rounded-xl btn-secondary min-w-0 px-2 sm:px-4 text-[11px] sm:text-xs font-medium cursor-pointer text-center active:scale-98 shadow-2xs inline-flex items-center justify-center whitespace-nowrap disabled:opacity-50"
          >
            {activeCancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isActionLoading}
            className={cn(
              'w-full py-2.5 sm:py-3 rounded-xl min-w-0 px-2 sm:px-4 text-[11px] sm:text-xs font-semibold cursor-pointer text-center active:scale-98 shadow-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-60 transition-colors',
              confirmBtnClass
            )}
          >
            {isActionLoading ? (
              <>
                <Spinner size="xs" variant="white" label="Memproses..." />
                <span>Memproses...</span>
              </>
            ) : (
              activeConfirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
