import Rating from "./Rating";
interface ReviewsProps {
  firstName?: string;
  lastName?: string;
  reviewNum: number;
  reviewTitle?: string;
  reviewDate: string;
  reviewMessage?: string;
}
const Reviews: React.FC<ReviewsProps> = ({
  firstName,
  lastName,
  reviewNum,
  reviewTitle,
  reviewDate,
  reviewMessage,
}) => {
  return (
    <div>
      <div className="flex flex-row flex-wrap gap-4">
        <div className="flex max-w-[800px] flex-col justify-start gap-1 p-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-300"></div>
            <h2 className="text-sm hover:underline">
              {firstName || lastName ? (
                `${firstName} ${lastName?.[0]}`
              ) : (
                <span className="text-zinc-400">Unknown</span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Rating
              filledStars={5}
              starSize="lg"
              starLength={reviewNum}
            ></Rating>
            <h1 className="roboto-bold text-sm">{reviewTitle}</h1>
          </div>
          <div className="flex flex-col">
            <div className="flex-0 flex flex-col">
              <p className="ml-0.5 mt-1 text-xs text-zinc-500">
                Reviewed on{" "}
                {new Date(reviewDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="h-full w-[1px] bg-zinc-200"></div>
            <div className="mt-1 flex-1">
              <p className="text-pretty text-xs">{reviewMessage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
