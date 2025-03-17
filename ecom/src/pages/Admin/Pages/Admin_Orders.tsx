import React, { useCallback, useEffect, useState } from "react";
import OrderList from "../Components/orders/OrderList";
import OrderFilters from "../Components/orders/OrderFilters";
import ManageOrder from "../Components/orders/ManageOrder";
import { FiltersProps, OrderProps } from "../Components/interface/interfaces";
import axiosInstance from "../Services/axiosInstance";
import { showToast } from "../Components/showToast";

const Admin_Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [manageOrder, setManageOrder] = useState<OrderProps | null>(null);
  const [filters, setFilters] = useState<FiltersProps>({
    status: [],
    paymentStatus: "",
    fulfillmentStatus: "",
    searchQuery: "",
    dateStart: null,
    dateEnd: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(orders.length / limit);

  const getOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/admin-get-orders", {
        params: { ...filters, currentPage, limit }
      });
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [filters, currentPage]);

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

  const getFilter = (filter: FiltersProps) => {
    setFilters(filter);
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:p-10">
      <h1 className="mb-2 text-xl font-bold tracking-wide">Order List</h1>
      <OrderFilters getFilter={getFilter} />
      <OrderList orders={orders} manageOrder={toggleManageOrder} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
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
