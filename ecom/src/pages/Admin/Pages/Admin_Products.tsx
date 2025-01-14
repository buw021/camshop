import { AnimatePresence, motion } from "framer-motion";
import { variants } from "../Components/assets/transition_variants";
import Admin_ProductTable from "../Components/products/Admin_ProductTable";
import React, { useEffect, useState } from "react";
import ProductForm from "../Components/products/ProductForm";
import axiosInstance from "../Services/axiosInstance";
import { Product } from "../Components/interface/interfaces";
import EditProduct from "../Components/products/EditProduct";
import Admin_ArchiveTable from "../Components/products/Admin_ArchiveTable";

const Admin_Products: React.FC<{ setIsDirty: (dirty: boolean) => void }> = ({
  setIsDirty,
}) => {
  const [addPopUp, setAddPopup] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [archive, setArchive] = useState(false);
  const [archiveProducts, setArchiveProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const toggleAddProduct = () => {
    setAddPopup(!addPopUp);
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/get-products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchArchiveProducts = async () => {
    try {
      const response = await axiosInstance.get("/get-archived-products");
      setArchiveProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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
    fetchArchiveProducts();
  }, []);

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

  const handleArchive = async (productIds: string[], command: boolean) => {
    if (
      !window.confirm("Are you sure you want to archive the selected products?")
    ) {
      return;
    }
    try {
      await axiosInstance.post("/archive-products", { productIds, command });

      fetchProducts();
      fetchArchiveProducts();
    } catch (error) {
      console.error("Error archiving products:", error);
    }
  };

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
  };

  return (
    <>
      <div className="relative flex h-full w-full flex-col rounded-xl bg-white p-10 ring-2 ring-zinc-300/70">
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
        <div className="roboto-medium flex justify-between uppercase text-zinc-500">
          <div className="flex gap-4">
            <button
              className="roboto-medium self-center rounded-md bg-zinc-400 px-4 py-2 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
              onClick={() => handleSearch(search)}
            >
              Search
            </button>
            <div className="relative flex items-center">
              <input
                className="roboto-regular w-[15vw] min-w-[175px] rounded-sm border-2 border-zinc-200 bg-zinc-50 py-[6px] pl-2 pr-8 text-sm text-zinc-900 outline-none outline-1 focus:border-zinc-300"
                placeholder="Search"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(search);
                }}
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
          <div className="flex flex-row gap-2">
            <button
              className={`roboto-medium self-center rounded-md bg-zinc-400 px-4 py-2 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500 disabled:translate-x-[5rem] disabled:scale-x-0 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500`}
              onClick={() => toggleAddProduct()}
              disabled={archive}
            >
              Add New Product
            </button>
            <button
              className={`roboto-medium flex self-center rounded-md px-4 py-1.5 text-sm uppercase tracking-wide text-white transition-all duration-100 ${!archive ? "bg-red-400 hover:bg-red-500" : "bg-green-400 hover:bg-green-500"}`}
              onClick={() => {
                setArchive(!archive);
                setSearch("");
              }}
            >
              {!archive ? (
                <>
                  <span
                    className="material-symbols-outlined"
                    title="View Archive"
                  >
                    archive
                  </span>
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined"
                    title="View Products"
                  >
                    unarchive
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {archive ? (
          <>
            <Admin_ArchiveTable
              products={archiveProducts}
              handleEdit={handleEdit}
              handleArchive={handleArchive}
            />
          </>
        ) : (
          <>
            <Admin_ProductTable
              products={products}
              handleEdit={handleEdit}
              handleArchive={handleArchive}
            />
          </>
        )}
      </div>
    </>
  );
};
export default Admin_Products;
