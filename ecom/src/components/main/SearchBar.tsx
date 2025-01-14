import React, { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance"; // Adjust the path as necessary
import { Link, useNavigate } from "react-router-dom";
import { slugify } from "../func/slugify";

interface SearchInputProps {
  searchRef: React.RefObject<HTMLInputElement>;
  toggleClose: () => void;
}

interface Product {
  id: string;
  name: string;
  variantId: string;
  brand: string;
}

export const SearchBar: React.FC<SearchInputProps> = ({
  searchRef,
  toggleClose,
}) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [notif, setNotif] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
  };

  const clickLink = () => {
    setQuery("");
    toggleClose();
  };

  const highlightText = (text: string, highlight: string) => {
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} className={"font-bold"}>
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (query) {
        try {
          const response = await axiosInstance.get(`/search?query=${query}`);
          setProducts(response.data);
          setNotif(response.data.length === 0);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      } else {
        setProducts([]);
        setNotif(false);
      }
    };

    fetchProducts();
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/?sort=default&page=1&query=${query}`, { replace: true });
      toggleClose();
    }
    if (e.key === "ArrowDown") {
      setFocusedIndex((prevIndex) =>
        prevIndex < products.length - 1 ? prevIndex + 1 : prevIndex,
      );
    } else if (e.key === "ArrowUp") {
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      const focusedProduct = products[focusedIndex];
      const productSlug = slugify(focusedProduct.name);
      navigate(
        `/product/${productSlug}_${focusedProduct.id}_${focusedProduct.variantId}`,
        { replace: true },
      );
      toggleClose(); // Navigate to the selected product
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-row items-center self-start border-b-2 py-1">
        <span
          className={`material-symbols-outlined flex items-center text-[22px] leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer`}
        >
          search
        </span>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={`roboto-medium w-full select-none bg-transparent px-[4px] text-lg leading-3 text-zinc-500 placeholder-zinc-300 outline-none transition-all duration-200`}
        />
        <span
          className={`material-symbols-outlined filled mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
          onClick={handleClear}
        >
          cancel
        </span>
      </div>
      {products.length > 0 && (
        <div className="mt-2 w-full self-start pb-2 pr-1 text-sm text-zinc-500">
          <span className="roboto-regular capitalize tracking-wide">
            Suggested Products
          </span>
          <ul className="list-disc pl-5">
            {products.map((product, index) => {
              const productSlug = slugify(product.name);
              return (
                <Link
                  key={product.id}
                  to={`/product/${productSlug}_${product.id}_${product.variantId}`}
                  onClick={clickLink}
                >
                  <li
                    className={`px-2 hover:cursor-pointer hover:bg-zinc-50 hover:font-bold hover:text-zinc-700 ${
                      focusedIndex === index
                        ? "bg-zinc-50 font-bold text-zinc-700"
                        : ""
                    }`}
                  >
                    {highlightText(`${product.name}`, query)}
                  </li>
                </Link>
              );
            })}
          </ul>
        </div>
      )}
      {notif && (
        <div className="mt-2 w-full self-start text-sm text-zinc-500">
          <span className="roboto-regular capitalize tracking-wide">
            No match found
          </span>
        </div>
      )}
    </div>
  );
};
