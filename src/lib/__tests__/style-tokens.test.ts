import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('globals.css architecture verification', () => {
  const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8');

  it('does not have !important on .btn-secondary:hover color', () => {
    const btnSecondaryHover = css.match(/\.btn-secondary:hover\s*\{[^}]+\}/)?.[0] || '';
    expect(btnSecondaryHover).not.toContain('color: var(--color-accent) !important;');
  });

  it('btn-interactive includes color in its transition properties', () => {
    const btnInteractive = css.match(/\.btn-interactive\s*\{[^}]+\}/)?.[0] || '';
    expect(btnInteractive).toMatch(/(?:^|[\s,])color\s+var\(/);
  });

  it('btn-interactive has :hover and :active rules', () => {
    const btnInteractiveHover = css.match(/\.btn-interactive:hover\s*\{[^}]+\}/)?.[0];
    const btnInteractiveActive = css.match(/\.btn-interactive:active\s*\{[^}]+\}/)?.[0];
    expect(btnInteractiveHover).toBeDefined();
    expect(btnInteractiveHover).toContain('transform: translateY(-1px)');
    expect(btnInteractiveActive).toBeDefined();
    expect(btnInteractiveActive).toContain('transform: translateY(0) scale(0.97)');
  });

  it('card-interactive has :active rule', () => {
    const cardInteractiveActive = css.match(/\.card-interactive:active\s*\{[^}]+\}/)?.[0];
    expect(cardInteractiveActive).toBeDefined();
    expect(cardInteractiveActive).toContain('transform: translateY(0) scale(0.99)');
  });
});
