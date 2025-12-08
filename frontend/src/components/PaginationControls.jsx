export default function PaginationControls({ meta, onPageChange }) {
  if (!meta) return null;

  const { currentPage, totalPages, totalItems } = meta;

  // Generate page numbers to show (max 7 visible pages)
  const getVisiblePages = () => {
    const delta = 3; // Show 3 pages on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Always show first page
    range.push(1);

    // Calculate start and end of middle range
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    // Add dots after first page if needed
    if (start > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add middle range
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        rangeWithDots.push(i);
      }
    }

    // Add dots before last page if needed
    if (end < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col items-center mt-6 gap-3">
      {/* Page buttons */}
      <div className="flex justify-center items-center gap-1">
        <button
          className="px-3 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>

        {visiblePages.map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`px-3 py-2 border rounded ${
                page === currentPage 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "border-gray-300 bg-white hover:bg-gray-50"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        ))}

        <button
          className="px-3 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-600">
        Showing page {currentPage} of {totalPages.toLocaleString()} 
        ({totalItems.toLocaleString()} total results)
      </div>
    </div>
  );
}
