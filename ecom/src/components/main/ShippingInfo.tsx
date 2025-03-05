import React from "react";
import { AddressInterface } from "../../interfaces/user";

const ShippingInfo: React.FC<{ address: AddressInterface }> = ({ address }) => {
  return (
    <div className="relative mb-2 self-start border-y-[1px] py-1">
      <div className="flex items-center justify-between mb-0.5">
        <h1 className="font-bold">Shipping Address</h1>
      </div>
      <div className="mb-1 h-[1px] w-full bg-zinc-100"></div>
      <div className="flex flex-col">
        <p className="text-sm font-medium tracking-wide text-zinc-700">
          <strong>Name:</strong>{" "}
          <span className="font-normal">
            {address.firstName} {address.lastName}
          </span>
        </p>
        <p className="text-sm font-medium tracking-wide text-zinc-700">
          <strong>Address:</strong>{" "}
          <span className="font-normal">{address.address}</span>
        </p>
        <p className="text-sm font-medium tracking-wide text-zinc-700">
          <strong>City/State/Zip:</strong>{" "}
          <span className="font-normal">
            {address.city} {address.state} {address.zip}
          </span>
        </p>
        <p className="text-sm font-medium tracking-wide text-zinc-700">
          <strong>Country:</strong>{" "}
          <span className="font-normal">{address.country}</span>
        </p>
        <p className="text-sm font-medium tracking-wide text-zinc-700">
          <strong>Phone:</strong>{" "}
          <span className="font-normal">{address.phoneNo}</span>
        </p>
      </div>
    </div>
  );
};

export default ShippingInfo;
