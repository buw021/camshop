import React from "react";
import { AddressInterface } from "../../interfaces/user";

const SFAddress: React.FC<{
  address: AddressInterface;
  toggleEditAddress: () => void;
}> = ({
  address,
  toggleEditAddress,
}) => {

  if (!address) {
    return (
      <div
        className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-[1px] border-zinc-50 p-4 group hover:cursor-pointer hover:border-zinc-200 hover:bg-zinc-100"
        onClick={(e) => {
          e.preventDefault();
          toggleEditAddress();
        }}
      >
        <p className="text-lg font-medium">No address available</p>
        <button
          type="button"
          className="h-5 rounded-full border-[1px] px-3 text-xs leading-3 group-hover:cursor-pointer group-hover:border-zinc-400 group-hover:bg-zinc-300"
          onClick={(e) => {
            e.preventDefault();
            toggleEditAddress();
          }}
        >
          Add an Address
        </button>
      </div>
    );
  }


  return (
    <>
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center gap-2 self-start">
          <span className="text-lg font-medium tracking-wide">
            Shipping Address
          </span>
          <button
            type="button"
            className="h-5 rounded-full border-[1px] px-3 text-xs leading-3 hover:cursor-pointer hover:border-zinc-400 hover:bg-zinc-300"
            onClick={(e) => {
              e.preventDefault;
              toggleEditAddress();
            }}
          >
            Select
          </button>
        </div>

        <div
          className="flex flex-col gap-1 rounded border-[1px] p-2 leading-3 hover:cursor-pointer hover:bg-zinc-50 focus:bg-zinc-100 active:bg-zinc-100 sm:max-w-sm"
          onClick={(e) => {
            e.preventDefault;
            toggleEditAddress();
          }}
        >
          {address.default && (
            <p className="roboto-medium border-b-[1px] text-xs text-zinc-500">
              Default Address
            </p>
          )}
          <p className="roboto-medium text-sm leading-3 tracking-wider">
            {address.firstName} {address.lastName}
          </p>
          <div className="h-[2px] w-full rounded-full bg-zinc-300"></div>
          <p className="flex flex-col gap-1 text-xs leading-3">
            <span>{address.address.split("_").join(" ")}</span>
            <span>
              {address.city}, {address.state}
            </span>
            <span>{address.zip}</span>
            <span>{address.country}</span>
            <span>Phone Number: {address.phoneNo}</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default SFAddress;
