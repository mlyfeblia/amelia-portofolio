import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md h-4'
      : 'rounded-xl';

  return (
    <div
      className={`skeleton ${variantClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Standardized Multi-line Text Skeleton
 */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => {
        // Natural varied line length: last line is shorter
        const widthClass =
          i === lines - 1 && lines > 1
            ? 'w-3/5'
            : i % 2 === 1
            ? 'w-11/12'
            : 'w-full';
        return <Skeleton key={i} variant="text" className={`h-3.5 ${widthClass}`} />;
      })}
    </div>
  );
}

/**
 * Standardized Admin Booking Card Skeleton
 */
export function SkeletonBookingCard() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-4 animate-fade-in" aria-hidden="true">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
          <div className="space-y-1.5">
            <Skeleton variant="rectangular" className="w-32 h-4" />
            <Skeleton variant="rectangular" className="w-24 h-3" />
          </div>
        </div>
        <Skeleton variant="rectangular" className="w-24 h-6 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <Skeleton variant="rectangular" className="h-8 rounded-lg" />
        <Skeleton variant="rectangular" className="h-8 rounded-lg" />
        <Skeleton variant="rectangular" className="h-8 rounded-lg" />
      </div>

      <div className="pt-2 border-t border-[var(--color-paper-border)] flex items-center justify-between gap-2">
        <Skeleton variant="rectangular" className="w-28 h-8 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" className="w-20 h-8 rounded-lg" />
          <Skeleton variant="rectangular" className="w-20 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Standardized Curhat Card Skeleton (used in Admin Counseling & Public CurhatWall)
 */
export function SkeletonCurhatCard() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5 animate-fade-in" aria-hidden="true">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="w-7 h-7" />
          <Skeleton variant="rectangular" className="w-28 h-4" />
        </div>
        <Skeleton variant="rectangular" className="w-24 h-5 rounded-full" />
      </div>

      <SkeletonText lines={2} />

      <div className="pt-2 border-t border-[var(--color-paper-border)] flex items-center justify-between">
        <Skeleton variant="rectangular" className="w-32 h-4" />
        <Skeleton variant="rectangular" className="w-20 h-7 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Standardized Article Card Skeleton (used in Admin Articles & Public Articles)
 */
export function SkeletonArticleCard() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3.5 animate-fade-in" aria-hidden="true">
      <div className="flex items-center justify-between gap-2">
        <Skeleton variant="rectangular" className="w-28 h-5 rounded-full" />
        <Skeleton variant="rectangular" className="w-20 h-4" />
      </div>

      <Skeleton variant="rectangular" className="w-4/5 h-6" />
      <SkeletonText lines={2} />

      <div className="pt-2 border-t border-[var(--color-paper-border)] flex items-center justify-between">
        <div className="flex gap-1.5">
          <Skeleton variant="rectangular" className="w-14 h-4 rounded-md" />
          <Skeleton variant="rectangular" className="w-14 h-4 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rectangular" className="w-16 h-7 rounded-lg" />
          <Skeleton variant="rectangular" className="w-16 h-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Standardized Overview Metric Card Skeleton
 */
export function SkeletonMetricCard() {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-paper-border)] shadow-xs space-y-3 animate-fade-in" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton variant="rectangular" className="w-24 h-4 rounded-md" />
        <Skeleton variant="circular" className="w-8 h-8 shrink-0" />
      </div>
      <Skeleton variant="rectangular" className="w-16 h-7 rounded-lg" />
      <Skeleton variant="rectangular" className="w-32 h-3 rounded-md" />
    </div>
  );
}

/**
 * Standardized Device Booking Record Skeleton
 */
export function SkeletonDeviceBookingCard() {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[var(--color-paper-border)] space-y-3 animate-fade-in shadow-2xs" aria-hidden="true">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" className="w-6 h-6 shrink-0" />
          <Skeleton variant="rectangular" className="w-28 h-4 font-mono rounded" />
        </div>
        <Skeleton variant="rectangular" className="w-20 h-5 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Skeleton variant="rectangular" className="h-6 rounded-md" />
        <Skeleton variant="rectangular" className="h-6 rounded-md" />
      </div>
    </div>
  );
}
