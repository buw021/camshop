import { useEffect, useState } from "react";
import { useDragToScroll } from "../func/DragtoScroll";
import type { CartInterface } from "../../interfaces/cart";
import { slugify } from "../func/slugify";
import { Link } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { showToast } from "../func/showToast";
import { useNavigate } from "react-router-dom";

interface CheckoutCart {
  token: string | null;
  checkout: boolean;
  onTotalPriceChange?: (totalPrice: number) => void;
}

const Cart: React.FC<CheckoutCart> = ({
  token,
  checkout,
  onTotalPriceChange,
}) => {
  const navigate = useNavigate();
  const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
  const [cart, setCart] = useState<CartInterface[]>(storedCart);

  const [totalPrice, setTotalPrice] = useState<number>(0);
  const scrollRef = useDragToScroll();

  const fetchUserCart = async (
    setUserCart: (cart: CartInterface[]) => void,
  ) => {
    try {
      const response = await axiosInstance.get("/user-cart");
      setUserCart(response.data.cart);
    } catch (error) {
      console.error("Error fetching user cart:", error);
    }
  };

  const saveUserCart = async (cart: CartInterface[]) => {
    try {
      await axiosInstance.post("/save-cart", { cart });
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const refresh = () => {};

  // Usage Example in React Component
  useEffect(() => {
    if (token) {
      fetchUserCart(setCart);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem("cart", JSON.stringify(cart));
      document.cookie = `cart=${JSON.stringify(cart)}; path=/;`;
    }
    const calculatedTotal = cart.reduce(
      (acc, item) =>
        acc +
        ((item.isOnSale ? item.salePrice : item.price) ?? item.price) *
          item.quantity,
      0,
    );
    setTotalPrice(calculatedTotal);
    if (onTotalPriceChange) {
      onTotalPriceChange(calculatedTotal);
    }
  }, [cart, token, onTotalPriceChange]);

  const handleClear = () => {
    if (token) {
      saveUserCart([]);
    }
    localStorage.setItem("cart", JSON.stringify([]));
    document.cookie = "cart=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCart([]);
  };

  const updateCartItemQuantity = (
    productId: string,
    variantId: string,
    quantity: number,
  ) => {
    const updatedCart = cart.reduce((acc, item) => {
      if (item.productId === productId && item.variantId === variantId) {
        if (quantity > 0) {
          acc.push({ ...item, quantity });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as CartInterface[]);
    setCart(updatedCart);
    if (token) {
      saveUserCart(updatedCart);
      refresh();
    }
  };

  const removeFromCart = (productId: string, variantId: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );
    setCart(updatedCart);
    if (token) {
      saveUserCart(updatedCart);
      refresh();
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      showToast("You need to be logged in to checkout", "warning");
      return;
    }
    if (token) {
      navigate("/checkout");
    }
  };

  return (
    <div
      ref={scrollRef}
      className="relative flex h-full w-full flex-col sm:px-[10vw]"
    >
      <p className="roboto-medium mb-4 text-center text-lg">Cart</p>
      <div className="products scrollbar-hide flex flex-col gap-4 overflow-auto pb-2">
        {cart?.length > 0 ? (
          cart?.map((item, index) => {
            const productSlug = slugify(item.name);
            return (
              <div
                key={index}
                className="flex items-center justify-between border-b-[1px] border-zinc-300 pb-4"
              >
                <Link
                  to={`/product/${productSlug}_${item.productId}_${item.variantId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (checkout) {
                      window.open(
                        `/product/${productSlug}_${item.productId}_${item.variantId}`,
                        "_blank",
                      );
                    } else {
                      window.location.href = `/product/${productSlug}_${item.productId}_${item.variantId}`;
                    }
                  }}
                >
                  <div className="relative flex h-28 w-28 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                    <img
                      className="h-full object-scale-down p-2"
                      src={`http://localhost:3000/uploads/${item.variantImg}`}
                    ></img>
                  </div>
                </Link>

                <div className="flex flex-col justify-between text-right text-zinc-700">
                  <Link
                    to={`/product/${productSlug}_${item.productId}_${item.variantId}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (checkout) {
                        window.open(
                          `/product/${productSlug}_${item.productId}_${item.variantId}`,
                          "_blank",
                        );
                      }
                      if (!checkout) {
                        window.location.href = `/product/${productSlug}_${item.productId}_${item.variantId}`;
                      }
                    }}
                  >
                    <h1 className="roboto-medium text-sm text-zinc-800 hover:underline">
                      {item.name} {item.variantName} {item.variantColor}
                    </h1>
                  </Link>

                  <p className="text-xs">
                    {item.quantity} x € <span>{item.price}</span>
                  </p>

                  <p className="text-xs text-zinc-800">
                    Total: € {item.quantity * item.price}
                  </p>
                  <div className="relative flex items-center justify-end gap-1 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        updateCartItemQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1,
                        );
                      }}
                    >
                      <span className="material-symbols-outlined h-6 w-6 rounded-full bg-white text-center text-xl leading-[26px] hover:cursor-pointer hover:bg-zinc-100">
                        remove
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        updateCartItemQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity + 1,
                        );
                      }}
                    >
                      <span className="material-symbols-outlined h-6 w-6 rounded-full bg-white text-center text-xl leading-6 hover:cursor-pointer hover:bg-zinc-100">
                        add
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.productId, item.variantId)
                      }
                    >
                      <span className="material-symbols-outlined h-6 w-6 rounded-full bg-white text-center text-xl leading-6 hover:cursor-pointer hover:bg-zinc-100">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-right">Your cart is empty</div>
        )}
      </div>
      {cart.length > 0 && (
        <div className="total mt-4 flex flex-col gap-2 justify-self-end text-right">
          {!checkout && (
            <>
              <div className="total text-right">
                <h2>Total Price: €{totalPrice.toFixed(2)}</h2>
                <div className="divider"></div>
              </div>
            </>
          )}
          <div className="flex justify-between">
            {checkout ? (
              <></>
            ) : (
              <>
                <button
                  className="roboto-medium rounded-md bg-zinc-900 px-6 py-1 text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
                  type="button"
                  onClick={handleClear}
                >
                  Clear
                </button>
                <button
                  className="roboto-medium rounded-md bg-zinc-900 px-4 py-1 text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
                  type="button"
                  onClick={handleCheckout}
                >
                  Check out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
