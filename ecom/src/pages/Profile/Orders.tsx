import React, { useState } from "react";
import OrderCard from "../../components/main/OrderCard";
import { useCallback, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import { OrderProps } from "../../interfaces/order";

const Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [orderStat, setOrderStat] = useState<"current" | "past" | "pending">(
    "current",
  );
  const getOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/get-my-orders?orderStatus=${orderStat}`,
      );
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [orderStat]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const handleOrderStat = (status: "current" | "past" | "pending") => {
    setOrderStat(status);
  };

  return (
    <>
      <div className="relative mb-2 mt-4 flex items-center justify-between border-b-[1px]">
        <div className="flex gap-2">
          <button type="button" onClick={() => handleOrderStat("current")}>
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${orderStat === "current" && "border-zinc-300 bg-zinc-200"}`}
            >
              Current {orderStat === "current" && "Orders"}
            </p>
          </button>
          <button type="button" onClick={() => handleOrderStat("pending")}>
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${orderStat === "pending" && "border-zinc-300 bg-zinc-200"}`}
            >
              Pending {orderStat === "pending" && "Orders"}
            </p>
          </button>
          <button type="button" onClick={() => handleOrderStat("past")}>
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${orderStat === "past" && "border-zinc-300 bg-zinc-200"}`}
            >
              Past {orderStat === "past" && "Orders"}
            </p>
          </button>
        </div>
      </div>
      <div className={`mb-4 flex h-full w-full flex-col gap-4`}>
        {orders.length > 0 ? (
          orders.map((order) => <OrderCard key={order._id} {...order} />)
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </>
  );
};

export default Orders;
