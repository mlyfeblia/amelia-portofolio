import React from 'react';
import Link from 'next/link';

function renderInlineMarkdown(text: string): React.ReactNode {
  // Matches [link text](url), **bold**, *italic*, `code`
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (!part) return null;
    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, rawHref] = linkMatch;
      const href = rawHref.trim();
      // Security: Strictly whitelist safe protocols (block javascript:, data:, vbscript:, //)
      const isSafeProtocol =
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        (href.startsWith('/') && !href.startsWith('//'));

      if (!isSafeProtocol) {
        return <span key={i}>{label}</span>;
      }

      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      return isExternal ? (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {label}
        </a>
      ) : (
        <Link
          key={i}
          href={href}
          className="text-[var(--color-accent)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {label}
        </Link>
      );
    }
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-[var(--color-ink)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={i} className="italic text-[var(--color-ink)] font-serif">
          {part.slice(1, -1)}
        </em>
      );
    }
    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-[var(--color-paper-muted)] border border-[var(--color-paper-border)] font-mono text-xs text-[var(--color-accent)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Render Markdown content cleanly into semantically structured HTML.
 * Handles headings (H2, H3), blockquotes, horizontal rules, lists, and short paragraphs.
 */
export function ArticleMarkdownRenderer({ content }: { content: string }) {
  const paragraphs = content.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-6 text-base sm:text-lg text-[var(--color-ink)] leading-relaxed">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();

        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-8 border-[var(--color-paper-border)]" />;
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="text-2xl sm:text-3xl font-medium text-[var(--color-ink)] pt-6 pb-2 leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-xl sm:text-2xl font-semibold text-[var(--color-ink)] pt-4 pb-1"
            >
              {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ') || trimmed === '>') {
          const quoteLines = trimmed
            .split('\n')
            .map((line) => line.replace(/^>\s?/, ''))
            .join(' ');
          return (
            <blockquote
              key={idx}
              className="my-6 pl-4 border-l-4 border-[var(--color-accent)] italic text-[var(--color-ink-muted)] bg-[var(--color-accent-soft)]/40 py-3 pr-4 rounded-r-lg"
            >
              <p className="leading-relaxed m-0 text-sm sm:text-base">
                {renderInlineMarkdown(quoteLines)}
              </p>
            </blockquote>
          );
        }

        // Unordered list
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed
            .split('\n')
            .filter((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
          return (
            <ul key={idx} className="space-y-2.5 my-4 pl-1" role="list">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2.5 shrink-0" />
                  <span className="leading-relaxed">
                    {renderInlineMarkdown(item.replace(/^[-*]\s+/, ''))}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter((line) => /^\d+\.\s/.test(line.trim()));
          return (
            <ol key={idx} className="space-y-3 my-4 pl-1" role="list">
              {items.map((item, itemIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)/);
                const num = match ? match[1] : `${itemIdx + 1}`;
                const text = match ? match[2] : item;
                return (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span className="leading-relaxed">{renderInlineMarkdown(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular short paragraph
        return (
          <p key={idx} className="leading-relaxed text-[var(--color-ink-muted)]">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
