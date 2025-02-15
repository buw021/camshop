import React from "react";
import { useCart } from "../../contexts/useCart";

const Vouchers = () => {
  const { applyCode } = useCart();

  return (
    <>
      <div className="flex gap-2">
        <label
          htmlFor={"vouchers"}
          className="sr-only text-xs capitalize leading-3 tracking-wide text-zinc-500"
        >
          vouchers
        </label>
        <input
          id={"vouchers"}
          className="w-full border-b-2 border-zinc-200 bg-none py-0.5 pt-1 text-sm text-zinc-600 placeholder-zinc-400 outline-0 outline-zinc-500 focus:border-zinc-400"
          name={"vouchers"}
          placeholder="VOUCHER"
        ></input>
        <button
          className="rounded-md border-[1px] w-14 px-2 text-xs uppercase leading-3 tracking-wide hover:bg-zinc-100 active:border-zinc-300 active:bg-zinc-200"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const voucherCode = (
              document.getElementById("vouchers") as HTMLInputElement
            ).value;
            applyCode(voucherCode);
          }}
        >
          apply
        </button>
      </div>
    </>
  );
};

export default Vouchers;
