import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosInstance from "../services/axiosInstance";
import { CartID, CartInterface } from "../interfaces/cart";
import { showToast } from "../func/showToast";
import { useAuth } from "./useAuth";
import axios from "axios";
import { checkItemStock } from "../hooks/itemStockChecker";

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
  availableItems: number | undefined;
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
  const [availableItems, setAvailableItems] = useState<number>();
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
      setAvailableItems(response.data.noOfAvailableItems);
    } catch (error) {
      console.error("Error fetching user cart:", error);
    }
  }, [discountedByCode.percentage]);

  const saveUserCart = useCallback(
    async (cart: CartID[]) => {
      if (!token) return;
      try {
        const response = await axiosInstance.post("/save-cart", { cart });
        if (response.data.warnings) {
          console.log(response.data.warnings);
          return;
        }
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

  useEffect(() => {
    fetchUserCart();
  }, [fetchUserCart]);

  /*   useEffect(() => {
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
  }, [cartIDs, cartInfo, discountedByCode.fixed, discountedByCode.percentage]); */
  const calcSubTotal = useMemo(() => {
    return cartInfo.reduce((acc, item) => {
      const effectivePrice =
        item.variantStocks <= 0
          ? 0
          : (item.discountedPrice ?? item.saleId?.salePrice ?? item.price);

      return acc + effectivePrice * item.quantity;
    }, 0);
  }, [cartInfo]);

  const total = useMemo(() => {
    let total = subtotal;

    if (discountedByCode.fixed) {
      total -= discountedByCode.fixed;
    }

    if (discountedByCode.percentage.length > 0) {
      total = cartInfo.reduce((acc, item) => {
        const effectivePrice =
          item.variantStocks <= 0
            ? 0
            : (item.discountedPrice ?? item.saleId?.salePrice ?? item.price);

        return acc + effectivePrice * item.quantity;
      }, 0);
    }
    if (total < 0) {
      total = 0;
    }
    return total;
  }, [subtotal, cartInfo, discountedByCode.fixed, discountedByCode.percentage]);

  useEffect(() => {
    setTotalPrice(total);
    setSubtotal(calcSubTotal);
  }, [total, calcSubTotal]);

  const addToCart = async (cartItem: CartID): Promise<boolean> => {
    if (token) {
      const response = await axiosInstance.post(
        "/add-to-cart",
        { cartItem },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.warning) {
        fetchUserCart();
        showToast(`${response.data.warning}`, "warning");
        return false;
      }
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
        const checkItem = await checkItemStock(
          storedCart[existingItemIndex].productId,
          storedCart[existingItemIndex].variantId,
          storedCart[existingItemIndex].quantity,
        );
        if (checkItem === null) {
          showToast("Error checking item stock", "error");
          return false;
        }
        if (checkItem === true) {
          if (storedCart[existingItemIndex].quantity >= 10) {
            showToast(
              "You've reached the maximum quantity for this item",
              "warning",
            );
            return false;
          }
          storedCart[existingItemIndex].quantity += 1;
        } else {
          showToast(
            "You've reached the maximum quantity for this item",
            "warning",
          );
          return false;
        }
      } else {
        storedCart.push(cartItem);
      }
      saveLocalCart(storedCart);
      showToast("Successfully added to Cart", "success");
      return true;
    }
    return false;
  };

  const updateCartItemQuantity = async (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    const checkItem = await checkItemStock(productId, variantId, quantity - 1);
    if (checkItem === null) {
      showToast("Error checking item stock", "error");
      return;
    }
    if (checkItem === true) {
      if (quantity >= 10) {
        showToast(
          "You've reached the maximum quantity for this item",
          "warning",
        );
        return;
      }
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
    } else {
      showToast("You've reached the maximum quantity for this item", "warning");
      return;
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
        showToast("Code Applied!", "success");
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
        availableItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
