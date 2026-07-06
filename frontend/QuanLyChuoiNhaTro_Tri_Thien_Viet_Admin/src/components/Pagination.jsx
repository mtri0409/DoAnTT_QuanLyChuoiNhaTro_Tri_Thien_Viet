import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const pages = [0]; // Luôn hiển thị trang đầu tiên
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);

    // Xử lý dấu ba chấm hoặc số trang bên trái
    if (start > 2) {
      pages.push('...');
    } else if (start === 2) {
      pages.push(1);
    }

    // Xử lý các trang ở giữa quanh trang hiện tại
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Xử lý dấu ba chấm hoặc số trang bên phải
    if (end < totalPages - 3) {
      pages.push('...');
    } else if (end === totalPages - 3) {
      pages.push(totalPages - 2);
    }

    pages.push(totalPages - 1); // Luôn hiển thị trang cuối cùng

    return pages;
  };

  const pages = getPages();

  return (
    <nav aria-label="Page navigation" className="mt-4">
      <ul className="pagination pagination-sm justify-content-center mb-0">
        
        {/* Prev */}
        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
          <button
            className="page-link shadow-none"
            onClick={() => onPageChange(currentPage - 1)}
          >
            Prev
          </button>
        </li>

        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link shadow-none">...</span>
              </li>
            );
          }
          return (
            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
              <button
                className="page-link shadow-none"
                onClick={() => onPageChange(page)}
              >
                {page + 1} 
              </button>
            </li>
          );
        })}

        {/* Next */}
        <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
          <button
            className="page-link shadow-none"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}