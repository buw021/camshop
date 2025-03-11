import { useEffect, useRef, useState } from "react";
import { Product } from "../interface/interfaces";
import PreviewForm from "./ProductView";

interface Table_Content {
  handleEdit: (product: Product) => void;
  products: Product[];
  handleArchive: (productIds: string[], command: boolean) => void;
}

const Admin_ArchiveTable: React.FC<Table_Content> = ({
  handleEdit,
  products,
  handleArchive,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [toggleProductView, setToggleProductView] = useState<boolean>(false);
  const itemsPerPage = 10;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const ref = useRef<HTMLTableCellElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsExpanded(false);
    }
  };
  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId],
    );
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const togglePreview = (product: Product) => {
    setCurrentProduct(product);
    setToggleProductView(!toggleProductView);
  };

  const togglePreviewClose = () => {
    setCurrentProduct(null);
    setToggleProductView(false);
  };

  const Row_Cells: React.FC<{
    product: Product;
    togglePreview: (product: Product) => void;
  }> = ({ product, togglePreview }) => (
    <tr className="border-y-[1px] hover:cursor-pointer hover:bg-zinc-100 focus:bg-zinc-200">
      <td scope="col" className="flex items-center px-4 py-1.5">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            checked={
              product._id
                ? selectedProducts.includes(product._id.toString())
                : false
            }
            onChange={() =>
              product._id && toggleSelectProduct(product._id.toString())
            }
          />
          <label className="sr-only">checkbox</label>
        </div>
      </td>

      <td className="pl-8 pr-6 text-left font-medium capitalize">
        {product.name}
      </td>
      <td className="pl-8 pr-6 text-left font-medium capitalize">
        {product.category}
      </td>
      <td className="pl-8 pr-6 text-left capitalize">
        €{" "}
        {Math.min(
          ...product.variants.map(
            (variant) => variant.variantPrice ?? Infinity,
          ),
        )}
      </td>

      <td className="pl-8 pr-6 text-left capitalize">
        {product.variants.length - 1}
      </td>
      <td className="pl-8 pr-6 text-left capitalize">
        {(() => {
          const stock = product.variants.reduce(
            (acc, variant) => acc + (variant.variantStocks ?? 0),
            0,
          );
          return stock;
        })()}
      </td>
      <td className="pl-8 pr-6 text-left capitalize"></td>
      <td className="mr-2 whitespace-nowrap text-center">
        <button
          className="rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700"
          onClick={() => togglePreview(product)}
        >
          <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
            edit_square
          </span>
          View
        </button>
        <button
          className="ml-2 rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700"
          onClick={() => handleEdit(product)}
        >
          <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
            edit_square
          </span>
          Edit
        </button>
        <button
          className="ml-2 rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700 disabled:border-zinc-200 disabled:text-zinc-200 disabled:hover:cursor-not-allowed"
          onClick={async () => {
            handleArchive(selectedProducts, false);
            setIsExpanded(false);
          }}
          disabled={selectedProducts.length === 0}
        >
          <span className="material-symbols-outlined absolute left-2 top-1 rotate-180 text-base leading-3">
            archive
          </span>
          Unarchive
        </button>
      </td>
    </tr>
  );

  // Calculate paginated products
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  // Pagination controls
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="flex h-full w-full flex-col justify-between">
      {toggleProductView && (
        <PreviewForm
          product={currentProduct}
          toggleClose={togglePreviewClose}
        ></PreviewForm>
      )}
      <div className="mt-4 flex h-full w-full justify-center">
        <div className="flex h-full w-full justify-center">
          <div className="relative h-full w-full overflow-auto rounded">
            <table className="w-full table-auto overflow-hidden text-sm">
              <thead className="bg-zinc-200">
                <tr className="h-8 text-nowrap bg-zinc-100">
                  <th scope="col" className="rounded-l-lg px-4">
                    <div className="flex items-center rounded">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            setSelectedProducts(
                              currentProducts.map((product) =>
                                product._id ? product._id.toString() : "",
                              ),
                            );
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                        checked={
                          currentProducts.length > 0 &&
                          currentProducts.every(
                            (product) =>
                              product._id &&
                              selectedProducts.includes(product._id.toString()),
                          )
                        }
                      />
                      <label className="sr-only">checkbox</label>
                    </div>
                  </th>
                  {/* <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
                    ID No.
                  </th> */}
                  <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                    <span className="mr-2 rounded border-[1px]" />
                    Name
                  </th>
                  <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                    <span className="mr-2 rounded border-[1px]" />
                    Category
                  </th>
                  <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                    <span className="mr-2 rounded border-[1px]" />
                    Minimum Price
                  </th>
                  <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                    <span className="mr-2 rounded border-[1px]" />
                    Variants
                  </th>
                  <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                    <span className="mr-2 rounded border-[1px]" />
                    Total Stocks
                  </th>
                  <th className="cursor-pointer px-6 text-left font-medium">
                    <span className="mr-2 rounded border-[1px]" />
                  </th>
                  <th className="rounded-r-lg text-center font-medium capitalize tracking-wider text-zinc-500">
                    {isExpanded && (
                      <div className="w-18 absolute top-8 z-20 -ml-4 rounded-lg border-[1px] border-zinc-200 bg-white px-4 py-2 drop-shadow-sm"></div>
                    )}
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody className="">
                <tr>
                  <td colSpan={8} className="h-2"></td>
                </tr>
                {currentProducts.map((product, index) => (
                  <Row_Cells
                    key={index}
                    product={product}
                    togglePreview={togglePreview}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="rounded bg-gray-300 px-4 py-2"
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
          className="rounded bg-gray-300 px-4 py-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Admin_ArchiveTable;
