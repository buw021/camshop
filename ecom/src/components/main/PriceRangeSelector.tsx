import React, { useCallback, useEffect, useRef, useState } from "react";

//Add Debounce for onchange
//Update Input


const PriceRangeSelector: React.FC<{
  min: number;
  max: number;
  priceRange: (min: number, max: number) => void;
}> = ({ min, max, priceRange }) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max],
  );

  const handleChange = () => {
    priceRange(minVal, maxVal);
  };

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex w-[200px] items-center">
        <div>
          <input
            type="range"
            min={min}
            max={max - 10}
            value={minVal}
            onChange={(event) => {
              const value = Math.min(Number(event.target.value), maxVal - 1);
              setMinVal(value);
              minValRef.current = value;
              handleChange();
            }}
            className="thumb thumb--left cursor-pointer"
            style={{ zIndex: minVal > max - 100 ? "5" : undefined }}
          />
          <input
            type="range"
            min={min + 10}
            max={max}
            value={maxVal}
            onChange={(event) => {
              const value = Math.max(Number(event.target.value), minVal + 1);
              setMaxVal(value);
              maxValRef.current = value;
               handleChange();
            }}
            className="thumb thumb--right cursor-pointer"
          />
          <div className="mt-[1.75px]">
            <div className="slider__track absolute" />
            <div ref={range} className="slider__range absolute" />
          </div>
        </div>
      </div>
      <div className="relative flex w-[200px] justify-between pt-5">
        <div className="relative flex w-20 flex-col items-center gap-1">
          <span className="text-xs font-medium tracking-wide text-zinc-500">
            Min.
          </span>
          <div className="">
            <input
              type="number"
              className="price w-16 max-w-20 rounded-lg border-[1px] border-zinc-200 py-1 text-center"
              value={minVal}
            />
          </div>
        </div>
        <div className="relative flex w-20 flex-col items-center gap-1">
          <span className="text-xs font-medium tracking-wide text-zinc-500">
            Max.
          </span>
          <div className="">
            <input
              type="number"
              className="price w-16 max-w-20 rounded-lg border-[1px] border-zinc-200 py-1 text-center"
              value={maxVal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSelector;
