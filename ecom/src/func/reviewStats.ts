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
