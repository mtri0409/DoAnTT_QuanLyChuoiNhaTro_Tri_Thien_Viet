import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

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
        {pages.map((page) => (
          <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
            <button
              className="page-link shadow-none"
              onClick={() => onPageChange(page)}
            >
              {page + 1} 
            </button>
          </li>
        ))}

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