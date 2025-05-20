import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { Link } from "react-router-dom";
import Rating from "../../components/reviews/Rating";
import { slugify } from "../../func/slugify";
import ModifyReview from "./ModifyReview";
import { UserReviewProps } from "../../interfaces/userReviews";
import { showToast } from "../../func/showToast";


const UserReviews = () => {
  const [reviews, setReviews] = useState<UserReviewProps[]>([]);

  const [currentReview, setCurrentReview] = useState<UserReviewProps | null>();

  const getUserReviews = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-user-reviews");
      setReviews(response.data.reviews);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  }, []);

  useEffect(() => {
    getUserReviews();
  }, [getUserReviews]);

  return (
    <>
      {currentReview && (
        <ModifyReview
          review={currentReview}
          close={() => setCurrentReview(null)}
          getUserReviews={getUserReviews}
        ></ModifyReview>
      )}
      <div className="mb-2 mt-4 flex h-full w-full flex-col gap-2">
        <p
          className={`roboto-medium flex self-start rounded-t border-zinc-300 bg-zinc-200 px-2 text-lg`}
        >
          Reviews
        </p>
        {reviews.length > 0 && (
          <>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
              {reviews.map((review, index) => {
                const productSlug = slugify(review.name);
                return (
                  <div
                    key={index}
                    className="flex w-full flex-col items-start rounded-lg border-[1px] border-zinc-300 p-2 sm:max-w-[500px]"
                  >
                    <Link
                      to={`/product/${productSlug}_${review.productId}_${review.variantId}`}
                      onClick={(e) => {
                        e.preventDefault();

                        window.open(
                          `/product/${productSlug}_${review.productId}_${review.variantId}`,
                          "_blank",
                        );
                      }}
                      className="group flex w-full items-start gap-3"
                    >
                      <div className="relative flex h-16 w-16 flex-shrink-0 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                        <img
                          className="h-full object-scale-down p-2"
                          src={review.variantImg}
                        ></img>
                      </div>
                      <div className="flex w-full flex-col py-1">
                        <h1 className="roboto-medium max-h-[64px] max-w-[250px] overflow-clip text-ellipsis text-sm text-zinc-800 hover:underline">
                          {review.name} {review.variantName}{" "}
                          {review.variantColor}{" "}
                        </h1>
                        <div className="flex items-center gap-2">
                          <Rating
                            filledStars={review.rating}
                            starSize="xl"
                            starLength={5}
                          />
                          <h1 className="roboto-medium -mb-0.5 text-sm text-zinc-700">
                            {review.title ? review.title : ""}
                          </h1>
                        </div>
                        <p className="ml-0.5 mt-1 text-xs text-zinc-500">
                          Reviewed on{" "}
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </Link>

                    <div className="mb-2 flex h-full w-full flex-col justify-start border-y-[1px] text-zinc-700">
                      <p className="max-h-[100px] overflow-hidden overflow-y-auto text-ellipsis whitespace-pre-line text-pretty rounded-md p-1.5 text-xs">
                        {review.message ? review.message : ""}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-end gap-2">
                      {review.updatedAt && (
                        <p className="text-xs text-zinc-500">
                          Updated on{" "}
                          {new Date(review.updatedAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}
                      <button
                        type="button"
                        className={`flex self-end rounded-full bg-zinc-700 px-2 py-1 text-xs font-medium text-white transition-all duration-200 hover:bg-zinc-600 disabled:bg-zinc-300`}
                        disabled={review.edit}
                        onClick={() => {
                          if (review.edit) {
                            showToast(
                              "You can only edit review one time",
                              "warning",
                            );
                            return;
                          }
                          setCurrentReview(review);
                        }}
                      >
                        {review.edit ? "Updated" : "Update"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UserReviews;
