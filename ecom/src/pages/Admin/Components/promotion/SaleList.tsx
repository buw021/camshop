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
        <tr className="border-y-[1px] hover:bg-zinc-100">
          <td scope="col" className="flex items-center px-4 py-1.5">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
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
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
            {index + 1}
          </td>
          <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
            {name} {variantName ? variantName : ""}{" "}
            {variantColor ? `(${variantColor})` : ""}
          </td>
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
            € {variantPrice}
          </td>
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
            € {salePrice}
          </td>
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
            € {(variantPrice - salePrice).toFixed(2)} (
            {((1 - salePrice / variantPrice) * 100).toFixed(2)}%)
          </td>
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
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
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
            {new Date(saleStartDate).toLocaleDateString("en-GB")}
          </td>
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
            {new Date(saleExpiryDate).toLocaleDateString("en-GB")}
          </td>
          <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
            <button className="rounded-lg border-[1px] border-zinc-300 bg-white px-2 py-0.5 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700">
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
        <button className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700">
          Archive
        </button>
        <button
          type="button"
          className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          onClick={(e) => {
            e.preventDefault();
            handleSelectProd();
          }}
        >
          Add Sale Products
        </button>
      </div>
      <div className="relative h-full w-full overflow-auto rounded">
        <table className="w-full table-auto overflow-hidden text-sm">
          <thead className="">
            <tr className="h-8 text-nowrap bg-zinc-100">
              <th scope="col" className="rounded-l-lg px-4">
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
                    checked={
                      selectedSale.length === saleList.length &&
                      saleList.length > 0
                    }
                  />
                  <label className="sr-only">checkbox</label>
                </div>
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                No.
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Product Name
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Original Price
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Sale Price
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Discount
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Days/Time Left
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Start Date
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                End Date
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            <tr>
              <td colSpan={8} className="h-2"></td>
            </tr>
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
