import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { CartInterface } from "../../interfaces/cart";
import axiosInstance from "../../services/axiosInstance";
import SFOptions from "../../components/main/SFOptions";
import Cart from "../../components/main/Cart";
import { data } from "framer-motion/client";

interface UserData {
  firstname: string;
  lastname: string;
  address: string;
  phoneNo: string;
  cart: CartInterface[];
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

  const [userData, setUserData] = useState<UserData>();
  const [selectedSFOption, setSelectedSFOption] = useState("nothing");
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

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
    setTotalPrice(shippingCost);
  };

  useEffect(() => {
    const fetchCart = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    };
    fetchCart();
  }, [cartTotal]);

  if (userData?.cart.length === 0) {
    return (
      <>
        <div>No Item in your cart</div>
      </>
    );
  }

  return (
    <>
      <form>
        <Cart
          token={token}
          checkout={true}
          onTotalPriceChange={setCartTotal}
        ></Cart>
        <SFOptions
          selectedSFOption={selectedSFOption}
          handleOptionChange={handleOptionChange}
        ></SFOptions>
        <div className="flex flex-col justify-end text-right">
          <span>Cart: € {cartTotal.toFixed(2)}</span>
          <span>
            Shipping Cost: €{" "}
            {shippingOptions
              .find((option) => option.id === selectedSFOption)
              ?.cost.toFixed(2) || 0.0}
          </span>
          <span>Total: € {(cartTotal + totalPrice).toFixed(2)}</span>
        </div>
      </form>
    </>
  );
};

export default Checkout;
