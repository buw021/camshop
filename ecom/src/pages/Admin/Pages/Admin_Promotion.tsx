import React, { useState } from "react";

import PromoList from "../Components/promotion/PromoList";
import SaleList from "../Components/promotion/SaleList";

const Admin_Promotion = () => {
  const [activeMenu, setActiveMenu] = useState<"promo" | "sale">("promo");

  return (
    <>
      <div className="relative flex h-full w-full flex-col rounded-xl bg-zinc-100 p-10">
        <div className="relative mb-2 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2  hover:cursor-pointer hover:bg-zinc-200 ${activeMenu === "promo" && "border-zinc-300 bg-zinc-200"}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu("promo");
              }}
            >
              Promotional Codes
            </button>

            <button
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 hover:cursor-pointer hover:bg-zinc-200 ${activeMenu === "sale" && "border-zinc-300 bg-zinc-200"}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveMenu("sale");
              }}
            >
              Sale Products
            </button>
          </div>
        </div>

        <div className="relative flex h-full w-full flex-col gap-2">
          {activeMenu === "promo" && <PromoList />}
          {activeMenu === "sale" && <SaleList />}
        </div>
      </div>
    </>
  );
};

export default Admin_Promotion;
