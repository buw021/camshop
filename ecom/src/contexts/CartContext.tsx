import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import axiosInstance from "../services/axiosInstance";
import { CartID, CartInterface } from "../interfaces/cart";
import { showToast } from "../func/showToast";
import { useAuth } from "./useAuth";
import axios from "axios";

interface DiscountedPrice {
  productId: string;
  variantId: string;
  discountedPrice: number;
}

interface DiscountedByCode {
  percentage: DiscountedPrice[];
  fixed: number;
  code?: string;
}

interface CartContextProps {
  cartInfo: CartInterface[];
  cartIDs: CartID[];
  subtotal: number;
  totalPrice: number;
  discountedByCode: DiscountedByCode;
  fetchUserCart: () => void;
  addToCart: (cartItem: CartID) => Promise<boolean>;
  updateCartItemQuantity: (
    productId: string,
    variantId: string,
    quantity: number,
  ) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  saveLocalCart: (cart: CartID[]) => void;
  applyCode: (code: string) => void;
  clearAppliedCode: () => void;
}

export const CartContext = createContext<CartContextProps | undefined>(
  undefined,
);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const [cartInfo, setCartInfo] = useState<CartInterface[]>([]);
  const [cartIDs, setCartIDs] = useState<CartID[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discountedByCode, setDiscountedByCode] = useState<DiscountedByCode>({
    percentage: [],
    fixed: 0,
  });
  const fetchUserCart = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/user-cart");
      if (!response.data.cart) return;
      const updatedCart = response.data.cart.map((item: CartInterface) => {
        const discount = discountedByCode.percentage.find(
          (discountItem) =>
            discountItem.productId === item.productId &&
            discountItem.variantId === item.variantId,
        );
        if (discount) {
          return {
            ...item,
            discountedPrice: discount.discountedPrice,
          };
        }
        return item;
      });
      setCartInfo(updatedCart);
      setCartIDs(
        response.data.cart.map((item: CartInterface) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      );
    } catch (error) {
      console.error("Error fetching user cart:", error);
    }
  }, [discountedByCode.percentage]);

  const saveUserCart = useCallback(
    async (cart: CartID[]) => {
      if (!token) return;
      try {
        const response = await axiosInstance.post("/save-cart", { cart });
        if (response.status === 200) {
          fetchUserCart();
          /*  showToast(response.data.message, "success"); */
        }
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    },
    [fetchUserCart, token],
  );

  const saveLocalCart = (cart: CartID[]) => {
    localStorage.setItem("cart", JSON.stringify(cart));
    document.cookie = `cart=${JSON.stringify(cart)}; path=/;`;
    fetchUserCart();
  };

  /*  useEffect(() => {
    if (!token) {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartIDs(storedCart);
      fetchUserCart();
    } else {
      fetchUserCart();
    }
  }, [fetchUserCart, token]); */

  useEffect(() => {
    fetchUserCart();
  }, [fetchUserCart, token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem("cart", JSON.stringify(cartIDs));
      document.cookie = `cart=${JSON.stringify(cartIDs)}; path=/;`;
    }

    const calculatedTotal = cartInfo.reduce(
      (acc, item) =>
        acc +
        ((item.saleId ? item.saleId.salePrice : item.price) ?? item.price) *
          item.quantity,
      0,
    );

    let finalTotal = calculatedTotal;

    if (discountedByCode.fixed) {
      finalTotal = discountedByCode.fixed
        ? calculatedTotal - discountedByCode.fixed
        : calculatedTotal;
    }

    if (discountedByCode.percentage.length > 0) {
      finalTotal = cartInfo.reduce(
        (acc, item) =>
          acc +
          (item.discountedPrice ?? item.saleId?.salePrice ?? item.price) *
            item.quantity,
        0,
      );
    }

    setTotalPrice(finalTotal);
    setSubtotal(calculatedTotal);
  }, [
    cartIDs,
    cartInfo,
    discountedByCode.fixed,
    token,
    discountedByCode.percentage,
  ]);

  const addToCart = async (cartItem: CartID): Promise<boolean> => {
    if (token) {
      const response = await axiosInstance.post(
        "/add-to-cart",
        { cartItem },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        fetchUserCart();
        showToast("Successfully added to Cart", "success");
        return true;
      }
    } else {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItemIndex = storedCart.findIndex(
        (item: {
          productId: string | undefined;
          variantId: string | undefined;
        }) =>
          item.productId === cartItem.productId &&
          item.variantId === cartItem.variantId,
      );
      if (existingItemIndex >= 0) {
        storedCart[existingItemIndex].quantity += 1;
      } else {
        storedCart.push(cartItem);
      }
      saveLocalCart(storedCart);
      showToast("Successfully added to Cart", "success");
      return true;
    }
    return false;
  };

  const updateCartItemQuantity = (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    const updatedCart = cartIDs.reduce((acc, item) => {
      if (item.productId === productId && item.variantId === variantId) {
        if (quantity > 0) {
          acc.push({ ...item, quantity });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as CartID[]);
    if (token) {
      saveUserCart(updatedCart);
    } else {
      saveLocalCart(updatedCart);
    }
  };

  const removeFromCart = (productId: string, variantId: string) => {
    const updatedCart = cartIDs.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );
    if (token) {
      saveUserCart(updatedCart);
    } else {
      saveLocalCart(updatedCart);
    }
  };

  const clearCart = () => {
    setCartIDs([]);
    localStorage.setItem("cart", JSON.stringify([]));
    document.cookie = "cart=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (token) {
      saveUserCart([]);
    } else {
      saveLocalCart([]);
    }
    console.log([]);
  };

  const applyCode = async (promoCodeInput: string) => {
    try {
      const response = await axiosInstance.post("/apply-promo-code", {
        promoCodeInput,
        cartIDs,
      });
      let discountedPrice: DiscountedPrice[] = [];
      let fixedDiscount = 0;
      if (response.data) {
        if (response.data.discountedItems) {
          discountedPrice = response.data.discountedItems.map(
            (item: DiscountedPrice) => ({
              productId: item.productId,
              variantId: item.variantId,
              discountedPrice: item.discountedPrice,
            }),
          );
          setDiscountedByCode((prev) => ({
            ...prev,
            percentage: discountedPrice,
          }));
        }
        if (response.data.fixedDiscount) {
          fixedDiscount = response.data.fixedDiscount;
          setDiscountedByCode((prev) => ({
            ...prev,
            fixed: fixedDiscount,
          }));
        }
        if (response.data.code) {
          setDiscountedByCode((prev) => ({
            ...prev,
            code: response.data.code,
          }));
        }
        fetchUserCart();
      } else {
        showToast(`Error applying promo code`, "error");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract the error message from the response
        const errorMessage =
          error.response.data.error || "Error applying promo code";
        showToast(`Error applying promo code: ${errorMessage}`, "error");
      } else {
        console.error("Error applying promo code:", error);
        showToast("Error applying promo code", "error");
      }
    }
  };

  const clearAppliedCode = useCallback(() => {
    setDiscountedByCode({
      percentage: [],
      fixed: 0,
      code: undefined,
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartInfo,
        cartIDs,
        totalPrice,
        subtotal,
        discountedByCode,
        fetchUserCart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        saveLocalCart,
        applyCode,
        clearAppliedCode,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
