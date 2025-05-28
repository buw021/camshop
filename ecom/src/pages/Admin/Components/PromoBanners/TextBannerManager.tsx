import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../Services/axiosInstance";
import { showToast } from "../showToast";

const TextBannerManager = () => {
  const [editText, setEditText] = useState<boolean>(false);
  const [textBanner, setTextBanner] = useState<string>();
  const [original, setOriginal] = useState<string>();

  const fetchTextBanners = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-text-banners");
      if (response.status === 200) {
        setTextBanner(response.data);
        setOriginal(response.data);
      }
    } catch (error) {
      console.error("Error fetching text banners:", error);
    }
  }, []);

  useEffect(() => {
    fetchTextBanners();
  }, [fetchTextBanners]);

  const saveBanner = async () => {
    try {
      const response = await axiosInstance.post("/save-text-banner", {
        text: textBanner,
      });
      if (response.data) {
        setTextBanner(response.data);
        fetchTextBanners();
        showToast("Successfuly saved!", "success");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* {manageText && <ManageTextBanners close={() => setManageText(false)} />} */}
      <div className="flex w-full max-w-96 flex-col items-start gap-2 rounded-md border-[1px] border-zinc-200 px-4 py-4">
        <div className="flex w-full items-center justify-between gap-1">
          <p className="text-lg font-medium leading-5 tracking-wide">
            Manage Text Banner
          </p>
          <div className="flex gap-2">
            <button
              className={`relative h-8 w-8 items-center justify-center rounded-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer hover:bg-zinc-300 ${!editText ? "flex" : "hidden"}`}
              title="Edit Banner"
              onClick={() => setEditText(true)}
            >
              <span className="material-symbols-outlined text-2xl leading-3">
                edit_square
              </span>
            </button>
            <button
              className={`relative h-8 w-8 items-center justify-center rounded-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer hover:bg-zinc-300 disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300 disabled:hover:cursor-not-allowed ${!editText ? "hidden" : "flex"}`}
              title="Save"
              disabled={original === textBanner}
              onClick={async () => {
                await saveBanner();
                setEditText(false);
              }}
            >
              <span className="material-symbols-outlined text-2xl leading-3">
                save
              </span>
            </button>
            <button
              className={`relative h-8 w-8 items-center justify-center rounded-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer hover:bg-zinc-300 ${!editText ? "hidden" : "flex"}`}
              title="Cancel"
              onClick={() => {
                if (textBanner !== original) {
                  if (window.confirm("Discard changes?")) {
                    setEditText(false);
                    setTextBanner(original);
                  }
                } else {
                  setEditText(false);
                  setTextBanner(original);
                }
              }}
            >
              <span className="material-symbols-outlined text-2xl leading-3">
                delete
              </span>
            </button>
          </div>
        </div>

        <textarea
          name="textBanner"
          id="textBanner"
          disabled={!editText}
          value={textBanner}
          onChange={(e) => setTextBanner(e.target.value)}
          className="h-[161px] w-full rounded border border-zinc-300 p-2 text-sm leading-4"
        ></textarea>
      </div>
    </>
  );
};

export default TextBannerManager;
