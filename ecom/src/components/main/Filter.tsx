import { useEffect, useRef, useState } from "react";
// bug in pricerange change value
import { Filter } from "../../interfaces/filter";
import { AnimatePresence, motion } from "framer-motion";

import axiosInstance from "../../services/axiosInstance";
import PriceRangeSelector from "./PriceRangeSelector";
import CheckBoxFilter from "./CheckBoxFilter";

interface FilterList {
  subcategories: { subCategory: string }[];
  colors: { colors: string }[];
  prices: number[];
  brands: { brand: string }[];
}

const ProductFilter: React.FC<{
  handleFilter: (filters: Filter) => void;
  category: string;
  selectedFilters: Filter;
}> = ({ handleFilter, category, selectedFilters }) => {
  const [show, setShow] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterList, setFilterList] = useState<FilterList>({
    subcategories: [],
    colors: [],
    prices: [],
    brands: [],
  });

  /*  const lowestPrice = Math.min(...filterList.prices); */
  const highestPrice = Math.max(...filterList.prices);
  const [filters, setFilters] = useState<Filter>({
    subCategory: selectedFilters.subCategory,
    brand: selectedFilters.brand,
    minPrice: null,
    maxPrice: null,
    onSale: selectedFilters.onSale,
    color: selectedFilters.color,
    specs: selectedFilters.specs,
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axiosInstance.get("/getFilters", {
          headers: { Category: category },
        });
        const data = response.data;

        if (data) {
          setFilterList(data);
          setFilters((prev) => ({
            ...prev,

            maxPrice: Math.max(...data.prices),
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (category) {
      fetchFilters();
    }
  }, [category]);

  const toggleFilter = () => {
    setShow(!show);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? (checked ? true : null) : value,
    }));
  };

  const handleSelected = (array: string[], key: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: array,
    }));
  };
  /*  const handleColorChange = (color: string) => {
    setFilters((prevFilters) => {
      const colors = [...prevFilters.colors];
      if (colors.includes(color as never)) {
        const index = colors.indexOf(color as never);
        colors.splice(index, 1);
      } else {
        colors.push(color as never);
      }
      return { ...prevFilters, colors };
    });
  }; */

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  };
  const applyFilters = () => {
    const newFilters = { ...filters };

    if (newFilters.minPrice === 0 || newFilters.minPrice === null) {
      newFilters.minPrice = null;
    }
    if (newFilters.maxPrice == highestPrice) {
      newFilters.maxPrice = null;
    }

    setFilters(newFilters);
    handleFilter(newFilters);
    setShow(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      filterRef.current &&
      !filterRef.current.contains(event.target as Node)
    ) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={filterRef}>
      <div className="relative flex gap-1">
        {category !== "all" && (
          <>
            <span
              className={`material-symbols-outlined -mt-[3px] select-none text-lg transition-all duration-300 ${
                show ? "opacity-100" : "rotate-180 opacity-0"
              }`}
            >
              keyboard_arrow_down
            </span>
            <button
              className="roboto-medium relative flex text-sm text-zinc-700 underline underline-offset-4 group-hover:text-zinc-950"
              onClick={() => toggleFilter()}
            >
              Filter
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            className={`absolute right-0 z-20 mt-2 flex w-[300px] flex-col gap-2.5 rounded-md border-[1px] border-zinc-700 bg-white p-2.5 text-sm`}
            initial={{ opacity: 0, y: -5 }}
            exit={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-end"></div>
            <div className="flex items-center gap-1 self-center">
              <label className="flex items-center px-2 text-sm font-medium hover:cursor-pointer">
                <input
                  id="onSale"
                  name="onSale"
                  type="checkbox"
                  checked={filters.onSale ? true : false}
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  onChange={handleFilterChange}
                />
                <span className="ml-2 capitalize">On Sale</span>
              </label>
            </div>
            {/* Subcategory filter */}
            <CheckBoxFilter
              list={filterList.subcategories}
              labelKey="subCategory"
              handleSelected={handleSelected}
              buttonLabel="Type"
              selectedFilters={filters.subCategory}
            />
            <CheckBoxFilter
              list={filterList.brands}
              labelKey="brand"
              handleSelected={handleSelected}
              buttonLabel="Brand"
              selectedFilters={filters.brand}
            />
            <CheckBoxFilter
              list={filterList.colors}
              labelKey="color"
              handleSelected={handleSelected}
              buttonLabel="Color"
              selectedFilters={filters.color}
            />
            {/* Price range filter */}

            <PriceRangeSelector
              min={0}
              max={highestPrice}
              priceRange={handlePriceRangeChange}
            ></PriceRangeSelector>

            {/* On sale filter */}

            {/* Color filter */}

            <button
              onClick={applyFilters}
              className="relative mt-3 self-center rounded-full bg-zinc-700 px-4 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-600"
            >
              Apply Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductFilter;
