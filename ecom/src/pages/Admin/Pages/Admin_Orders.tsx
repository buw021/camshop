import React from "react";
import OrderList from "../Components/orders/OrderList";
import OrderFilters from "../Components/orders/OrderFilters";

const Admin_Orders = () => {
  return (
    <div className="relative flex h-full w-full flex-col rounded-xl bg-white p-10 ring-2 ring-zinc-300/70 gap-1">
      <h1 className="mb-2 text-xl font-bold tracking-wide">Order List</h1>
      <OrderFilters></OrderFilters>
      <OrderList></OrderList>
    </div>
  );
};

export default Admin_Orders;
