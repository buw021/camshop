import React, { useState } from "react";
import { OrderProps } from "../interface/interfaces";

import ProgressBar from "../../../../components/main/ProgressBar";
import { statusColor } from "../assets/statusColor";
import { showToast } from "../showToast";
import OrderInfo from "../orders/OrderInfo";
import axiosInstance from "../../Services/axiosInstance";

interface ManageOrderProps {
  currentOrder: OrderProps;
  setManageOrder: (order: OrderProps) => void;
  closeManageOrder: () => void;
}

const ManageOrder: React.FC<ManageOrderProps> = ({
  currentOrder,
  setManageOrder,
  closeManageOrder,
}) => {
  const [trackingNo, setTrackingNo] = useState(currentOrder.trackingNo || "");
  const [trackingLink, setTrackingLink] = useState(
    currentOrder.trackingLink || "",
  );

  const updateOrderStatus = (
    action: string,
    trackingNo: string,
    trackingLink: string,
  ) => {
    if (currentOrder) {
      axiosInstance
        .post("/update-order-status", {
          orderId: currentOrder._id,
          customOrderId: currentOrder.customOrderId,
          trackingNo,
          trackingLink,
          action,
        })
        .then((response) => {
          if (response.data) {
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
    <div className="absolute left-0 top-0 z-20 flex h-full w-full justify-center rounded-xl sm:py-4">
      <div className="flex w-full flex-col gap-2 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:max-w-[800px] sm:p-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap items-center sm:gap-2">
            <span
              className={`material-symbols-outlined z-20 flex h-7 w-7 select-none items-center justify-center rounded-full bg-zinc-900/10 text-center text-xl text-zinc-800 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
              onClick={closeManageOrder}
            >
              close
            </span>
            <h1 className="text-lg font-medium tracking-tight sm:text-3xl">
              {currentOrder.customOrderId}
            </h1>
          </div>
        </div>

        <div className="ml-0.5 flex w-full items-center justify-between">
          <p className="text-sm font-medium tracking-wide text-zinc-500">
            Order date{" "}
            <span className="text-zinc-700">
              {new Date(currentOrder.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-zinc-700">Status: </p>
          <span
            className={`flex items-center justify-center rounded-xl border-[1px] text-sm font-medium ${statusColor(currentOrder.status)} px-2 py-0.5 capitalize drop-shadow-sm`}
          >
            {currentOrder.status}
          </span>
          <span
            className={`flex items-center justify-center rounded-xl border-[1px] text-sm font-medium ${currentOrder.paymentStatus ? "border-green-300 bg-green-200 text-green-800" : "border-orange-300 bg-orange-200 text-orange-800"} px-2 py-0.5 drop-shadow-sm`}
          >
            {currentOrder.paymentStatus ? "Paid" : "Unpaid"}
          </span>
          <span
            className={`flex items-center justify-center rounded-xl border-[1px] text-sm font-medium ${currentOrder.fulfilled ? "border-blue-300 bg-blue-200 text-blue-800" : "border-zinc-300 bg-zinc-200 text-zinc-700"} px-2 py-0.5 drop-shadow-sm`}
          >
            {currentOrder.fulfilled ? "Fulfilled" : "Unfulfilled"}
          </span>
        </div>

        <div className="scrollbar-hide flex flex-col gap-2 overflow-y-auto rounded-lg border-y-[1px] border-zinc-100">
          <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
            <ProgressBar label={currentOrder?.status || ""} />
          </div>

          <div className="scrollbar-hide flex flex-col gap-2">
            <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
              <OrderInfo
                orderItems={currentOrder.items}
                totalPrice={currentOrder.totalAmount}
                shippingCost={currentOrder.shippingCost}
                originalAmount={currentOrder.originalTotalAmount}
                couponUsed={currentOrder.promoCode || ""}
                paymentMethod={currentOrder.paymentMethod}
                shippingOption={currentOrder.shippingOption}
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="insert-tracking-no "
                className="text-xs font-medium leading-3 tracking-wide"
              >
                Tracking Number
              </label>
              <input
                className="roboto-medium w-full rounded-md border-2 border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
                onChange={(e) => setTrackingNo(e.target.value)}
                value={trackingNo}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="insert-tracking-link"
                className="text-xs font-medium leading-3 tracking-wide"
              >
                Tracking Link
              </label>
              <input
                className="roboto-medium w-full rounded-md border-2 border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
                onChange={(e) => setTrackingLink(e.target.value)}
                value={trackingLink}
              />
            </div>
            <div className="flex w-full justify-between">
              {currentOrder.trackingLink && (
                <a
                  className="relative mt-2 cursor-pointer self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
                  href={currentOrder.trackingLink}
                  target="_blank"
                >
                  Track Order
                </a>
              )}
              {(currentOrder.status === "shipped" ||
                currentOrder.status === "processed") && (
                <button
                  className="relative mt-2 self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
                  onClick={() => {
                    if (
                      trackingNo === currentOrder.trackingNo &&
                      trackingLink === currentOrder.trackingLink
                    ) {
                      return;
                    }
                    if (
                      window.confirm(
                        "Are you sure you want to update the tracking information?",
                      )
                    ) {
                      updateOrderStatus(
                        "updateTracking",
                        trackingNo,
                        trackingLink,
                      );
                    }
                  }}
                >
                  Update Tracking
                </button>
              )}
            </div>
          </div>
          <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
            <div className="mb-0.5 flex items-center justify-between">
              <h1 className="font-bold">Shipping Address</h1>
            </div>
            <div className="mb-1 h-[1px] w-full bg-zinc-100"></div>
            <div className="flex flex-col">
              <p className="text-sm font-medium tracking-wide text-zinc-700">
                <strong>Name:</strong>{" "}
                <span className="font-normal">
                  {currentOrder.shippingAddress.firstName}{" "}
                  {currentOrder.shippingAddress.lastName}
                </span>
              </p>
              <p className="text-sm font-medium tracking-wide text-zinc-700">
                <strong>Address:</strong>{" "}
                <span className="font-normal">
                  {currentOrder.shippingAddress.address}
                </span>
              </p>
              <p className="text-sm font-medium tracking-wide text-zinc-700">
                <strong>City/State/Zip:</strong>{" "}
                <span className="font-normal">
                  {currentOrder.shippingAddress.city},{" "}
                  {currentOrder.shippingAddress.state},{" "}
                  {currentOrder.shippingAddress.zip}
                </span>
              </p>
              <p className="text-sm font-medium tracking-wide text-zinc-700">
                <strong>Country:</strong>{" "}
                <span className="font-normal">
                  {currentOrder.shippingAddress.country}
                </span>
              </p>
              <p className="text-sm font-medium tracking-wide text-zinc-700">
                <strong>Phone:</strong>{" "}
                <span className="font-normal">
                  {currentOrder.shippingAddress.phoneNo}
                </span>
              </p>
            </div>
          </div>
          <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
            <div className="mb-0.5 flex items-center justify-between">
              <h1 className="font-bold">Contact Information</h1>
            </div>
            <div className="mb-1 h-[1px] w-full bg-zinc-100"></div>

            <p className="mt-2.5 flex items-center justify-start text-sm font-medium tracking-wide text-zinc-700">
              <span className="rounded-md border-[1px] border-blue-300 bg-blue-50 px-2 py-1 font-medium text-blue-800">
                {currentOrder.userEmail}
              </span>
            </p>
          </div>
        </div>
        <div className="flex w-full justify-between">
          {currentOrder.status !== "shipped" &&
            currentOrder.status !== "delivered" && (
              <button
                className="relative self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
                disabled={
                  currentOrder.status === "shipped" ||
                  currentOrder.status === "delivered"
                }
              >
                Cancel Order
              </button>
            )}
          {!currentOrder.fulfilled && currentOrder.status === "ordered" && (
            <button
              className="relative self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to fulfill this order?")
                ) {
                  updateOrderStatus("fulfill", trackingLink, trackingNo);
                }
              }}
            >
              Fulfill Order
            </button>
          )}
          {!currentOrder.fulfilled &&
            currentOrder.status === "refund on process" && (
              <button
                className="relative self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to refund this order?",
                    )
                  ) {
                    console.log("refunding");
                  }
                }}
              >
                Refund
              </button>
            )}
          {currentOrder.fulfilled && currentOrder.status !== "shipped" && (
            <button
              className="relative self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
              onClick={() => {
                if (!trackingNo || !trackingLink) {
                  showToast(
                    "Please fill in the tracking number and link",
                    "error",
                  );
                  return;
                }
                if (window.confirm("Update status to shipped?")) {
                  updateOrderStatus("shipped", trackingNo, trackingLink);
                }
              }}
            >
              Ship Order
            </button>
          )}

          {currentOrder.fulfilled && currentOrder.status === "shipped" && (
            <button
              className="relative self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
              onClick={() => {
                if (!trackingNo || !trackingLink) {
                  showToast(
                    "Please fill in the tracking number and link",
                    "error",
                  );
                  return;
                }
                updateOrderStatus("delivered", trackingNo, trackingLink);
              }}
            >
              Order Delivered
            </button>
          )}

          {currentOrder.fulfilled && currentOrder.status === "delivered" && (
            <button
              className="relative self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
              onClick={() => {
                if (!trackingNo || !trackingLink) {
                  showToast(
                    "Please fill in the tracking number and link",
                    "error",
                  );
                  return;
                }
              }}
            >
              Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageOrder;
