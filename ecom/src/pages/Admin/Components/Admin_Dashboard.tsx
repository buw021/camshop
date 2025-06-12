import { useEffect } from "react";
import ImgCarouselManger from "./PromoBanners/ImgCarouselManager";
import TextBannerManager from "./PromoBanners/TextBannerManager";
import { AnalyticsProvider } from "./reports/AnalyticsContext";
import TotalOrders from "./reports/TotalOrder";
import TotalRevenue from "./reports/TotalRevenue";
import SFOptions from "./shipping/ShippingOptions";

const Admin_Dashboard = () => {
  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:p-10">
      <h1 className="roboto-bold self-start text-xl text-zinc-800">
        Dashboard
      </h1>
      <div className="relative mb-2 flex items-center justify-between self-start">
        <div className="flex gap-2">
          <button
            className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 hover:cursor-pointer hover:bg-zinc-200`}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Overview
          </button>

          <button
            className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 hover:cursor-pointer hover:bg-zinc-200`}
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Site Settings
          </button>
        </div>
      </div>
      {/*  <div className="3xl:bg-red-500 grid w-full grid-cols-1 grid-rows-2 gap-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <SFOptions />
        <ImgCarouselManger />
        <TextBannerManager />
        <AnalyticsProvider>
          <TotalRevenue />
          <TotalOrders />
        </AnalyticsProvider>
      </div> */}
      <div className="3xl:bg-red-500 grid w-full grid-cols-1 grid-rows-2 gap-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <AnalyticsProvider>
          <TotalRevenue />
        </AnalyticsProvider>
      </div>
    </div>
  );
};

export default Admin_Dashboard;
