import React, { useState, useMemo } from "react";
import { OrderProps } from "../interface/interfaces";

import { statusColor } from "../assets/statusColor";
const Row_Cells: React.FC<{
  order: OrderProps;
  manageOrder: (order: OrderProps) => void;
}> = ({ order, manageOrder }) => (
  <tr className="border-y-[1px] hover:bg-zinc-100">
    <td className="px-6 py-1 text-left font-medium tracking-tight">
      {order.customOrderId}
    </td>
    <td className="pl-8 pr-6 text-left tracking-tight whitespace-nowrap">
      € {order.totalAmount.toFixed(2)}
    </td>
    <td className="pl-8 pr-6 text-left text-xs font-medium capitalize">
      <div className="flex gap-2">
        <span
          className={`rounded-xl border-[1px] ${order.paymentStatus ? "border-green-300 bg-green-200 text-green-800" : "border-orange-300 bg-orange-200 text-orange-800"} px-2 py-0.5 drop-shadow-sm`}
        >
          {order.paymentStatus ? "Paid" : "Unpaid"}
        </span>
      </div>
    </td>
    <td className="pl-8 pr-6 text-left text-xs font-medium capitalize">
      <div className="flex gap-2">
        <span
          className={`rounded-xl border-[1px] ${order.fulfillment ? "border-blue-300 bg-blue-200 text-blue-800" : "border-gray-300 bg-gray-200 text-gray-800"} px-2 py-0.5 drop-shadow-sm`}
        >
          {order.fulfillment ? "Fulfilled" : "Unfulfilled"}
        </span>
      </div>
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left text-xs font-medium capitalize">
      <div className="flex gap-2">
        <span
          className={`rounded-xl border-[1px] px-2 py-0.5 drop-shadow-sm ${statusColor(order.status)}`}
        >
          {order.status}
        </span>
      </div>
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left">{order.userEmail}</td>
    <td className="pl-8 pr-6 text-left">
      {new Date(order.placedAt).toLocaleDateString()}
    </td>
    <td className="whitespace-nowrap px-6 pl-8 pr-6 text-left">
      {order.trackingNo}
    </td>
    <td className="px-6 pl-8 text-left">
      <button
        className="rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700"
        onClick={() => manageOrder(order)}
      >
        <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
          edit_square
        </span>
        Manage
      </button>
    </td>
  </tr>
);

const OrderList: React.FC<{
  orders: OrderProps[];
  manageOrder: (order: OrderProps) => void;
  getOrders: () => void;
}> = ({ orders, manageOrder, getOrders }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof OrderProps;
    direction: string;
  } | null>(null);


  const sortedOrders = useMemo(() => {
    const sortableOrders = [...orders];
    if (sortConfig !== null) {
      sortableOrders.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue && bValue && aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue && bValue && aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [orders, sortConfig]);

  const requestSort = (key: keyof OrderProps) => {
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
                onClick={() => requestSort("customOrderId")}
              >
                Order ID
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("totalAmount")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Total
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("paymentStatus")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Payment Status
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("fulfillment")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Fulfillment
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer whitespace-nowrap px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("status")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Order Status
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>

              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("userEmail")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Customer
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("placedAt")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Order Date
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("trackingNo")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Tracking Number
              </th>
              <th className="rounded-r-lg px-6 text-left font-medium capitalize tracking-wider text-zinc-500">
                <span className="mr-2 rounded border-[1px]" />
                Manage
              </th>
            </tr>
          </thead>
          <tr>
            <td colSpan={8} className="h-2"></td>
          </tr>
          <tbody>
            {sortedOrders.map((order) => (
              <Row_Cells
                key={order._id}
                order={order}
                manageOrder={manageOrder}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderList;
