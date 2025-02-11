import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { CartID } from "../../interfaces/cart";
import axiosInstance from "../../services/axiosInstance";
import SFOptions from "../../components/main/SFOptions";
import Cart from "../../components/main/Cart";
import { AddressInterface } from "../../interfaces/user";
import SFAddress from "../../components/main/SFAddress";
import AddressContent from "../Profile/Address";
import Vouchers from "../../components/main/Vouchers";
import { loadStripe } from "@stripe/stripe-js";
import { stripePromise } from "../../utils/stripe";
import { useCart } from "../../contexts/useCart";

interface UserData {
  firstname: string;
  lastname: string;
  address: AddressInterface[];
  phoneNo: string;
  cart: CartID[];
}

const getUserData = async () => {
  try {
    const response = await axiosInstance.get("/get-user-data");
    return response.data;
  } catch (error) {
    console.error("Error fetching user cart:", error);
  }
};

const Checkout = () => {
  const { token } = useAuth();
  if (!token) {
    window.location.href = "/";
  }
  const [userData, setUserData] = useState<UserData>({
    firstname: "",
    lastname: "",
    address: [],
    phoneNo: "",
    cart: [],
  });
  const { totalPrice, subtotal } = useCart();
  const [selectedSFOption, setSelectedSFOption] = useState("nothing");
  const [selectedSFAddress, setSelectedSFAdress] = useState<AddressInterface>();

  const [shippingCost, setShippingCost] = useState<number>(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editAddress, setEditAddress] = useState<boolean>(false);
  const [promoCode, setPromoCode] = useState<string>("");

  const shippingOptions = [
    { id: "nothing", cost: 0.0 },
    { id: "free", cost: 0.0 },
    { id: "standard", cost: 5.0 },
    { id: "express", cost: 15.0 },
  ];

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    setSelectedSFOption(selected);
    const shippingCost =
      shippingOptions.find((option) => option.id === selected)?.cost || 0;
    setShippingCost(shippingCost);
  };

  const checkBeforeSubmit = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (selectedSFOption === "nothing") {
      newErrors.SFOption = "Please select your shipping option";
    }
    if (userData.address.length === 0 && !selectedSFAddress) {
      newErrors.address = "Please provide a shipping address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  const toggleEditAddress = () => {
    setEditAddress(!editAddress);
    fetchCart();
  };

  const fetchCart = useCallback(async () => {
    const data = await getUserData();
    if (data) {
      setUserData(data);
    }
  }, []);

  const handlePayNow = async () => {
    const check = await checkBeforeSubmit();
    if (check) {
      return;
    } else {
      try {
        const response = await axiosInstance.post("/create-checkout-session", {
          cart: userData.cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          address: selectedSFAddress
            ? selectedSFAddress
            : userData.address.find((addr) => addr.default) ||
              userData.address[0],
          shippingOption: selectedSFOption,
          promocode: "",
        });
        const stripe = await stripePromise;
        const sessionId = response.data.id;

        // Redirect to Stripe Checkout
        const result = await stripe?.redirectToCheckout({
          sessionId: sessionId,
        });
        if (result?.error) {
          console.error(result.error.message); // Handle error as needed
        }
      } catch (error) {
        console.error("Failed to checkout", error);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart, subtotal]);

  useEffect(() => {
    if (editAddress) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [editAddress]);

  if (userData?.cart.length === 0) {
    return (
      <>
        <div className="flex h-full w-full flex-col items-center justify-end text-center"></div>
        <div className="fixed bottom-0 left-0 flex h-16 w-screen items-center justify-between border-t-[1px] border-zinc-100 bg-white px-6 py-2.5">
          <p>No Item in your cart</p>
          <a href="/" className="text-xs text-blue-500 hover:underline">
            Go to Store
          </a>
        </div>
      </>
    );
  }

  const selected = (address: AddressInterface) => {
    setSelectedSFAdress(address);
  };

  return (
    <>
      {editAddress && (
        <>
          <div className="fixed left-0 top-0 z-[50] flex h-full w-full justify-center overflow-hidden bg-white/90 px-5 pb-5 pt-10 backdrop-blur-sm">
            <button
              type="button"
              className={`material-symbols-outlined absolute right-2.5 top-2.5 text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
              onClick={(e) => {
                e.preventDefault();
                toggleEditAddress();
              }}
            >
              close
            </button>
            <AddressContent
              toggleClose={toggleEditAddress}
              checkout={true}
              selected={selected}
            ></AddressContent>
          </div>
        </>
      )}
      <form className="mb-20 flex flex-col gap-2.5">
        {errors.address && (
          <div className="-mb-2.5">
            <span className="text-right text-xs text-red-500">
              {errors.address}
            </span>
          </div>
        )}
        <SFAddress
          address={
            selectedSFAddress
              ? selectedSFAddress
              : userData.address.find((addr) => addr.default) ||
                userData.address[0]
          }
          toggleEditAddress={toggleEditAddress}
        ></SFAddress>

        {errors.SFOption && (
          <div className="-mb-2.5">
            <span className="text-right text-xs text-red-500">
              {errors.SFOption}
            </span>
          </div>
        )}
        <SFOptions
          selectedSFOption={selectedSFOption}
          handleOptionChange={handleOptionChange}
        ></SFOptions>
        <div className="self-start">
          <span className="text-lg font-medium tracking-wide">
            Shopping Cart
          </span>
        </div>
        <Cart checkout={true} quantityChange={fetchCart}></Cart>
        <div className="self-start">
          <span className="text-lg font-medium tracking-wide">Vouchers</span>
        </div>
        <Vouchers></Vouchers>
      </form>
      <div className="fixed bottom-0 left-0 flex h-44 w-screen flex-col items-center justify-end border-t-[1px] border-zinc-100 bg-white px-6 py-2.5">
        <div className="w-full sm:max-w-96 sm:self-center">
          <div className="self-start">
            <span className="text font-medium tracking-wide">Summary</span>
          </div>
          <div className="mb-1 h-[1px] w-full rounded-full bg-zinc-200"></div>
          <div className="flex w-full flex-col self-start text-left text-sm">
            <div className="flex justify-between">
              <span className="text-xs">Subtotal:</span>
              <span className="text-right"> € {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs">Discount:</span>{" "}
              {totalPrice && (
                <span className="text-right">
                  {"-"} {(subtotal - totalPrice).toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-xs">Shipping:</span>
              <span className="text-right">
                <span className="text-[10px]">+</span> {shippingCost.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-bold">
              <span className="">Total:</span>
              <span className="text-right">
                € {(totalPrice ?? subtotal + shippingCost).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            className="roboto-medium w-full self-end rounded-md bg-zinc-900 px-4 py-1 text-white transition-all duration-200 hover:bg-zinc-700 mt-2"
            type="button"
            onClick={(e) => {
              e.preventDefault;
              handlePayNow();
            }}
          >
            Pay Now
          </button>
        </div>
      </div>
    </>
  );
};

export default Checkout;
