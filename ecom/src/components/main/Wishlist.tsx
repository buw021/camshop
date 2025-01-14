import { useEffect, useState } from "react";
import { useDragToScroll } from "../func/DragtoScroll";
import { Bounce, toast } from "react-toastify";
import type { Wishlist } from "../../interfaces/wishlist";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../services/axiosInstance";

const Wishlist: React.FC = () => {
  const { token } = useAuth();
  const storedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

  const [favs, setFavs] = useState<Wishlist[]>(storedWishlist);

  const scrollRef = useDragToScroll();

  const fetchUserWishlist = async (setFavs: (wishlist: Wishlist[]) => void) => {
    try {
      const response = await axiosInstance.get(`/user-wishlist`);
      setFavs(response.data.wishlist);
    } catch (error) {
      console.error("Error fetching user Wishlist:", error);
    }
  };

  const saveUserWishlist = async (wishlist: Wishlist[]) => {
    try {
      await axiosInstance.post("/save-wishlist", { wishlist });
    } catch (error) {
      console.error("Error saving Wishlist:", error);
    }
  };

  const handleAddToCart = async (cartItem: Wishlist) => {
    try {
      cartItem.quantity = 1;
      await axiosInstance.post("/add-to-cart", { cartItem });
      removeFromWishlist(cartItem.productId, cartItem.variantId);
      toast.success(`Successfully added to Cart`, {
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
    } catch (error) {
      console.error("Error saving cart:", error);
      toast.error(`Error response: ${error}`, {
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
    }
  };

  // Usage Example in React Component
  useEffect(() => {
    if (token) {
      fetchUserWishlist(setFavs);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem("wishlist", JSON.stringify(favs));
      document.cookie = `wishlist=${JSON.stringify(favs)}; path=/;`;
    }
  }, [favs, token]);

  const handleClear = () => {
    if (token) {
      saveUserWishlist([]);
    }
    localStorage.setItem("wishlist", JSON.stringify([]));
    document.cookie =
      "wishlist=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setFavs([]);
  };

  const removeFromWishlist = (productId: string, variantId: string) => {
    const updatedWishlist = favs.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );

    setFavs(updatedWishlist);
    if (token) {
      saveUserWishlist(updatedWishlist);
    }
  };

  const addAllToCart = async () => {
    if (favs.length <= 0)
      return toast.warning(`You don't have items in your wishlist`, {
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
    if (token) {
      try {
        const response = await axiosInstance.post("/add-all-to-cart");
        if (response.data.success) {
          toast.success(`Successfully added all to Cart`, {
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
          localStorage.setItem("wishlist", JSON.stringify([]));
          document.cookie =
            "wishlist=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          setFavs([]);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("add all to cart local cookies");
    }
  };

  return (
    <div
      ref={scrollRef}
      className="relative flex h-full w-full flex-col sm:px-[10vw]"
    >
      <p className="roboto-medium mb-4 text-center text-lg">Wishlist</p>
      <div className="products scrollbar-hide flex flex-col gap-4 overflow-auto pb-2">
        {favs?.length > 0 ? (
          favs?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b-[1px] border-zinc-300 pb-4"
            >
              <div className="relative flex h-36 w-28 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                <img
                  className="h-full object-scale-down p-2"
                  src={`http://localhost:3000${item.variantImg}`}
                ></img>
              </div>

              <div className="flex flex-col justify-between text-right text-zinc-700">
                <h1 className="roboto-medium text-sm text-zinc-800">
                  {item.name} {item.variantName} {item.variantColor}
                </h1>
                <p className="text-xs">
                  €<span>{item.price}</span>
                </p>
                <div className="relative flex items-center justify-end gap-1 pt-2">
                  <button
                    onClick={() =>
                      removeFromWishlist(item.productId, item.variantId)
                    }
                  >
                    <span className="material-symbols-outlined mt-1 h-6 w-6 rounded-full bg-white text-center text-xl leading-6 hover:cursor-pointer hover:bg-zinc-100">
                      delete
                    </span>
                  </button>
                  <button
                    className="roboto-medium rounded-md bg-zinc-900 px-2 py-1 text-xs text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
                    type="button"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-right">Your wishlist is empty</div>
        )}
      </div>
      {favs.length > 0 && (
        <div className="total mt-4 flex flex-col gap-2 justify-self-end text-right">
          <div className="total text-right">
            {" "}
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
              onClick={addAllToCart}
            >
              Add "All" to cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
