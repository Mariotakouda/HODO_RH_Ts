interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ currentPage, lastPage, onChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <nav className="d-flex justify-content-center mt-4">
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(currentPage - 1)}>
            <i className="bi bi-chevron-left" />
          </button>
        </li>
        {pages.map((page) => (
          <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
            <button className="page-link" onClick={() => onChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onChange(currentPage + 1)}>
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
