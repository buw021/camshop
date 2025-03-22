import React, { useEffect, useState } from "react";
import BrowseProduct from "./BrowseProduct";
import axiosInstance from "../../Services/axiosInstance";

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

const SelectProduct: React.FC<{ handleClose: () => void }> = ({
  handleClose,
}) => {
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
      console.log("Please fill in all required fields.");
      return;
    }

    try {
      const response = await axiosInstance.post("/set-product-on-sale", { SaleList: sale });
      if (response.data) {
        console.log("Sale set successfully");
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
        console.log("please enter a valid date");
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
          console.log("please enter a valid date");
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
    <tr className="hover:bg-zinc-200">
      <td scope="col" className="px-4">
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
      <td className="whitespace-nowrap px-6 text-center">
        {selected.name} {selected.variantName}
      </td>
      <td className="whitespace-nowrap px-6 text-center capitalize">
        {selected.category}
      </td>
      <td className="whitespace-nowrap px-6 text-center">
        € {selected.variantPrice}
      </td>
      <td className="whitespace-nowrap px-6 text-center font-medium">
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
      <td className="whitespace-nowrap px-6 text-center">
        €{" "}
        {sale.discountType && sale.discount !== null
          ? sale.discountType === "percentage"
            ? ((selected.variantPrice * sale.discount) / 100).toFixed(2)
            : sale.discount.toFixed(2)
          : ""}
      </td>
      <td className="whitespace-nowrap px-6 text-center">
        <button className="font-medium text-blue-700 hover:underline">
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

      <div className="flex h-[90%] w-[90%] flex-col gap-2 overflow-hidden rounded bg-white p-2 drop-shadow-sm">
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
              className={
                "w-20 select-none rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:ring-zinc-300"
              }
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
          <div className="flex flex-col gap-2 sm:flex-row">
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
                className="w-36 select-none rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
                onChange={(e) => handleDateChange(e, "startDate")}
                required
              ></input>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={"promoCode"} className="text-xs font-medium">
                End Date:
              </label>
              <input
                type="date"
                value={
                  sale.endDate instanceof Date
                    ? sale.endDate.toISOString().slice(0, 10)
                    : ""
                }
                className="w-36 select-none rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
                onChange={(e) => handleDateChange(e, "endDate")}
              ></input>
            </div>
          </div>
          <button
            type="button"
            className="roboto-medium rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
            onClick={(e) => {
              e.preventDefault();
              setToggleBrose(true);
            }}
          >
            Browse Products
          </button>
        </div>
        <div className="h-full w-full overflow-auto rounded">
          <table className="w-full table-auto divide-y divide-gray-300 overflow-auto text-sm">
            <thead className="bg-zinc-200">
              <tr className="">
                <th scope="col" className="px-4 py-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
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
            className="roboto-medium self-center rounded-md bg-zinc-400 px-4 py-2 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500 disabled:bg-zinc-200"
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
            className="roboto-medium self-center rounded-md bg-zinc-400 px-4 py-2 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500 disabled:bg-zinc-200"
          >
            Next
          </button>
        </div>
        <button
          type="button"
          className="roboto-medium rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm("Are you sure you want to confirm this sale?")) {
              handleConfirm();
            }
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default SelectProduct;
