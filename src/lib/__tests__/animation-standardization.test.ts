import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Animation and Hover Interaction Standardization', () => {
  const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8');

  it('does not define unconditional global @custom-variant hover (&:hover) which causes sticky hover on touchscreens', () => {
    expect(css).not.toContain('@custom-variant hover (&:hover);');
    expect(css).not.toContain('@custom-variant group-hover (:where(.group):hover &);');
  });

  it('gates desktop hover lift and scale transforms with @media (hover: hover) and (pointer: fine)', () => {
    expect(css).toMatch(/@media\s*\(\s*hover:\s*hover\s*\)\s*and\s*\(\s*pointer:\s*fine\s*\)/);
  });

  it('limits .card-interactive hover lift to max 2px and does not use -3px or -8px', () => {
    const cardHoverMatch = css.match(/\.card-interactive:hover\s*\{[^}]+\}/)?.[0] || '';
    expect(cardHoverMatch).not.toContain('translateY(-3px)');
    expect(cardHoverMatch).not.toContain('translateY(-6px)');
    expect(cardHoverMatch).not.toContain('translateY(-8px)');
    expect(cardHoverMatch).toMatch(/translateY\(-1\.(?:5|0)px\)|translateY\(-1px\)|translateY\(-2px\)/);
  });

  it('limits .card-icon-pop hover scale to max 1.05 and does not use 1.18 or 1.25', () => {
    expect(css).not.toContain('scale(1.18)');
    expect(css).not.toContain('scale(1.25)');
    const cardIconHover = css.match(/\.card-interactive:hover\s+\.card-icon-pop\s*\{[^}]+\}/)?.[0] || '';
    expect(cardIconHover).toMatch(/scale\(1\.0[2-5]\)/);
    expect(cardIconHover).not.toContain('color: #FFFFFF');
    expect(cardIconHover).toContain('color: var(--color-accent)');
  });

  it('standardizes interactive card icon wrappers to rounded-xl badge containers across sections', () => {
    const approachSection = fs.readFileSync(path.resolve(process.cwd(), 'src/components/home/ApproachSection.tsx'), 'utf-8');
    const trackRecordSection = fs.readFileSync(path.resolve(process.cwd(), 'src/components/home/TrackRecordSection.tsx'), 'utf-8');

    expect(approachSection).toContain('card-icon-pop w-10 h-10 rounded-xl bg-[var(--color-accent-soft)]');
    expect(trackRecordSection).toContain('card-icon-pop w-10 h-10 rounded-xl bg-[var(--color-accent-soft)]');
  });

  it('does not jump vertically on .nav-link-interactive hover', () => {
    const navLinkHover = css.match(/\.nav-link-interactive:hover\s*\{[^}]+\}/)?.[0] || '';
    expect(navLinkHover).not.toContain('translateY(-2px)');
    expect(navLinkHover).not.toContain('translateY(-1px)');
  });

  it('does not explode .nav-link-icon to scale(1.22)', () => {
    expect(css).not.toContain('scale(1.22)');
  });

  it('limits .hero-photo-interactive hover jump and image zoom to subtle calm values', () => {
    const heroHover = css.match(/\.hero-photo-interactive:hover\s*\{[^}]+\}/)?.[0] || '';
    expect(heroHover).not.toContain('translateY(-6px)');
    expect(heroHover).not.toContain('translateY(-8px)');

    const heroImgHover = css.match(/\.hero-photo-interactive:hover\s+img\s*\{[^}]+\}/)?.[0] || '';
    expect(heroImgHover).not.toContain('scale(1.08)');
    expect(heroImgHover).not.toContain('scale(1.10)');
    expect(heroImgHover).toMatch(/scale\(1\.0[1-3]\)/);
  });

  it('neutralizes all transforms and animations under prefers-reduced-motion: reduce', () => {
    const reducedMotionMatch = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] || '';
    expect(reducedMotionMatch).toContain('animation-duration: 0.01ms !important;');
    expect(reducedMotionMatch).toContain('scroll-behavior: auto !important;');
  });
});
