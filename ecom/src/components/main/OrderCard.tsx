import React from "react";
import { Link } from "react-router-dom";
import { slugify } from "../func/slugify";

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

const OrderCard: React.FC<OrderProps> = ({
  createdAt,
  customOrderId,
  discountAmount,
  items = [],
  originalTotalAmount,
  placedAt,
  status,
  totalAmount,
  _id,
}) => {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-zinc-50 p-4">
      <div className="flex items-center justify-between">
        <Link to={`/order-status?orderId=${customOrderId}`} className="text-base font-semibold leading-3 ">
          Order <span className="underline hover:text-zinc-700">{customOrderId}</span>
        </Link>
        <p className="text-sm capitalize leading-3 font-medium">{status}</p>
      </div>
      <p className="text-xs leading-3">
        {new Date(createdAt).toLocaleDateString("en-GB")}
      </p>
      <div className="relative flex flex-col items-center justify-between gap-3 pt-1">
        {items.map((item, index) => {
          const productName = slugify(item.name);
          return (
            <div key={index + customOrderId} className="flex w-full gap-2">
              <Link
                to={`/product/${productName}_${item.productId}_${item.variantId}`}
                target="_blank"
              >
                <div className="relative flex h-24 w-24 select-none flex-col justify-center overflow-hidden rounded-lg border-zinc-500 shadow-inner">
                  <div className="absolute z-10 h-full w-full hover:cursor-pointer hover:bg-black/10"></div>
                  <div className="absolute h-full w-full bg-zinc-500/5"></div>
                  <img
                    className="h-full object-scale-down px-4 py-4"
                    src={`http://localhost:3000/uploads/${item.variantImg}`}
                  ></img>
                </div>
              </Link>
              <div className="flex w-full flex-col justify-between gap-1 py-2">
                <div className="flex w-full max-w-44 flex-col flex-wrap gap-1">
                  <p className="text-sm font-medium leading-4">{item.name} {item.variantName}</p>
                  <p className="text-xs leading-3">{item.variantColor}</p>
                </div>
                <div className="flex w-full items-center justify-between">
                  <p className="text-xs">Qty: {item.quantity}</p>
                  <p className="text-xs">
                    €{" "}
                    {(item.salePrice ? item.salePrice : item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t-[1px] border-zinc-200 pb-1"></div>
      <div className="flex items-center justify-between">
        <p className="text-xs leading-3">Total Items : {items.length}</p>
        <p className="flex items-center gap-1">
          <span className="text-xs leading-3">Total :</span>{" "}
          <span className="text-base font-medium leading-3">
            € {totalAmount}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
