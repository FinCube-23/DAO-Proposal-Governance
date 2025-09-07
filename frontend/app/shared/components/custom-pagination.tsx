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
    if (totalPages < 8) {
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
      // Always show 1 2 3 ... n-2 n-1 n
      const items = [];
      items.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={page === 1} onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>,
      );
      items.push(
        <PaginationItem key={2}>
          <PaginationLink isActive={page === 2} onClick={() => handlePageChange(2)}>2</PaginationLink>
        </PaginationItem>,
      );
      items.push(
        <PaginationItem key={3}>
          <PaginationLink isActive={page === 3} onClick={() => handlePageChange(3)}>3</PaginationLink>
        </PaginationItem>,
      );
      // Ellipsis
      items.push(
        <PaginationItem key="start-ellipsis">
          <PaginationEllipsis />
        </PaginationItem>,
      );
      // Show n-2, n-1, n
      for (let p = totalPages - 2; p <= totalPages; p++) {
        items.push(
          <PaginationItem key={p}>
            <PaginationLink isActive={p === page} onClick={() => handlePageChange(p)}>{p}</PaginationLink>
          </PaginationItem>,
        );
      }
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
