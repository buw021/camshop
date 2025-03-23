import React, { useEffect, useState } from "react";
import BrowseProduct from "./BrowseProduct";
import axiosInstance from "../../Services/axiosInstance";
import { showToast } from "../showToast";

interface SelectedProducts {
  productId: string;
  name: string;
  category: string;
  variantId: string;
  variantName: string;
  variantColor: string;
  variantPrice: number;
}

interface SaleInterface {
  startDate: Date | null;
  endDate: Date | null;
  discountType: "percentage" | "fixed" | null;
  discount: number | null;
  selectedProducts: SelectedProducts[];
}

const SelectProduct: React.FC<{
  handleClose: () => void;
  fetchSaleList: () => void;
}> = ({ handleClose, fetchSaleList }) => {
  const [sale, setSale] = useState<SaleInterface>({
    startDate: null,
    endDate: null,
    discountType: null,
    discount: null,
    selectedProducts: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setSale((prev) => ({
      ...prev,
      startDate: new Date(),
    }));
  }, []);

  const [toRemove, setToRemove] = useState<SelectedProducts[]>([]);

  const closeBrowse = () => {
    setToggleBrose(false);
  };

  const handleConfirm = async () => {
    if (
      !sale.discountType ||
      sale.discount === null ||
      sale.selectedProducts.length === 0 ||
      !sale.startDate
    ) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      const response = await axiosInstance.post("/set-product-on-sale", {
        SaleList: sale,
      });
      if (response.data) {
        showToast("Successfully set the product/s on sale", "success");
        fetchSaleList();
        handleClose();
      }
    } catch (error) {
      console.error("Error setting sale:", error);
    }
  };

  const [toggleBrowse, setToggleBrose] = useState(false);

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    dateType: "startDate" | "endDate",
  ) => {
    if (dateType === "startDate") {
      const today = new Date();
      const value = new Date(e.target.value);
      if (today <= value) {
        console.log(today, value);
        setSale((prev) => ({
          ...prev,
          [dateType]: new Date(e.target.value),
        }));
      } else {
        showToast("please enter a valid date", "error");
      }
    }
    if (dateType === "endDate") {
      const start = sale.startDate;
      const value = new Date(e.target.value);
      if (start)
        if (start <= value) {
          setSale((prev) => ({
            ...prev,
            [dateType]: new Date(e.target.value),
          }));
        } else {
          showToast("please enter a valid date", "error");
        }
    }
  };

  const handleSelectProduct = (selectedPs: SelectedProducts[]) => {
    setSale((prev) => {
      const updatedSelectedProducts = [...prev.selectedProducts];

      selectedPs.forEach((newProduct) => {
        const exists = updatedSelectedProducts.some(
          (sp) =>
            sp.productId === newProduct.productId &&
            sp.variantId === newProduct.variantId,
        );
        if (!exists) {
          updatedSelectedProducts.push(newProduct);
        }
      });

      return {
        ...prev,
        selectedProducts: updatedSelectedProducts,
      };
    });
  };

  const checkToRemove = (selected: SelectedProducts) => {
    const selectedProduct: SelectedProducts = {
      productId: selected.productId,
      name: selected.name,
      category: selected.category,
      variantId: selected.variantId,
      variantName: selected.variantName,
      variantColor: selected.variantColor,
      variantPrice: selected.variantPrice,
    };

    setToRemove((prevSelected) =>
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

  const Row_Cells: React.FC<{
    selected: SelectedProducts;
  }> = ({ selected }) => (
    <tr className="border-y-[1px] hover:bg-zinc-100">
      <td className="whitespace-nowrap py-1.5 pl-6 pr-6 text-left capitalize">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600"
            checked={toRemove.some(
              (sp) =>
                sp.productId === selected.productId &&
                sp.variantId === selected.variantId,
            )}
            onChange={() => {
              checkToRemove(selected);
            }}
          />
          <label className="sr-only">checkbox</label>
        </div>
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium">
        {selected.name} {selected.variantName}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        {selected.category}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        € {selected.variantPrice}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        €{" "}
        {sale.discountType && sale.discount !== null
          ? sale.discountType === "percentage"
            ? (
                selected.variantPrice -
                (selected.variantPrice * sale.discount) / 100
              ).toFixed(2)
            : (selected.variantPrice - sale.discount).toFixed(2)
          : ""}
      </td>
      <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
        €{" "}
        {sale.discountType && sale.discount !== null
          ? sale.discountType === "percentage"
            ? ((selected.variantPrice * sale.discount) / 100).toFixed(2)
            : sale.discount.toFixed(2)
          : ""}
      </td>
      <td className="whitespace-nowrap px-6 text-center">
        <button
          className="ml-2 rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700 disabled:text-zinc-200"
          onClick={() => {
            setSale((prev) => ({
              ...prev,
              selectedProducts: prev.selectedProducts.filter(
                (sp) =>
                  !toRemove.some(
                    (removeItem) =>
                      removeItem.productId === sp.productId &&
                      removeItem.variantId === sp.variantId,
                  ),
              ),
            }));
            setToRemove([]);
          }}
        >
          {" "}
          <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
            delete
          </span>
          Remove
        </button>
      </td>
    </tr>
  );
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sale.selectedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  const totalPages = Math.ceil(sale.selectedProducts.length / itemsPerPage);
  return (
    <div className="absolute left-0 z-20 flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded bg-zinc-100/95 p-2.5 text-sm backdrop-blur-sm">
      {toggleBrowse && (
        <BrowseProduct
          close={closeBrowse}
          confirmSelected={handleSelectProduct}
          initialSelectedProducts={sale.selectedProducts}
        />
      )}
      <button
        type="button"
        className="transitio-all absolute right-2.5 top-2 duration-200 hover:text-zinc-400"
        onClick={handleClose}
        hidden={toggleBrowse}
      >
        <span className="material-symbols-outlined text-md">close</span>
      </button>

      <div className="flex h-[90%] w-[90%] flex-col gap-2 overflow-hidden rounded-lg border-[1px] bg-white p-4 shadow-sm drop-shadow-sm">
        <div className="flex flex-col gap-2 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={"promo-type"} className="pr-1 text-sm font-medium">
              Discount Type:
            </label>

            <div className="flex items-center gap-2 text-sm leading-3">
              <input
                type="radio"
                id={"percentage"}
                name={"discount-type"}
                checked={sale.discountType === "percentage"}
                onChange={() => {
                  setSale((prev) => {
                    let discount = prev.discount;
                    if (discount !== null && discount > 100) {
                      discount = 100;
                    }
                    return { ...prev, discountType: "percentage", discount };
                  });
                }}
              />
              <label htmlFor={"percentage"} className="text-sm leading-[11px]">
                Percentage
              </label>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                id={"fixed"}
                name={"discount-type"}
                checked={sale.discountType === "fixed"}
                onChange={() =>
                  setSale((prev) => ({ ...prev, discountType: "fixed" }))
                }
              />
              <label htmlFor={"fixed"} className="text-sm leading-[11px]">
                Fixed
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={"discount-value"} className="text-sm font-medium">
              Value:
            </label>
            <input
              type="number"
              className="roboto-medium w-20 rounded-md border-2 border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-900 outline-none outline-1 focus:border-zinc-300"
              placeholder="Ex. 5"
              disabled={!sale.discountType}
              value={
                sale.discount !== null && sale.discount !== 0
                  ? sale.discount
                  : ""
              }
              onChange={(e) => {
                let value = Number(e.target.value);
                if (sale.discountType === "percentage" && value > 100) {
                  value = 100;
                }
                setSale((prev) => ({
                  ...prev,
                  discount: value,
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              required
              min={0}
              max={sale.discountType === "percentage" ? 100 : undefined}
            ></input>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-row gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={"promoCode"} className="text-xs font-medium">
                  Start Date:
                </label>
                <input
                  type="date"
                  value={
                    sale.startDate instanceof Date
                      ? sale.startDate.toISOString().slice(0, 10)
                      : ""
                  }
                  className="border-zinc-150 w-26 rounded-md border-[1px] bg-zinc-50 px-1 py-1 text-xs font-medium tracking-wide text-zinc-900 outline-none outline-1 drop-shadow-sm hover:border-zinc-300 focus:border-zinc-300"
                  title="Start Date"
                  onChange={(e) => handleDateChange(e, "startDate")}
                  required
                ></input>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={"promoCode"} className="text-xs font-medium">
                  Expiration Date:
                </label>
                <input
                  type="date"
                  value={
                    sale.endDate instanceof Date
                      ? sale.endDate.toISOString().slice(0, 10)
                      : ""
                  }
                  className="border-zinc-150 w-26 rounded-md border-[1px] bg-zinc-50 px-1 py-1 text-xs font-medium tracking-wide text-zinc-900 outline-none outline-1 drop-shadow-sm hover:border-zinc-300 focus:border-zinc-300"
                  title="Expiration Date"
                  onChange={(e) => handleDateChange(e, "endDate")}
                ></input>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 self-end">
              <button
                type="button"
                className="relative rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
                onClick={(e) => {
                  e.preventDefault();
                  setToggleBrose(true);
                }}
              >
                Browse Products
              </button>
              <button
                type="button"
                className="relative rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    window.confirm(
                      "Are you sure you want to confirm this sale?",
                    )
                  ) {
                    handleConfirm();
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
        <div className="relative h-full w-full overflow-auto rounded">
          <table className="w-full table-auto overflow-hidden text-sm">
            <thead className="">
              <tr className="h-8 text-nowrap bg-zinc-100">
                <th className="cursor-pointer rounded-l-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setToRemove(isChecked ? sale.selectedProducts : []);
                      }}
                      checked={
                        sale.selectedProducts.length > 0 &&
                        toRemove.length === sale.selectedProducts.length
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
                <th className="cursor-pointer rounded-r-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                  <span className="mr-2 rounded border-[1px]" />
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="">
              <tr>
                <td colSpan={8} className="h-2"></td>
              </tr>
              {currentProducts.map((selected, index) => (
                <Row_Cells key={index} selected={selected} />
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

export default SelectProduct;
