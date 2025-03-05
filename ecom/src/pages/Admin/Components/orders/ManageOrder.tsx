import React from "react";
import { OrderProps } from "../interface/interfaces";
import OrderInfo from "../../../../components/main/OrderInfo";
import ProgressBar from "../../../../components/main/ProgressBar";
import { statusColor } from "../assets/statusColor";

interface ManageOrderProps {
  orders: OrderProps[];
  currentOrder: OrderProps;
  setManageOrder: (order: OrderProps) => void;
  closeManageOrder: () => void;
}

const ManageOrder: React.FC<ManageOrderProps> = ({
  orders,
  currentOrder,
  setManageOrder,
  closeManageOrder,
}) => {
  const currentIndex = orders.findIndex(
    (order) => order._id === currentOrder._id,
  );

  const handleNextOrder = () => {
    if (currentIndex < orders.length - 1) {
      setManageOrder(orders[currentIndex + 1]);
    }
  };

  const handlePreviousOrder = () => {
    if (currentIndex > 0) {
      setManageOrder(orders[currentIndex - 1]);
    }
  };

  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-full justify-center rounded-xl bg-zinc-900/20 py-4 backdrop-blur-sm">
      <div className="flex w-full flex-col gap-2 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:max-w-[800px] sm:p-12">
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

          <div className="flex items-center justify-center gap-0.5">
            <button
              className={`relative flex h-8 w-8 items-center justify-center rounded-l-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer`}
              onClick={handlePreviousOrder}
              style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
            >
              <span className="material-symbols-outlined absolute right-0.5 text-lg leading-3">
                arrow_back_ios
              </span>
            </button>
            <button
              className={`relative flex h-8 w-8 items-center justify-center rounded-r-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer`}
              onClick={handleNextOrder}
              style={{ opacity: currentIndex === orders.length - 1 ? 0.5 : 1 }}
            >
              <span className="material-symbols-outlined absolute right-1 text-lg leading-3">
                arrow_forward_ios
              </span>
            </button>
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
          <p className="text-sm font-medium tracking-wide text-zinc-500">
            Order <span className="text-zinc-700">{currentIndex + 1}</span> out
            of <span className="text-zinc-700">{orders.length}</span>
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
            className={`flex items-center justify-center rounded-xl border-[1px] text-sm font-medium ${currentOrder.fulfillment ? "h-6 border-blue-300 bg-blue-200 text-blue-800" : "border-zinc-300 bg-zinc-200 text-zinc-700"} px-2 py-0.5 drop-shadow-sm`}
          >
            {currentOrder.fulfillment ? "Fulfilled" : "Unfulfilled"}
          </span>
        </div>
        <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
          <ProgressBar label={currentOrder?.status || ""} />
        </div>

        <div className="flex max-h-[700px] flex-col gap-2 overflow-auto">
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

        <button
          className="relative self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
          disabled={currentOrder.fulfillment}
          /* onClick={() => handleSearch(search)} */
        >
          Fulfill Order
        </button>
      </div>
    </div>
  );
};

export default ManageOrder;
