interface Params {
  total: number;
  limit: number;
  page: number;
  setPage: (number: number) => void;
}

export const Pagination: React.FC<Params> = ({
  total,
  limit,
  page,
  setPage,
}) => {
  const totalPages = Math.ceil(total / limit);

  const getPages = () => {
    const pages = [];
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    pages.push(1);
    if (startPage > 2) {
      pages.push("...");
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) {
      pages.push("...");
    }
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="mt-4 flex justify-center">
      {getPages().map((pageNumber, index) =>
        typeof pageNumber === "number" ? (
          <button
            key={index}
            onClick={() => setPage(pageNumber)}
            className={`px-4 py-2 ${pageNumber === page ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-zinc-700 text-white hover:bg-zinc-800"} mx-1 rounded`}
          >
            {pageNumber}
          </button>
        ) : (
          <span key={index} className="mx-1 rounded px-4 py-2">
            ...
          </span>
        ),
      )}
    </div>
  );
};
