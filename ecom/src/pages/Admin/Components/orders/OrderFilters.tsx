import React, { useState } from "react";

const statusList = [
  "ordered",
  "pending",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "processed",
  "refund on process",
  "payment failed",
];

const OrderFilters = () => {
  const [filters, setFilters] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-sm hover:cursor-pointer hover:bg-zinc-200 ${"border-zinc-300 bg-zinc-200"}`}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            All Products
          </button>
          <button
            className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-sm hover:cursor-pointer hover:bg-zinc-200 ${"border-zinc-300 bg-zinc-200"}`}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Unfulfilled
          </button>
          <button
            className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-sm hover:cursor-pointer hover:bg-zinc-200 ${"border-zinc-300 bg-zinc-200"}`}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Paid
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <button
            className="relative self-center rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
            /* onClick={() => handleSearch(search)} */
          >
            Search
          </button>
          <div className="relative flex items-center">
            <input
              className="roboto-medium w-[15vw] min-w-[175px] rounded-md border-2 border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
              /* onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(search);
            }} */
              value={search}
            />
            <span
              className={`material-symbols-outlined filled absolute right-2 mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
              onClick={() => setSearch("")}
            >
              cancel
            </span>
          </div>
        </div>
        <div className="h-4 w-[1px] bg-zinc-200"></div>
        <div className="flex items-center">
          <div
            className="relative z-10"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setShowDropdown(false);
              }
            }}
            tabIndex={0}
          >
            <button
              className="relative self-center rounded-md bg-zinc-800 py-[7px] pl-3 pr-7 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Filter by status{" "}
              <span className="material-symbols-outlined absolute right-2 top-1.5 text-lg leading-3">
                keyboard_arrow_down
              </span>
            </button>
            {showDropdown && (
              <div className="absolute mt-2 w-48 gap-1 rounded-md bg-white py-1 text-sm font-medium tracking-wide shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {statusList.map((status, index) => (
                    <label
                      key={index}
                      className="flex items-center px-2 hover:cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        checked={filters.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters([...filters, status]);
                          } else {
                            setFilters(filters.filter((f) => f !== status));
                          }
                        }}
                      />
                      <span className="ml-2 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="sr-only text-xs font-medium tracking-wide"></label>
          <select
            className="border-zinc-150 w-26 rounded-md border-[1px] bg-zinc-50 px-1 py-1 text-xs font-medium tracking-wide text-zinc-900 outline-none outline-1 drop-shadow-sm hover:border-zinc-300 focus:border-zinc-300"
            onChange={(e) => setFilters([...filters, e.target.value])}
          >
            <option className="text-xs font-medium tracking-wide" value="">
              Payment Status
            </option>
            <option className="text-xs font-medium tracking-wide" value="paid">
              Paid
            </option>
            <option
              className="text-xs font-medium tracking-wide"
              value="unpaid"
            >
              Unpaid
            </option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="sr-only text-xs font-medium tracking-wide">
            Fulfillment Status
          </label>
          <select
            className="border-zinc-150 w-26 rounded-md border-[1px] bg-zinc-50 px-1 py-1 text-xs font-medium tracking-wide text-zinc-900 outline-none outline-1 drop-shadow-sm hover:border-zinc-300 focus:border-zinc-300"
            onChange={(e) => setFilters([...filters, e.target.value])}
          >
            <option className="text-xs font-medium tracking-wide" value="">
              Fullfillment Status
            </option>
            <option
              className="text-xs font-medium tracking-wide"
              value="fulfilled"
            >
              Fulfilled
            </option>
            <option
              className="text-xs font-medium tracking-wide"
              value="unfulfilled"
            >
              Unfulfilled
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
