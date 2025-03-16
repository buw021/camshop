import { FC, useState } from "react";
import { OrderProps } from "../interface/interfaces";

import ManageOrder from "./ManageOrder";
import axiosInstance from "../../Services/axiosInstance";

const CustomerOrderList: FC<{
  orders: OrderProps[];
}> = ({ orders }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOrderID, setSearchOrderID] = useState<string>("");
  const [currentOrder, setCurrentOrder] = useState<OrderProps | null>(null);
  const filteredOrders = orders.filter((order) =>
    order.customOrderId.toLowerCase().includes(searchOrderID.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredOrders.length / 10);
  const indexOfLastProduct = currentPage * 10;
  const indexOfFirstProduct = indexOfLastProduct - 10;
  const currentOrders = filteredOrders.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  const closeManageOrder = () => {
    setCurrentOrder(null);
  };

  const getOrderData = async (orderId: string) => {
    try {
      const response = await axiosInstance.get("get-order-details", {
        params: { orderId },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  if (orders.length === 0) {
    return (
      <div
        className={`flex w-full flex-col justify-between gap-2 overflow-hidden rounded-lg py-4 text-center text-xs`}
      >
        <p>No Orders found</p>
      </div>
    );
  }

  const manageOrder = async (orderId: string | null) => {
    if (!orderId) return;
    const orderDetails = await getOrderData(orderId);
    if (orderDetails) setCurrentOrder(orderDetails);
  };

  return (
    <>
      {currentOrder && (
        <ManageOrder
          currentOrder={currentOrder}
          setManageOrder={setCurrentOrder}
          closeManageOrder={closeManageOrder}
        />
      )}
      <div className="mt-2 border-y-[1px] border-zinc-100 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex items-center">
            <input
              className="roboto-medium w-[15vw] min-w-[175px] rounded-md border-[1px] border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
              placeholder="Search"
              onChange={(e) => setSearchOrderID(e.target.value)}
              value={searchOrderID}
            />
            <span
              className={`material-symbols-outlined filled absolute right-2 mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
              onClick={() => {
                setSearchOrderID("");
              }}
            >
              cancel
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-md bg-zinc-800 px-2 py-[5px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
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
              className="rounded-md bg-zinc-800 px-2 py-[5px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
            >
              Next
            </button>
          </div>
        </div>
        <div
          className={`flex h-[400px] w-full flex-col justify-between gap-2 overflow-hidden rounded-lg py-2`}
        >
          <div className="flex flex-col gap-2">
            {currentOrders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between gap-2 rounded-lg border-[1px] border-zinc-100 px-2 py-1 hover:border-zinc-200 hover:bg-zinc-100"
              >
                <p className="text-sm font-medium leading-3 tracking-wide text-zinc-700">
                  {order.customOrderId}
                </p>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700"
                    onClick={() => manageOrder(order.orderId ?? null)}
                  >
                    <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
                      edit_square
                    </span>
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerOrderList;
