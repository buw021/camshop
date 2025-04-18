import React, { useState, useCallback, useEffect } from "react";
import Rating from "../reviews/Rating";
import Reviews from "../reviews/Reviews";
import axiosInstance from "../../services/axiosInstance";

interface User {
  firstName: string;
  lastName: string;
}

interface Review {
  _id: string;
  rating: number;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  name: string;
  variantName: string;
  variantColor: string | null;
  variantImg: string;
}

interface RatingCount {
  rating: number;
  count: number;
}

interface ProductReviewProps {
  reviews: Review[];
  currentPage: number;
  limit: number;
  totalReviews: number;
  averageRating: number;
  ratingCountsArray: RatingCount[];
}

const ProductReviews: React.FC<{
  productId: string;
  onReviewDataChange: (totalReviews: number, averageRating: number) => void;
}> = ({ productId, onReviewDataChange }) => {
  const [reviews, setReviews] = useState<ProductReviewProps>();
  const [rating, setRating] = useState<number | null>(null);
  const getProductReviews = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-product-reviews", {
        params: {
          productId: productId,
          currentPage: 1,
          limit: 10,
          filter: rating,
        },
      });
      setReviews(response.data);
      onReviewDataChange(
        response.data.totalReviews,
        response.data.averageRating,
      );
    } catch (error) {
      console.error("Error fetching product reviews:", error);
    }
  }, [onReviewDataChange, productId, rating]);

  useEffect(() => {
    getProductReviews();
  }, [getProductReviews]);

  return (
    <div className="flex flex-col gap-4">
      <span className="roboto-bold mb-2 border-b-[1px] border-zinc-200 px-4 py-1 text-center text-2xl uppercase tracking-tighter">
        Reviews
      </span>

      <div className="flex flex-col items-center justify-center gap-2">
        <div className="mb-4 flex gap-4 border-b-[1px] border-zinc-200 pb-4">
          <ul className="flex flex-row flex-wrap items-center justify-center gap-2">
            {[
              ...(reviews?.ratingCountsArray?.map((rating) => rating.rating) ||
                []),
              "All",
            ]
              .reverse()
              .map((num) => {
                let ratingCount = 0;
                if (num !== "All") {
                  ratingCount =
                    reviews?.ratingCountsArray?.find((r) => r.rating === num)
                      ?.count || 0;
                } else {
                  ratingCount = reviews?.totalReviews || 0;
                }
                return (
                  <li
                    key={num}
                    className="flex items-center justify-center gap-1 rounded-full border-[1px] px-3 py-1 hover:cursor-pointer"
                    onClick={() => {
                      setRating(num === "All" ? null : Number(num));
                    }}
                  >
                    <span className="roboto-medium text-xs">{num}</span>
                    <Rating filledStars={1} starSize={"xl"} starLength={1} />

                    <p className="flex items-center gap-1">
                      <span className="text-xs">({ratingCount})</span>
                    </p>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 md:gap-10">
        {reviews && reviews.reviews.length > 0 ? (
          reviews.reviews.map((review) => (
            <Reviews
              key={review._id}
              firstName={review.user.firstName}
              lastName={review.user.lastName}
              reviewNum={review.rating}
              reviewDate={review.createdAt}
              reviewTitle={review.title}
              reviewMessage={review.message}
            />
          ))
        ) : (
          <p className="text-sm font-medium tracking-wide text-zinc-700">
            No Reviews available
            {rating !== null ? ` with ${rating} rating/s` : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
