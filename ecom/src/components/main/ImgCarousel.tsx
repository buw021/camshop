import useEmblaCarousel from "embla-carousel-react";
import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
interface Image {
  filepath: string;
  active: boolean;
  _id: string;
}

const ImgCarousel: React.FC<{ imgs: string[]; prev?: string }> = ({ prev }) => {
  const [images, setImages] = useState<Image[]>();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, // Enable infinite looping
    align: "start", // Align slides to the start
    slidesToScroll: "auto", // Automatically determine the number of slides to scroll
  });

  const fetchBanners = useCallback(async () => {
    try {
      const reponse = await axiosInstance.get("/get-banners");
      if (reponse.status === 200) {
        setImages(reponse.data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const timerRef = React.useRef<number | null>(null);

  const clearAndRestartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (emblaApi) {
      timerRef.current = setInterval(() => {
        emblaApi.scrollNext();
      }, 5000);
    }
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    clearAndRestartTimer();

    const onUserScroll = () => {
      clearAndRestartTimer();
    };

    emblaApi.on("pointerUp", onUserScroll);
    emblaApi.on("select", onUserScroll);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      emblaApi.off("pointerUp", onUserScroll);
      emblaApi.off("select", onUserScroll);
    };
  }, [emblaApi, clearAndRestartTimer]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const optimizeCloudinaryUrl = (
    url: string,
    transformation = "f_auto,q_auto,w_800",
  ) => {
    return url.replace("/upload/", `/upload/${transformation}/`);
  };

  return (
    <div ref={emblaRef} className="flex w-full flex-col overflow-hidden">
      <div
        className={`embla__container ${prev ? "prev" : "flex h-52 flex-nowrap sm:h-56 md:h-96 lg:h-[30rem]"}`}
      >
        {images &&
          images.map((img) => (
            <div
              key={img._id}
              className="big-banner flex h-full w-full flex-shrink-0 flex-grow-0 items-center"
            >
              <img
                alt=""
                src={optimizeCloudinaryUrl(img.filepath, "f_auto,q_auto,w_600")}
                srcSet={`
    ${optimizeCloudinaryUrl(img.filepath, "f_auto,q_auto,w_400")} 400w,
    ${optimizeCloudinaryUrl(img.filepath, "f_auto,q_auto,w_800")} 800w,
    ${optimizeCloudinaryUrl(img.filepath, "f_auto,q_auto,w_1920")} 1200w
  `}
                sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
                className="h-full w-full object-contain"
              />
            </div>
          ))}
      </div>
      <div className="mt-2 hidden items-center justify-between">
        <div className="flex items-center gap-1 self-end">
          <button
            className={`relative flex h-8 w-8 items-center justify-center rounded-l-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer`}
            onClick={() => scrollPrev()}
          >
            <span className="material-symbols-outlined absolute right-0.5 text-lg leading-3">
              arrow_back_ios
            </span>
          </button>
          <button
            className={`relative flex h-8 w-8 items-center justify-center rounded-r-md border-[1px] border-zinc-300 bg-zinc-200 text-sm font-medium text-zinc-700 drop-shadow-sm hover:cursor-pointer`}
            onClick={() => scrollNext()}
          >
            <span className="material-symbols-outlined absolute right-1 text-lg leading-3">
              arrow_forward_ios
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImgCarousel;
