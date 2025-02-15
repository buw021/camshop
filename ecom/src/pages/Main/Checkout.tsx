import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import { CartID } from "../../interfaces/cart";
import axiosInstance from "../../services/axiosInstance";
import SFOptions from "../../components/main/SFOptions";
import Cart from "../../components/main/Cart";
import { AddressInterface } from "../../interfaces/user";
import SFAddress from "../../components/main/SFAddress";
import AddressContent from "../Profile/Address";
import Vouchers from "../../components/main/Vouchers";

import { stripePromise } from "../../utils/stripe";
import { useCart } from "../../contexts/useCart";

interface UserData {
  firstname: string;
  lastname: string;
  address: AddressInterface[];
  phoneNo: string;
  cart: CartID[];
}

interface ShippingOptionProps {
  shippingType: string;
  shippingCost: number;
  shippingLabel: string;
  shippingTime: string;
  _id?: string;
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
  const { token, email } = useAuth();
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
  const { totalPrice, subtotal, clearAppliedCode, discountedByCode } =
    useCart();
  const [selectedSFOption, setSelectedSFOption] = useState<ShippingOptionProps>(
    { shippingType: "", shippingCost: 0, shippingLabel: "", shippingTime: "" },
  );
  const [selectedSFAddress, setSelectedSFAdress] = useState<AddressInterface>();
  const [userEmail, setUserEmail] = useState<string>(email || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editAddress, setEditAddress] = useState<boolean>(false);

  const handleOptionChange = (sfOption: ShippingOptionProps) => {
    setSelectedSFOption(sfOption);
  };

  const checkBeforeSubmit = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (selectedSFOption.shippingType === "") {
      newErrors.SFOption = "Please select your shipping option";
    }
    if (userData.address.length === 0 && !selectedSFAddress) {
      newErrors.address = "Please provide a shipping address";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      newErrors.email = "Please provide a valid email address";
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

  const payNowButton = document.getElementById("pay-now");

  const PayNow = () => {
    payNowButton?.removeAttribute("disabled");
    payNowButton?.classList.remove("pulse");
    payNowButton!.textContent = "Pay Now";
  };

  const Processing = () => {
    payNowButton?.setAttribute("disabled", "true");
    payNowButton?.classList.add("pulse");
    payNowButton!.textContent = "Processing...";
  };

  const handlePayNow = async () => {
    const check = await checkBeforeSubmit();
    if (check) {
      PayNow();
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
          promoCodeInput: discountedByCode.code,
          userEmail: userEmail,
        });

        if (response.status !== 200) {
          PayNow();
          throw new Error("Failed to create checkout session");
        }

        const stripe = await stripePromise;
        const sessionId = response.data.id;

        if (!sessionId) {
          PayNow();
          throw new Error("Session ID not found in response");
        }

        // Redirect to Stripe Checkout
        const result = await stripe?.redirectToCheckout({
          sessionId: sessionId,
        });

        if (result?.error) {
          PayNow();
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

  useEffect(() => {
    return () => {
      clearAppliedCode();
    };
  }, [clearAppliedCode]);

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
      <form className="mb-48 flex flex-col gap-2.5 overflow-auto">
        <div className="self-start">
          <span className="text-lg font-medium tracking-wide">
            Shopping Cart
          </span>
        </div>
        <Cart checkout={true} quantityChange={fetchCart}></Cart>
        <div className="">
          <span className="text-lg font-medium tracking-wide">Email</span>
          {errors.email && (
            <div className="text-xs">
              <span className="text-right text-xs text-red-500">
                {errors.email}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <label
              htmlFor={"email"}
              className="sr-only text-xs capitalize leading-3 tracking-wide text-zinc-500"
            >
              email
            </label>
            <input
              id={"email"}
              type={"email"}
              className="w-full border-b-2 border-zinc-200 bg-none py-0.5 pt-1 text-sm text-zinc-600 placeholder-zinc-400 outline-0 outline-zinc-500 focus:border-zinc-400 disabled:hover:cursor-not-allowed"
              name={"email"}
              placeholder="Email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              disabled={true}
            ></input>
            <button
              className="w-14 rounded-md border-[1px] px-2.5 text-xs uppercase leading-3 tracking-wide hover:bg-zinc-100 active:border-zinc-300 active:bg-zinc-200"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const emailInput = document.getElementById(
                  "email",
                ) as HTMLInputElement;
                if (emailInput) {
                  emailInput.disabled = !emailInput.disabled;
                  e.currentTarget.textContent = emailInput.disabled
                    ? "Edit"
                    : "Save";
                }
              }}
            >
              Edit
            </button>
          </div>
        </div>
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
          totalOrderCost={totalPrice ?? subtotal}
        ></SFOptions>
        <div className="">
          <span className="text-lg font-medium tracking-wide">Voucher</span>
          <Vouchers></Vouchers>
        </div>
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
                <span className="text-[10px]">+</span>{" "}
                {selectedSFOption.shippingCost.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between font-bold">
              <span className="">Total:</span>
              <span className="text-right">
                €{" "}
                {(totalPrice
                  ? totalPrice + selectedSFOption.shippingCost
                  : subtotal + selectedSFOption.shippingCost
                ).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            id="pay-now"
            name="pay-now"
            className="roboto-medium m w-full self-end rounded-md bg-zinc-900 px-4 py-1 text-white transition-all duration-200 hover:bg-zinc-700"
            type="button"
            onClick={(e) => {
              e.preventDefault;
              Processing();
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
