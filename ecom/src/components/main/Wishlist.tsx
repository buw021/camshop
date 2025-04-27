import { useDragToScroll } from "../../func/DragtoScroll";
import type { Wishlist } from "../../interfaces/wishlist";
import { useWishlist } from "../../contexts/useWishlist";

const Wishlist: React.FC = () => {
  const {
    favsInfo,
    removeFromWishlist,
    handleAddAllToCart,
    handleAddToCart,
    clearFavs,
  } = useWishlist();
  const scrollRef = useDragToScroll();

  return (
    <div
      ref={scrollRef}
      className="relative flex h-full w-full flex-col sm:px-[10vw]"
    >
      <p className="roboto-medium mb-4 text-center text-lg">Wishlist</p>
      <div className="products scrollbar-hide flex flex-col gap-4 overflow-auto pb-2">
        {favsInfo?.length > 0 ? (
          favsInfo?.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b-[1px] border-zinc-300 pb-4"
            >
              <div className="relative flex h-36 w-28 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                <img
                  className="h-full object-scale-down p-2"
                  src={`http://localhost:3000/uploads/products/${item.variantImg}`}
                ></img>
              </div>

              <div className="flex flex-col justify-between text-right text-zinc-700">
                <h1 className="roboto-medium text-sm text-zinc-800">
                  {item.name} {item.variantName} {item.variantColor}
                </h1>
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
                  {item.variantStocks > 0 ? (
                    <button
                      className="roboto-medium rounded-md bg-zinc-900 px-2 py-1 text-xs text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
                      type="button"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to cart
                    </button>
                  ) : (
                    <p className="roboto-medium rounded-md bg-zinc-500 px-2 py-1 text-xs text-white md:max-w-[300px]">
                      Unavailable
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-right">Your wishlist is empty</div>
        )}
      </div>
      {favsInfo.length > 0 && (
        <div className="total mt-4 flex flex-col gap-2 justify-self-end text-right">
          <div className="total text-right">
            {" "}
            <div className="divider"></div>{" "}
          </div>
          <div className="flex justify-between">
            <button
              className="roboto-medium rounded-md bg-zinc-900 px-6 py-1 text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
              type="button"
              onClick={clearFavs}
            >
              Clear
            </button>
            <button
              className="roboto-medium rounded-md bg-zinc-900 px-4 py-1 text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
              type="button"
              onClick={handleAddAllToCart}
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
