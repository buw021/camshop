import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const PriceRangeSelector: React.FC<{
  min: number;
  max: number;
  priceRange: (min: number, max: number) => void;
}> = ({ min, max, priceRange }) => {
  const location = useLocation();
  const getFiltersFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : 0,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : null,
    };
  }, [location.search]);

  const { minPrice, maxPrice } = getFiltersFromUrl();

 

  const initialMin = minPrice !== null && minPrice >= min && minPrice <= max ? minPrice : min;
  const initialMax =
    maxPrice !== null && maxPrice <= max && maxPrice >= initialMin ? maxPrice : max;

  const [minVal, setMinVal] = useState(initialMin);
  const [maxVal, setMaxVal] = useState(initialMax);
  const minValRef = useRef(initialMin);
  const maxValRef = useRef(initialMax);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max],
  );

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

  const minChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(event.target.value), maxVal - 10);
    setMinVal(value);
    minValRef.current = value;
    priceRange(value, maxVal);
  };

  const maxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(event.target.value), minVal + 10);
    setMaxVal(value);
    maxValRef.current = value;
    priceRange(minVal, value);
  };

  return (
    <div className="flex flex-col items-center">
      <data className="rounded-full border-2 px-4 pb-4 pt-[14px]">
        <div className="relative flex w-[200px] items-center">
          <div>
            <input
              type="range"
              min={min}
              max={max - 10}
              value={minVal}
              onChange={(event) => {
                minChange(event);
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
                maxChange(event);
              }}
              className="thumb thumb--right cursor-pointer"
            />
            <div className="mt-[1.75px]">
              <div className="slider__track absolute" />
              <div ref={range} className="slider__range absolute" />
            </div>
          </div>
        </div>
      </data>
      <div className="relative flex w-[200px] justify-between pt-2">
        <div className="relative flex w-20 flex-col items-center gap-1">
          <label className="text-xs font-medium tracking-wide text-zinc-500">
            Min.
          </label>

          <input
            type="number"
            name="min"
            className="price w-16 max-w-20 rounded-lg border-[1px] border-zinc-200 py-1 text-center"
            min={min}
            max={max - 10}
            value={minVal}
            onChange={(event) => minChange(event)}
          />
        </div>
        <div className="relative flex w-20 flex-col items-center gap-1">
          <label
            htmlFor="max"
            className="text-xs font-medium tracking-wide text-zinc-500"
          >
            Max.
          </label>

          <input
            type="number"
            name="max"
            className="price w-16 max-w-20 rounded-lg border-[1px] border-zinc-200 py-1 text-center"
            min={min + 10}
            max={max}
            value={maxVal}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (value > max) {
                event.target.value = max.toString();
                maxChange(event);
              } else {
                maxChange(event);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSelector;
