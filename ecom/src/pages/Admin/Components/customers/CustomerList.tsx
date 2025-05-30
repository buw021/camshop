import React, { useState, useMemo } from "react";
import { CustomerProps } from "../interface/interfaces";
const Row_Cells: React.FC<{
  customer: CustomerProps;
  manageCustomer: (customer: string) => void;
}> = ({ customer, manageCustomer }) => (
  <tr className="border-y-[1px] hover:bg-zinc-100">
    <td className="whitespace-nowrap py-1 pl-8 pr-6 text-left capitalize">
      {customer.firstName || "unset"}
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
      {customer.lastName || "unset"}
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left text-xs font-medium">
      {customer.email}
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left text-xs font-medium">
      {customer.phoneNo || "XXX-XXX-XXXX"}
    </td>
    <td className="whitespace-nowrap px-6 pl-8 text-left">
      <button
        className="rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700"
        onClick={() => manageCustomer(customer._id)}
      >
        <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
          edit_square
        </span>
        Manage
      </button>
    </td>
  </tr>
);

const CustomerList: React.FC<{
  customers: CustomerProps[];
  manageCustomer: (customerID: string) => void;
  currentPage: number;
  setCurrentPage: (react: React.SetStateAction<number>) => void;
  totalPages: number;
}> = ({
  customers,
  manageCustomer,
  currentPage,
  setCurrentPage,
  totalPages,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CustomerProps;
    direction: string;
  } | null>(null);

  const sortedCustomers = useMemo(() => {
    if (!customers || !sortConfig) return customers;

    const { key, direction } = sortConfig;

    const sortableOrders = [...customers];
    sortableOrders.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      // Handle comparison for different data types

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return direction === "ascending"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      return 0; // Default case
    });

    return sortableOrders;
  }, [customers, sortConfig]);

  const requestSort = (key: keyof CustomerProps) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    return key;
  };

  return (
    <>
      <div className="flex items-center justify-between"></div>
      <div className="relative h-full w-full overflow-auto">
        <table className="w-full table-auto overflow-hidden text-sm">
          <thead className="">
            <tr className="h-8 text-nowrap bg-zinc-100">
              <th
                className="relative cursor-pointer rounded-l-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("firstName")}
              >
                First Name
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("lastName")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Last Name
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("email")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Email
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("phoneNo")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Phone Number
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th className="rounded-r-lg px-6 text-left font-medium capitalize tracking-wider text-zinc-500">
                <span className="mr-2 rounded border-[1px]" />
                Manage
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={8} className="h-2"></td>
            </tr>
            {sortedCustomers.map((customer) => (
              <Row_Cells
                key={customer._id}
                customer={customer}
                manageCustomer={manageCustomer}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
        >
          Previous
        </button>
        <span className="text-xs font-bold uppercase leading-3 tracking-wide text-zinc-500">
          Page {totalPages > 0 ? currentPage : 0} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
          className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
        >
          Next
        </button>
      </div>
    </>
  );
};

export default CustomerList;
