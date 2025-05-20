import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Dropdown from "../../components/main/Dropdown";
import { ProductCard, CardLoadingSkeleton } from "../../components/main/Card";
import { Pagination } from "../../components/products/Pagination";
import axiosInstance from "../../services/axiosInstance";
import { Filter } from "../../interfaces/filter";
import ProductFilter from "../../components/main/Filter";

interface Category {
  category: "camera" | "lens" | "accessories" | "other" | "all";
}

interface saleId {
  salePrice: number | null;
}

interface ProductList {
  _id: string;
  productId: string;
  productName: string;
  productBrand: string;
  variantName: string;
  variantColor: string;
  variantPrice: number;
  variantImgs: string[];
  saleId: saleId | null;
  variantStocks: number;
  variantContent: string[];
}

const Product_List: React.FC<Category> = ({ category }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const sortParam = params.get("sort") || "default";
  const pageParam = parseInt(params.get("page") || "1", 10);

  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<ProductList[]>([]);
  const [page, setPage] = useState(pageParam);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [sortCriteria, setSortCriteria] = useState(sortParam);
  const [filter, setFilter] = useState(false);
  // Helper to parse filters from URL
  const getFiltersFromUrl = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      subCategory: searchParams.get("subCategory")
        ? searchParams.get("subCategory")!.split(",")
        : [],
      brand: searchParams.get("brand")
        ? searchParams.get("brand")!.split(",")
        : [],
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : 0,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : null,
      onSale: searchParams.get("onSale")
        ? searchParams.get("onSale") === "true"
        : false,
      color: searchParams.get("colors")
        ? searchParams.get("colors")!.split(",")
        : [],
      specs: searchParams.get("specs")
        ? (() => {
            try {
              return JSON.parse(searchParams.get("specs")!);
            } catch {
              return {};
            }
          })()
        : {},
    };
  }, [location.search]);

  const [selectedFilters, setSelectedFilters] =
    useState<Filter>(getFiltersFromUrl());

  // Update selectedFilters when URL changes
  useEffect(() => {
    setSelectedFilters(getFiltersFromUrl());
  }, [getFiltersFromUrl, location.search]);

  const list = [
    { value: "default", placeholder: "Default" },
    { value: "price-asc", placeholder: "Price-low to high" },
    { value: "price-desc", placeholder: "Price-high to low" },
    { value: "rating", placeholder: "Average ratings" },
    { value: "best-seller", placeholder: "Best seller" },
    { value: "newest", placeholder: "Newest" },
  ];

  const fetchProducts = useCallback(
    async (retryCount = 0) => {
      try {
        // Set loading to true before fetching
        const searchParams = new URLSearchParams(location.search);
        if (!searchParams.has("sort")) {
          searchParams.set("sort", "default");
        }
        if (!searchParams.has("page")) {
          searchParams.set("page", "1");
        }
        if (!searchParams.has("limit")) {
          searchParams.set("limit", limit.toString());
        }

        const url = `/get-variants?${searchParams.toString()}`;

        const response = await axiosInstance.get(url, {
          headers: { Category: category },
        });
        const fetchedVariants = response.data.variants;
        setTotal(response.data.total);
        setVariants(fetchedVariants);
        setLoading(false); // Set loading to false after fetching
      } catch (error) {
        console.error("Error fetching products:", error);
        if (retryCount < 3) {
          setTimeout(
            () => fetchProducts(retryCount + 1),
            Math.pow(2, retryCount) * 1000,
          );
        } else {
          setLoading(false); // Ensure loading is set to false in case of error
        }
      }
    },
    [category, limit, location.search],
  );

  useEffect(() => {
    setPage(1); // Reset page to 1 when category changes
  }, [category]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleDropdownValue = useCallback(
    (val: string | number) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("sort", val.toString());

      // Generate the updated URL with all existing parameters plus the new sort value
      const updatedUrl = `${category === "all" ? `` : `/${category}`}/?${searchParams.toString()}`;
      setSortCriteria(val.toString());
      navigate(updatedUrl, { replace: true });
    },
    [category, navigate, location.search],
  );

  const handlePageMovement = useCallback(() => {
    const numericVal = parseInt(page.toString(), 10);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", numericVal.toString());

    // Generate the updated URL with all existing parameters plus the new page value
    const updatedUrl = `${category === "all" ? `` : `/${category}`}/?${searchParams.toString()}`;
    setPage(numericVal);
    navigate(updatedUrl, { replace: true });
  }, [page, category, navigate, location.search]);

  const handleFilter = useCallback(
    (filters: Filter) => {
      const { subCategory, brand, minPrice, maxPrice, onSale, color, specs } =
        filters;
      setPage(1);
      const searchParams = new URLSearchParams(location.search);
      if (subCategory && subCategory.length > 0) {
        searchParams.set("subCategory", subCategory.join(","));
      }
      if (brand && brand.length > 0) {
        searchParams.set("brand", brand.join(","));
      }
      if (minPrice !== null) {
        searchParams.set("minPrice", minPrice.toString());
      }
      if (maxPrice !== null) {
        searchParams.set("maxPrice", maxPrice.toString());
      }
      if (onSale !== null) {
        searchParams.set("onSale", onSale.toString());
      }
      if (color && color.length > 0) {
        searchParams.set("colors", color.join(","));
      }
      if (specs && Object.keys(specs).length > 0) {
        searchParams.set("specs", JSON.stringify(specs));
      }

      const updatedUrl = `${category === "all" ? `` : `/${category}`}/?${searchParams.toString()}`;

      navigate(updatedUrl, { replace: true });
    },
    [location.search, category, navigate],
  );

  const toggleFilter = () => {
    setFilter(!filter);
  };

  useEffect(() => {
    setSortCriteria(sortParam);
    setPage(pageParam);
  }, [location, pageParam, sortParam]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setFilter(false); // Close filter when category changes
  }, [category]);

  useEffect(() => {
    handlePageMovement();
  }, [page, handlePageMovement]);

  return (
    <div className="relative mb-4 mt-2 flex flex-col gap-2">
      <>
        <div className="flex justify-between">
          <div className="justify-self-end">
            <Dropdown
              label={"Sort by: "}
              list={list}
              onValueChange={handleDropdownValue}
              selectedValue={sortCriteria} // Pass sort criteria as prop
            ></Dropdown>
          </div>
          <div className="relative flex gap-1">
            {category !== "all" && (
              <>
                <span
                  className={`material-symbols-outlined -mt-[3px] select-none text-lg transition-all duration-300 ${
                    filter ? "opacity-100" : "rotate-180 opacity-0"
                  }`}
                >
                  keyboard_arrow_down
                </span>
                <button
                  className="roboto-medium relative flex text-sm text-zinc-700 underline underline-offset-4 group-hover:text-zinc-950"
                  onClick={toggleFilter}
                >
                  Filter
                </button>

                <ProductFilter
                  handleFilter={handleFilter}
                  toggleFilter={toggleFilter}
                  toggle={filter}
                  category={category}
                  selectedFilters={selectedFilters}
                ></ProductFilter>
              </>
            )}
          </div>
        </div>
        {variants.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {loading
                ? Array.from({ length: limit }, (_, index) => (
                    <CardLoadingSkeleton key={index} />
                  ))
                : variants.map((variant) => (
                    <ProductCard
                      key={variant._id}
                      id={variant.productId}
                      name={variant.productName}
                      variantId={variant._id}
                      price={variant.variantPrice}
                      salePrice={variant.saleId?.salePrice ?? null}
                      brand={variant.productBrand}
                      thumbnail={variant.variantImgs[0]}
                      variantName={variant.variantName}
                      color={variant.variantColor}
                    />
                  ))}
            </div>
            <div className="border-t-[1px] border-zinc-300">
              <Pagination
                total={total}
                limit={limit}
                page={page}
                setPage={setPage}
              />
            </div>
          </>
        )}
      </>
      {variants.length === 0 && !loading && (
        <>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-lg font-semibold">No products found</div>
            {category === "all" ? (
              <>
                <Link to={`/`} className="text-blue-500 underline">
                  Go back home
                </Link>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to={`/`} className="text-blue-500 underline">
                  Home
                </Link>
                <span>{`/`}</span>
                {location.pathname === "/" ? (
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-500 underline"
                  >
                    Refresh
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(-1)}
                    className="text-blue-500 underline"
                  >
                    Go back
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Product_List;
