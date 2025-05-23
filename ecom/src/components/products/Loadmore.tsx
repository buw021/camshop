interface Params {
  total: number;
  limit: number;
  page: number;
  setPage: (number: number) => void;
  handlePageMovement: (number: number) => void;
}

export const LoadMore: React.FC<Params> = ({
  total,
  limit,
  page,
  setPage,
  handlePageMovement,
}) => {
  const totalPages = total / limit;

  const loadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
      handlePageMovement(page + 1);
    }
  };

  return (
    <div className="flex justify-center">
      {page < totalPages ? (
        <button
          onClick={() => {
            loadMore();
          }}
          className={`mx-1 rounded-full bg-zinc-700 px-2.5 py-1 text-sm font-bold text-white hover:bg-zinc-800`}
        >
          Show more products
        </button>
      ) : (
        <span className="mx-1 rounded px-4 py-2"></span>
      )}
    </div>
  );
};
