import { AnimatePresence, motion } from "framer-motion";
import { variants } from "../Components/assets/transition_variants";
import Admin_ProductTable from "../Components/products/Admin_ProductTable";
import React, { useCallback, useEffect, useState } from "react";
import ProductForm from "../Components/products/ProductForm";
import axiosInstance from "../Services/axiosInstance";
import { Product } from "../Components/interface/interfaces";
import EditProduct from "../Components/products/EditProduct";

const categoryList = ["camera", "lens", "accessories", "others"];

const Admin_Products: React.FC<{ setIsDirty: (dirty: boolean) => void }> = ({
  setIsDirty,
}) => {
  const [addPopUp, setAddPopup] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [archive, setArchive] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState<number>(0);

  const [showDropdown, setShowDropdown] = useState(false);
  const [filters, setFilters] = useState<{
    category: string[];
  }>({
    category: [],
  });
  const toggleAddProduct = () => {
    setAddPopup(!addPopUp);
  };

  const fetchProducts = useCallback(
    async (search: string = "") => {
      try {
        const response = await axiosInstance.get("/get-products", {
          params: { filters: filters, currentPage, limit, archive, search },
        });
        if (response.data) {
          setProducts(response.data.products);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    },
    [filters, currentPage, archive],
  );

  const fetchProducToEdit = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/getFullProduct?id=${id}`);
      setEditProd(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleEdit = (product: Product) => {
    if (product._id) fetchProducToEdit(product._id);
  };

  const handleCancel = () => {
    setEditProd(null);
  };

  const handleProductAdded = () => {
    fetchProducts();
    setAddPopup(false);
  };

  const handleProductUpdated = () => {
    fetchProducts();
    setEditProd(null);
  };

  const handleArchive = async (productIds: string[]) => {
    if (
      !window.confirm("Are you sure you want to archive the selected products?")
    ) {
      return;
    }
    try {
      await axiosInstance.post("/archive-products", {
        productIds,
        command: !archive,
      });
      fetchProducts();
    } catch (error) {
      console.error("Error archiving products:", error);
    }
  };

  /* Search from database
  const handleSearch = async (search: string) => {
    const command = archive ? true : false;
    if (search === "") {
      fetchProducts();
      return;
    }
    try {
      const response = await axiosInstance.get(
        `/search-products?search=${search}&command=${command}`,
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }; */

  return (
    <>
      <div className="relative flex h-full w-full flex-col rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:p-10">
        <AnimatePresence>
          {addPopUp && (
            <motion.div
              className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-700/10 backdrop-blur-sm"
              variants={variants}
              initial="fade-out"
              animate="fade-in"
              exit="fade-out"
            >
              <ProductForm
                toggleAddProduct={toggleAddProduct}
                setIsDirty={setIsDirty}
                onProductAdded={handleProductAdded}
              />
            </motion.div>
          )}

          {editProd && (
            <motion.div
              className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-700/10 backdrop-blur-sm"
              variants={variants}
              initial="fade-out"
              animate="fade-in"
              exit="fade-out"
            >
              <EditProduct
                handleCancel={handleCancel}
                setIsDirty={setIsDirty}
                getData={editProd}
                onProductUpdated={handleProductUpdated}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="roboto-bold mb-5 text-xl text-zinc-800">
          {archive ? "Archive" : "Product"} List{" "}
        </h1>
        <div className="roboto-medium flex flex-wrap items-center justify-between gap-2 uppercase text-zinc-500">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
              onClick={() => fetchProducts(search)}
            >
              Search
            </button>
            <div className="relative flex items-center">
              <input
                className="roboto-medium w-[275px] min-w-[175px] rounded-md border-2 border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
                placeholder="Search Product Name, Brand or Category"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchProducts(search);
                }}
                value={search}
              />
              <span
                className={`material-symbols-outlined filled absolute right-2 mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
                onClick={() => {
                  setSearch("");
                  fetchProducts();
                }}
              >
                cancel
              </span>
            </div>
            <div className="flex items-center">
              <div
                className="relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowDropdown(false);
                  }
                }}
                tabIndex={0}
              >
                <button
                  className="relative self-center rounded-md bg-zinc-800 py-[7px] pl-3 pr-7 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  Filter by Category{" "}
                  <span className="material-symbols-outlined absolute right-2 top-1.5 text-lg leading-3">
                    keyboard_arrow_down
                  </span>
                </button>
                {showDropdown && (
                  <div className="absolute z-10 mt-2 w-48 gap-1 rounded-md bg-white py-1 text-sm font-medium tracking-wide shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {categoryList.map((category, index) => (
                        <label
                          key={index}
                          className="flex items-center px-2 hover:cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            checked={filters.category.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  category: [...prev.category, category],
                                }));
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  category: prev.category.filter(
                                    (f) => f !== category,
                                  ),
                                }));
                              }
                            }}
                          />
                          <span className="ml-2 capitalize">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <button
              className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
              onClick={() => toggleAddProduct()}
              disabled={archive}
            >
              Add New Product
            </button>
            <button
              className={`roboto-medium flex rounded-md py-[7px] pl-2.5 pr-2.5 text-sm uppercase tracking-wide text-white transition-all duration-100 ${!archive ? "bg-red-400 hover:bg-red-500" : "bg-green-400 hover:bg-green-500"}`}
              onClick={() => {
                setArchive(!archive);
                setFilters({ category: [] });
                /* setSearch(""); */
              }}
            >
              {!archive ? (
                <>
                  <span
                    className="material-symbols-outlined text-lg leading-3"
                    title="View Archive"
                  >
                    archive
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-lg leading-3"
                    title="View Products"
                  >
                    unarchive
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
        <Admin_ProductTable
          products={products}
          handleEdit={handleEdit}
          handleArchive={handleArchive}
          archive={archive}
        />
        <div className="mt-4 flex items-center justify-center gap-2">
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
    </>
  );
};
export default Admin_Products;
