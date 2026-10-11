import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('ScrollRevealProvider and pageEnter animation verification', () => {
  const providerContent = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/ScrollRevealProvider.tsx'),
    'utf-8'
  );
  const cssContent = fs.readFileSync(
    path.resolve(process.cwd(), 'src/app/globals.css'),
    'utf-8'
  );

  describe('ScrollRevealProvider dynamic DOM observation', () => {
    it('sets up a MutationObserver to observe dynamic DOM updates for [data-reveal]', () => {
      expect(providerContent).toContain('new MutationObserver(');
      expect(providerContent).toContain('mutationObserver.observe(');
      expect(providerContent).toMatch(/\[data-reveal\]/);
    });

    it('disconnects the MutationObserver on cleanup', () => {
      expect(providerContent).toContain('mutationObserver.disconnect()');
    });
  });

  describe('pageEnter animation in globals.css', () => {
    it('does not start at opacity: 0 with 6px jump to eliminate FOUC / SSR hydration blinking', () => {
      const keyframesMatch = cssContent.match(/@keyframes\s+pageEnter\s*\{([\s\S]*?)\n\}/);
      expect(keyframesMatch).toBeDefined();
      const keyframesBody = keyframesMatch?.[1] || '';

      expect(keyframesBody).not.toMatch(/opacity:\s*0(?:\.0+)?(?:\s*;|\s*\})/);
      expect(keyframesBody).not.toMatch(/translateY\(\s*6px\s*\)/);
    });

    it('starts at opacity: 0.85 or higher and translateY(2px) or less', () => {
      const fromMatch = cssContent.match(/@keyframes\s+pageEnter\s*\{[\s\S]*?from\s*\{([^}]+)\}/);
      expect(fromMatch).toBeDefined();
      const fromBody = fromMatch?.[1] || '';

      const opacityMatch = fromBody.match(/opacity:\s*([0-9.]+)/);
      expect(opacityMatch).toBeDefined();
      const opacityVal = parseFloat(opacityMatch?.[1] || '0');
      expect(opacityVal).toBeGreaterThanOrEqual(0.85);

      const translateMatch = fromBody.match(/translateY\(\s*([0-9.]+)px\s*\)/);
      expect(translateMatch).toBeDefined();
      const translateVal = parseFloat(translateMatch?.[1] || '999');
      expect(translateVal).toBeLessThanOrEqual(2);
    });

    it('uses var(--dur-fast) for .page-enter', () => {
      const pageEnterRule = cssContent.match(/\.page-enter\s*\{([^}]+)\}/)?.[1] || '';
      expect(pageEnterRule).toContain('var(--dur-fast)');
    });
  });
});
