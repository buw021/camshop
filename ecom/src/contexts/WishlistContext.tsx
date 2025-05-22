import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import axiosInstance from "../services/axiosInstance";
import { useCart } from "./useCart";
import { CartID, CartInterface } from "../interfaces/cart";
import { showToast } from "../func/showToast";
import { useAuth } from "./useAuth";

interface WishlistContextProps {
  favsInfo: CartInterface[];
  favsIDs: CartID[];
  fetchUserWishlist: () => void;
  saveUserWishlist: (favs: CartID[]) => void;
  saveLocalFavs: (wishlist: CartID[]) => void;
  addToFavs: (item: CartID) => Promise<boolean>;
  handleAddToCart: (cartItem: CartID) => void;
  clearFavs: () => void;
  handleAddAllToCart: () => void;
  removeFromWishlist: (productId: string, variantId: string) => void;
}

export const WishlistContext = createContext<WishlistContextProps | undefined>(
  undefined,
);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const { addToCart, cartIDs, saveLocalCart } = useCart();
  const [favsInfo, setFavsInfo] = useState<CartInterface[]>([]);
  const [favsIDs, setFavsIDs] = useState<CartID[]>([]);

  const fetchUserWishlist = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/user-wishlist`);
      if (!response.data.favs) return;
      setFavsInfo(response.data.favs);
      setFavsIDs(
        response.data.favs.map((item: CartID) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      );
    } catch (error) {
      console.error("Error fetching user Wishlist:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserWishlist();
  }, [fetchUserWishlist]);

  const saveUserWishlist = useCallback(
    async (favs: CartID[]) => {
      if (!token) return;
      try {
        const response = await axiosInstance.post("/save-favs", { favs });
        if (response.status === 200) {
          fetchUserWishlist();
          /*  showToast(response.data.message, "success"); */
        }
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    },
    [fetchUserWishlist, token],
  );

  const saveLocalFavs = (wishlist: CartID[]) => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    document.cookie = `wishlist=${JSON.stringify(wishlist)}; path=/;`;
    fetchUserWishlist();
  };

  const addToFavs = async (item: CartID): Promise<boolean> => {
    if (token) {
      const itemExists = favsIDs.some(
        (fav) =>
          fav.productId === item.productId && fav.variantId === item.variantId,
      );
      if (itemExists) {
        showToast("Item already in wishlist", "warning");
        return false;
      }
      const response = await axiosInstance.post(
        "/add-to-wishlist",
        { item },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        fetchUserWishlist();
        showToast("Item added to wishlist", "success");
        return true;
      }
    } else {
      const storedFavs = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const itemExists = storedFavs.some(
        (fav: CartID) =>
          fav.productId === item.productId && fav.variantId === item.variantId,
      );
      if (itemExists) {
        showToast("Item already in wishlist", "warning");
        return false;
      }
      const updatedFavs = [...storedFavs, item];
      saveLocalFavs(updatedFavs);
      showToast("Item added to wishlist", "success");
      return true;
    }
    return false;
  };

  const handleAddToCart = async (cartItem: CartID) => {
    const item = {
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      quantity: 1,
    };
    const updatedWishlist = favsIDs.filter(
      (item) =>
        !(
          item.productId === cartItem.productId &&
          item.variantId === cartItem.variantId
        ),
    );
    const response = await addToCart(item);
    if (response) {
      if (token) {
        saveUserWishlist(updatedWishlist);
      } else {
        saveLocalFavs(updatedWishlist);
      }
    }
  };

  const handleAddAllToCart = async () => {
    if (token) {
      const response = await axiosInstance.post("/add-all-to-cart");
      if (response) {
        saveUserWishlist([]);
        showToast(response.data.success, "success");
      }
    } else {
      console.log(favsIDs);
      const response = await axiosInstance.post("/add-all-to-cart-local", {
        wishlist: favsIDs,
        cart: cartIDs,
      });
      if (response.status === 200) {
        saveLocalFavs(response.data.updatedWishlist);
        saveLocalCart(response.data.updatedCart);
        showToast(`${response.data.success}`, "success");
      } else {
        showToast(`${response.data.error}`, "error");
      }
    }
  };

  const removeFromWishlist = (productId: string, variantId: string) => {
    const updatedWishlist = favsIDs.filter(
      (item) => !(item.productId === productId && item.variantId === variantId),
    );
    setFavsIDs(updatedWishlist);
    if (token) {
      saveUserWishlist(updatedWishlist);
    } else {
      saveLocalFavs(updatedWishlist);
    }
  };

  const clearFavs = () => {
    setFavsIDs([]);
    localStorage.setItem("wishlist", JSON.stringify([]));
    document.cookie =
      "wishlist=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (token) {
      saveUserWishlist([]);
    } else {
      saveLocalFavs([]);
    }
    console.log([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        favsInfo,
        favsIDs,
        fetchUserWishlist,
        saveUserWishlist,
        addToFavs,
        clearFavs,
        saveLocalFavs,
        handleAddToCart,
        handleAddAllToCart,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
