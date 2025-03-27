import { useMemo, useState } from "react";
import { Product } from "../interface/interfaces";
import PreviewForm from "./ProductView";

interface Table_Content {
  handleEdit: (product: Product) => void;
  products: Product[];
  handleArchive: (productIds: string[]) => void;
  archive: boolean;
}

const Admin_ProductTable: React.FC<Table_Content> = ({
  handleEdit,
  products,
  handleArchive,
  archive,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [toggleProductView, setToggleProductView] = useState<boolean>(false);

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId],
    );
  };

  const togglePreview = (product: Product) => {
    setCurrentProduct(product);
    setToggleProductView(!toggleProductView);
  };

  const togglePreviewClose = () => {
    setCurrentProduct(null);
    setToggleProductView(false);
  };
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: string;
  } | null>(null);

  const handleSort = (key: keyof Product) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = useMemo(() => {
    if (!products || !sortConfig) return products;

    const { key, direction } = sortConfig;

    const sortableOrders = [...products];
    sortableOrders.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return direction === "ascending"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      }

      return 0; // Default case
    });

    return sortableOrders;
  }, [products, sortConfig]);

  const Row_Cells: React.FC<{
    product: Product;
    togglePreview: (product: Product) => void;
  }> = ({ product, togglePreview }) => (
    <tr className="bg- border-y-[1px] hover:bg-zinc-100">
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
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        {product.name}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        {product.brand ? product.brand : "None"}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        {product.category}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        €{" "}
        {Math.min(
          ...product.variants.map(
            (variant) => variant.variantPrice ?? Infinity,
          ),
        )}
      </td>

      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        {product.variants.length - 1}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
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
            visibility
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
            handleArchive(selectedProducts);
          }}
          disabled={selectedProducts.length === 0}
        >
          <span
            className={`material-symbols-outlined absolute left-2 top-1 text-base leading-3 ${archive && "rotate-180"}`}
          >
            archive
          </span>
          {archive ? "Unarchive" : "Archive"}
        </button>
      </td>
    </tr>
  );

  // Pagination controls

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
          <div className="relative h-full w-full overflow-auto">
            <table className="w-full table-auto overflow-hidden text-sm">
              <thead className="">
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
                              sortedOrders.map((product) =>
                                product._id ? product._id.toString() : "",
                              ),
                            );
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                        checked={
                          sortedOrders.length > 0 &&
                          sortedOrders.every(
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
                  {/*  <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                    Thumbnail
                  </th> */}
                  <th
                    className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                    onClick={() => {
                      handleSort("name");
                    }}
                  >
                    <span className="mr-2 rounded border-[1px]" />
                    Name
                    <span className="material-symbols-outlined absolute top-2.5 px-1 text-sm leading-3">
                      swap_vert
                    </span>
                  </th>
                  <th
                    className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                    onClick={() => {
                      handleSort("brand");
                    }}
                  >
                    <span className="mr-2 rounded border-[1px]" />
                    Brand
                  </th>
                  <th
                    className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                    onClick={() => {
                      handleSort("category");
                    }}
                  >
                    <span className="mr-2 rounded border-[1px]" />
                    Category
                    <span className="material-symbols-outlined absolute top-2.5 px-1 text-sm leading-3">
                      swap_vert
                    </span>
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
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody className="">
                <tr>
                  <td colSpan={8} className="h-2"></td>
                </tr>
                {sortedOrders.map((product, index) => (
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
    </div>
  );
};

export default Admin_ProductTable;
