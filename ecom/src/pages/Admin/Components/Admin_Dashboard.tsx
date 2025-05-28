import ImgCarouselManger from "./PromoBanners/ImgCarouselManager";
import TextBannerManager from "./PromoBanners/TextBannerManager";
import SFOptions from "./shipping/ShippingOptions";

const Admin_Dashboard = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center gap-4 overflow-y-auto rounded-xl bg-white p-10 ring-2 ring-zinc-300/70 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center">
      <SFOptions />
      <ImgCarouselManger />
      <TextBannerManager />
    </div>
  );
};

export default Admin_Dashboard;
