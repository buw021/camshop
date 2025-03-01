import React, { useState } from "react";
import OrderCard from "../../components/main/OrderCard";
import { useCallback, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";


interface ItemsProps {
  createdAt: string;
  discountedPrice: number | null;
  isOnSale: boolean;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  salePrice: number;
  updatedAt: string;
  variantColor: string;
  variantId: string;
  variantImg: string;
  variantName: string;
}
interface OrderProps {
  createdAt: string;
  customOrderId: string;
  discountAmount: number;
  items: [ItemsProps];
  originalTotalAmount: number;
  placedAt: string;
  status: string;
  totalAmount: number;
  _id: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const getOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-my-orders");
      if (response.data) {
        console.log(response.data); // Log orders after fetching
        setOrders(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  return (
    <div className={`flex h-full w-full flex-col gap-4`}>
      {orders.map((order) => (
        <OrderCard key={order._id} {...order} />
      ))}
    </div>
  );
};

export default Orders;
