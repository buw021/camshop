import React, { useEffect, useState } from "react";
import { Address } from "../../interfaces/user";

const AddressInputBox: React.FC<{
  value: string | number;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}> = ({ value, label, name, ...rest }) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={label}
        className="text-xs capitalize leading-3 tracking-wide text-zinc-500"
      >
        {label}
      </label>
      <input
        id={label}
        className="w-full border-b-2 border-zinc-200 bg-none py-0.5 pt-1 text-sm text-zinc-600 placeholder-zinc-400 outline-0 outline-zinc-500 focus:border-zinc-400"
        name={name}
        value={value}
        {...rest}
      ></input>
    </div>
  );
};

const NewAddress: React.FC<{
  toggleClose: () => void;
  onAddAddress: (newAddress: Address) => void;
}> = ({ toggleClose, onAddAddress }) => {
  // Initialize state with default values for all fields except 'default'
  const [newAddress, setNewAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    phoneNo: "",
    address: "",
    city: "",
    state: "",
    zip: 0,
    country: "",
    default: false,
  });
  const [lineAddress, setLineAddress] = useState({
    lineAddress1: "",
    lineAddress2: "",
  });

  const check = () => {
    return (
      newAddress.firstName === "" &&
      newAddress.lastName === "" &&
      newAddress.phoneNo === "" &&
      newAddress.address === "_" &&
      newAddress.city === "" &&
      newAddress.state === "" &&
      newAddress.zip <= 0 &&
      newAddress.country === ""
    );
  };

  useEffect(() => {
    setNewAddress((prevAddress) => ({
      ...prevAddress,
      address: lineAddress.lineAddress1 + "_" + lineAddress.lineAddress2,
    }));
  }, [lineAddress]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the corresponding field in newAddress state
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
    if (check()) {
      toggleClose();
    } else {
      const shouldClose = window.confirm("Are you sure you want to close?");
      if (shouldClose) {
        toggleClose();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (check()) {
      return;
    } else {
      onAddAddress(newAddress);
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
          value={newAddress.firstName}
          label="firstname"
          name="firstName"
          onChange={handleInputChange}
          placeholder={"Ex. John"}
          required
        ></AddressInputBox>
        <AddressInputBox
          value={newAddress.lastName}
          label="lastname"
          name="lastName"
          onChange={handleInputChange}
          placeholder={"Ex. Smith"}
          required
        ></AddressInputBox>
        <AddressInputBox
          value={lineAddress.lineAddress1}
          label="line Address 1"
          name="lineAddress1" // Pass name
          onChange={handleLineAddress} // Corrected to `onChange`
          placeholder="Street Address" // Pass placeholder
          required
        />
        <AddressInputBox
          value={lineAddress.lineAddress2}
          label="line Address 2"
          name="lineAddress2"
          onChange={handleLineAddress}
          placeholder={""}
        ></AddressInputBox>
        <AddressInputBox
          value={newAddress.city}
          label="city"
          name="city"
          onChange={handleInputChange}
          placeholder={""}
          required
        ></AddressInputBox>
        <AddressInputBox
          value={newAddress.state}
          label="state"
          name="state"
          onChange={handleInputChange}
          placeholder={""}
          required
        ></AddressInputBox>
        <AddressInputBox
          value={newAddress.zip}
          label="zip"
          name="zip"
          onChange={handleInputChange}
          placeholder={""}
          min={0}
          required
        ></AddressInputBox>
        <AddressInputBox
          value={newAddress.country}
          label="country"
          name="country"
          onChange={handleInputChange}
          placeholder={""}
          required
        ></AddressInputBox>
        <AddressInputBox
          value={newAddress.phoneNo}
          label="phone number"
          name="phoneNo"
          onChange={handleInputChange}
          placeholder={""}
          required
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

export default NewAddress;
