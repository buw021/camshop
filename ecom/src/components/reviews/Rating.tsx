interface Review {
  productID: number;
  review: number;
}

export const reviewStats = (
  array: Review[],
  productID: number,
): { totalAverage: number; totalReview: number } => {
  const productReviews = array.filter((item) => item.productID === productID);
  const sum = productReviews.reduce((total, item) => total + item.review, 0);
  const average = sum / productReviews.length;
  const output = {
    totalAverage: average,
    totalReview: productReviews.length,
  };
  return output;
};

interface StarRatingProps {
  filledStars: number;
  starSize: string;
  starLength: number;
}
const Rating: React.FC<StarRatingProps> = ({
  filledStars,
  starSize,
  starLength,
}) => {
  return (
    <div className="flex items-center">
      {Array(starLength)
        .fill(0)
        .map((_, index) => (
          <span
            key={index}
            className={`material-symbols-outlined filled leading-5 text-${starSize} ${
              index < filledStars
                ? "text-yellow-400 saturate-[.90]"
                : "text-zinc-300"
            }`}
          >
            star
          </span>
        ))}
    </div>
  );
};

export default Rating;
