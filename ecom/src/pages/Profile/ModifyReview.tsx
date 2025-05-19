import React from "react";
import { UserReviewProps } from "../../interfaces/userReviews";
import { slugify } from "../../func/slugify";
import { Link } from "react-router-dom";
import RatingSelector from "../../components/reviews/SelectRate";
import axiosInstance from "../../services/axiosInstance";
import { showToast } from "../../func/showToast";


type RatingData = {
  rate: number;
  title?: string;
  message?: string;
};
const ModifyReview: React.FC<{
  review: UserReviewProps;
  close: () => void;
  getUserReviews: () => void;
}> = ({ review, close, getUserReviews }) => {
  const [ratingData, setRatingData] = React.useState<RatingData>({
    rate: review.rating,
    title: review.title,
    message: review.message,
  });
  const productSlug = slugify(review.name);

  const updateReview = async () => {
    if (!window.confirm("Are you sure you want to update your review?")) {
      return;
    }
    try {
      const response = await axiosInstance.post("/update-review", {
        reviewId: review._id,
        ratingData,
      });
      if (response.status === 200) {
        showToast("Review updated successfully", "success");
        getUserReviews();
        close();
      } else {
        showToast("Failed to update review", "error");
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  return (
    <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-zinc-900/50 p-5 sm:p-10">
      <div className="relative flex w-full flex-col items-center gap-2">
        {review && (
          <>
            <div className="relative flex w-full flex-col items-start rounded-lg border-[1px] border-zinc-300 bg-white p-2 sm:max-w-[500px]">
              <span
                className={`material-symbols-outlined absolute right-2 top-2 text-zinc-800 transition-all duration-100 hover:cursor-pointer hover:text-zinc-500`}
                onClick={close}
              >
                close
              </span>
              <div className="flex w-full items-start gap-3">
                <Link
                  to={`/product/${productSlug}_${review.productId}_${review.variantId}`}
                  onClick={(e) => {
                    e.preventDefault();

                    window.open(
                      `/product/${productSlug}_${review.productId}_${review.variantId}`,
                      "_blank",
                    );
                  }}
                  className=""
                >
                  <div className="relative flex h-16 w-16 flex-shrink-0 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                    <img
                      className="h-full object-scale-down p-2"
                      src={review.variantImg}
                    ></img>
                  </div>
                </Link>
                <Link
                  to={`/product/${productSlug}_${review.productId}_${review.variantId}`}
                  onClick={(e) => {
                    e.preventDefault();

                    window.open(
                      `/product/${productSlug}_${review.productId}_${review.variantId}`,
                      "_blank",
                    );
                  }}
                  className="py-1"
                >
                  <h1 className="roboto-medium max-h-[64px] max-w-[250px] overflow-clip text-ellipsis text-sm text-zinc-800 hover:underline">
                    {review.name} {review.variantName} {review.variantColor}{" "}
                  </h1>
                </Link>
              </div>

              <div className="mb-2 flex h-full w-full flex-col justify-start gap-2 text-zinc-700">
                <RatingSelector
                  rating={review.rating}
                  onRateChange={(rate) =>
                    setRatingData((prev) => ({
                      ...prev,
                      rate: rate,
                    }))
                  }
                ></RatingSelector>
                <input
                  type="text"
                  value={ratingData.title || ""}
                  onChange={(e) =>
                    setRatingData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  maxLength={100}
                  placeholder="Subject (Optional)"
                  className="rounded-md border p-2 text-sm font-medium outline-none"
                />

                {/* Message Textarea */}

                <textarea
                  value={ratingData.message || ""}
                  onChange={(e) =>
                    setRatingData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Message (Optional)"
                  rows={3}
                  maxLength={5000}
                  className="h-36 resize-none overflow-y-auto rounded-md border p-2 text-sm text-xs outline-none"
                />
              </div>
              <button
                type="button"
                className={`flex self-end rounded-full bg-zinc-700 px-2 py-1 text-xs font-medium text-white transition-all duration-200 hover:bg-zinc-600`}
                onClick={updateReview}
              >
                Update Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModifyReview;
