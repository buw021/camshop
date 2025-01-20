import React from "react";
import { Cart } from "../../interfaces/cart";
import { Link, useNavigate } from "react-router-dom";
import { slugify } from "../func/slugify";
import { useDragToScroll } from "../func/DragtoScroll";

interface CheckoutCartProps {
  cart: Cart[];
}

const CheckoutCart: React.FC<CheckoutCartProps> = ({ cart }) => {
  const scrollRef = useDragToScroll();
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState<number>(0);
  
  const fetchUserCart = async (setUserCart: (cart: Cart[]) => void) => {
    try {
      const response = await axiosInstance.get("/user-cart");
      setUserCart(response.data.cart);
    } catch (error) {
      console.error("Error fetching user cart:", error);
    }
  };
  const saveUserCart = async (cart: Cart[]) => {
    try {
      await axiosInstance.post("/save-cart", { cart });
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };
  const handleClear = () => {
    if (token) {
      saveUserCart([]);
    
    localStorage.setItem("cart", JSON.stringify([]));
    document.cookie = "cart=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCart([]);
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
                    window.open(
                      `/product/${productSlug}_${item.productId}_${item.variantId}`,
                      "_blank",
                    );
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
                      window.open(
                        `/product/${productSlug}_${item.productId}_${item.variantId}`,
                        "_blank",
                      );
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
                      onClick={() =>
                        updateCartItemQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity - 1,
                        )
                      }
                    >
                      <span className="material-symbols-outlined h-6 w-6 rounded-full bg-white text-center text-xl leading-[26px] hover:cursor-pointer hover:bg-zinc-100">
                        remove
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        updateCartItemQuantity(
                          item.productId,
                          item.variantId,
                          item.quantity + 1,
                        )
                      }
                    >
                      <span className="material-symbols-outlined h-6 w-6 rounded-full bg-white text-center text-xl leading-6 hover:cursor-pointer hover:bg-zinc-100">
                        add
                      </span>
                    </button>

                    <button
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
          <div className="total text-right">
            {" "}
            <h2>Total Price: €{totalPrice.toFixed(2)}</h2>{" "}
            <div className="divider"></div>{" "}
          </div>
          <div className="flex justify-between">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutCart;
