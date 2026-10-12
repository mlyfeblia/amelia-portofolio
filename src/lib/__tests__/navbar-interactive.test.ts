import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Navbar interactive and layout verification', () => {
  const navbarContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Navbar.tsx'), 'utf-8');

  it('does not contain [contain:paint] which clips hover box-shadow', () => {
    expect(navbarContent).not.toContain('[contain:paint]');
  });

  it('includes group class on mobile toggle button so group-hover:scale-110 works', () => {
    const mobileButtonMatch = navbarContent.match(/<button[\s\S]*?aria-controls="mobile-nav"[\s\S]*?>/);
    expect(mobileButtonMatch).toBeDefined();
    const buttonTag = mobileButtonMatch?.[0] || '';
    expect(buttonTag).toMatch(/className="[^"]*\bgroup\b[^"]*"/);
  });
});
