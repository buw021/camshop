import React, { useEffect, useState } from "react";
import { AddressInterface } from "../../interfaces/user";

const AddressInputBox: React.FC<{
  value: string | number;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}> = ({ value, label, name, ...rest }) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor="address"
        className="text-xs leading-3 tracking-wide text-zinc-500"
      >
        {label}
      </label>
      <input
        className="w-full border-b-2 border-zinc-200 bg-none py-0.5 pt-1 text-sm text-zinc-600 placeholder-zinc-400 outline-0 outline-zinc-500 focus:border-zinc-400"
        name={name}
        value={value}
        {...rest}
      ></input>
    </div>
  );
};

const ModifyAddress: React.FC<{
  toggleClose: () => void;
  address: AddressInterface | null;
  modifiedAddress: (modifiedAddress: AddressInterface) => void;
}> = ({ toggleClose, address, modifiedAddress }) => {
  // Initialize state with default values for all fields except 'default'
  const [editAddress, setNewAddress] = useState<AddressInterface>(address as AddressInterface);
  const split = editAddress.address.split("_");
  const [lineAddress, setLineAddress] = useState({
    lineAddress1: split[0],
    lineAddress2: split[1],
  });

  useEffect(() => {
    setNewAddress((prevAddress) => ({
      ...prevAddress,
      address: lineAddress.lineAddress1 + "_" + lineAddress.lineAddress2,
    }));
  }, [lineAddress]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the corresponding field in editAddress state
    setNewAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleLineAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLineAddress((prevLineAddress) => ({
      ...prevLineAddress,
      [name]: value,
    }));
  };
  const handleClose = () => {
    const shouldClose = window.confirm("Are you sure you want to close?");
    if (shouldClose) {
      toggleClose();
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const shouldSubmit = window.confirm("Are you sure you want to save the changes?");
    if (shouldSubmit) {
      modifiedAddress(editAddress);
      toggleClose();
    }
  };

  return (
    <div className="flex w-[90%] max-w-sm flex-col gap-4 rounded bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="roboto-medium text-sm uppercase">Add Shipping Address</p>
        <span
          className={`material-symbols-outlined self-end text-right text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
          onClick={handleClose}
        >
          close
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <AddressInputBox
          value={editAddress.firstName}
          label="Firstname"
          name="firstName"
          onChange={handleInputChange}
          placeholder={"Ex. John"}
        ></AddressInputBox>
        <AddressInputBox
          value={editAddress.lastName}
          label="Lastname"
          name="lastName"
          onChange={handleInputChange}
          placeholder={"Ex. Smith"}
        ></AddressInputBox>
        <AddressInputBox
          value={lineAddress.lineAddress1}
          label="Line Address 1"
          name="lineAddress1" // Pass name
          onChange={handleLineAddress} // Corrected to `onChange`
          placeholder="Street Address" // Pass placeholder
        />
        <AddressInputBox
          value={lineAddress.lineAddress2}
          label="Line Address 2"
          name="lineAddress2"
          onChange={handleLineAddress}
          placeholder={""}
        ></AddressInputBox>
        <AddressInputBox
          value={editAddress.city}
          label="City"
          name="city"
          onChange={handleInputChange}
          placeholder={""}
        ></AddressInputBox>
        <AddressInputBox
          value={editAddress.state}
          label="State"
          name="state"
          onChange={handleInputChange}
          placeholder={""}
        ></AddressInputBox>
        <AddressInputBox
          value={editAddress.zip}
          label="ZIP Code"
          name="zip"
          onChange={handleInputChange}
          placeholder={""}
        ></AddressInputBox>
        <AddressInputBox
          value={editAddress.country}
          label="Country"
          name="country"
          onChange={handleInputChange}
          placeholder={""}
        ></AddressInputBox>
        <AddressInputBox
          value={editAddress.phoneNo}
          label="Phone Number:"
          name="phoneNo"
          onChange={handleInputChange}
          placeholder={""}
        ></AddressInputBox>
        <button
          type="submit"
          className="rounded bg-zinc-500 px-2 py-0.5 text-xs text-white hover:bg-zinc-700"
        >
          Confirm
        </button>
      </form>
    </div>
  );
};

export default ModifyAddress;
