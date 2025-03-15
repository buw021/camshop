import React, { useState } from "react";
import { AddressInterface, CustomerProps } from "../interface/interfaces";
import CustomerAddress from "./CustomerAddress";
import CustomerOrderList from "./CustomerOrderList";
import CustomerCartList from "./CustomerCart";

const ManageCustomerInfo: React.FC<{
  customer: CustomerProps;
  customertList: CustomerProps[];
  setCustomer: (order: CustomerProps) => void;
  close: () => void;
}> = ({ customer, customertList, close, setCustomer }) => {
  const [toggleAddress, setToggleAddress] = useState<boolean>(true);
  const [toggleOrders, setToggleOrders] = useState<boolean>(true);
  const [toggleCart, setToggleCart] = useState<boolean>(false);
  const [toggleWishlist, setToggleWishlist] = useState<boolean>(false);
  const currentIndex = customertList.findIndex(
    (l_customer) => l_customer._id === customer._id,
  );
  const handleNextOrder = () => {
    if (currentIndex < customertList.length - 1) {
      setCustomer(customertList[currentIndex + 1]);
    }
  };
  const handlePreviousOrder = () => {
    if (currentIndex > 0) {
      setCustomer(customertList[currentIndex - 1]);
    }
  };
  const handleToggleAddress = () => {
    setToggleAddress(!toggleAddress);
  };
  const handleToggleOrders = () => {
    setToggleOrders(!toggleOrders);
  };

  const handleToggleCart = () => {
    setToggleCart(!toggleCart);
  };

  const handleToggleWishlist = () => {
    setToggleWishlist(!toggleWishlist);
  };
  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-full justify-center rounded-xl bg-zinc-900/20 backdrop-blur-sm sm:py-4">
      <div className="flex w-full flex-col gap-2 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:max-w-[800px] sm:p-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`material-symbols-outlined z-20 flex h-7 w-7 select-none items-center justify-center rounded-full bg-zinc-900/10 text-center text-xl text-zinc-800 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
              onClick={close}
            >
              close
            </span>
            <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
              {customer.firstName + customer.lastName || "Unset"}
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
              style={{
                opacity: currentIndex === customertList.length - 1 ? 0.5 : 1,
              }}
            >
              <span className="material-symbols-outlined absolute right-1 text-lg leading-3">
                arrow_forward_ios
              </span>
            </button>
          </div>
        </div>

        <div className="scrollbar-hide flex flex-col gap-2 overflow-y-auto rounded-lg border-y-[1px] border-zinc-100">
          <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
            <div className="mb-0.5 flex items-center justify-between">
              <h1 className="font-bold">Contact Information</h1>
            </div>
            <div className="mb-1 h-[1px] w-full bg-zinc-100"></div>

            <p className="mt-2.5 flex items-center justify-start gap-2 text-sm font-medium tracking-wide text-zinc-700">
              <span className="rounded-md border-[1px] border-blue-300 bg-blue-50 px-2 py-1 font-medium text-blue-800">
                {customer.email}
              </span>
              {customer.phoneNo && (
                <span className="rounded-md border-[1px] border-blue-300 bg-blue-50 px-2 py-1 font-medium text-blue-800">
                  {customer.phoneNo}
                </span>
              )}
            </p>
          </div>
          <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="font-bold">Orders</h1>
              </div>

              <button
                className="flex items-center rounded-md border-[1px] border-zinc-200 px-0.5 py-1.5 leading-3 drop-shadow-sm"
                onClick={handleToggleOrders}
              >
                <span className="material-symbols-outlined ml-0.5 text-lg leading-3">
                  {toggleOrders ? "expand_less" : "expand_more"}
                </span>
              </button>
            </div>
            {toggleOrders && <CustomerOrderList orders={customer.orders} />}
          </div>
          <div className="s flex flex-col gap-2">
            <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
              <div className="mb-0.5 flex items-center justify-between">
                <h1 className="font-bold">Cart</h1>
              </div>
              <button
                className="flex items-center rounded-md border-[1px] border-zinc-200 px-0.5 py-1.5 leading-3 drop-shadow-sm"
                onClick={handleToggleCart}
              >
                <span className="material-symbols-outlined ml-0.5 text-lg leading-3">
                  {toggleCart ? "expand_less" : "expand_more"}
                </span>
              </button>
              {toggleOrders && <CustomerCartList cart={customer.cart} />}
            </div>
          </div>
          <div className="scrollbar-hide flex flex-col gap-2">
            <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
              <div className="mb-0.5 flex items-center justify-between">
                <h1 className="font-bold">Wishlist</h1>
              </div>
              <div className="mb-1 h-[1px] w-full bg-zinc-100"></div>
              {/* WISHLIST  <OrderInfo
                orderItems={currentOrder.items}
                totalPrice={currentOrder.totalAmount}
                shippingCost={currentOrder.shippingCost}
                originalAmount={currentOrder.originalTotalAmount}
                couponUsed={currentOrder.promoCode || ""}
                paymentMethod={currentOrder.paymentMethod}
                shippingOption={currentOrder.shippingOption}
              /> */}
            </div>
          </div>
          <div className="w-full rounded-lg border-[1px] border-zinc-100 p-4 sm:max-w-[800px]">
            <div className="mb-2 flex items-center justify-between">
              <h1 className="font-bold">Shipping Address</h1>
              <button
                className="flex items-center rounded-md border-[1px] border-zinc-200 px-0.5 py-1.5 leading-3 drop-shadow-sm"
                onClick={handleToggleAddress}
              >
                <span className="material-symbols-outlined ml-0.5 text-lg leading-3">
                  {toggleAddress ? "expand_less" : "expand_more"}
                </span>
              </button>
            </div>

            <div
              className={`flex w-full flex-col gap-2 overflow-hidden transition-all duration-300 ease-linear`}
            >
              {toggleAddress &&
                customer.address.map((address: AddressInterface) => (
                  <CustomerAddress key={address._id} {...address} />
                ))}
            </div>
          </div>
        </div>
        <div className="flex w-full justify-between">
          {/* ADD BUTTON TO SEND or CREATE A LINK FOR CHANGE EMAIL OR PASSWORD */}
        </div>
      </div>
    </div>
  );
};

export default ManageCustomerInfo;
