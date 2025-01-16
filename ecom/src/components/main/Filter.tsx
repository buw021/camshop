import { useCallback, useEffect, useState } from "react";
// bug in pricerange change value
import { Filter } from "../../interfaces/filter";
import { AnimatePresence, motion } from "framer-motion";

import axiosInstance from "../../services/axiosInstance";
import PriceRangeSelector from "./PriceRangeSelector";
import { b } from "framer-motion/client";

interface FilterList {
  subcategories: { subCategory: string }[];
  colors: { colors: string }[];
  prices: number[];
  brands: { brand: string }[];
}

const ProductFilter: React.FC<{
  handleFilter: (filters: Filter) => void;
  toggle: boolean;
  toggleFilter: () => void;
  category: string;
}> = ({ handleFilter, toggleFilter, toggle, category }) => {
  const [filterList, setFilterList] = useState<FilterList>({
    subcategories: [],
    colors: [],
    prices: [],
    brands: [],
  });

  const lowestPrice = Math.min(...filterList.prices);
  const highestPrice = Math.max(...filterList.prices);
  const [filters, setFilters] = useState<Filter>({
    subCategory: "",
    brand: "",
    minPrice: 0,
    maxPrice: null,
    onSale: false,
    colors: [],
    specs: [],
  });
  const [filter, setFilter] = useState(toggle);

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

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleColorChange = (color: string) => {
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
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
    console.log(filters);
  };
  const applyFilters = () => {
    handleFilter(filters);
    console.log(filters);
  };

  return (
    <>
      <AnimatePresence>
        {toggle && (
          <motion.div
            className={`absolute right-0 z-20 mt-8 flex w-[300px] flex-col gap-2.5 bg-white p-2.5 text-sm drop-shadow-lg`}
            initial={{ opacity: 0, y: -5 }}
            exit={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-end">
              <button
                onClick={toggleFilter}
                className="flex items-center rounded border-b-2 border-zinc-500 transition-all duration-100 hover:border-zinc-400"
              >
                <span
                  className={`material-symbols-outlined $ text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
                >
                  close
                </span>
              </button>
            </div>
            {/* Subcategory filter */}
            <div className="flex gap-2">
              <label htmlFor="subcategory">Type:</label>
              <select
                name="subCategory"
                onChange={handleFilterChange}
                className="w-full border-b-[2px] capitalize outline-none"
              >
                {/* Map your subcategories here */}
                <option value={""}></option>
                {filterList.subcategories.map((item, index) => (
                  <option
                    key={index}
                    value={item.subCategory}
                    className="capitalize"
                  >
                    {item.subCategory}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <label htmlFor="brand">Brand:</label>
              {/* Brand filter */}
              <select
                name="brand"
                onChange={handleFilterChange}
                className="w-full border-b-[2px] capitalize outline-none"
              >
                <option value={""}></option>
                {filterList.brands.map((item, index) => (
                  <option key={index} value={item.brand} className="capitalize">
                    {item.brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range filter */}

            <PriceRangeSelector
              min={0}
              max={highestPrice}
              priceRange={handlePriceRangeChange}
            ></PriceRangeSelector>

            {/* On sale filter */}
            <div className="flex items-center gap-1">
              <label>On Sale</label>
              <input
                type="checkbox"
                name="onSale"
                onChange={handleFilterChange}
              />
            </div>

            {/* Color filter */}

            <button onClick={applyFilters}>Apply Filters</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductFilter;
