import React from "react";
import { ItemsProps } from "../interface/interfaces";
import { productImgPath } from "../../Services/imgUrlPath";

interface OrderInfoProps {
  orderItems: ItemsProps[];
  totalPrice: number;
  shippingCost: number;
  originalAmount: number;
  couponUsed?: string;
  paymentMethod: string;
  shippingOption: string;
  paymentStatus: boolean;
}
const OrderInfo: React.FC<OrderInfoProps> = ({
  orderItems,
  totalPrice,
  shippingCost,
  originalAmount,
  couponUsed,
  paymentMethod,
  shippingOption,
  paymentStatus,
}) => {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="products scrollbar-hide flex max-h-80 flex-col gap-4 overflow-auto pb-2">
        {orderItems?.map((item, index) => {
          return (
            <div
              key={index}
              className="flex items-center justify-between border-b-[1px] border-zinc-300 pb-4"
            >
              <div className="relative flex h-28 w-28 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                <img
                  className="h-full object-scale-down p-2"
                  src={productImgPath + item.variantImg}
                ></img>
              </div>

              <div className="flex flex-col justify-between text-right text-zinc-700">
                <h1 className="roboto-medium text-sm text-zinc-800 hover:underline">
                  {item.name} {item.variantName} {item.variantColor}
                </h1>

                <span
                  className={`text-xs text-zinc-500 ${(item.salePrice || item.discountedPrice) && "line-through"}`}
                >
                  € {item.price.toFixed(2)}
                </span>
                <p className="text-xs">
                  {item.quantity} x €{" "}
                  <span>
                    {item.salePrice || item.discountedPrice
                      ? item.discountedPrice && item.discountedPrice > 0
                        ? item.discountedPrice.toFixed(2)
                        : item.salePrice.toFixed(2)
                      : item.price.toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-zinc-800">
                  Total: €{" "}
                  {(
                    item.quantity *
                    (item.salePrice || item.discountedPrice
                      ? item.discountedPrice && item.discountedPrice > 0
                        ? item.discountedPrice
                        : item.salePrice
                      : item.price)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex w-full flex-col self-start text-left text-sm">
        {couponUsed && (
          <>
            <div className="flex justify-between">
              <span className="text-xs">Coupon:</span>
              <span className="text-right uppercase"> {couponUsed}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="text-xs">Payment Method:</span>
          <span className="text-right capitalize">{paymentMethod}</span>
        </div>

        <div className="border-t-[1px] border-dashed border-zinc-400 pb-1"></div>
        <div className="flex justify-between">
          <span className="text-xs">Subtotal:</span>
          <span className="text-right"> € {originalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs">Discount: </span>{" "}
          {totalPrice && (
            <span className="text-right">
              {"-"}{" "}
              {(
                originalAmount -
                totalPrice +
                (paymentStatus ? shippingCost : 0)
              ).toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex justify-between">
          <span className="text-xs">
            Shipping:{" "}
            <span className="capitalize">{`(${shippingOption}) `}</span>
          </span>
          <span className="text-right">
            <span className="text-[10px]">+</span> {shippingCost.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between font-bold">
          <span className="">Total:</span>
          {paymentStatus
            ? totalPrice.toFixed(2)
            : (totalPrice + shippingCost).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
