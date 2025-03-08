import React, { useCallback, useEffect, useState } from "react";
import OrderList from "../Components/orders/OrderList";
import OrderFilters from "../Components/orders/OrderFilters";
import ManageOrder from "../Components/orders/ManageOrder";
import { OrderProps } from "../Components/interface/interfaces";
import axiosInstance from "../Services/axiosInstance";
import { showToast } from "../Components/showToast";

const Admin_Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [manageOrder, setManageOrder] = useState<OrderProps | null>(null);

  const getOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/admin-get-orders");
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [setOrders]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const toggleManageOrder = (order: OrderProps) => {
    if (order) {
      setManageOrder(order);
    }
  };

  const closeManageOrder = () => {
    setManageOrder(null);
  };

  const updateOrderStatus = (
    action: string,
    trackingNo: string,
    trackingLink: string,
  ) => {
    if (manageOrder) {
      axiosInstance
        .post("/update-order-status", {
          orderId: manageOrder._id,
          customOrderId: manageOrder.customOrderId,
          trackingNo,
          trackingLink,
          action,
        })
        .then((response) => {
          if (response.data) {
            getOrders();
            showToast(response.data.message, "success");
            setManageOrder(response.data.order);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-10 ring-2 ring-zinc-300/70">
      <h1 className="mb-2 text-xl font-bold tracking-wide">Order List</h1>
      <OrderFilters />
      <OrderList
        orders={orders}
        getOrders={getOrders}
        manageOrder={toggleManageOrder}
      />
      {manageOrder && (
        <ManageOrder
          orders={orders}
          currentOrder={manageOrder}
          setManageOrder={setManageOrder}
          closeManageOrder={closeManageOrder}
          fulfillOrder={updateOrderStatus}
          shipOrder={updateOrderStatus}
          deliveredOrder={updateOrderStatus}
          updateTracking={updateOrderStatus}
        />
      )}
    </div>
  );
};

export default Admin_Orders;
