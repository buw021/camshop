import { FC, useCallback, useEffect, useState } from "react";
import { CartInterface } from "../interface/interfaces";
import axiosInstance from "../../Services/axiosInstance";
interface WishListProps {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  variantColor: string;
  variantImg: string;
}

const CustomerWishlist: FC<{
  wishlistIDs: CartInterface[];
}> = ({ wishlistIDs }) => {
  /*   const [populatedCart, setPopulatedCart] = useState */
  const [wishlistDetails, setWishlistDetails] = useState<WishListProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;
  const totalPages = Math.ceil(wishlistIDs.length / limit);

  const getWishlistDetails = useCallback(async () => {
    try {
      const response = await axiosInstance.post("/get-wishlist-details", {
        wishlistIDs,
        currentPage,
        limit,
      });
      if (response.data) {
        setWishlistDetails(response.data.cart);
      }
    } catch (error) {
      console.log(error);
    }
  }, [wishlistIDs, currentPage]);

  useEffect(() => {
    getWishlistDetails();
  }, [getWishlistDetails]);

  if (wishlistIDs.length === 0)
    return (
      <div className="flex items-center justify-center gap-2">
        <p className="text-sm font-medium leading-3 tracking-wide text-zinc-700">
          No items in cart
        </p>
      </div>
    );

  return (
    <div className="mt-2 border-y-[1px] border-zinc-100 py-2">
      <div className="flex items-center justify-end">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-md bg-zinc-800 px-2 py-[5px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
          >
            Previous
          </button>
          <span className="text-xs font-bold uppercase leading-3 tracking-wide text-zinc-500">
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-md bg-zinc-800 px-2 py-[5px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
          >
            Next
          </button>
        </div>
      </div>
      <div
        className={`flex h-[250px] w-full flex-col justify-between gap-2 overflow-hidden rounded-lg py-2`}
      >
        <div className="flex flex-col gap-2">
          {wishlistDetails?.length > 0 &&
            wishlistDetails?.map((wishlist, index) => (
              <div
                key={wishlist.variantId}
                className="flex items-center justify-between gap-2 rounded-lg border-[1px] border-zinc-100 px-2 py-1 hover:border-zinc-200 hover:bg-zinc-100"
              >
                <p className="py-1.5 text-sm font-medium leading-3 tracking-wide text-zinc-700">
                  {index + 1}. {wishlist.name} {wishlist.variantName}{" "}
                  {wishlist.variantColor && `(${wishlist.variantColor})`}
                </p>
                <p></p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerWishlist;
