import { FC, useState } from "react";
import { CartInterface } from "../interface/interfaces";

const CustomerCartList: FC<{
  cart: CartInterface[];
}> = ({ cart }) => {

/*   const [populatedCart, setPopulatedCart] = useState */
  
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(cart.length / 10);
  const indexOfLastProduct = currentPage * 10;
  const indexOfFirstProduct = indexOfLastProduct - 10;
  const currentOrders = cart.slice(indexOfFirstProduct, indexOfLastProduct);

  if (cart.length === 0) {
    return (
      <div
        className={`flex w-full flex-col justify-between gap-2 overflow-hidden rounded-lg py-4 text-center text-xs`}
      >
        <p>No Orders found</p>
      </div>
    );
  }

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
        className={`flex h-[400px] w-full flex-col justify-between gap-2 overflow-hidden rounded-lg py-2`}
      >
        <div className="flex flex-col gap-2">
          {currentOrders.map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between gap-2 rounded-lg border-[1px] border-zinc-100 px-2 py-1 hover:border-zinc-200 hover:bg-zinc-100"
            >
              <p className="text-sm font-medium leading-3 tracking-wide text-zinc-700">
                {order.customOrderId}
              </p>
              <div className="flex gap-2">
                <button className="rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700">
                  <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
                    edit_square
                  </span>
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerCartList;
