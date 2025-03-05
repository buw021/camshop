import React, { useState } from "react";
import OrderList from "../Components/orders/OrderList";
import OrderFilters from "../Components/orders/OrderFilters";
import ManageOrder from "../Components/orders/ManageOrder";
import { OrderProps } from "../Components/interface/interfaces";

const Admin_Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [manageOrder, setManageOrder] = useState<OrderProps | null>(null);

  const toggleManageOrder = (order: OrderProps) => {
    if (order) {
      setManageOrder(order);
    }
  };

  const closeManageOrder = () => {
    setManageOrder(null);
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-10 ring-2 ring-zinc-300/70">
      <h1 className="mb-2 text-xl font-bold tracking-wide">Order List</h1>
      <OrderFilters />
      <OrderList
        orders={orders}
        setOrders={setOrders}
        manageOrder={toggleManageOrder}
      />
      {manageOrder && (
        <ManageOrder
          orders={orders}
          currentOrder={manageOrder}
          setManageOrder={setManageOrder}
          closeManageOrder={closeManageOrder}
        />
      )}
    </div>
  );
};

export default Admin_Orders;
