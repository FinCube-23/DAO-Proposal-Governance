import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';

interface Props {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function CustomPagination({ total, page, limit, onPageChange }: Props) {
  // Helper to scroll to top and change page
  const handlePageChange = (pageNum: number) => {
    onPageChange(pageNum);
    if (typeof window !== 'undefined') {
      // Always use smooth scroll, fallback for older browsers
      if ('scrollTo' in window && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      else {
        window.scroll(0, 0);
      }
    }
  };
  const totalPages = Math.ceil(total / limit);

  if (totalPages < 1) {
    return null;
  }

  // Helper to render page numbers
  const renderPageNumbers = () => {
    // For mobile, show fewer page numbers
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const maxPagesToShow = isMobile ? 3 : 7;

    if (totalPages <= maxPagesToShow) {
      // Render all page numbers directly
      return Array.from({ length: totalPages }, (_, idx) => {
        const pageNum = idx + 1;
        return (
          <PaginationItem key={pageNum}>
            <PaginationLink
              isActive={pageNum === page}
              onClick={() => handlePageChange(pageNum)}
              className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm"
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
      });
    }
    else {
      const items = [];
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            onClick={() => handlePageChange(1)}
            className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm"
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      // Show left ellipsis if needed
      const showLeftEllipsis = isMobile ? page > 3 : page > 4;
      if (showLeftEllipsis) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis className="h-8 w-8 sm:h-9 sm:w-9" />
          </PaginationItem>,
        );
      }

      // Show window of pages around current
      const windowPages = [];
      if (isMobile) {
        // Mobile: show only current page if not at edges
        if (page > 2 && page < totalPages - 1) {
          windowPages.push(page);
        }
        else if (page <= 2) {
          // Show page 2 if near start
          if (totalPages > 2) {
            windowPages.push(2);
          }
        }
        else {
          // Show page n-1 if near end
          if (totalPages > 2) {
            windowPages.push(totalPages - 1);
          }
        }
      }
      else {
        // Desktop: existing logic
        if (page <= 4) {
          for (let p = 2; p <= 5; p++) {
            if (p < totalPages) {
              windowPages.push(p);
            }
          }
        }
        else if (page >= totalPages - 3) {
          for (let p = totalPages - 4; p < totalPages; p++) {
            if (p > 1) {
              windowPages.push(p);
            }
          }
        }
        else {
          for (let p = page - 1; p <= page + 1; p++) {
            if (p > 1 && p < totalPages) {
              windowPages.push(p);
            }
          }
        }
      }

      windowPages.forEach((p) => {
        items.push(
          <PaginationItem key={p}>
            <PaginationLink
              isActive={p === page}
              onClick={() => handlePageChange(p)}
              className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm"
            >
              {p}
            </PaginationLink>
          </PaginationItem>,
        );
      });

      // Show right ellipsis if needed
      const showRightEllipsis = isMobile ? page < totalPages - 2 : page < totalPages - 3;
      if (showRightEllipsis) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis className="h-8 w-8 sm:h-9 sm:w-9" />
          </PaginationItem>,
        );
      }

      // Always show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="h-8 w-8 sm:h-9 sm:w-9 text-xs sm:text-sm"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
      return items;
    }
  };

  return (
    <div className="flex items-center justify-center px-2 sm:px-0">
      <Pagination>
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              onClick={page === 1 ? undefined : () => handlePageChange(Math.max(1, page - 1))}
              className={`h-8 sm:h-9 text-xs sm:text-sm ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext
              onClick={page === totalPages ? undefined : () => handlePageChange(Math.min(totalPages, page + 1))}
              className={`h-8 sm:h-9 text-xs sm:text-sm ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
