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
          className="text-[var(--color-accent)] font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          {label}
        </a>
      ) : (
        <Link
          key={i}
          href={href}
          className="text-[var(--color-accent)] font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
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

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Render Markdown content cleanly into semantically structured HTML.
 * Handles headings (H2, H3), blockquotes, horizontal rules, lists, and prose paragraphs with comfortable reading line-height.
 */
export function ArticleMarkdownRenderer({ content }: { content: string }) {
  const paragraphs = content.trim().split(/\n\s*\n/);

  return (
    <div className="article-content space-y-6 text-[15px] sm:text-base md:text-[17px] text-[var(--color-ink)] leading-[1.8] sm:leading-[1.85]">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();

        // Horizontal rule
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-10 border-[var(--color-paper-border)]" />;
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          const rawText = trimmed.replace(/^##\s+/, '');
          const id = slugifyHeading(rawText);
          return (
            <h2
              key={idx}
              id={id}
              className="group text-xl sm:text-2xl md:text-[1.65rem] font-medium text-[var(--color-ink)] pt-8 pb-1 leading-snug tracking-tight scroll-mt-24"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <a
                href={`#${id}`}
                className="hover:text-[var(--color-accent)] transition-colors focus:outline-none"
                title={`Tautan ke bagian: ${rawText}`}
              >
                {renderInlineMarkdown(rawText)}
              </a>
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          const rawText = trimmed.replace(/^###\s+/, '');
          const id = slugifyHeading(rawText);
          return (
            <h3
              key={idx}
              id={id}
              className="group text-lg sm:text-xl font-semibold text-[var(--color-ink)] pt-5 pb-1 leading-snug scroll-mt-24"
            >
              <a
                href={`#${id}`}
                className="hover:text-[var(--color-accent)] transition-colors focus:outline-none"
                title={`Tautan ke bagian: ${rawText}`}
              >
                {renderInlineMarkdown(rawText)}
              </a>
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
              className="my-7 pl-5 border-l-3 border-[var(--color-accent)] italic text-[var(--color-ink)] bg-[var(--color-accent-soft)]/35 py-3.5 pr-5 rounded-r-xl"
            >
              <p className="leading-relaxed m-0 text-sm sm:text-base font-serif">
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
            <ul key={idx} className="space-y-3 my-5 pl-1" role="list">
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
            <ol key={idx} className="space-y-3.5 my-5 pl-1" role="list">
              {items.map((item, itemIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)/);
                const num = match ? match[1] : `${itemIdx + 1}`;
                const text = match ? match[2] : item;
                return (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent-border)] text-[var(--color-accent)] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span className="leading-relaxed">{renderInlineMarkdown(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Regular prose paragraph
        return (
          <p key={idx} className="leading-[1.8] sm:leading-[1.85] text-[var(--color-ink)]/90">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
