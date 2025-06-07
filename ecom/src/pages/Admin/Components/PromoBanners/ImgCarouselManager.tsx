import { useState } from "react";
import ManageBanners from "./ManageBanners";
import ImgCarousel from "../../../../components/main/ImgCarousel";

const ImgCarouselManger = () => {
  const [manageBanners, setManageBanners] = useState(false);

  return (
    <>
      {manageBanners && <ManageBanners close={() => setManageBanners(false)} />}
      <div className="flex w-full flex-col items-start gap-3 rounded-md border-[1px] border-zinc-200 md:col-span-2 p-6">
        <div className="flex w-full items-center justify-between gap-1">
          <p className="text-lg font-medium leading-5 tracking-wide">
            Manage Promotional Banners
          </p>
          <button
            className="relative flex h-8 w-8 select-none items-center justify-center rounded-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer hover:bg-zinc-300"
            title="Manage Banners"
            onClick={() => setManageBanners(!manageBanners)}
          >
            <span className="material-symbols-outlined h- text-2xl leading-3">
              edit_square
            </span>
          </button>
        </div>
        <div className="flex h-full select-none items-center">
          <ImgCarousel imgs={[]} prev="h-36" />
        </div>
      </div>
    </>
  );
};

export default ImgCarouselManger;
