import React from "react";
import { useDragToScroll } from "../../func/DragtoScroll";
import { slugify } from "../../func/slugify";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/useCart";
import { useAuth } from "../../contexts/useAuth";
import { showToast } from "../../func/showToast";

interface CheckoutCart {
  checkout: boolean;
  toggleClose?: () => void;
  quantityChange?: () => void;
}

const Cart: React.FC<CheckoutCart> = ({
  checkout,
  toggleClose,
  quantityChange,
}) => {
  const {
    cartInfo,
    totalPrice,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useDragToScroll();

  const handleClear = () => {
    clearCart();
  };

  const handleCheckout = async () => {
    if (!token) {
      showToast("You need to be logged in to checkout", "warning");
      toggleClose?.();
      return;
    }
    if (token) {
      toggleClose?.();
      navigate("/checkout");
    }
  };

  return (
    <div ref={scrollRef} className="relative flex h-full w-full flex-col">
      {!checkout && (
        <>
          <p className="roboto-medium mb-4 text-center text-lg">Cart</p>
        </>
      )}
      <div className="products scrollbar-hide flex max-h-80 flex-col gap-4 overflow-auto pb-2">
        {cartInfo?.length > 0 ? (
          cartInfo?.map((item, index) => {
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

                  {checkout ? (
                    <>
                      {item.saleId?.salePrice ? (
                        <>
                          <span className="text-xs text-zinc-500 line-through">
                            € {item.price.toFixed(2)}
                          </span>
                          <p className="text-xs">
                            {item.quantity} x €{" "}
                            <span>
                              {item.discountedPrice && item.discountedPrice > 0
                                ? item.discountedPrice.toFixed(2)
                                : item.saleId.salePrice.toFixed(2)}
                            </span>
                          </p>

                          <p className="text-xs text-zinc-800">
                            Total: €{" "}
                            {(
                              item.quantity *
                              (item.discountedPrice && item.discountedPrice > 0
                                ? item.discountedPrice
                                : item.saleId.salePrice)
                            ).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-zinc-500 line-through">
                            € {item.price.toFixed(2)}
                          </span>
                          <p className="text-xs">
                            {item.quantity} x €{" "}
                            <span>
                              {item.discountedPrice && item.discountedPrice > 0
                                ? item.discountedPrice.toFixed(2)
                                : item.price.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-xs text-zinc-800">
                            Total: €{" "}
                            {(
                              item.quantity *
                              (item.discountedPrice && item.discountedPrice > 0
                                ? item.discountedPrice
                                : item.price)
                            ).toFixed(2)}
                          </p>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {item.saleId?.salePrice ? (
                        <>
                          <span className="text-xs text-zinc-500 line-through">
                            € {item.price.toFixed(2)}
                          </span>
                          <p className="text-xs">
                            {item.quantity} x €{" "}
                            <span>{item.saleId.salePrice.toFixed(2)}</span>
                          </p>

                          <p className="text-xs text-zinc-800">
                            Total: €{" "}
                            {(item.quantity * item.saleId.salePrice).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs">{item.quantity} x € </p>
                          <p className="text-xs text-zinc-800">
                            Total: € {(item.quantity * item.price).toFixed(2)}
                          </p>
                        </>
                      )}
                    </>
                  )}

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
                        quantityChange?.();
                      }}
                    >
                      <span className="material-symbols-outlined h-6 w-6 rounded-full bg-zinc-100 text-center text-xl leading-[26px] hover:cursor-pointer hover:bg-zinc-200">
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
                        quantityChange?.();
                      }}
                    >
                      <span className="material-symbols-outlined h-6 w-6 rounded-full bg-zinc-100 text-center text-xl leading-6 hover:cursor-pointer hover:bg-zinc-200">
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
      {cartInfo.length > 0 && (
        <div className="total mt-4 flex flex-col gap-2 justify-self-end text-right">
          {!checkout && (
            <>
              <div className="total text-right">
                <h2>Total Price: €{totalPrice.toFixed(2)}</h2>
                <div className="divider"></div>
              </div>
            </>
          )}

          {checkout ? (
            <></>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
