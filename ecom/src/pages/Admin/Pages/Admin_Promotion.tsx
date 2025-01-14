import React, { useState } from "react";
import { Link } from "react-router-dom";
import PromotionalCodes from "../Components/promotion/PromotionalCodes";
import PromoCodeForm from "../Components/promotion/PromoCodeForm";
import PromoList from "../Components/promotion/PromoList";

const Admin_Promotion = () => {
  const [activeMenu, setActiveMenu] = useState("promotionalCodes");
  const [toggleAddPromo, setToggleAddPromo] = useState(false);
  3;

  const handleAddPromo = () => {
    setToggleAddPromo(!toggleAddPromo);
  };
  return (
    <>
      <div className="relative flex h-full w-full flex-col rounded-xl bg-zinc-100 p-10">
        <div className="relative mb-2 flex items-center justify-between border-b-[1px]">
          <div className="flex gap-2">
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${activeMenu === "promotionalCodes" && "border-zinc-300 bg-zinc-200"}`}
            >
              Promotional Codes
            </p>

            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${activeMenu === "saleProducts" && "border-zinc-300 bg-zinc-200"}`}
            >
              Sale Products
            </p>
          </div>
        </div>
        {toggleAddPromo && (
          <PromoCodeForm onClose={handleAddPromo}></PromoCodeForm>
        )}
        <div className="flex h-full w-full flex-col gap-2">
          <button
            className="roboto-medium self-end rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
            onClick={() => handleAddPromo()}
          >
            Add New Promo
          </button>
          <PromoList></PromoList>
        </div>
      </div>
    </>
  );
};

export default Admin_Promotion;
