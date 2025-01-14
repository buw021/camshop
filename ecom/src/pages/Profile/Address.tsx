import React, { useEffect, useState } from "react";
import { Address } from "../../interfaces/user";
import ModifyAddress from "./ModifyAddress";
import axiosInstance from "../../services/axiosInstance";

const AddressContent: React.FC<{
  userAddresses: Address[];
  onDeleteAddress: (addressId: string) => void;
  onModifyAddress: (address: Address) => void;
}> = ({ userAddresses, onDeleteAddress, onModifyAddress }) => {
  const [addresses, setAddresses] = useState<Address[]>(userAddresses);
  const [toggleEdit, setToggleEdit] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  useEffect(() => {
    const sortedAddresses = [
      ...userAddresses.filter((address) => address.default),
      ...userAddresses.filter((address) => !address.default),
    ];
    setAddresses(sortedAddresses);
  }, [userAddresses]);

  const updateAddress = async (updatedAddresses: Address[]) => {
    try {
      await axiosInstance.post("/update-address", { updatedAddresses });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await axiosInstance.post("/set-address-default", {
        addressId,
      });
      if (response.status === 200) {
        const updatedAddresses = addresses.map((address) => ({
          ...address,
          default: address._id === addressId,
        }));
        const sortedAddresses = [
          ...updatedAddresses.filter((address) => address.default),
          ...updatedAddresses.filter((address) => !address.default),
        ];
        setAddresses(sortedAddresses);
      }
    } catch (error) {
      console.error("Failed to set default address", error);
    }
  };

  const handleRemove = async (addressId: string) => {
    if (addressId) {
      const updatedAddresses = addresses.filter(
        (address) => !(address._id === addressId),
      );
      onDeleteAddress(addressId);
      setAddresses(updatedAddresses);
      updateAddress(updatedAddresses);
    }
  };

  const handleEdit = (address: Address) => {
    setCurrentAddress(address);
    setToggleEdit(!toggleEdit);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {addresses.map((address, index) => (
        <div key={index}>
          {toggleEdit && currentAddress?._id === address._id && (
            <div className="fixed inset-0 z-50 h-screen w-screen select-none bg-zinc-700/20">
              <div className="flex h-full w-full flex-col items-center justify-center">
                <ModifyAddress
                  toggleClose={() => setToggleEdit(false)}
                  address={currentAddress}
                  modifiedAddress={onModifyAddress}
                ></ModifyAddress>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1 rounded border-[1px] p-2 leading-3 sm:max-w-sm">
            {address.default && (
              <p className="roboto-medium border-b-[1px] text-xs text-zinc-500">
                Default Address
              </p>
            )}
            <p className="roboto-medium text-sm leading-3 tracking-wider">
              {address.firstName} {address.lastName}
            </p>

            <p className="flex flex-col gap-1 text-xs leading-3">
              <span>{address.address.split("_").join(" ")}</span>
              <span>
                {address.city}, {address.state}
              </span>
              <span>{address.zip}</span>
              <span>{address.country}</span>
              <span>Phone Number: {address.phoneNo}</span>
            </p>
            <div className="my-1 flex items-center gap-1 text-xs leading-3">
              <button
                className="rounded-full border-[1px] px-3 py-1 hover:cursor-pointer hover:border-zinc-400 hover:bg-zinc-300"
                onClick={() => handleEdit(address)}
              >
                Modify
              </button>
              <button
                className="rounded-full border-[1px] px-3 py-1 hover:cursor-pointer hover:border-zinc-400 hover:bg-zinc-300"
                onClick={() => {
                  address._id && handleRemove(address._id);
                }}
              >
                Remove
              </button>
              {!address.default && (
                <button
                  className="ml-auto self-end rounded-full border-[1px] px-2 py-1 leading-3 hover:cursor-pointer hover:border-zinc-400 hover:bg-zinc-300"
                  onClick={() => {
                    address._id && handleSetDefault(address._id);
                  }}
                >
                  Set as Default Address
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressContent;
