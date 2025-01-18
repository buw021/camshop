import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Cart } from "../../interfaces/cart";
import axiosInstance from "../../services/axiosInstance";

interface UserData {
  firstname: string;
  lastname: string;
  address: string;
  phoneNo: string;
  cart: Cart[];
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
  const [userData, setUserData] = useState<UserData[]>();
  const { token } = useAuth();

  if (!token) {
    window.location.href = "/";
  }

  useEffect(() => {
    const fetchCart = async () => {
      const data = await getUserData();
      if (data) {
        setUserData(data);
      }
    };
    fetchCart();
  }, []);
  console.log(userData);
  return <div>Checkout</div>;
};

export default Checkout;
