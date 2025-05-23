import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ImagePreview from "../../components/products/ImagePreview";
import Rating from "../../components/reviews/Rating";
import { Link, useParams } from "react-router-dom";
import { Product, Variant } from "../../interfaces/products";
import { slugify } from "../../func/slugify";
import { useCart } from "../../contexts/useCart";
import { Loading } from "../../components/main/Loading";
import axiosInstance from "../../services/axiosInstance";
import { useWishlist } from "../../contexts/useWishlist";
import { showToast } from "../../func/showToast";

import axios from "axios";
import ProductReviews from "../../components/main/ProductReviews";
import useEmblaCarousel from "embla-carousel-react";

const ProductDisplay: React.FC = () => {
  const { details } = useParams();
  const { addToCart } = useCart();
  const { addToFavs } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);
  const [stats, setStats] = useState({
    totalAverage: 0,
    totalReview: 0,
  });

  const handleReviewDataChange = useCallback(
    (totalReviews: number, averageRating: number) => {
      setStats({
        totalReview: totalReviews,
        totalAverage: averageRating,
      });
    },
    [],
  );
  const targetRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth" }); // Smooth scrolling effect
    }
  };

  const prodId = product?._id || "";
  const name = product?.name || "";
  const productSlug = slugify(name);
  const brand = product?.brand || "";

  const description = product?.description || "";
  const specification = product?.specifications || [""];

  const variants = useMemo(() => {
    return product && product.variants
      ? product.variants.filter(() => true) // Replace with actual filter logic if needed
      : [];
  }, [product]);

  const variantName = variant?.variantName || "";
  const variantColor = variant?.variantColor || "";
  const variantPrice = variant?.variantPrice || 0;
  const variantStocks = variant?.variantStocks || 0;
  const variantImgs = variant?.variantImgs || [""];
  const inTheBox = variant?.variantContent || [""];
  const variantId = variant?._id || "";
  const isOnSale = variant?.saleId || false;
  const salePrice = variant?.saleId?.salePrice || null;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isButtonsVisible, setIsButtonsVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsButtonsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    const currentButtonRef = buttonRef.current;
    if (currentButtonRef) observer.observe(currentButtonRef);

    return () => {
      if (currentButtonRef) observer.unobserve(currentButtonRef);
    };
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  useEffect(() => {
    if (!emblaApi) return;

    const selectedIndex = variants.findIndex(
      (variant) => variant._id === variantId,
    );

    if (selectedIndex !== -1) {
      emblaApi.scrollTo(selectedIndex, false); // `true` enables snapping
    }
  }, [emblaApi, variantId, variants]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${details}`);
        setProduct(response.data.product);
        setVariant(response.data.variant);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          window.location.href = "/404";
        }
      }
    };
    fetchProduct();
  }, [details]);

  const handleAddToFavs = async () => {
    const item = {
      productId: prodId,
      variantId: variantId,
      quantity: 1,
    };
    addToFavs(item);
  };

  const handleAddToCart = () => {
    if (variantStocks <= 0) {
      showToast(
        "No stock available. Try again later or Contact Customer Service",
        "warning",
      );
    }
    const cartItem = {
      productId: prodId,
      variantId: variantId,
      quantity: 1,
    };
    addToCart(cartItem);
  };

  return (
    <div className="roboto-regular mt-4 flex flex-col justify-center overflow-auto pb-10 text-zinc-700 lg:flex-row lg:items-start lg:gap-10">
      {product ? (
        <>
          <div className="relative mt-1 flex w-full flex-col items-center gap-4 px-4 py-6">
            {/*Image Prev*/}

            <div className="max-w-[400px]">
              <ImagePreview
                images={variantImgs}
                altname={name + variantName + variantColor}
                gallery={true}
              />
            </div>
            <div className="flex w-full flex-col justify-center gap-2">
              {isOnSale ? (
                <>
                  <p className="roboto-black flex-0 flex flex-wrap gap-2 text-4xl">
                    <span>€ {salePrice?.toFixed(2) ?? "0.00"}</span>{" "}
                    <span className="relative flex gap-2 text-sm">
                      <s className="text-zinc-400">
                        € {variantPrice?.toFixed(2) ?? "0.00"}
                      </s>
                      {salePrice && (
                        <span className="flex h-4 bg-red-700 px-1.5 text-center text-xs text-white">
                          -
                          {Math.round(
                            ((variantPrice - salePrice) / variantPrice) * 100,
                          )}
                          %
                        </span>
                      )}
                    </span>
                  </p>
                </>
              ) : (
                <p className="roboto-black flex-0 text-4xl">
                  € {variantPrice?.toFixed(2) ?? "0.00"}
                </p>
              )}

              <div
                ref={buttonRef}
                className="buttons flex w-full flex-col justify-center gap-4 md:flex-row md:items-center"
              >
                <div className="flex w-full flex-1 gap-4">
                  <button
                    className="roboto-medium w-full max-w-[250px] self-center rounded-full bg-zinc-900 py-2 text-lg text-white transition-all duration-100 hover:bg-zinc-700 focus:bg-zinc-950"
                    onClick={handleAddToCart}
                    disabled={variantStocks === 0}
                  >
                    {variantStocks > 0 ? "Add to cart" : "Not Available"}
                  </button>
                  <div className="group">
                    <button
                      className="w-[50px] self-center rounded-full bg-zinc-900 px-4 py-2 text-zinc-100 transition-all duration-300 ease-out focus:bg-zinc-300 focus:text-red-700 group-hover:bg-zinc-400 md:max-w-[300px]"
                      onClick={handleAddToFavs}
                    >
                      <span className="material-symbols-outlined filled flex justify-center text-2xl">
                        favorite
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`fixed left-0 right-0 flex justify-center z-10 bg-white py-4 transition-all duration-300 ${isButtonsVisible ? "-bottom-40" : " bottom-12 md:bottom-0"}`}
              >
                <div className="flex w-full max-w-[300px] gap-4 rounded-full">
                  <button
                    className="roboto-medium w-full rounded-full bg-zinc-900 py-2 text-white hover:bg-zinc-700"
                    onClick={handleAddToCart}
                    disabled={variantStocks === 0}
                  >
                    {variantStocks > 0 ? "Add to cart" : "Not Available"}
                  </button>
                </div>
              </div>

              <div className="roboto-medium mt-1 flex w-full text-xl">
                <span>
                  {name} {variantName && `- ${variantName}`}{" "}
                  {variantColor && `(${variantColor})`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <Rating
                    filledStars={Math.floor(stats.totalAverage)}
                    starSize={"2xl"}
                    starLength={5}
                  ></Rating>
                  <div className="mt-[1px] flex items-center">
                    <p className="ml-1 content-center text-[14px] font-medium leading-[14px] text-gray-500">
                      {stats.totalAverage}
                    </p>
                    <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-500"></span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleScroll();
                      }}
                      className="text-[14px] font-medium leading-[14px] text-gray-500 underline hover:no-underline"
                    >
                      {stats.totalReview} reviews
                    </a>
                  </div>
                </div>
                {
                  <p
                    className={`roboto-medium text-sm ${variantStocks > 0 ? "" : "text-zinc-500"}`}
                  >
                    {variantStocks > 0 ? (
                      variantStocks <= 10 ? (
                        <span className="text-red-700 underline">
                          Only{" "}
                          <span className="font-extrabold">
                            {variant?.variantStocks}
                          </span>{" "}
                          left in stock!
                        </span>
                      ) : (
                        "In Stock"
                      )
                    ) : (
                      "Not Available"
                    )}
                  </p>
                }
              </div>
            </div>
            {variants.length > 1 && (
              <div className="lg:self-start">
                <p className="text-start text-xs font-medium tracking-wide text-zinc-700">
                  Select Options:
                </p>
                <div
                  ref={emblaRef}
                  className="w-[350px] overflow-x-hidden sm:w-[400px]"
                >
                  <div className="embla__container flex flex-row gap-2 py-3">
                    {variants.map((variant, index) => (
                      <Link
                        key={index}
                        to={
                          variantId !== variant._id
                            ? `/product/${productSlug}_${prodId}_${variant._id}`
                            : "#"
                        }
                        className="embla__slide group flex-none group-hover:cursor-pointer"
                      >
                        <div
                          className="relative flex h-36 w-32 flex-col items-center justify-center rounded-sm border-2 bg-white px-2 py-2"
                          title={`${name} ${variant.variantName} ${variant.variantColor}`}
                        >
                          <div
                            className={`absolute h-full w-full group-hover:bg-zinc-500/10 ${variantId === variant._id && "bg-zinc-500/10"}`}
                          ></div>
                          <div className="flex-2 max-h-20 w-[100px]">
                            <div>
                              <ImagePreview
                                images={variant.variantImgs}
                                altname={
                                  name +
                                  variant.variantName +
                                  variant.variantColor
                                }
                                gallery={false}
                              />
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col items-center px-2">
                            <p className="whitespace-nowrap text-center text-sm">
                              {name}
                            </p>
                            <p className="max-w-24 truncate text-center text-xs">
                              {variant.variantName} {variant.variantColor}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <p className="text-center text-xs text-zinc-500">
                  {variants.findIndex((v) => v._id === variantId) + 1} /{" "}
                  {variants.length}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <Loading></Loading>
      )}

      <div className="mt-5 flex w-full flex-col gap-4 text-left md:mt-8">
        <div className="flex flex-col gap-2 border-b-[1px] pb-2">
          <span className="roboto-bold border-b-[1px] border-zinc-200 px-4 py-1 text-center text-2xl uppercase tracking-tighter">
            Description
          </span>
          <span className="roboto-black self-center text-2xl uppercase">
            {brand}
          </span>
          <p className="roboto whitespace-pre-line text-pretty text-sm">
            {description}
          </p>
          <span className="roboto-bold -mb-2 self-center">In the box</span>
          <ul className="self-center text-sm">
            {inTheBox.map((item, index) => (
              <li key={index} className="text-center">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 border-b-[1px] pb-2">
          <span className="roboto-bold border-b-[1px] border-zinc-200 px-4 py-1 text-center text-2xl uppercase tracking-tighter">
            Specifications
          </span>
          <table className="w-full table-auto">
            <tbody className="leading-5">
              {Object.entries(specification).map(([key, value], index) => (
                <tr key={index} className="hover:bg-zinc-100">
                  <td className="roboto-bold px-2 py-1 align-top uppercase tracking-wide">
                    <div>{key}</div>
                  </td>
                  <td className="flex flex-wrap px-2 py-1">
                    <div className="flex flex-wrap">{value}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div ref={targetRef}>
          {prodId && (
            <ProductReviews
              productId={prodId}
              onReviewDataChange={handleReviewDataChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
