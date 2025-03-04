import React, { useState, useCallback, useEffect, useMemo } from "react";
import { OrderProps } from "../interface/interfaces";
import axiosInstance from "../../Services/axiosInstance";

const statusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-200 text-yellow-800 border-yellow-300";
    case "processed":
      return "bg-blue-200 text-blue-800 border-blue-300";
    case "shipped":
      return "bg-green-200 text-green-800 border-green-300";
    case "delivered":
      return "bg-green-200 text-green-800 border-green-300";
    case "cancelled":
      return "bg-red-200 text-red-800  border-red-300";
    default:
      return "bg-gray-200 text-gray-800 border-gray-300";
  }
};

const Row_Cells: React.FC<{ order: OrderProps }> = ({ order }) => (
  <tr className="border-b-2 hover:bg-zinc-100">
    <td className="flex items-center px-4 py-2">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
      />
    </td>
    <td className="pl-8 pr-6 text-left font-medium tracking-tight">
      {order.customOrderId}
    </td>
    <td className="pl-8 pr-6 text-left tracking-tight">
      € {order.totalAmount.toFixed(2)}
    </td>
    <td className="pl-8 pr-6 text-left text-xs font-medium capitalize">
      <div className="flex gap-2">
        <span
          className={`rounded-lg border-[1px] ${order.paymentStatus ? "border-green-300 bg-green-200 text-green-800" : "border-red-300 bg-red-200 text-red-800"} px-2 py-1 drop-shadow-sm`}
        >
          {order.paymentStatus ? "Paid" : "Unpaid"}
        </span>
      </div>
    </td>
    <td className="pl-8 pr-6 text-left text-xs font-medium capitalize">
      <div className="flex gap-2">
        <span
          className={`rounded-lg border-[1px] ${order.fulfillment ? "border-blue-300 bg-blue-200 text-blue-800" : "border-gray-300 bg-gray-200 text-gray-800"} px-2 py-1 drop-shadow-sm`}
        >
          {order.fulfillment ? "Fulfilled" : "Unfulfilled"}
        </span>
      </div>
    </td>
    <td className="pl-8 pr-6 text-left text-xs font-medium capitalize">
      <div className="flex gap-2">
        {order.status !== "cancelled" && order.paymentStatus && (
          <span
            className={`rounded-lg border-[1px] border-green-300 bg-green-200 px-2 py-1 text-green-800 drop-shadow-sm`}
          >
            Paid
          </span>
        )}
        <span
          className={`rounded-lg border-[1px] px-2 py-1 drop-shadow-sm ${statusColor(order.status)}`}
        >
          {order.status}
        </span>
      </div>
    </td>
    <td className="pl-8 pr-6 text-left">{order.userEmail}</td>
    <td className="pl-8 pr-6 text-left">
      {new Date(order.placedAt).toLocaleDateString()}
    </td>
    <td className="px-6 pl-8 pr-6 text-left">{order.trackingNo}</td>
    <td className="px-6 pl-8 text-left">
      <button className="rounded-lg border-[1px] border-zinc-300 bg-white py-1 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700">
        <span className="material-symbols-outlined absolute left-2 top-1.5 text-base leading-3">
          edit_square
        </span>
        Manage
      </button>
    </td>
  </tr>
);

const OrderList = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof OrderProps;
    direction: string;
  } | null>(null);

  const getOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/admin-get-orders");
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

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
              <th scope="col" className="rounded-l-lg px-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                  <label className="sr-only">checkbox</label>
                </div>
              </th>
              <th
                className="relative cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("customOrderId")}
              >
                <span className="mr-2 rounded border-[1px]"></span>
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
                onClick={() => requestSort("fulfuillment")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Fulfillment
                <span className="material-symbols-outlined absolute top-2 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
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
              <Row_Cells key={order._id} order={order} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderList;
