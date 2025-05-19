import { Link } from "react-router-dom";
import { ItemsProps } from "../../interfaces/order";
import { slugify } from "../../func/slugify";
import RatingSelector from "../reviews/SelectRate";
import { useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { showToast } from "../../func/showToast";


type RatingData = {
  rate: number;
  subject?: string;
  message?: string;
};

const Review: React.FC<{
  items: ItemsProps[];
  close: () => void;
  orderNumber: string;
  getOrderStatus: () => void;
}> = ({ items, close, orderNumber, getOrderStatus }) => {
  const [ratings, setRatings] = useState<Record<string, RatingData>>({});

  const handleRateChange = (
    productId: string,
    variantId: string,
    rate: number,
    subject?: string,
    message?: string,
  ) => {
    const key = `${productId}-${variantId}`;
    setRatings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key], // Keep existing values of subject and message
        rate, // Update only the rate
        subject, // Update subject if provided
        message, // Update message if provided
      },
    }));
  };

  const handleConfirm = async () => {
    if (!window.confirm("Are you sure you want to submit your reviews?")) {
      return;
    }
    const result = items.map((item) => {
      const key = `${item.productId}-${item.variantId}`;
      const ratingData = ratings[key] || {};
      return {
        productId: item.productId,
        variantId: item.variantId,
        rate: ratingData.rate || 0,
        subject: ratingData.subject || "",
        message: ratingData.message || "",
      };
    });

    try {
      const response = await axiosInstance.post("/submit-review", {
        reviews: result,
        orderId: orderNumber,
      });

      if (response.status === 200) {
        showToast("Reviews submitted successfully!", "success");
        getOrderStatus();
        close();
      }
    } catch (error) {
      showToast("Failed to submit your review. Please try again.", "error");
    }
    console.log(result);
  };

  return (
    <div className="absolute left-0 top-10 z-20 flex h-full w-full items-center justify-center bg-zinc-900/70 p-10 sm:p-20">
      <div className="relative mb-8 h-full w-full max-w-[1024px] rounded-md bg-white p-5 sm:p-8">
        <span
          className={`material-symbols-outlined absolute right-4 top-3 text-zinc-800 transition-all duration-100 hover:cursor-pointer hover:text-zinc-500`}
          onClick={close}
        >
          close
        </span>
        <div className="flex h-full w-full flex-col items-center justify-start gap-5 overflow-y-auto">
          <h1 className="text-2xl font-bold tracking-wider text-zinc-800 underline">
            Rate Your Order
          </h1>

          <div className="products flex h-full w-full flex-col gap-4 overflow-auto pb-2">
            {items.map((item, index) => {
              const productSlug = slugify(item.name);
              const key = `${item.productId}-${item.variantId}`;
              const currentRating = ratings[key] || {};
              return (
                <>
                  {" "}
                  <div
                    key={index}
                    className="flex items-start gap-2 border-b-[1px] border-zinc-300 pb-4"
                  >
                    <Link
                      to={`/product/${productSlug}_${item.productId}_${item.variantId}`}
                      onClick={(e) => {
                        e.preventDefault();

                        window.open(
                          `/product/${productSlug}_${item.productId}_${item.variantId}`,
                          "_blank",
                        );
                      }}
                      className=""
                    >
                      <div className="relative flex h-28 w-28 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner">
                        <img
                          className="h-full object-scale-down p-2"
                           src={item.variantImg}
                        ></img>
                      </div>
                    </Link>

                    <div className="flex h-full w-full flex-col justify-start text-zinc-700">
                      <Link
                        to={`/product/${productSlug}_${item.productId}_${item.variantId}`}
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(
                            `/product/${productSlug}_${item.productId}_${item.variantId}`,
                            "_blank",
                          );
                        }}
                      >
                        <h1 className="roboto-medium text-sm text-zinc-800 hover:underline">
                          {item.name} {item.variantName} {item.variantColor}
                        </h1>
                      </Link>
                      <RatingSelector
                        onRateChange={(rate) =>
                          handleRateChange(
                            item.productId,
                            item.variantId,
                            rate,
                            currentRating.subject,
                            currentRating.message,
                          )
                        }
                      ></RatingSelector>
                      <input
                        type="text"
                        value={currentRating.subject || ""}
                        onChange={(e) =>
                          handleRateChange(
                            item.productId,
                            item.variantId,
                            currentRating.rate || 0,
                            e.target.value,
                            currentRating.message,
                          )
                        }
                        maxLength={100}
                        placeholder="Subject (Optional)"
                        className="mt-2 rounded-md border p-2 text-sm font-medium outline-none"
                      />

                      {/* Message Textarea */}
                      <textarea
                        value={currentRating.message || ""}
                        onChange={(e) =>
                          handleRateChange(
                            item.productId,
                            item.variantId,
                            currentRating.rate || 0,
                            currentRating.subject,
                            e.target.value,
                          )
                        }
                        placeholder="Message (Optional)"
                        rows={3}
                        maxLength={5000}
                        className="mt-2 h-36 resize-none overflow-y-auto rounded-md border p-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </>
              );
            })}
          </div>
          <button
            id="confirm-review"
            name="confirm-review"
            className="roboto-medium self-end rounded-md bg-zinc-900 px-3 py-2 leading-3 text-white transition-all duration-200 hover:bg-zinc-700"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;
