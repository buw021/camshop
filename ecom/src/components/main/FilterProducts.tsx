import React, { useState } from "react";
import FilterComponent, { Filters } from "./FilterComponent";

const ParentComponent: React.FC = () => {
  const [toggle, setToggle] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    subCategory: "",
    brand: "",
    minPrice: 0,
    maxPrice: 0,
    onSale: false,
    colors: [],
  });

  const handleToggle = () => setToggle(!toggle);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePriceRangeChange = (range: { min: number; max: number }) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      minPrice: range.min,
      maxPrice: range.max,
    }));
  };

  const applyFilters = () => {
    console.log("Applying filters:", filters);
    // Your apply filters logic here
  };

  return (
    <div>
      <button onClick={handleToggle}>Toggle Filter</button>
      <FilterComponent
        toggle={toggle}
        filters={filters}
        handleFilterChange={handleFilterChange}
        handlePriceRangeChange={handlePriceRangeChange}
        applyFilters={applyFilters}
        toggleFilter={handleToggle}
      />
    </div>
  );
};

export default ParentComponent;

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import PriceRangeSelector from "./PriceRangeSelector";

export interface Filters {
  subCategory: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  onSale: boolean;
  colors: string[];
}

interface FilterComponentProps {
  toggle: boolean;
  filters: Filters;
  handleFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handlePriceRangeChange: (range: { min: number; max: number }) => void;
  applyFilters: () => void;
  toggleFilter: () => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  toggle,
  filters,
  handleFilterChange,
  handlePriceRangeChange,
  applyFilters,
  toggleFilter,
}) => {
  return (
    <AnimatePresence>
      {toggle && (
        <motion.div
          className="absolute right-0 z-20 mt-8 flex w-[300px] flex-col gap-2.5 bg-white p-2.5 text-sm drop-shadow-lg"
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
              <span className="material-symbols-outlined text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500">
                close
              </span>
            </button>
          </div>
          {/* Subcategory filter */}
          <div className="flex gap-2">
            <label htmlFor="subCategory">Type:</label>
            <select
              name="subCategory"
              value={filters.subCategory}
              onChange={handleFilterChange}
              className="w-full border-b-[2px] capitalize outline-none"
            >
              <option value=""></option>
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
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              className="w-full border-b-[2px] capitalize outline-none"
            >
              <option value=""></option>
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
          />

          {/* On sale filter */}
          <div className="flex items-center gap-1">
            <label>On Sale</label>
            <input
              type="checkbox"
              name="onSale"
              checked={filters.onSale}
              onChange={handleFilterChange}
            />
          </div>

          <button onClick={applyFilters}>Apply Filters</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterComponent;
