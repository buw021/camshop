import Rating from "./Rating";
interface Reviews {
  firstName?: string;
  lastName?: string;
  reviewNum: number;
  reviewTitle?: string;
  reviewDate: string;
  reviewText?: string;
}
const Reviews: React.FC<Reviews> = ({
  firstName,
  lastName,
  reviewNum,
  reviewTitle,
  reviewDate,
  reviewText,
}) => {
  return (
    <div>
      <div className="flex flex-row flex-wrap gap-4">
        <div className="flex flex-col justify-start gap-1 p-2 max-w-[800px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-300"></div>
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
            <h1 className="roboto-bold text-sm ">{reviewTitle}</h1>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col flex-0">
              <p className="text-xs">
                Reviewed on <span className="">{reviewDate}</span>
              </p>
            </div>
            <div className="bg-zinc-200 w-[1px] h-full"></div>
            <div className="flex-1 mt-1">
              <p className="text-pretty text-xs">{reviewText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
