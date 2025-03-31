import { useCallback, useEffect, useState } from "react";
import SelectProduct from "./SelectProduct";
import axiosInstance from "../../Services/axiosInstance";
import { showToast } from "../showToast";
import EditSale from "./EditSale";
import { TimerCell } from "./Timer";

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
  isOnSale: boolean;
  salePrice: number;
  saleStartDate: Date;
  saleExpiryDate: Date;
  _id: string;
  productInfo: ProductInfo;
}

const Row_Cells: React.FC<{
  saleList: SaleInterface;
  index: number;
  pauseSale: (id: string) => void;
  resumeSale: (id: string) => void;
  editSale: (sale: SaleInterface) => void;
}> = ({ saleList, index, pauseSale, resumeSale, editSale }) => {
  const {
    productInfo: { name, variants },
    salePrice,
    saleStartDate,
    saleExpiryDate,
  } = saleList;
  const { variantName, variantColor, variantPrice } = variants;

  return (
    <tr className="border-y-[1px] hover:bg-zinc-100">
      <td className="whitespace-nowrap py-1 pl-8 pr-6 text-left capitalize">
        {index + 1}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        {name} {variantName ? variantName : ""}{" "}
        {variantColor ? `(${variantColor})` : ""}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        € {variantPrice.toFixed(2)}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        € {salePrice.toFixed(2)}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        € {(variantPrice - salePrice).toFixed(2)} (
        {((1 - salePrice / variantPrice) * 100).toFixed(2)}%)
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left ">
        <TimerCell saleExpiryDate={saleExpiryDate} />
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        {new Date(saleStartDate).toLocaleDateString("en-GB")}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        {new Date(saleExpiryDate).toLocaleDateString("en-GB")}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
        <button
          className="rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700 disabled:text-zinc-200"
          disabled={saleList.isOnSale}
          onClick={() => editSale(saleList)}
        >
          <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
            edit_square
          </span>
          Edit
        </button>

        {saleList.isOnSale ? (
          <button
            className="ml-2 rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700 disabled:text-zinc-200"
            onClick={() => {
              if (
                !window.confirm("Are you sure you want to pause this sale?")
              ) {
                return;
              }
              pauseSale(saleList._id);
            }}
          >
            <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
              pause
            </span>
            Pause
          </button>
        ) : (
          <button
            className="ml-2 rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700 disabled:text-zinc-200"
            onClick={() => {
              const expiryDate = new Date(saleList.saleExpiryDate);
              if (expiryDate < new Date()) {
                showToast(
                  "Cannot resume sale. The sale has already expired.",
                  "error",
                );
                return;
              }

              if (
                !window.confirm("Are you sure you want to resume this sale?")
              ) {
                return;
              }
              resumeSale(saleList._id);
            }}
          >
            <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
              play_arrow
            </span>
            Resume
          </button>
        )}
      </td>
    </tr>
  );
};

const SaleList = () => {
  const [selectProd, setSelectProd] = useState(false);
  const [saleList, setSaleList] = useState<SaleInterface[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleInterface>();
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState<boolean>(true);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(0);

  const handleSelectProd = () => {
    setSelectProd(!selectProd);
  };

  const fetchSaleList = useCallback(
    async (search: string = "") => {
      try {
        const response = await axiosInstance.get("/get-sale-list", {
          params: { status, search, currentPage, limit },
        });
        if (response.data) {
          setSaleList(response.data.saleList);
          setTotalPages(response.data.totalPages);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [currentPage, status],
  );

  const handleStatus = () => {
    setStatus(!status);
  };

  const pauseSale = async (id: string) => {
    try {
      const response = await axiosInstance.post("/pause-sale", { id });
      if (response.status === 200) {
        showToast(`${response.data.message}`, "success");
        fetchSaleList();
      } else {
        showToast("Failed to pause sale", "error");
      }
    } catch (err) {
      console.log(err);
      showToast("An error occurred while pausing the sale", "error");
    }
  };

  const resumeSale = async (id: string) => {
    try {
      const response = await axiosInstance.post("/resume-sale", { id });
      if (response.status === 200) {
        showToast(`${response.data.message}`, "success");
        fetchSaleList();
      } else {
        showToast("Failed to resume sale", "error");
      }
    } catch (err) {
      console.log(err);
      showToast("An error occurred while pausing the sale", "error");
    }
  };

  useEffect(() => {
    fetchSaleList();
  }, [fetchSaleList]);

  const editSale = (sale: SaleInterface) => {
    if (!sale) return;
    setSelectedSale(sale);
  };

  return (
    <>
      {selectProd && (
        <SelectProduct
          handleClose={handleSelectProd}
          fetchSaleList={fetchSaleList}
        />
      )}
      {selectedSale && (
        <EditSale
          close={() => {
            setSelectedSale(undefined);
          }}
          sale={selectedSale}
          fetch={fetchSaleList}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            className="relative self-center rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
            onClick={() => fetchSaleList(search)}
          >
            Search
          </button>
          <div className="relative flex items-center">
            <input
              className="roboto-medium w-[275px] min-w-[175px] rounded-md border-2 border-zinc-200 bg-zinc-50 py-[4.25px] pl-2 pr-8 text-xs leading-3 text-zinc-900 outline-none outline-1 focus:border-zinc-300"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchSaleList(search);
              }}
              value={search}
            />
            <span
              className={`material-symbols-outlined filled absolute right-2 mr-1 flex items-center text-base leading-3 text-zinc-500 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-600`}
              onClick={() => {
                setSearch("");
                fetchSaleList();
              }}
            >
              cancel
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
            onClick={handleStatus}
          >
            {status ? "Show Inactive" : "Show Active"}
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
      </div>
      <div className="relative h-full w-full overflow-auto rounded">
        <table className="w-full table-auto overflow-hidden text-sm">
          <thead className="">
            <tr className="h-8 text-nowrap bg-zinc-100">
              <th className="cursor-pointer rounded-l-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
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
              <th className="cursor-pointer rounded-r-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Manage
              </th>
            </tr>
          </thead>
          <tbody className="">
            <tr>
              <td colSpan={8} className="h-2"></td>
            </tr>
            {saleList.map((saleList, index) => (
              <Row_Cells
                key={saleList._id}
                saleList={saleList}
                index={index}
                pauseSale={pauseSale}
                resumeSale={resumeSale}
                editSale={editSale}
              />
            ))}
          </tbody>
        </table>
      </div>
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
    </>
  );
};

export default SaleList;
