import { useState } from "react";

const STAR_LENGTH = 5;

interface RatingSelectorProps {
  rating?: number;
  onRateChange: (rate: number) => void; // Callback prop to notify parent
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  rating,
  onRateChange,
}) => {
  const [rate, setRate] = useState<number>(rating || 0);

  const handleRate = (index: number) => {
    const newRate = index + 1;
    setRate(newRate); // Update local state
    onRateChange(newRate); // Notify parent component
  };

  return (
    <div className="flex items-center">
      {Array(STAR_LENGTH)
        .fill(0)
        .map((_, index) => (
          <span
            key={index}
            onClick={() => handleRate(index)} // Add click handler
            className={`material-symbols-outlined filled cursor-pointer text-lg leading-5 sm:text-xl ${
              index < rate ? "text-yellow-400 saturate-[.90]" : "text-zinc-300"
            }`}
          >
            star
          </span>
        ))}
    </div>
  );
};

export default RatingSelector;
