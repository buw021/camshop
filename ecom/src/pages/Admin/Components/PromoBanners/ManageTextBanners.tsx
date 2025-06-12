import React, { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../../Services/axiosInstance";
import EditTextBanner from "./EditTextBanner";

interface TextBannerProps {
  text: string;
  active: boolean;
}

const ManageTextBanners: React.FC<{ close: () => void }> = ({ close }) => {
  const [quickAdd, setQuickAdd] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const draggingZone = useRef<HTMLDivElement | null>(null);
  const [outside, setOutside] = useState(false);
  const [textBanners, setTextBanners] = useState<TextBannerProps[]>([]);

  const fetchTextBanners = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-text-banners");
      if (response.status === 200) {
        setTextBanners(response.data);
      }
    } catch (error) {
      console.error("Error fetching text banners:", error);
    }
  }, []);

  useEffect(() => {
    fetchTextBanners();
  }, [fetchTextBanners]);

  return (
    <div className="absolute left-0 top-0 z-10 flex h-full w-full justify-center overflow-hidden rounded-xl bg-zinc-900/20 px-4 py-4 backdrop-blur-[2px] sm:items-center sm:px-10 sm:py-10">
      {quickAdd && (
        <EditTextBanner setQuickAdd={setQuickAdd} success={fetchTextBanners} />
      )}

      <div className="relative flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-md bg-white p-2.5 px-10">
        <p className="self-start text-lg font-medium tracking-wide">
          Manage Text Banners | Arrange Text Banners
        </p>

        <div className="flex flex-wrap gap-2 self-end">
          <button
            title="Add New Image"
            className="relative self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
            onClick={() => setQuickAdd(!quickAdd)}
          >
            Add Text Banner
          </button>
          <button
            title="Save Changes"
            className="relative self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Save Changes
          </button>
        </div>

        <span
          className={`material-symbols-outlined absolute right-2 top-2 z-10 h-8 w-8 select-none self-end rounded-full bg-zinc-100 text-center text-xl leading-8 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:bg-zinc-200 hover:text-zinc-900`}
          onClick={() => close()}
        >
          close
        </span>
      </div>
    </div>
  );
};

export default ManageTextBanners;
