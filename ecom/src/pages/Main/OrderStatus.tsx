import React, { useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";

const OrderStatus = () => {
  const getOrderStatus = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get("orderId");
      const response = await axiosInstance.get("/get-order-status", {
        params: {
          orderId,
        },
      });
      if (response.data) {
        console.log(response.data);
      } else {
        console.log("No data found");
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getOrderStatus();
  });

  return <div>Blank</div>;
};

export default OrderStatus;
