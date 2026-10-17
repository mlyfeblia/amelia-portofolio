import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Responsive Layout & Button Label Standardization Verification', () => {
  const assessmentHistoryPath = path.resolve(process.cwd(), 'src/components/assessment/AssessmentHistory.tsx');
  const bookingTrackerPath = path.resolve(process.cwd(), 'src/components/booking/BookingTracker.tsx');
  const bookingDetailCardPath = path.resolve(process.cwd(), 'src/components/booking/BookingDetailCard.tsx');
  const bookingDeleteModalPath = path.resolve(process.cwd(), 'src/components/booking/BookingDeviceDeleteModal.tsx');
  const assessmentDeleteModalPath = path.resolve(process.cwd(), 'src/components/assessment/AssessmentDeleteModal.tsx');
  const bookingSectionPath = path.resolve(process.cwd(), 'src/components/BookingSection.tsx');
  const assessmentSectionPath = path.resolve(process.cwd(), 'src/components/AssessmentSection.tsx');

  describe('AssessmentHistory.tsx buttons', () => {
    const content = fs.readFileSync(assessmentHistoryPath, 'utf-8');

    it('contains text label only on desktop (hidden sm:inline) for Salin button', () => {
      expect(content).toContain('<span className="hidden sm:inline font-semibold">');
      expect(content).toContain('{isCopied ? \'Tersalin\' : \'Salin\'}');
    });

    it('contains text label only on desktop (hidden sm:inline) for Hapus button', () => {
      expect(content).toContain('<span className="hidden sm:inline font-medium">Hapus</span>');
    });

    it('ensures title header has min-w-0 flex-1 break-words to avoid colliding with action buttons', () => {
      expect(content).toContain('min-w-0 flex-1 break-words');
    });
  });

  describe('BookingTracker.tsx device history card buttons', () => {
    const content = fs.readFileSync(bookingTrackerPath, 'utf-8');

    it('contains text label only on desktop (hidden sm:inline) for device record Hapus button', () => {
      expect(content).toContain('<span className="hidden sm:inline">Hapus</span>');
    });

    it('ensures top row of record card uses flex-wrap sm:flex-nowrap for small mobile viewports', () => {
      expect(content).toContain('flex flex-wrap sm:flex-nowrap items-center justify-between gap-2');
    });
  });

  describe('BookingDetailCard.tsx remove button', () => {
    const content = fs.readFileSync(bookingDetailCardPath, 'utf-8');

    it('contains text label only on desktop (hidden sm:inline) for Hapus Histori button', () => {
      expect(content).toContain('<span className="hidden sm:inline">Hapus Histori</span>');
    });
  });

  describe('Device Delete Modals header safety', () => {
    const bookingModalContent = fs.readFileSync(bookingDeleteModalPath, 'utf-8');
    const assessmentModalContent = fs.readFileSync(assessmentDeleteModalPath, 'utf-8');

    it('BookingDeviceDeleteModal uses min-w-0 flex-1 break-words to prevent title collision with close button', () => {
      expect(bookingModalContent).toContain('min-w-0 flex-1');
      expect(bookingModalContent).toContain('break-words');
    });

    it('AssessmentDeleteModal uses min-w-0 flex-1 break-words to prevent title collision with close button', () => {
      expect(assessmentModalContent).toContain('min-w-0 flex-1');
      expect(assessmentModalContent).toContain('break-words');
    });
  });

  describe('Segmented Tab controls responsive sizing in BookingSection & AssessmentSection', () => {
    const bookingSectionContent = fs.readFileSync(bookingSectionPath, 'utf-8');
    const assessmentSectionContent = fs.readFileSync(assessmentSectionPath, 'utf-8');

    it('BookingSection tab buttons use responsive font sizing (text-[11px] min-[360px]:text-xs sm:text-sm)', () => {
      expect(bookingSectionContent).toContain('text-[11px] min-[360px]:text-xs sm:text-sm');
    });

    it('AssessmentSection tab buttons use responsive font sizing (text-[11px] min-[360px]:text-xs sm:text-sm)', () => {
      expect(assessmentSectionContent).toContain('text-[11px] min-[360px]:text-xs sm:text-sm');
    });
  });

  describe('Standardized Mobile Pagination & Auto-Scroll', () => {
    const paginationBarPath = path.resolve(process.cwd(), 'src/components/ui/PaginationBar.tsx');
    const articleListPath = path.resolve(process.cwd(), 'src/components/admin/articles/ArticleList.tsx');
    const bookingListPath = path.resolve(process.cwd(), 'src/components/admin/bookings/BookingList.tsx');
    const counselingListPath = path.resolve(process.cwd(), 'src/components/admin/counseling/CounselingList.tsx');

    const paginationContent = fs.readFileSync(paginationBarPath, 'utf-8');
    const articleListContent = fs.readFileSync(articleListPath, 'utf-8');
    const bookingListContent = fs.readFileSync(bookingListPath, 'utf-8');
    const counselingListContent = fs.readFileSync(counselingListPath, 'utf-8');

    it('ensures mobile pagination places page numbers on row 1 (order-1) and prev/next buttons on row 2 (order-2)', () => {
      expect(paginationContent).toContain('order-1 sm:order-2 flex items-center justify-center gap-1');
      expect(paginationContent).toContain('order-2 sm:order-none flex items-center justify-center gap-2 w-full sm:w-auto sm:contents');
      expect(paginationContent).not.toContain('min-[340px]:hidden');
      expect(paginationContent).toContain('min-w-[28px] sm:min-w-[32px]');
    });

    it('ensures Sebelumnya and Selanjutnya buttons sit side-by-side on mobile with balanced max widths', () => {
      expect(paginationContent).toContain('max-w-[130px] sm:max-w-none');
      expect(paginationContent).toContain('<span>Sebelumnya</span>');
      expect(paginationContent).toContain('<span>Selanjutnya</span>');
    });

    it('ensures ArticleList has listTopRef and smooth scroll on page change', () => {
      expect(articleListContent).toContain('listTopRef = useRef<HTMLDivElement>(null)');
      expect(articleListContent).toContain("scrollIntoView({ behavior: 'smooth', block: 'start' })");
      expect(articleListContent).toContain('scroll-mt-24');
    });

    it('ensures BookingList has listTopRef and smooth scroll on page change', () => {
      expect(bookingListContent).toContain('listTopRef = useRef<HTMLDivElement>(null)');
      expect(bookingListContent).toContain("scrollIntoView({ behavior: 'smooth', block: 'start' })");
      expect(bookingListContent).toContain('scroll-mt-24');
    });

    it('ensures CounselingList has listTopRef and smooth scroll on page change', () => {
      expect(counselingListContent).toContain('listTopRef = useRef<HTMLDivElement>(null)');
      expect(counselingListContent).toContain("scrollIntoView({ behavior: 'smooth', block: 'start' })");
      expect(counselingListContent).toContain('scroll-mt-24');
    });

    it('ensures ArticleListItem metadata (kategori, estimasi baca, jumlah pembaca) renders in a single row without flex-wrap', () => {
      const articleListItemPath = path.resolve(process.cwd(), 'src/components/articles/ArticleListItem.tsx');
      const articleItemContent = fs.readFileSync(articleListItemPath, 'utf-8');

      expect(articleItemContent).not.toContain('flex-wrap');
      expect(articleItemContent).toContain('flex items-center gap-1.5 sm:gap-2.5 min-w-0');
      expect(articleItemContent).toContain('truncate min-w-0 shrink');
      expect(articleItemContent).toContain('whitespace-nowrap');
    });
  });
});

