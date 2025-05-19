// ImagePreview.tsx
import { useEffect, useState } from "react";


interface ImagePreviewProps {
  images?: string[];
  altname: string;
  gallery: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images = [""],
  altname,
  gallery,
}) => {
  const [imgPrev, setImgPrev] = useState(images[0]);
  const [selectedImg, setSelectedImg] = useState(images[0]);
  const [galleryPrev, setGalleryPrev] = useState(false);
  const [galleryImgPrev, setGalleryImgPrev] = useState(images[0]);
  const [gallerytSelectedImg, setGallerySelectedImg] = useState(images[0]);
  const [animateClose, setAnimateClose] = useState(false);

  useEffect(() => {
    setImgPrev(images[0]);
    setSelectedImg(images[0]);
    setGalleryImgPrev(images[0]);
    setGallerySelectedImg(images[0]);
  }, [images]);

  const closeDiag = () => {
    setAnimateClose(true);
    setTimeout(() => {
      setAnimateClose(false);
      setGalleryPrev(!galleryPrev);
    }, 300);
  };

  const morePictures = () => {
    setGalleryPrev(!galleryPrev);
  };

  const handleGalleryImageClick = (url: string) => {
    setGalleryImgPrev(url);
    setGallerySelectedImg(url);
  };

  const handleImageClick = (url: string) => {
    setImgPrev(url);
    setSelectedImg(url);
  };

  useEffect(() => {
    if (galleryPrev) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [galleryPrev]);

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center overflow-auto">
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex w-full justify-center gap-1 rounded bg-white px-2">
            <img
              src={imgPrev}
              alt={`${altname}`}
              className="w-[550px] object-contain"
              loading="lazy"
            />
          </div>
          {gallery && (
            <>
              <div className="flex flex-row justify-between gap-2">
                {images.slice(0, 4).map((url, index) => (
                  <div
                    key={index}
                    className={`duration-400 group relative overflow-hidden rounded-sm border-[1px] border-zinc-100 bg-white transition-all ease-in hover:cursor-pointer ${selectedImg === url && "border-zinc-300"} `}
                    onClick={() =>
                      index !== 3 ? handleImageClick(url) : morePictures()
                    }
                  >
                    <div className="duration-400 absolute h-full w-full bg-none transition-all ease-in group-hover:bg-zinc-900/75"></div>
                    {images.length > 4 && index === 3 && (
                      <>
                        <div className="duration-400 absolute h-full w-full bg-zinc-900/75 transition-all ease-in"></div>
                        <span className="roboto-bold absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 text-2xl text-white">
                          +{images.length - 3}
                        </span>
                      </>
                    )}
                    <img
                      src={url}
                      alt={`${altname}`}
                      className="z-50 w-24 object-cover p-2 text-[10px]"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              {galleryPrev && (
                <>
                  <div
                    className={`fixed left-0 top-0 z-50 flex h-full w-full animate-fade-in items-center justify-center opacity-0 transition-opacity duration-500 ease-in ${
                      animateClose ? "animate-fade-out" : ""
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-zinc-500/70"
                      onClick={closeDiag}
                    ></div>
                    <div className="relative z-50 flex h-[100vh] w-[100vw] flex-col items-center justify-center gap-10 overflow-hidden bg-white p-10 md:h-[90vh] md:w-[80vw]">
                      <span
                        className={`material-symbols-outlined absolute right-0 top-0 mr-3 mt-2 text-3xl text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
                        onClick={closeDiag}
                      >
                        close
                      </span>
                      <img
                        src={galleryImgPrev}
                        alt={`${altname}`}
                        className="object-fill px-4 md:w-[35%]"
                        loading="lazy"
                      />
                      <div className="w-full overflow-x-auto px-4 py-4 md:max-w-[800px]">
                        <div className="flex flex-row gap-2 self-start">
                          {images.map((url, index) => (
                            <div
                              key={index}
                              className={`duration-400 group relative w-[100px] rounded-sm border-[1px] border-zinc-100 bg-white transition-all ease-in hover:cursor-pointer ${gallerytSelectedImg === url && "border-zinc-300"} `}
                              onClick={() => handleGalleryImageClick(url)}
                              onMouseEnter={() => handleGalleryImageClick(url)}
                            >
                              <div className="w-[100px]">
                                <div className="duration-400 absolute h-full w-full bg-none transition-all ease-in group-hover:bg-zinc-900/75"></div>
                                <img
                                  src={url}
                                  alt={`${altname}`}
                                  className="z-50 object-cover p-2 text-[10px]"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ImagePreview;
