import { useCallback, useEffect, useState } from "react";
import OrderList from "../Components/orders/OrderList";
import OrderFilters from "../Components/orders/OrderFilters";

import { FiltersProps, OrderProps } from "../Components/interface/interfaces";
import axiosInstance from "../Services/axiosInstance";

import { PageButtons } from "../../../components/main/Buttons";
import ManageOrder from "../Components/orders/ManageOrder";

const Admin_Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentOrder, setCurrentOrder] = useState<OrderProps | null>();
  const [manageOrderInfos, setManageOrderInfos] = useState<{
    nextId: string | null;
    prevId: string | null;
    currentOrderIndex: number;
    totalOrders: number;
  }>({
    nextId: null,
    prevId: null,
    currentOrderIndex: 0,
    totalOrders: 0,
  });
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
  const getOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/admin-get-orders", {
        params: { ...filters, currentPage, limit },
      });
      if (response.data) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.log(error);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getFilter = (filter: FiltersProps) => {
    setFilters(filter);
  };


  const closeManageOrder = () => {
    setCurrentOrder(null);
  };

  const fetchOrderData = async (orderId: string) => {
    try {
      const response = await axiosInstance.get("/fetch-order-data", {
        params: { ...filters, orderId },
      });
      if (response.data) {
        setCurrentOrder(response.data.currentOrder);
        setManageOrderInfos({
          nextId: response.data.nextOrder,
          prevId: response.data.previousOrder,
          currentOrderIndex: response.data.currentOrderIndex,
          totalOrders: response.data.totalOrders,
        });
        console.log(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch order data:", error);
    }
  };

  const nextPage = async () => {
    if (!manageOrderInfos.nextId) return; // Prevent navigating if no next order
    await fetchOrderData(manageOrderInfos.nextId);
  };

  const prevPage = async () => {
    if (!manageOrderInfos.prevId) return; // Prevent navigating if no previous order
    await fetchOrderData(manageOrderInfos.prevId);
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:p-10">
      <h1 className="mb-2 text-xl font-bold tracking-wide">Order List</h1>
      <OrderFilters getFilter={getFilter} />
      <OrderList orders={orders} manageOrder={fetchOrderData} />
      <div className="flex justify-center">
        <PageButtons
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
      {currentOrder && (
        <ManageOrder
          order={currentOrder}
          close={closeManageOrder}
          nextPage={nextPage}
          prevPage={prevPage}
          fetchOrder={fetchOrderData}
          currentOrderIndex={manageOrderInfos.currentOrderIndex}
          totalOrders={manageOrderInfos.totalOrders}
          getOrders={getOrders}
        ></ManageOrder>
      )}
    </div>
  );
};

export default Admin_Orders;
