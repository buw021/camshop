import React from "react";
import { Link } from "react-router-dom";
import { slugify } from "../func/slugify";
import { ItemsProps } from "../../interfaces/order";

interface OrderInfoProps {
  orderItems: ItemsProps[];
  totalPrice: number;
  shippingCost: number;
  originalAmount: number;
  couponUsed?: string;
  paymentMethod: string;
  shippingOption: string;
}
const OrderInfo: React.FC<OrderInfoProps> = ({
  orderItems,
  totalPrice,
  shippingCost,
  originalAmount,
  couponUsed,
  paymentMethod,
  shippingOption,
}) => {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="products scrollbar-hide flex max-h-80 flex-col gap-4 overflow-auto pb-2">
        {orderItems?.map((item, index) => {
          const productSlug = slugify(item.name);
          return (
            <div
              key={index}
              className="flex items-center justify-between border-b-[1px] border-zinc-300 pb-4"
            >
              <Link
                to={`/product/${productSlug}_${item.productId}_${item.variantId}`}
                onClick={(e) => {
                  e.preventDefault();

                  window.open(
                    `/product/${productSlug}_${item.productId}_${item.variantId}`,
                    "_blank",
                  );
                }}
              >
                <div className="relative flex h-28 w-28 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                  <img
                    className="h-full object-scale-down p-2"
                    src={`http://localhost:3000/uploads/${item.variantImg}`}
                  ></img>
                </div>
              </Link>

              <div className="flex flex-col justify-between text-right text-zinc-700">
                <Link
                  to={`/product/${productSlug}_${item.productId}_${item.variantId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(
                      `/product/${productSlug}_${item.productId}_${item.variantId}`,
                      "_blank",
                    );
                  }}
                >
                  <h1 className="roboto-medium text-sm text-zinc-800 hover:underline">
                    {item.name} {item.variantName} {item.variantColor}
                  </h1>
                </Link>
                <span className="text-xs text-zinc-500 line-through">
                  € {item.price.toFixed(2)}
                </span>
                <p className="text-xs">
                  {item.quantity} x €{" "}
                  <span>
                    {item.discountedPrice && item.discountedPrice > 0
                      ? item.discountedPrice.toFixed(2)
                      : item.salePrice.toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-zinc-800">
                  Total: €{" "}
                  {(
                    item.quantity *
                    (item.discountedPrice && item.discountedPrice > 0
                      ? item.discountedPrice
                      : item.salePrice)
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
              {"-"} {(originalAmount - totalPrice).toFixed(2)}
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
          <span className="text-right">€ {totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
