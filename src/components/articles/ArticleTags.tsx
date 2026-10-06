import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';

export function ArticleTags({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div
      className="pt-6 border-t border-[var(--color-paper-border)] space-y-2.5"
      role="list"
      aria-label="Tag artikel"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink-muted)]">
        <Tag className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        <span>Topik Bahasan:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/articles?q=${encodeURIComponent(tag)}`}
            role="listitem"
            className="chip-interactive text-xs font-medium px-2.5 py-1 border border-[var(--color-paper-border)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] rounded-lg transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
