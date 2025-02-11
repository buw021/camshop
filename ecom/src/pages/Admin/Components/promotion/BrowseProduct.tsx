import React, { useEffect, useState } from "react";
import axiosInstance from "../../Services/axiosInstance";

import { Product, Variant } from "../interface/interfaces";

interface SelectedProducts {
  productId: string;
  name: string;
  category: string;
  variantId: string;
  variantName: string;
  variantColor: string;
  variantPrice: number;
}

const BrowseProduct: React.FC<{
  close: () => void;
  confirmSelected: (array: SelectedProducts[]) => void;
  initialSelectedProducts: SelectedProducts[];
}> = ({ close, confirmSelected, initialSelectedProducts }) => {
  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts[]>(
    initialSelectedProducts,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/browse-products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const checkSelect = (product: Product, variant: Variant) => {
    const selectedProduct: SelectedProducts = {
      productId: product._id || "",
      name: product.name,
      category: product.category,
      variantId: variant._id || "",
      variantName: variant.variantName,
      variantColor: variant.variantColor,
      variantPrice: variant.variantPrice ?? 0,
    };

    setSelectedProducts((prevSelected) =>
      prevSelected.some(
        (sp) =>
          sp.productId === selectedProduct.productId &&
          sp.variantId === selectedProduct.variantId,
      )
        ? prevSelected.filter(
            (sp) =>
              !(
                sp.productId === selectedProduct.productId &&
                sp.variantId === selectedProduct.variantId
              ),
          )
        : [...prevSelected, selectedProduct],
    );
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = async (search: string) => {
    if (search === "") {
      fetchProducts();
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/search-products?search=${search}&command=${true}`,
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  // Pagination controls
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const Row_Cells: React.FC<{
    product: Product;
    variant: Variant;
  }> = ({ product, variant }) => (
    <tr className="hover:bg-zinc-200">
      <td scope="col" className="px-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
            checked={selectedProducts.some(
              (sp) =>
                sp.productId === product._id && sp.variantId === variant._id,
            )}
            onChange={() => checkSelect(product, variant)}
          />
          <label className="sr-only">checkbox</label>
        </div>
      </td>
      <td className="whitespace-nowrap px-6 text-center">
        {product.name} {variant.variantName}
      </td>
      <td className="whitespace-nowrap px-6 text-center capitalize">
        {product.category}
      </td>
      <td className="whitespace-nowrap px-6 text-center font-medium">
        {variant.variantPrice}
      </td>
      {/*  <td className="whitespace-nowrap px-6 text-center">
        <button className="font-medium text-blue-700 hover:underline">
          Select
        </button>
      </td> */}
    </tr>
  );

  return (
    <div className="absolute z-30 flex h-[90%] w-[90%] flex-col items-center justify-center gap-2 overflow-hidden rounded bg-zinc-200/75 p-2.5 text-sm backdrop-blur-sm">
      <button
        type="button"
        className="transitio-all absolute right-2.5 top-2 duration-200 hover:text-zinc-400"
        onClick={close}
      >
        <span className="material-symbols-outlined text-md">close</span>
      </button>

      <div className="flex h-[90%] w-[90%] flex-col gap-2 overflow-hidden rounded bg-white p-2 drop-shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <button
              className="roboto-medium self-center rounded-md bg-zinc-400 px-4 py-2 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
              /*  onClick={() => handleSearch(search)} */
            >
              Search
            </button>
            <div className="relative flex items-center">
              <input
                className="roboto-regular w-[15vw] min-w-[175px] rounded-sm border-2 border-zinc-200 bg-zinc-50 py-[6px] pl-2 pr-8 text-sm text-zinc-900 outline-none outline-1 focus:border-zinc-300"
                placeholder="Search"
                onChange={(e) => setSearch(e.target.value)}
                /*  onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(search);
                }} */
                value={search}
              />
              <span
                className={`material-symbols-outlined filled absolute right-2 mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
                onClick={() => setSearch("")}
              >
                cancel
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="roboto-medium self-center rounded-md bg-zinc-400 px-4 py-2 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500 disabled:bg-zinc-200"
            >
              Previous
            </button>
            <span>
              Page {totalPages > 0 ? currentPage : 0} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="roboto-medium self-center rounded-md bg-zinc-400 px-4 py-2 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500 disabled:bg-zinc-200"
            >
              Next
            </button>
          </div>
        </div>
        <div className="h-full w-full overflow-auto rounded">
          <table className="w-full table-auto divide-y divide-gray-300 overflow-auto text-sm">
            <thead className="bg-zinc-200">
              <tr className="">
                <th scope="col" className="px-4 py-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          const allProducts = products.flatMap((product) =>
                            product.variants.map((variant) => ({
                              productId: product._id || "",
                              name: product.name,
                              category: product.category,
                              variantId: variant._id || "",
                              variantName: variant.variantName,
                              variantColor: variant.variantColor,
                              variantPrice: variant.variantPrice ?? 0,
                            }))
                          );
                          setSelectedProducts(allProducts);
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                      checked={selectedProducts.length === products.flatMap((product) => product.variants).length}
                    />
                    <label className="sr-only">checkbox</label>
                  </div>
                </th>
                <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                  Product Name
                </th>
                <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                  Category
                </th>
                <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                  Price
                </th>
                {/*  <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                  Action
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {currentProducts.map((product) =>
                product.variants.map((variant, index) => (
                  <Row_Cells
                    key={`${product._id}-${index}`}
                    product={product}
                    variant={variant}
                  />
                )),
              )}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="roboto-medium rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
          onClick={(e) => {
            e.preventDefault();
            if (
              window.confirm(
                "Are you sure you want to confirm the selected products?",
              )
            ) {
              confirmSelected(selectedProducts);
              close();
            }
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default BrowseProduct;
