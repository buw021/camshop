import React, { useEffect, useState } from "react";
import { User, Address } from "../../interfaces/user";
import AddressContent from "./Address";
import NewAddress from "./NewAddress";

import { Bounce, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../services/axiosInstance";

const Profile: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<User | null>(null);
  const [toggleNewAddress, setToggleNewAddress] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const regex = /^\(\d{3}\) \d{3}-\d{4}$/;
    setIsPhoneValid(regex.test(value));
    if (data) {
      setData({ ...data, phoneNo: value });
    }
  };
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (data) {
      setData({ ...data, [name]: value });
    }
  };
  const getUser = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      setData(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const updateAddress = async (updatedAddresses: Address[]) => {
    try {
      await axiosInstance.post("/update-address", { updatedAddresses });
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfile = async (
    firstName: string,
    lastName: string,
    phoneNo: string,
  ) => {
    const profile = {
      firstName: firstName,
      lastName: lastName,
      phoneNo: phoneNo,
    };
    try {
      await axiosInstance.post("/update-profile", { profile });
    } catch (error) {
      console.log(error);
    }
    getUser();
  };

  useEffect(() => {
    getUser();
  }, []);

  const handleNewAddress = () => {
    if (data?.address && data?.address.length > 4) {
      toast.warning("You can only add up to 5 Address", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    } else {
      setToggleNewAddress(!toggleNewAddress);
    }
  };

  useEffect(() => {
    if (toggleNewAddress) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [toggleNewAddress]);

  const addNewAddress = async (newAddress: Address) => {
    if (token && data?.address) {
      try {
        const response = await axiosInstance.post("/save-new-address", { newAddress });
        if (response.status === 200) {
          getUser();
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deleteAddress = (addressId: string) => {
    if (data) {
      const updatedAddresses = data.address.filter(
        (address) => address._id !== addressId,
      );
      setData({ ...data, address: updatedAddresses });
    }
  };

  const modifyAddress = (updatedAddress: Address) => {
    if (data) {
      const updatedAddresses = data.address.map((address) =>
        address._id === updatedAddress._id ? updatedAddress : address,
      );
      const newData = { ...data, address: updatedAddresses };
      setData(newData);
      updateAddress(newData.address);
    }
  };

  const handleSaveProfile = () => {
    if (data) {
      updateProfile(data.firstName, data.lastName, data.phoneNo);
    }
  };

  if (!data)
    return (
      <div className="absolute left-1/2 top-1/2 h-screen w-screen">
        <div
          className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-zinc-900 motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );

  return (
    <div className={`flex h-full w-full flex-col gap-2`}>
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
      <div>
        <div className="relative mb-2 flex items-center justify-between border-b-[1px]">
          <div className="flex gap-2">
            <Link to={"/my-profile"}>
              <p
                className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${window.location.pathname === "/my-profile" && "border-zinc-300 bg-zinc-200"}`}
              >
                My Profile
              </p>
            </Link>
            <Link to={"/security"}>
              <p
                className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${window.location.pathname === "/security" && "border-zinc-300 bg-zinc-200"}`}
              >
                Security
              </p>
            </Link>
          </div>
          <button
            className="rounded bg-zinc-500 px-2 py-0.5 text-xs text-white hover:bg-zinc-700"
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? "Save" : "Edit Profile"}
          </button>
        </div>
        <div className="flex flex-col gap-4 rounded border-[1px] p-2">
          {/* <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-xs tracking-wide text-zinc-500"
            >
              Email:
            </label>
            <input
              id="email"
              className="w-52 border-b-2 border-zinc-200 bg-none px-2 py-0.5 pt-1 text-sm text-zinc-600 outline-0 outline-zinc-500 focus:border-zinc-400"
              value={data.email}
              disabled={data.email.length > 0}
            ></input>
          </div> */}
          <div className="flex gap-2">
            <div className="flex flex-col">
              <label
                htmlFor="firstName"
                className="text-xs tracking-wide text-zinc-500"
              >
                Firstname:
              </label>
              <input
                id="firstName"
                name="firstName"
                value={data.firstName}
                className="w-36 border-b-2 border-zinc-200 bg-none px-2 py-0.5 pt-1 text-sm text-zinc-600 outline-0 outline-zinc-500 focus:border-zinc-400"
                disabled={!isEditing}
                onChange={handleNameChange}
              ></input>
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="lastName"
                className="text-xs tracking-wide text-zinc-500"
              >
                Lastname:
              </label>
              <input
                id="lastName"
                name="lastName"
                value={data.lastName}
                className="w-36 border-b-2 border-zinc-200 bg-none px-2 py-0.5 pt-1 text-sm text-zinc-600 outline-0 outline-zinc-500 focus:border-zinc-400"
                disabled={!isEditing}
                onChange={handleNameChange}
              ></input>
            </div>
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="phoneNumber"
              className="text-xs tracking-wide text-zinc-500"
            >
              Phone Number:
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={data.phoneNo}
              className="w-36 border-b-2 border-zinc-200 bg-none px-2 py-0.5 pt-1 text-sm text-zinc-600 outline-0 outline-zinc-500 focus:border-zinc-400"
              disabled={!isEditing}
              onChange={handlePhoneChange}
            ></input>
          </div>
        </div>
      </div>

      <div>
        <div className="relative mb-2 flex items-center justify-between border-b-[1px]">
          <p className="roboto-medium text-lg">Shipping Address</p>
          <button
            className="rounded bg-zinc-500 px-2 py-0.5 text-xs text-white hover:bg-zinc-700"
            onClick={() => handleNewAddress()}
          >
            Add New Address
          </button>
        </div>
        <AddressContent
          userAddresses={data.address}
          onDeleteAddress={deleteAddress}
          onModifyAddress={modifyAddress}
        ></AddressContent>
      </div>
    </div>
  );
};

export default Profile;
