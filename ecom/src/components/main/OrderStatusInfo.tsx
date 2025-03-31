import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import ProgressBar from "./ProgressBar";
import { stripePromise } from "../../utils/stripe";
import { showToast } from "../../func/showToast";
import axios from "axios";
import OrderInfo from "./OrderInfo";
import { ItemsProps } from "../../interfaces/order";
import ShippingInfo from "./ShippingInfo";
import { AddressInterface } from "../../interfaces/user";

interface OrderProps {
  createdAt: string;
  shippingAddress: AddressInterface;
  customOrderId: string;
  discountAmount: number;
  items: [ItemsProps];
  originalTotalAmount: number;
  paymentMethod: string;
  paymentUrl: string;
  placedAt: string;
  promoCode: string | null;
  shippingCost: number;
  shippingOption: string;
  status: string;
  paymentStatus: boolean;
  totalAmount: number;
  trackingNo: string | null;
  receiptLink: string | null;
  _id: string;
}

const OrderStatusInfo = () => {
  const [order, setOrder] = useState<OrderProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  const payNowButton = document.getElementById("pay-now");
  const refundButton = document.getElementById("return-refund");
  const cancelButton = document.getElementById("cancel-order");

  const PayNow = () => {
    payNowButton?.removeAttribute("disabled");
    payNowButton?.classList.remove("pulse");
    payNowButton!.textContent = "Pay Now";
  };

  const Refund = () => {
    refundButton?.removeAttribute("disabled");
    refundButton?.classList.remove("pulse");
    refundButton!.textContent = "Return/Refund";
  };

  const CancelOrder = () => {
    cancelButton?.removeAttribute("disabled");
    cancelButton?.classList.remove("pulse");
    cancelButton!.textContent = "Cancel Order";
  };

  const Processing = (button: HTMLElement) => {
    button?.setAttribute("disabled", "true");
    button?.classList.add("pulse");
    button!.textContent = "Processing...";
  };

  const getOrderStatus = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get("orderId");
      const response = await axiosInstance.get("/get-order-status", {
        params: {
          orderId,
        },
      });
      if (response.data) {
        setOrder(response.data);
      } else {
        setNoData(true);
      }
    } catch (error) {
      console.error(error);
      setNoData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getOrderStatus();
  }, [getOrderStatus]);

  const handlePayNow = async (orderId: string) => {
    if (!orderId) return;
    try {
      const response = await axiosInstance.post(
        "/create-new-checkout-session",
        {
          orderId,
        },
      );

      if (response.status !== 200) {
        PayNow();
        throw new Error(response.data.error);
      }

      const stripe = await stripePromise;
      const sessionId = response.data.id;

      if (!sessionId) {
        PayNow();
        throw new Error("Session ID not found in response");
      }

      // Redirect to Stripe Checkout
      const result = await stripe?.redirectToCheckout({
        sessionId: sessionId,
      });

      if (result?.error) {
        PayNow();
        console.error(result.error.message); // Handle error as needed
      }
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        typeof error.response.data === "object"
      ) {
        const errorMessage = error.response.data.error;
        console.log(errorMessage);
        PayNow();
        showToast(errorMessage, "error");
      }
    }
  };

  const handleCancelOrder = async (orderId: string, action: string) => {
    if (!orderId) return;
    try {
      const response = await axiosInstance.post("/order-cancel-refund", {
        orderId,
        action,
      });
      if (response.status === 200) {
        showToast(response.data.message, "success");
        getOrderStatus();
        CancelOrder();
        Refund();
      } else {
        showToast(response.data.error, "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOrderReceived = async (orderId: string) => {
    if (!order) return;
    try {
      const response = await axiosInstance.post("/order-received", { orderId });
      if (response.status === 200) {
        showToast(response.data.message, "success");
        getOrderStatus();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (noData) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [noData]);

  if (loading) {
    return <></>;
  }

  if (noData) {
    return (
      <div className="flex items-center justify-center gap-2">
        <p className="text-lg font-medium tracking-wide">
          Cannot find order number. Redirecting to home page
        </p>
        <div
          className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-zinc-900 motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <button
        id="my-orders"
        name="my-orders"
        className="roboto-medium max-w-40 self-start rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:bg-zinc-700"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          window.location.href = "/my-orders";
        }}
      >
        My Order/s
      </button>

      <p className="text-normal font-medium capitalize tracking-wide">
        Order Status:{" "}
        <span className="underline">
          {order?.status
            ? order.status === "pending"
              ? "waiting for payment"
              : order.status
            : ""}
        </span>{" "}
      </p>

      <div className="flex w-full items-center rounded-md border-[1px] px-2 py-1 sm:max-w-[800px] sm:flex-col sm:px-4 sm:py-2.5">
        <ProgressBar label={order?.status || ""} />
      </div>
      <div className="flex w-full flex-col justify-between gap-1 self-start">
        <h3 className="self-start text-xl font-medium tracking-normal">
          ORDER #:{" "}
          <span className="font-bold uppercase tracking-normal">
            {order?.customOrderId}
          </span>
        </h3>
        <div className="self-start">
          <p className="text-sm font-medium tracking-wide">
            Payment Status:{" "}
            {order?.paymentStatus ? (
              <span className="text-green-600">Paid</span>
            ) : (
              <span className="text-yellow-600">Unpaid</span>
            )}
          </p>
        </div>
        {/* Render order details here */}
        <div className="mb-2 self-start">
          <p className="text-sm font-medium tracking-wide">
            Tracking No:{" "}
            {order?.trackingNo ? (
              <span className="uppercase text-zinc-600 hover:underline">
                {order.trackingNo}
              </span>
            ) : (
              <span className="ml-1 font-normal uppercase">not available</span>
            )}
          </p>
        </div>

        {order && (
          <>
            <ShippingInfo address={order?.shippingAddress}></ShippingInfo>
            <OrderInfo
              orderItems={order.items}
              totalPrice={order.totalAmount}
              shippingCost={order.shippingCost}
              originalAmount={order.originalTotalAmount}
              couponUsed={order.promoCode || ""}
              paymentMethod={order.paymentMethod}
              shippingOption={order.shippingOption}
            />
          </>
        )}
        <div
          className={`flex w-full ${order?.status === "pending" || order?.status === "shipped" ? "justify-between" : "justify-end"} gap-2`}
        >
          {["ordered", "pending"].includes(order?.status || "") && (
            <button
              id="cancel-order"
              name="cancel-order"
              className="roboto-medium rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:bg-zinc-700"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!order) return;
                if (order.status === "pending" || order.status === "ordered") {
                  if (
                    window.confirm(
                      "Are you sure you want to cancel this order?",
                    )
                  ) {
                    if (cancelButton) {
                      Processing(cancelButton);
                    }
                    handleCancelOrder(order.customOrderId, "cancel");
                  }
                }
              }}
            >
              Cancel Order {order?.status === "ordered" ? "/ Refund" : ""}
            </button>
          )}
          {order?.status === "shipped" && (
            <button
              id="cancel-order"
              name="cancel-order"
              className="roboto-medium rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:bg-zinc-700"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                showToast(
                  "Cannot cancel when Order has been shipped. Contact Customer Support for more information",
                  "warning",
                );
                if (!order) return;
              }}
            >
              Cancel Order
            </button>
          )}
          {order?.status === "shipped" && (
            <button
              id="cancel-order"
              name="cancel-order"
              className="roboto-medium rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:bg-zinc-700"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (
                  window.confirm(
                    "Already received the order? Click OK to confirm",
                  )
                ) {
                  handleOrderReceived(order.customOrderId);
                }
              }}
            >
              Order Received
            </button>
          )}

          {["payment failed", "pending"].includes(order?.status || "") && (
            <button
              id="pay-now"
              name="pay-now"
              className="roboto-medium max-w-40 rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:bg-zinc-700"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (order?.customOrderId) {
                  if (payNowButton) {
                    Processing(payNowButton);
                  }
                  handlePayNow(order.customOrderId);
                }
              }}
            >
              Pay Now
            </button>
          )}

          {order?.status === "delivered" && (
            <button
              id="return-refund"
              name="return-refund"
              className="roboto-medium max-w-40 self-end rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:bg-zinc-700"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!order) return;
                if (order.status === "delivered") {
                  if (
                    window.confirm(
                      "Are you sure you want to return/refund this order?",
                    )
                  ) {
                    if (refundButton) {
                      Processing(refundButton);
                    }
                    handleCancelOrder(order.customOrderId, "return");
                  }
                }
              }}
            >
              Return/Refund
            </button>
          )}
          {order?.paymentStatus && (
            <a
              href={`${order.receiptLink}`}
              target="_blank"
              className="roboto-medium max-w-40 self-end rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:cursor-pointer hover:bg-zinc-700"
            >
              View Receipt
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusInfo;
