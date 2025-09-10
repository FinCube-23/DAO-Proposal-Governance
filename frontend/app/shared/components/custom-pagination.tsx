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

  if (totalPages <= 1) {
    return null;
  }

  // Helper to render page numbers
  const renderPageNumbers = () => {
    if (totalPages <= 7) {
      // Render all page numbers directly
      return Array.from({ length: totalPages }, (_, idx) => {
        const pageNum = idx + 1;
        return (
          <PaginationItem key={pageNum}>
            <PaginationLink
              isActive={pageNum === page}
              onClick={() => handlePageChange(pageNum)}
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
          <PaginationLink isActive={page === 1} onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>,
      );

      // Show left ellipsis if needed
      if (page > 4) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // Show window of pages around current
      const windowPages = [];
      if (page <= 4) {
        // Show pages 2, 3, 4, 5 if near the start
        for (let p = 2; p <= 5; p++) {
          if (p < totalPages) {
            windowPages.push(p);
          }
        }
      }
      else if (page >= totalPages - 3) {
        // Show pages n-4, n-3, n-2, n-1 if near the end
        for (let p = totalPages - 4; p < totalPages; p++) {
          if (p > 1) {
            windowPages.push(p);
          }
        }
      }
      else {
        // Show current -1, current, current +1
        for (let p = page - 1; p <= page + 1; p++) {
          if (p > 1 && p < totalPages) {
            windowPages.push(p);
          }
        }
      }
      windowPages.forEach((p) => {
        items.push(
          <PaginationItem key={p}>
            <PaginationLink isActive={p === page} onClick={() => handlePageChange(p)}>{p}</PaginationLink>
          </PaginationItem>,
        );
      });

      // Show right ellipsis if needed
      if (page < totalPages - 3) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // Always show last page
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink isActive={page === totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>,
      );
      return items;
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => handlePageChange(Math.max(1, page - 1))} />
          </PaginationItem>
          {renderPageNumbers()}
          <PaginationItem>
            <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, page + 1))} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
