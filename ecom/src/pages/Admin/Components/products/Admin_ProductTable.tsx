import { useEffect, useRef, useState } from "react";
import { Product } from "../interface/interfaces";

interface Table_Content {
  handleEdit: (product: Product) => void;
  products: Product[];
  handleArchive: (productIds: string[], command: boolean) => void;
}

const Admin_ProductTable: React.FC<Table_Content> = ({
  handleEdit,
  products,
  handleArchive,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  const Row_Cells: React.FC<{
    product: Product;
  }> = ({ product }) => (
    <tr className="hover:bg-zinc-200">
      <td scope="col" className="px-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
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
      {/* <td className="overflow-hidden overflow-ellipsis whitespace-nowrap px-6">
        <span className=""> {variant._id}</span>
      </td> */}
      <td className="flex justify-center whitespace-nowrap px-6">
        <div className="h-8 w-8 items-center bg-black">
          <img
            src={`http://localhost:3000/uploads/${product.variants[0].variantImgs}`}
            alt="thumbnail"
          />
        </div>
      </td>
      <td className="whitespace-nowrap px-6">{product.name}</td>
      <td className="whitespace-nowrap px-6 capitalize">{product.category}</td>
      <td className="whitespace-nowrap px-6 font-medium">
        EUR{" "}
        {Math.min(
          ...product.variants.map(
            (variant) => variant.variantPrice ?? Infinity,
          ),
        )}
      </td>

      <td className="whitespace-nowrap px-6 text-center">
        {product.variants.length - 1}
      </td>
      <td className="whitespace-nowrap px-6 text-center">
        {(() => {
          const stock = product.variants.reduce(
            (acc, variant) => acc + (variant.variantStocks ?? 0),
            0,
          );
          return stock;
        })()}
      </td>
      <td className="whitespace-nowrap px-6 text-center">
        <button
          className="font-medium text-blue-700 hover:underline"
          onClick={() => handleEdit(product)}
        >
          Edit
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
      <div className="mt-4 flex h-full w-full justify-center font-sans">
        <div className="flex h-full w-full justify-center">
          <div className="relative h-full w-full overflow-auto rounded">
            <table className="w-full table-auto divide-y divide-gray-300 text-sm">
              <thead className="bg-zinc-200">
                <tr className="">
                  <th scope="col" className="px-4">
                    <div className="flex items-center rounded">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
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
                  <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                    Thumbnail
                  </th>
                  <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
                    Name
                  </th>
                  <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
                    Category
                  </th>
                  <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
                    Minimum Price
                  </th>
                  <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                    Variants
                  </th>
                  <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                    Total Stocks
                  </th>
                  <th
                    scope="col"
                    className="relative flex items-center justify-center p-4"
                    ref={ref}
                  >
                    <button
                      type="button"
                      className="flex rounded-md border-[1px] border-zinc-400 bg-zinc-100 transition-all hover:border-zinc-500"
                      onClick={() => setIsExpanded(!isExpanded)}
                      title="More Options"
                    >
                      <span className="material-symbols-outlined px-1 leading-3 text-zinc-500 transition-all hover:text-zinc-700">
                        more_horiz
                      </span>
                    </button>
                    {isExpanded && (
                      <>
                        <button
                          className="w-18 absolute top-10 rounded-md bg-white p-2 uppercase text-red-700 shadow-md outline-2 transition-all hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                          onClick={async () => {
                            handleArchive(selectedProducts, true);
                            setIsExpanded(false);
                          }}
                          disabled={selectedProducts.length === 0}
                        >
                          Archive
                        </button>
                      </>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {currentProducts.map((product, index) => (
                  <Row_Cells key={index} product={product} />
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

export default Admin_ProductTable;
