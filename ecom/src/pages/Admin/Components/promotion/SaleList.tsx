import { useCallback, useEffect, useState } from "react";
import SelectProduct from "./SelectProduct";
import axiosInstance from "../../Services/axiosInstance";

interface VariantInfo {
  variantName: string;
  variantColor: string;
  variantPrice: number;
}

interface ProductInfo {
  name: string;
  category: string;
  variants: VariantInfo;
}

interface SaleInterface {
  productId: string;
  variantId: string;
  isOnsale: boolean;
  salePrice: number;
  saleStartDate: string;
  saleExpiryDate: string;
  _id: string;
  productInfo: ProductInfo;
}

const SaleList = () => {
  const [selectProd, setSelectProd] = useState(false);
  const [saleList, setSaleList] = useState<SaleInterface[]>([]);
  const [selectedSale, setSelectedSale] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSelectProd = () => {
    setSelectProd(!selectProd);
  };

  const fetchSaleList = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-sale-list");
      setSaleList(response.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchSaleList();
  }, [fetchSaleList]);

  const Row_Cells: React.FC<{
    saleList: SaleInterface;
    index: number;
  }> = ({ saleList, index }) => {
    const {
      productInfo: { name, variants },
      salePrice,
      saleStartDate,
      saleExpiryDate,
    } = saleList;
    const { variantName, variantColor, variantPrice } = variants;

    return (
      <>
        <tr className="hover:bg-zinc-200">
          <td scope="col" className="px-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSale((prevSelected) => [
                      ...prevSelected,
                      saleList._id,
                    ]);
                  } else {
                    setSelectedSale((prevSelected) =>
                      prevSelected.filter((id) => id !== saleList._id),
                    );
                  }
                }}
                checked={selectedSale.includes(saleList._id)}
              />
              <label className="sr-only">checkbox</label>
            </div>
          </td>
          <td className="whitespace-nowrap px-6 text-center">{index + 1}</td>
          <td className="whitespace-nowrap px-6 text-center capitalize">
            {name} {variantName ? variantName : ""}{" "}
            {variantColor ? `(${variantColor})` : ""}
          </td>
          <td className="whitespace-nowrap px-6 text-center">
            € {variantPrice}
          </td>
          <td className="whitespace-nowrap px-6 text-center font-medium">
            € {salePrice}
          </td>
          <td className="whitespace-nowrap px-6 text-center">
            € {(variantPrice - salePrice).toFixed(2)} (
            {((1 - salePrice / variantPrice) * 100).toFixed(2)}%)
          </td>
          <td className="px-6 text-center">
            {saleStartDate && saleExpiryDate ? (
              (() => {
                const daysLeft = Math.ceil(
                  (new Date(saleExpiryDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                );
                return (
                  <span
                    className={
                      daysLeft <= 0 ? "text-red-600" : "text-green-600"
                    }
                  >
                    {daysLeft <= 0 ? "Expired" : daysLeft}
                  </span>
                );
              })()
            ) : (
              <span className="text-green-600">Unlimited</span>
            )}
          </td>
          <td className="whitespace-nowrap px-6 text-center">
            {new Date(saleStartDate).toLocaleDateString("en-GB")}
          </td>
          <td className="whitespace-nowrap px-6 text-center">
            {new Date(saleExpiryDate).toLocaleDateString("en-GB")}
          </td>
          <td className="whitespace-nowrap px-6 text-center">
            <button className="font-medium text-blue-700 hover:underline">
              Remove
            </button>
          </td>
        </tr>
      </>
    );
  };

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = saleList.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  return (
    <>
      {selectProd && <SelectProduct handleClose={handleSelectProd} />}
      <div className="flex items-center justify-between">
        <button
          className={`roboto-medium self-start rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500`}
        >
          Archive
        </button>
        <button
          type="button"
          className="roboto-medium self-end rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
          onClick={(e) => {
            e.preventDefault();
            handleSelectProd();
          }}
        >
          Add Sale Products
        </button>
      </div>
      <div className="relative h-full w-full overflow-auto rounded">
        <table className="w-full table-auto divide-y divide-gray-300 text-sm">
          <thead className="bg-zinc-200">
            <tr className="">
              <th scope="col" className="px-4">
                <div className="flex items-center">
                  <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  onChange={(e) => {
                    if (e.target.checked) {
                    const allSaleIds = saleList.map((sale) => sale._id);
                    setSelectedSale(allSaleIds);
                    } else {
                    setSelectedSale([]);
                    }
                  }}
                  checked={selectedSale.length === saleList.length && saleList.length > 0}
                  />
                  <label className="sr-only">checkbox</label>
                </div>
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                No.
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Product Name
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Original Price
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Sale Price
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Discount
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Days/Time Left
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Start Date
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                End Date
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Manage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {currentProducts.map((saleList, index) => (
              <Row_Cells key={saleList._id} saleList={saleList} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SaleList;
