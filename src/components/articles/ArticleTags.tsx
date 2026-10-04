import React from 'react';

export function ArticleTags({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-2 pt-8 border-t border-[var(--color-paper-border)]"
      role="list"
      aria-label="Tag artikel"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          role="listitem"
          className="text-xs font-medium px-3 py-1.5 border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink-soft)] rounded-lg"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
