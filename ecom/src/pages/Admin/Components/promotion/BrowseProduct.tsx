import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../Services/axiosInstance";

interface SelectedProducts {
  productId: string;
  name: string;
  category: string;
  brand: string;
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
  const [searchVal, setSearchVal] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProducts[]>(
    initialSelectedProducts,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [products, setProducts] = useState<SelectedProducts[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const fetchProducts = useCallback(async () => {
    if (!search) {
      setProducts([]);
      setTotalPages(0);
      return;
    }
    try {
      const response = await axiosInstance.get("/browse-products", {
        params: { search, currentPage, limit: itemsPerPage },
      });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [search, currentPage]);

  const checkSelect = (product: SelectedProducts) => {
    const selectedProduct: SelectedProducts = {
      productId: product.productId || "",
      name: product.name,
      category: product.category,
      brand: product.brand,
      variantId: product.variantId || "",
      variantName: product.variantName,
      variantColor: product.variantColor,
      variantPrice: product.variantPrice ?? 0,
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
  }, [fetchProducts]);

  const Row_Cells: React.FC<{
    product: SelectedProducts;
  }> = ({ product }) => (
    <tr className="border-y-[1px] hover:bg-zinc-100">
      <td className="whitespace-nowrap py-1 pl-8 pr-6 text-left">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
            checked={selectedProducts.some(
              (sp) =>
                sp.productId === product.productId &&
                sp.variantId === product.variantId,
            )}
            onChange={() => checkSelect(product)}
          />
          <label className="sr-only">checkbox</label>
        </div>
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        {product.name} {product.variantName} {product.variantColor}
      </td>
      <td className="whitespace-nowrap px-6 text-center font-medium">
        {product.variantPrice}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        {product.brand}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        {product.category}
      </td>
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
              className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
              onClick={() => setSearch(searchVal)}
            >
              Search
            </button>
            <div className="relative flex items-center">
              <input
                className="roboto-medium w-[275px] min-w-[175px] rounded-md border-2 border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
                placeholder="Search"
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchVal);
                }}
                value={searchVal}
              />
              <span
                className={`material-symbols-outlined filled absolute right-2 mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
                onClick={() => setSearch("")}
              >
                cancel
              </span>
            </div>
          </div>
          <button
            type="button"
            className="max-w-24 self-end rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
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

        <div className="h-full w-full overflow-auto rounded">
          <table className="w-full table-auto overflow-hidden text-sm">
            <thead className="">
              <tr className="h-8 text-nowrap bg-zinc-100">
                <th className="cursor-pointer rounded-l-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                  <div className="ml-2 flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                      checked={
                        products.every((product) =>
                          selectedProducts.some(
                            (sp) =>
                              sp.productId === product.productId &&
                              sp.variantId === product.variantId,
                          ),
                        ) && products.length > 0
                      }
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          const allProducts = products.flatMap((product) => ({
                            productId: product.productId || "",
                            name: product.name,
                            category: product.category,
                            brand: product.brand,
                            variantId: product.variantId || "",
                            variantName: product.variantName,
                            variantColor: product.variantColor,
                            variantPrice: product.variantPrice ?? 0,
                          }));
                          setSelectedProducts((prevSelected) => [
                            ...prevSelected,
                            ...allProducts.filter(
                              (product) =>
                                !prevSelected.some(
                                  (sp) =>
                                    sp.productId === product.productId &&
                                    sp.variantId === product.variantId,
                                ),
                            ),
                          ]);
                        } else {
                          const productIdsOnCurrentPage = products.map(
                            (product) =>
                              `${product.productId}-${product.variantId}`,
                          );
                          setSelectedProducts((prevSelected) =>
                            prevSelected.filter(
                              (sp) =>
                                !productIdsOnCurrentPage.includes(
                                  `${sp.productId}-${sp.variantId}`,
                                ),
                            ),
                          );
                        }
                      }}
                    />
                    <label className="sr-only">checkbox</label>
                  </div>
                </th>
                <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                  <span className="mr-2 rounded border-[1px]" />
                  Product Name
                </th>
                <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                  <span className="mr-2 rounded border-[1px]" />
                  Price
                </th>
                <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                  <span className="mr-2 rounded border-[1px]" />
                  Brand
                </th>
                <th className="cursor-pointer rounded-r-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                  <span className="mr-2 rounded border-[1px]" />
                  Category
                </th>
                {/*  <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                  Action
                </th> */}
              </tr>
            </thead>
            <tbody className="">
              <tr>
                <td colSpan={8} className="h-2"></td>
              </tr>
              {products.map((product, index) => (
                <Row_Cells
                  key={`${product.productId}-${index}`}
                  product={product}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
          >
            Previous
          </button>
          <span className="text-xs font-bold uppercase leading-3 tracking-wide text-zinc-500">
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrowseProduct;
