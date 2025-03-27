import React, { useEffect, useState } from "react";

interface FiltersProps {
  searchQuery: string;
}

const CustomerSearchBar: React.FC<{
  getFilters: (filter: FiltersProps) => void;
}> = ({ getFilters }) => {
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<FiltersProps>({
    searchQuery: "",
  });

  useEffect(() => {
    getFilters(filters);
  }, [filters, getFilters]);

  return (
    <div>
      <div className="flex gap-2">
        <button
          className="relative self-center rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              searchQuery: search,
            }))
          }
        >
          Search
        </button>
        <div className="relative flex items-center">
          <input
            className="roboto-medium w-[275px] min-w-[175px] rounded-md border-2 border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
            placeholder="Search Name or Email"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setFilters((prev) => ({
                  ...prev,
                  searchQuery: search,
                }));
            }}
            value={search}
          />
          <span
            className={`material-symbols-outlined filled absolute right-2 mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
            onClick={() => {
              setSearch("");
              setFilters((prev) => ({
                ...prev,
                searchQuery: "",
              }));
            }}
          >
            cancel
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerSearchBar;
