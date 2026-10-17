import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Modal Dialog and Animation Standardization', () => {
  const css = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8');

  it('standardizes .modal-backdrop-layer with pure frosted glass blur identical to navbar drawer', () => {
    expect(css).toContain('.modal-backdrop-layer {');
    expect(css).toContain('background-color: transparent;');
    expect(css).toContain('backdrop-filter: blur(12px);');
  });

  it('binds .modal-backdrop-enter and .modal-backdrop-exit to navBackdropFade keyframes', () => {
    const enterMatch = css.match(/\.modal-backdrop-enter\s*\{[^}]+\}/)?.[0] || '';
    const exitMatch = css.match(/\.modal-backdrop-exit\s*\{[^}]+\}/)?.[0] || '';

    expect(enterMatch).toContain('navBackdropFadeIn');
    expect(exitMatch).toContain('navBackdropFadeOut');
    expect(exitMatch).toContain('pointer-events: none !important');
  });

  it('binds .modal-window-enter and .modal-window-exit to modalCardScale keyframes', () => {
    const windowEnterMatch = css.match(/\.modal-window-enter\s*\{[^}]+\}/)?.[0] || '';
    const windowExitMatch = css.match(/\.modal-window-exit\s*\{[^}]+\}/)?.[0] || '';

    expect(windowEnterMatch).toContain('modalCardScaleIn');
    expect(windowExitMatch).toContain('modalCardScaleOut');
    expect(windowExitMatch).toContain('pointer-events: none !important');
  });

  it('defines responsive mobile sheet animations for .modal-window-sheet-mobile under 640px', () => {
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)\s*\{[\s\S]*?\.modal-window-sheet-mobile\.modal-window-enter[\s\S]*?modalSheetUp/);
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)\s*\{[\s\S]*?\.modal-window-sheet-mobile\.modal-window-exit[\s\S]*?modalSheetDown/);
  });

  it('neutralizes all modal animations under prefers-reduced-motion: reduce', () => {
    const reducedMotionMatch = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] || '';
    expect(reducedMotionMatch).toContain('.modal-window-enter');
    expect(reducedMotionMatch).toContain('.modal-window-exit');
    expect(reducedMotionMatch).toContain('.modal-sheet-enter');
    expect(reducedMotionMatch).toContain('.modal-sheet-exit');
    expect(reducedMotionMatch).toContain('.modal-backdrop-enter');
    expect(reducedMotionMatch).toContain('.modal-backdrop-exit');
  });

  it('eliminates rogue Tailwind transition classes fighting keyframe animations in Modal.tsx', () => {
    const modalTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/Modal.tsx'), 'utf-8');
    expect(modalTsx).not.toContain('transition-opacity duration-200');
    expect(modalTsx).not.toContain('transition-all duration-200');
    expect(modalTsx).not.toContain('bg-[var(--color-ink)]/50');
    expect(modalTsx).toContain('backdropClass');
    expect(modalTsx).toContain('windowClass');
  });

  it('eliminates rogue dark black backdrops and transition conflicts in ArticleMarkdownCheatsheet.tsx', () => {
    const cheatsheetTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/articles/ArticleMarkdownCheatsheet.tsx'), 'utf-8');
    expect(cheatsheetTsx).not.toContain('bg-black/45');
    expect(cheatsheetTsx).not.toContain('transition-opacity');
    expect(cheatsheetTsx).toContain('modal-window-sheet-mobile');
    expect(cheatsheetTsx).toContain('backdropClass');
  });

  it('standardizes mobile full-screen admin modals with modal-window-sheet-mobile', () => {
    const formModalTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/articles/ArticleFormModal.tsx'), 'utf-8');
    const replyBoxTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/counseling/CounselingReplyBox.tsx'), 'utf-8');

    expect(formModalTsx).toContain('modal-window-sheet-mobile');
    expect(replyBoxTsx).toContain('modal-window-sheet-mobile');
  });

  it('preserves cached target in admin delete modals to prevent premature unmounting during exit animation', () => {
    const bookingDeleteModalTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/bookings/BookingDeleteModal.tsx'), 'utf-8');
    const articleDeleteModalTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/articles/ArticleDeleteModal.tsx'), 'utf-8');
    const counselingDeleteModalTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/counseling/CounselingDeleteModal.tsx'), 'utf-8');

    expect(bookingDeleteModalTsx).toContain('cachedBooking');
    expect(articleDeleteModalTsx).toContain('cachedArticle');
    expect(counselingDeleteModalTsx).toContain('cachedItem');
  });

  it('preserves cached status and props in BookingCard, ArticleCard, and ConfirmDecisionModal during exit animation', () => {
    const bookingCardTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/bookings/BookingCard.tsx'), 'utf-8');
    const articleCardTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/articles/ArticleCard.tsx'), 'utf-8');
    const confirmModalTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/ConfirmDecisionModal.tsx'), 'utf-8');

    expect(bookingCardTsx).toContain('cachedStatus');
    expect(bookingCardTsx).toContain('activeStatus');
    expect(articleCardTsx).toContain('cachedAction');
    expect(articleCardTsx).toContain('activeAction');
    expect(confirmModalTsx).toContain('cachedPropsRef');
  });

  it('calls all React hooks before early returns in ConfirmDecisionModal complying with Rules of Hooks', () => {
    const confirmModalTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/ConfirmDecisionModal.tsx'), 'utf-8');
    const indexOfUseRef = confirmModalTsx.indexOf('const cachedPropsRef = React.useRef');
    const indexOfEarlyReturn = confirmModalTsx.indexOf('if (!mounted || !isRendered) return null;');

    expect(indexOfUseRef).toBeGreaterThan(-1);
    expect(indexOfEarlyReturn).toBeGreaterThan(-1);
    expect(indexOfUseRef).toBeLessThan(indexOfEarlyReturn);
  });
});

