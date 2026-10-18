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

    it('attaches non-passive native wheel listener with e.preventDefault to prevent dual-scroll on desktop', () => {
      expect(tabsContent).toContain("addEventListener('wheel', onNativeWheel, { passive: false })");
      expect(tabsContent).toContain('e.preventDefault()');
      expect(tabsContent).toContain('overscroll-x-contain');
    });
  });

  describe('ArticleEditorToolbar.tsx wheel scroll isolation', () => {
    const toolbarContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/admin/articles/form/ArticleEditorToolbar.tsx'),
      'utf-8'
    );

    it('uses non-passive wheel listener with e.preventDefault and overscroll-x-contain', () => {
      expect(toolbarContent).toContain("addEventListener('wheel', onNativeWheel, { passive: false })");
      expect(toolbarContent).toContain('e.preventDefault()');
      expect(toolbarContent).toContain('overscroll-x-contain');
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
        /if\s*\(trimmed\.length\s*<\s*10\)\s*\{[\s\S]*?(?:scrollIntoView\(\{[\s\S]*?behavior:\s*['"]smooth['"][\s\S]*?\}\)[\s\S]*?focus\(\)|focusAndScrollToField)/
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

  describe('Footer Web App Install Button & PWA Integration', () => {
    const footerContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/Footer.tsx'),
      'utf-8'
    );
    const installBtnContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/FooterInstallButton.tsx'),
      'utf-8'
    );

    it('Footer.tsx renders FooterInstallButton component instead of dead anchor link', () => {
      expect(footerContent).toContain('import FooterInstallButton from');
      expect(footerContent).toContain('<FooterInstallButton />');
      expect(footerContent).not.toContain('href="/#app-showcase"');
    });

    it('FooterInstallButton.tsx wires directly to triggerPwaInstall and openInstalledInfoModal', () => {
      expect(installBtnContent).toContain('triggerPwaInstall');
      expect(installBtnContent).toContain('openInstalledInfoModal');
      expect(installBtnContent).toContain('usePwa');
      expect(installBtnContent).toContain('cursor-pointer');
      expect(installBtnContent).toContain('select-none');
    });
  });

  describe('Scroll Isolation & Dual-Scroll Prevention Architecture', () => {
    const scrollProviderContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ScrollRestorationProvider.tsx'),
      'utf-8'
    );
    const globalsCssContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/globals.css'),
      'utf-8'
    );
    const textareaUiContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/Textarea.tsx'),
      'utf-8'
    );

    it('ScrollRestorationProvider registers non-passive wheel interceptor for textareas and scroll-isolated containers', () => {
      expect(scrollProviderContent).toContain("window.addEventListener('wheel', handleGlobalWheel, { passive: false })");
      expect(scrollProviderContent).toContain("target.closest('textarea')");
      expect(scrollProviderContent).toContain('textarea.scrollHeight - textarea.clientHeight');
      expect(scrollProviderContent).toContain('textarea.scrollTop += delta');
      expect(scrollProviderContent).toContain('e.preventDefault()');
      expect(scrollProviderContent).toContain('.scroll-isolated');
    });

    it('globals.css applies overscroll-behavior contain to textarea and .scroll-isolated', () => {
      expect(globalsCssContent).toContain('overscroll-behavior: contain;');
      expect(globalsCssContent).toContain('overscroll-behavior-y: contain;');
    });

    it('ui/Textarea.tsx contains scroll-isolated, overscroll-contain, cursor-text, and select-text', () => {
      expect(textareaUiContent).toContain('overscroll-contain');
      expect(textareaUiContent).toContain('scroll-isolated');
      expect(textareaUiContent).toContain('cursor-text');
      expect(textareaUiContent).toContain('select-text');
    });
  });

  describe('Contextual Cursors and Text Selection Hygiene', () => {
    const globalsCssContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/globals.css'),
      'utf-8'
    );

    it('globals.css maps pointer cursor to all clickable controls', () => {
      expect(globalsCssContent).toContain('cursor: pointer;');
      expect(globalsCssContent).toContain('input[type="checkbox"]');
      expect(globalsCssContent).toContain('input[type="radio"]');
      expect(globalsCssContent).toContain('.chip-interactive');
    });

    it('globals.css maps cursor-text to inputs and textareas', () => {
      expect(globalsCssContent).toContain('cursor: text;');
      expect(globalsCssContent).toContain('input[type="text"]');
      expect(globalsCssContent).toContain('textarea');
    });

    it('globals.css enforces cursor: not-allowed on disabled elements', () => {
      expect(globalsCssContent).toContain('cursor: not-allowed !important;');
      expect(globalsCssContent).toContain('button:disabled');
      expect(globalsCssContent).toContain('[aria-disabled="true"]');
    });

    it('globals.css enforces strict user-select: none on UI controls and children', () => {
      expect(globalsCssContent).toContain('button,');
      expect(globalsCssContent).toContain('button *,');
      expect(globalsCssContent).toContain('[role="button"],');
      expect(globalsCssContent).toContain('[role="tab"],');
      expect(globalsCssContent).toContain('.chip-interactive,');
      expect(globalsCssContent).toContain('user-select: none;');
    });

    it('globals.css guarantees user-select: text on articles, reading typography, and curhat answers', () => {
      expect(globalsCssContent).toContain('article,');
      expect(globalsCssContent).toContain('.prose,');
      expect(globalsCssContent).toContain('.curhat-content,');
      expect(globalsCssContent).toContain('.curhat-answer,');
      expect(globalsCssContent).toContain('user-select: text;');
    });
  });

  describe('FormErrorMessage Manual Dismiss and Auto-Dismiss Architecture', () => {
    const formErrorContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/FormErrorMessage.tsx'),
      'utf-8'
    );
    const bookingSectionContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/BookingSection.tsx'),
      'utf-8'
    );
    const curhatFormContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/counseling/CurhatForm.tsx'),
      'utf-8'
    );
    const bookingTrackerContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/booking/BookingTracker.tsx'),
      'utf-8'
    );

    it('FormErrorMessage provides manual close button with X icon and smooth exit animation', () => {
      expect(formErrorContent).toContain('onClick={startExit}');
      expect(formErrorContent).toContain('aria-label="Tutup pesan peringatan"');
      expect(formErrorContent).toContain('<X className="w-4 h-4"');
      expect(formErrorContent).toContain('form-error-enter');
      expect(formErrorContent).toContain('form-error-exit');
      expect(formErrorContent).toContain('formErrorProgress');
    });

    it('FormErrorMessage supports autoDismissMs timer with pause on hover only on fine pointer devices', () => {
      expect(formErrorContent).toContain('autoDismissMs = 6000');
      expect(formErrorContent).toContain('onMouseEnter={() => setIsHovered(true)}');
      expect(formErrorContent).toContain('onMouseLeave={() => setIsHovered(false)}');
      expect(formErrorContent).toContain('(hover: hover) and (pointer: fine)');
      expect(formErrorContent).toContain('onTouchStart={() => _setIsHovered(false)}');
      expect(formErrorContent).toContain('onTouchMove={() => _setIsHovered(false)}');
      expect(formErrorContent).toContain("window.addEventListener('scroll', handleScrollOrTouch");
      expect(formErrorContent).toContain("window.addEventListener('touchmove', handleScrollOrTouch");
      expect(formErrorContent).toContain('setTimeout');
      expect(formErrorContent).toContain('clearTimeout');
    });

    it('BookingSection.tsx uses FormErrorMessage and clears error on input change', () => {
      expect(bookingSectionContent).toContain('import { FormErrorMessage } from');
      expect(bookingSectionContent).toContain('<FormErrorMessage');
      expect(bookingSectionContent).toContain("if (error) setError('');");
    });

    it('CurhatForm.tsx uses FormErrorMessage and clears error on input edit', () => {
      expect(curhatFormContent).toContain('import { FormErrorMessage } from');
      expect(curhatFormContent).toContain('<FormErrorMessage');
      expect(curhatFormContent).toContain("if (sendError) setSendError('');");
    });

    it('BookingTracker.tsx uses FormErrorMessage for consistent dismissible alerts', () => {
      expect(bookingTrackerContent).toContain('import { FormErrorMessage } from');
      expect(bookingTrackerContent).toContain('<FormErrorMessage');
    });
  });

  describe('EmptyState Universal Standardization (No Badge across web)', () => {
    const emptyStateContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/ui/EmptyState.tsx'),
      'utf-8'
    );

    it('EmptyStateProps and component do not render or accept badge', () => {
      expect(emptyStateContent).not.toContain('badge?:');
      expect(emptyStateContent).not.toContain('{badge &&');
      expect(emptyStateContent).not.toContain('{badge}');
    });

    it('EmptyState maintains accessible role="status" and polite live region', () => {
      expect(emptyStateContent).toContain('role="status"');
      expect(emptyStateContent).toContain('aria-live="polite"');
    });
  });
});


