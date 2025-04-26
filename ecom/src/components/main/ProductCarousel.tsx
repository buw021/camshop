import { useCallback, useEffect, useRef, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { CardLoadingSkeleton, ProductCard } from "./Card";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
interface saleId {
  salePrice: number | null;
}

interface ProductList {
  _id: string;
  productId: string;
  productName: string;
  productBrand: string;
  variantName: string;
  variantColor: string;
  variantPrice: number;
  variantImgs: string[];
  saleId: saleId | null;
  variantStocks: number;
  variantContent: string[];
}

const ProductCarousel = () => {
  const limit = 10;
  const maxPreviews = 4;
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductList[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, // Enable infinite looping
    align: "start", // Align slides to the start
    slidesToScroll: 1, // Scroll 1 slide at a time
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const fetchProducts = useCallback(
    async (retryCount = 0) => {
      try {
        // Set loading to true before fetching
        const response = await axiosInstance.get("/home-products", {
          params: { limit },
        });
        const fetchedVariants = response.data.variants;
        console.log(fetchedVariants);
        setProducts(fetchedVariants);
        setLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error("Error fetching products:", error);
        if (retryCount < 3) {
          setTimeout(
            () => fetchProducts(retryCount + 1),
            Math.pow(2, retryCount) * 1000,
          );
        } else {
          setLoading(false); // Ensure loading is set to false in case of error
        }
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div ref={emblaRef} className="flex flex-col overflow-hidden">
      <div className="embla__container grid auto-cols-[50%] grid-flow-col border-b-2 border-zinc-100 sm:auto-cols-[33.333%] xl:auto-cols-[25%]">
        {loading
          ? Array.from({ length: maxPreviews }, (_, index) => (
              <div key={index} className="">
                <CardLoadingSkeleton />
              </div>
            ))
          : products.map((variant) => (
              <div key={variant._id} className="select-none p-2">
                <ProductCard
                  id={variant.productId}
                  name={variant.productName}
                  variantId={variant._id}
                  price={variant.variantPrice}
                  salePrice={variant.saleId?.salePrice ?? null}
                  brand={variant.productBrand}
                  thumbnail={variant.variantImgs[0]}
                  variantName={variant.variantName}
                  color={variant.variantColor}
                />
              </div>
            ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
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
        <Link to={"/"} className="mr-2 self-end">
          <h1 className="roboto-medium relative flex text-base text-zinc-700 underline underline-offset-4 group-hover:text-zinc-950">
            <span>View more products</span>
          </h1>
        </Link>
      </div>
    </div>
  );
};

export default ProductCarousel;
