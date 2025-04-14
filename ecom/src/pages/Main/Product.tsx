import React, { useEffect, useState } from "react";
import ImagePreview from "../../components/products/ImagePreview";
import Rating, { reviewStats } from "../../components/reviews/Rating";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Link, useParams } from "react-router-dom";
import Navigation from "../../components/main/Navigation";
import { Product, Variant } from "../../interfaces/products";
import { slugify } from "../../func/slugify";
import { useCart } from "../../contexts/useCart";
import { Loading } from "../../components/main/Loading";
import axiosInstance from "../../services/axiosInstance";
import { useWishlist } from "../../contexts/useWishlist";
import { showToast } from "../../func/showToast";

import axios from "axios";

const reviewData = [
  {
    reviewId: 0,
    userId: 1,
    productId: 0,
    reviewDate: "July 5, 2024",
    reviewNumber: 5,
    reviewTitle: "Lorem ipsum dolor sit amet.",
    reviewText:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores nulla quibusdam tenetur fugiat optio odit quae animi cupiditate vero praesentium.",
  },
  {
    reviewId: 1,
    userId: 1,
    productId: 1,
    reviewDate: "",
    reviewNumber: 5,
    reviewTitle: "",
    reviewText: "",
  },
  {
    reviewId: 2,
    userId: 1,
    productId: 0,
    reviewDate: "January 05, 2024",
    reviewNumber: 5,
    reviewTitle: "Lorem ipsum dolor sit amet.",
    reviewText:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolores nulla quibusdam tenetur fugiat optio odit quae animi cupiditate vero praesentium.",
  },
];

//ADD USER DATA

const ProductDisplay: React.FC = () => {
  const { details } = useParams();
  const { addToCart } = useCart();
  const { addToFavs } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState<Variant | null>(null);

  const prodId = product?._id || "";
  const name = product?.name || "";
  const productSlug = slugify(name);
  const brand = product?.brand || "";
  const category = product?.category || "";
  const description = product?.description || "";
  const specification = product?.specifications || [""];
  const subCategory = product?.subCategory || "";
  const variants: Variant[] = product?.variants ?? [];

  const variantName = variant?.variantName || "";
  const variantColor = variant?.variantColor || "";
  const variantPrice = variant?.variantPrice || 0;
  const variantStocks = variant?.variantStocks || 0;
  const variantImgs = variant?.variantImgs || [""];
  const inTheBox = variant?.variantContent || [""];
  const variantId = variant?._id || "";
  const isOnSale = variant?.saleId || false;
  const salePrice = variant?.saleId?.salePrice || null;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`/product/${details}`);
        setProduct(response.data.product);
        setVariant(response.data.variant);
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

  const filteredRating = reviewData
    .filter((review) => review.productId === 1)
    .map((review) => ({
      productID: review.productId,
      review: review.reviewNumber,
    }));

  const stats = reviewStats(filteredRating, 1);

  return (
    <div className="roboto-regular flex flex-col items-center justify-center overflow-auto text-zinc-700">
      <Navigation category={category} subCategory={subCategory}></Navigation>
      <div></div>
      {product ? (
        <>
          <div className="mt-1 flex w-full flex-col items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 py-6 md:flex-row">
            {/*Image Prev*/}
            <div className="flex-2 max-w-lg self-center md:self-start">
              <div className="roboto-medium flex flex-col gap-3">
                <div className="flex max-w-[500px] flex-col gap-2">
                  <span className="roboto-black text-2xl uppercase">
                    {brand}
                  </span>

                  <div className="md:max-w-[85%]">
                    {
                      <ImagePreview
                        images={variantImgs}
                        altname={name + variantName + variantColor}
                        gallery={true}
                      />
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="flex max-w-[500px] flex-1 flex-col justify-center gap-2">
              <div className="roboto-medium mt-1 flex w-full flex-wrap text-3xl">
                <span>
                  {name} {variantName}
                </span>{" "}
                <span>{variantColor}</span>
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
              <div className="buttons mb-2 flex w-full flex-col justify-center gap-4 md:flex-row md:items-center">
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

              <div className="roboto-regular flex flex-col gap-1">
                {variants.length > 1 && (
                  <>
                    <p className="roboto-medium text-lg">Select Variation :</p>
                    <div className="flex flex-row justify-start gap-1">
                      {variants.map((variant, index) => (
                        <Link
                          key={index}
                          to={
                            variantId !== variant._id
                              ? `/product/${productSlug}_${prodId}_${variant._id}`
                              : "#"
                          }
                          className="group group-hover:cursor-pointer"
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
                  </>
                )}
              </div>
            </div>
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
          <p className="roboto text-pretty text-sm">{description}</p>
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
        {/*REviews*/}
        <div className="flex flex-col gap-4">
          <span className="roboto-bold mb-2 border-b-[1px] border-zinc-200 px-4 py-1 text-center text-2xl uppercase tracking-tighter">
            Reviews
          </span>

          <div className="flex flex-col items-center justify-center gap-2">
            <div className="mb-4 flex gap-4 border-b-[1px] border-zinc-200 pb-4">
              <ul className="flex flex-row flex-wrap items-center justify-center gap-2">
                {/*["All", 5, 4, 3, 2, 1].map((num) => (
                  <li
                    key={num}
                    className="flex items-center justify-center gap-1 rounded-full border-[1px] px-3 py-1 hover:cursor-pointer"
                  >
                    <span className="roboto-medium text-xs">{num}</span>
                    <Rating filledStars={1} starSize={"xl"} starLength={1} />

                    <p className="flex items-center gap-1">
                      <span className="text-xs">(12)</span>
                    </p>
                  </li>
                ))*/}
              </ul>
            </div>

            <div className="flex flex-col gap-4 md:gap-10">
              {/*reviews.map((review) => (
                <Reviews
                  firstName=""
                  lastName=""
                  reviewNum={review.reviewNumber}
                  reviewDate={review.reviewDate}
                  reviewTitle={review.reviewTitle}
                  reviewText={review.reviewText}
                />
              ))*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
