

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
