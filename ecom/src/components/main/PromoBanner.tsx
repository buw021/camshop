import React, { useEffect, useRef, useState, useCallback } from "react";
import axiosInstance from "../../services/axiosInstance";

const PromoBanner: React.FC<{ expand: boolean }> = ({ expand }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [textBanner, setTextBanner] = useState();

  const fetchTextBanners = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-text-banners");
      if (response.status === 200) {
        setTextBanner(response.data);
      }
    } catch (error) {
      console.error("Error fetching text banners:", error);
    }
  }, []);

  useEffect(() => {
    fetchTextBanners();
  }, [fetchTextBanners]);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.scrollWidth;
        setShouldAnimate(textWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow); // Recheck on window resize

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  return (
    <>
      {textBanner && (
        <div
          ref={containerRef}
          className={`absolute -bottom-4 w-full bg-zinc-700 py-0.5 transition-all duration-200 ease-in ${expand ? "opacity-0" : "delay-1000"} `}
        >
          <div
            ref={textRef}
            className={`whitespace-nowrap px-4 text-xs font-medium text-white ${shouldAnimate ? "promo-text" : "text-center"}`}
          >
            {textBanner}
          </div>
        </div>
      )}
    </>
  );
};

export default PromoBanner;
