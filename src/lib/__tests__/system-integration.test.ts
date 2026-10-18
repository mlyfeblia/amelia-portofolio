import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import robots from '@/app/robots';

describe('System Integration & Full-Site Architecture Verification', () => {
  const curhatRoutePath = path.resolve(process.cwd(), 'src/app/api/curhat/route.ts');
  const bookingsRoutePath = path.resolve(process.cwd(), 'src/app/api/bookings/route.ts');
  const adminLayoutPath = path.resolve(process.cwd(), 'src/app/admin/layout.tsx');
  const adminLayoutClientPath = path.resolve(process.cwd(), 'src/components/admin/AdminLayoutClient.tsx');

  describe('Web Push Notification Routing Consistency', () => {
    it('curhat API pushes notifications to canonical /admin/counseling route', () => {
      const curhatRoute = fs.readFileSync(curhatRoutePath, 'utf-8');
      expect(curhatRoute).toContain("url: '/admin/counseling'");
      expect(curhatRoute).not.toContain("url: '/admin/curhat'");
    });

    it('bookings API pushes notifications to canonical /admin/bookings route', () => {
      const bookingsRoute = fs.readFileSync(bookingsRoutePath, 'utf-8');
      expect(bookingsRoute).toContain("url: '/admin/bookings'");
    });
  });

  describe('Search Engine Security & Robots Configuration', () => {
    it('robots.ts disallows administrative and API endpoints', () => {
      const config = robots();
      const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
      const disallows = rules.flatMap((r) => (Array.isArray(r.disallow) ? r.disallow : [r.disallow]));

      expect(disallows).toContain('/admin');
      expect(disallows).toContain('/api/');
    });

    it('admin layout sets noindex and nofollow headers for search crawlers', () => {
      const adminLayout = fs.readFileSync(adminLayoutPath, 'utf-8');
      expect(adminLayout).toContain('index: false');
      expect(adminLayout).toContain('follow: false');
    });
  });

  describe('Admin Navigation & Responsiveness Standard', () => {
    it('admin header supports 320px ultra-small screens with responsive Web text toggle', () => {
      const clientLayout = fs.readFileSync(adminLayoutClientPath, 'utf-8');
      expect(clientLayout).toContain('hidden min-[320px]:inline sm:hidden');
      expect(clientLayout).toContain('hidden sm:inline');
    });

    it('admin logout button uses icon on mobile and text on desktop', () => {
      const clientLayout = fs.readFileSync(adminLayoutClientPath, 'utf-8');
      expect(clientLayout).toContain('<span className="hidden sm:inline">Keluar</span>');
    });
  });

  describe('Curhat Sticky Sidebar Architecture', () => {
    it('CurhatSection implements desktop/tablet sticky sidebar with top-20 offset and self-start', () => {
      const curhatSectionPath = path.resolve(process.cwd(), 'src/components/CurhatSection.tsx');
      const curhatSectionContent = fs.readFileSync(curhatSectionPath, 'utf-8');
      expect(curhatSectionContent).toContain('md:sticky md:top-20 md:self-start');
    });
  });

  describe('Admin Bookings Filter Dropdown & Counseling Card/Modal Polish', () => {
    it('BookingFilters implements 3-column dropdown filters without horizontal status tabs', () => {
      const filtersPath = path.resolve(process.cwd(), 'src/components/admin/bookings/BookingFilters.tsx');
      const filtersContent = fs.readFileSync(filtersPath, 'utf-8');
      expect(filtersContent).toContain('STATUS_OPTIONS');
      expect(filtersContent).toContain('ListFilter');
      expect(filtersContent).not.toContain('<TabsList');
      expect(filtersContent).toContain('grid grid-cols-1 sm:grid-cols-3 gap-2.5');
    });

    it('CounselingCard matches ArticleCard action button sizing and classes', () => {
      const counselingCardPath = path.resolve(process.cwd(), 'src/components/admin/counseling/CounselingCard.tsx');
      const cardContent = fs.readFileSync(counselingCardPath, 'utf-8');
      expect(cardContent).toContain('py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold');
      expect(cardContent).toContain('★ Di Beranda');
      expect(cardContent).toContain('Publik');
      expect(cardContent).toContain('Draf');
      expect(cardContent).toContain('hover:border-red-300');
    });

    it('CounselingReplyBox uses standardized useModalAnimation enter and exit transitions', () => {
      const replyBoxPath = path.resolve(process.cwd(), 'src/components/admin/counseling/CounselingReplyBox.tsx');
      const replyBoxContent = fs.readFileSync(replyBoxPath, 'utf-8');
      expect(replyBoxContent).toContain('useModalAnimation');
      expect(replyBoxContent).toContain('backdropClass');
      expect(replyBoxContent).toContain('windowClass');
      expect(replyBoxContent).not.toContain('animate-fade-in-up');
    });
  });

  describe('Production Reliability: Resend Email, PWA Update Button & Admin Auth', () => {
    it('resend.ts uses verified owner email mlyfeblia150207@gmail.com and sandbox fallback', () => {
      const resendContent = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/resend.ts'), 'utf-8');
      expect(resendContent).toContain("DEFAULT_ADMIN_EMAIL = 'mlyfeblia150207@gmail.com'");
      expect(resendContent).toContain('isSandboxRestrictionError');
      expect(resendContent).toContain('[Salinan Konseli:');
    });

    it('serverless routes await Promise.allSettled for email and push notifications', () => {
      const bookingsRoute = fs.readFileSync(bookingsRoutePath, 'utf-8');
      const bookingIdRoute = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/api/bookings/[id]/route.ts'),
        'utf-8'
      );
      const curhatRoute = fs.readFileSync(curhatRoutePath, 'utf-8');

      expect(bookingsRoute).toContain('await Promise.allSettled');
      expect(bookingIdRoute).toContain('await Promise.allSettled');
      expect(curhatRoute).toContain('await Promise.allSettled');
    });

    it('PwaLifecycle.tsx Perbarui Sekarang button has guaranteed reload fallback and loading state', () => {
      const pwaContent = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/pwa/PwaLifecycle.tsx'),
        'utf-8'
      );
      expect(pwaContent).toContain('isApplyingUpdate');
      expect(pwaContent).toContain("caches.delete('amelia-pages-cache')");
      expect(pwaContent).toContain('setTimeout(performReload, 450)');
      expect(pwaContent).toContain("isApplyingUpdate ? 'Memperbarui...' : 'Perbarui Sekarang'");
    });

    it('sw.ts enables clientsClaim: true so skipped-waiting worker claims active clients', () => {
      const swContent = fs.readFileSync(path.resolve(process.cwd(), 'src/sw.ts'), 'utf-8');
      expect(swContent).toContain('clientsClaim: true');
    });
  });
});
