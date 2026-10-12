import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { formatIndoPhoneNumber } from '@/components/booking/BookingClientInfoStep';

describe('Core UX & Interactive Features Verification', () => {
  describe('formatIndoPhoneNumber (BookingClientInfoStep)', () => {
    it('converts standard 08 numbers "081234567890" to formatted "0812-3456-7890"', () => {
      expect(formatIndoPhoneNumber('081234567890')).toBe('0812-3456-7890');
    });

    it('converts international format "6281234567890" to "0812-3456-7890"', () => {
      expect(formatIndoPhoneNumber('6281234567890')).toBe('0812-3456-7890');
      expect(formatIndoPhoneNumber('+62 812-3456-7890')).toBe('0812-3456-7890');
    });

    it('limits to max 13 digits (trimmed)', () => {
      // 15 digits input should be trimmed to 13 digits: 0812345678901
      const formatted = formatIndoPhoneNumber('0812345678901234');
      expect(formatted).toBe('0812-3456-78901');
      const digitCount = formatted.replace(/\D/g, '').length;
      expect(digitCount).toBe(13);
    });

    it('handles short numbers cleanly without dangling dashes', () => {
      expect(formatIndoPhoneNumber('')).toBe('');
      expect(formatIndoPhoneNumber('08')).toBe('08');
      expect(formatIndoPhoneNumber('081')).toBe('081');
      expect(formatIndoPhoneNumber('0812')).toBe('0812');
      expect(formatIndoPhoneNumber('08123')).toBe('0812-3');
      expect(formatIndoPhoneNumber('08123456')).toBe('0812-3456');
      expect(formatIndoPhoneNumber('081234567')).toBe('0812-3456-7');
    });

    it('cleans non-numeric characters gracefully', () => {
      expect(formatIndoPhoneNumber('abc 0812 xyz 3456-7890')).toBe('0812-3456-7890');
    });
  });

  describe('Tabs.tsx pill proportions and styling', () => {
    const tabsContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/Tabs.tsx'),
      'utf-8'
    );

    it('uses rounded-xl in variantStyles.pills', () => {
      const pillsMatch = tabsContent.match(/pills:\s*cn\(([\s\S]*?)\)/);
      expect(pillsMatch).toBeDefined();
      const pillsBody = pillsMatch?.[1] || '';
      expect(pillsBody).toContain('rounded-xl');
    });

    it('does not use rounded-full min-h-[44px] in variantStyles.pills', () => {
      expect(tabsContent).not.toContain('rounded-full min-h-[44px]');
      const pillsMatch = tabsContent.match(/pills:\s*cn\(([\s\S]*?)\)/);
      const pillsBody = pillsMatch?.[1] || '';
      expect(pillsBody).not.toContain('rounded-full');
      expect(pillsBody).not.toContain('min-h-[44px]');
    });
  });

  describe('ArticlesDirectory.tsx divider and search stabilization', () => {
    const articlesContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/articles/ArticlesDirectory.tsx'),
      'utf-8'
    );

    it('container does not have static border-y that causes double divider with PaginationBar', () => {
      // Must not have divide-y accompanied by static border-y
      expect(articlesContent).not.toMatch(/className="[^"]*divide-y[^"]*\bborder-y\b[^"]*"/);
      expect(articlesContent).not.toContain('divide-y divide-[var(--color-paper-border)] border-y');
      // Should use border-t and conditional border-b
      expect(articlesContent).toContain('border-t ${totalPages <= 1 ? \'border-b\' : \'\'}');
    });

    it('uses stabilized search input and icon classes', () => {
      expect(articlesContent).toContain('search-input');
      expect(articlesContent).toContain('search-icon');
      expect(articlesContent).toContain('search-clear-btn');
    });
  });

  describe('CurhatForm.tsx autosave and validation focus', () => {
    const curhatFormContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/counseling/CurhatForm.tsx'),
      'utf-8'
    );

    it('removes curhat_draft_v1 from sessionStorage when message & alias are cleared', () => {
      expect(curhatFormContent).toMatch(
        /if\s*\(!message\s*&&\s*!alias\)\s*\{[\s\S]*?sessionStorage\.removeItem\(['"]curhat_draft_v1['"]\)/
      );
    });

    it('includes auto-scroll and focus to message input when message length < 10', () => {
      expect(curhatFormContent).toMatch(
        /if\s*\(trimmed\.length\s*<\s*10\)\s*\{[\s\S]*?scrollIntoView\(\{[\s\S]*?behavior:\s*['"]smooth['"][\s\S]*?\}\)[\s\S]*?focus\(\)/
      );
    });
  });

  describe('AssessmentHistory.tsx action buttons layout', () => {
    const assessmentHistoryContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/assessment/AssessmentHistory.tsx'),
      'utf-8'
    );

    it('primary WhatsApp consultation button is prominent and single-line', () => {
      const whatsAppBtnMatch = assessmentHistoryContent.match(
        /<a[\s\S]*?href=\{getAssessmentWhatsAppUrl\([\s\S]*?>/
      );
      expect(whatsAppBtnMatch).toBeDefined();
      const btnTag = whatsAppBtnMatch?.[0] || '';

      // Prominent primary button styling
      expect(btnTag).toContain('btn-primary');
      expect(btnTag).toContain('btn-interactive');

      // Single line layout
      expect(btnTag).toContain('whitespace-nowrap');
      expect(btnTag).toContain('shrink-0');
    });
  });

  describe('BookingSection.tsx and dom-utils integration', () => {
    const bookingSectionContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/BookingSection.tsx'),
      'utf-8'
    );

    it('imports and uses focusAndScrollToField for validation errors', () => {
      expect(bookingSectionContent).toContain('focusAndScrollToField');
      expect(bookingSectionContent).toMatch(/focusAndScrollToField\(`\$\{formId\}-name`\)/);
      expect(bookingSectionContent).toMatch(/focusAndScrollToField\(`\$\{formId\}-phone`\)/);
      expect(bookingSectionContent).toMatch(/focusAndScrollToField\(`\$\{formId\}-email`\)/);
      expect(bookingSectionContent).toMatch(/focusAndScrollToField\(`\$\{formId\}-date`\)/);
    });
  });
});
