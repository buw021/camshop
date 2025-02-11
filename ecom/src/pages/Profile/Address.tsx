import React, { useCallback, useEffect, useState } from "react";
import { AddressInterface } from "../../interfaces/user";
import ModifyAddress from "./ModifyAddress";
import axiosInstance from "../../services/axiosInstance";
import NewAddress from "./NewAddress";

const AddressContent: React.FC<{
  checkout: boolean;
  selected?: (address: AddressInterface) => void;
  toggleClose?: () => void;
}> = ({ checkout, selected, toggleClose }) => {
  const [addresses, setAddresses] = useState<AddressInterface[]>([]);
  const [toggleEdit, setToggleEdit] = useState(false);
  const [toggleNewAddress, setToggleNewAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<AddressInterface | null>(
    null,
  );

  const getUserAddress = async () => {
    try {
      const response = await axiosInstance.get("/get-address");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAddress = useCallback(async () => {
    const userAddresses = await getUserAddress();
    const sortedAddresses = [
      ...userAddresses.filter((address: AddressInterface) => address.default),
      ...userAddresses.filter((address: AddressInterface) => !address.default),
    ];
    setAddresses(sortedAddresses);
  }, []);

  useEffect(() => {
    if (toggleNewAddress || toggleEdit) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [toggleNewAddress, toggleEdit]);

  useEffect(() => {
    fetchAddress();
  }, [fetchAddress]);

 

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

  const addNewAddress = async (newAddress: AddressInterface) => {
    try {
      const response = await axiosInstance.post("/save-new-address", {
        newAddress,
      });
      if (response.status === 200) {
        fetchAddress();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const modifyAddress = async (updatedAddress: AddressInterface) => {
    if (updatedAddress) {
     try {
      const updateAddress = await axiosInstance.post("/update-address", { updatedAddress});
      if (updateAddress.status === 200) {
        fetchAddress();
        setToggleEdit(false);
      }
    } catch (error) {
      console.log(error);
    }
    }
  };

  const handleRemove = async (addressId: string) => {
    try {
      if (addressId) {
        const deleteAddress = await axiosInstance.post("/delete-address", {
          addressId,
        });
        if (deleteAddress.status === 200) {
          fetchAddress();
        }
      }
    } catch (error) {
      console.error("Failed to remove address", error);
    }
  };

  const handleEdit = (address: AddressInterface) => {
    setCurrentAddress(address);
    setToggleEdit(!toggleEdit);
  };

  const handleNewAddress = () => {
    setToggleNewAddress(!toggleNewAddress);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative mb-2 flex items-center justify-between border-b-[1px]">
        <p className="roboto-medium text-lg">Shipping Address</p>
        <button
          className="rounded bg-zinc-500 px-2 py-0.5 text-xs text-white hover:bg-zinc-700"
          onClick={() => handleNewAddress()}
        >
          Add New Address
        </button>
      </div>
      {toggleNewAddress && (
        <>
          <div className="fixed inset-0 z-50 h-screen w-screen select-none bg-zinc-700/50">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <NewAddress
                toggleClose={handleNewAddress}
                onAddAddress={addNewAddress}
              ></NewAddress>
            </div>
          </div>
        </>
      )}
      {addresses.map((address, index) => (
        <div key={index}>
          {toggleEdit && currentAddress?._id === address._id && (
            <div className="fixed inset-0 z-50 h-screen w-screen select-none bg-zinc-700/20">
              <div className="flex h-full w-full flex-col items-center justify-center">
                <ModifyAddress
                  toggleClose={() => setToggleEdit(false)}
                  address={currentAddress}
                  modifiedAddress={modifyAddress}
                ></ModifyAddress>
              </div>
            </div>
          )}
          <div
            className="z-10 flex flex-col gap-1 rounded border-[1px] bg-white p-2 leading-3 hover:cursor-pointer hover:bg-zinc-100 sm:max-w-sm"
            onClick={(e) => {
              e.preventDefault();
              if (checkout) {
                selected?.(address);
                toggleClose?.();
              }
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
                className="z-40 rounded-full border-[1px] px-3 py-1 hover:cursor-pointer hover:border-zinc-400 hover:bg-zinc-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(address);
                }}
              >
                Modify
              </button>
              <button
                className="z-40 rounded-full border-[1px] px-3 py-1 hover:cursor-pointer hover:border-zinc-400 hover:bg-zinc-300"
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      "Are you sure you want to remove this address?",
                    )
                  ) {
                    address._id && handleRemove(address._id);
                  }
                }}
              >
                Remove
              </button>
              {!address.default && (
                <button
                  className="z-40 ml-auto self-end rounded-full border-[1px] px-2 py-1 leading-3 hover:cursor-pointer hover:border-zinc-400 hover:bg-zinc-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    address._id && handleSetDefault(address._id);

                    if (checkout) {
                      const updatedAddress = { ...address, default: true };
                      selected?.(updatedAddress);
                    }
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
