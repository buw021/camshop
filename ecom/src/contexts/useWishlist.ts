import { useContext } from "react";
import { WishlistContext } from "./WishlistContext";


export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};