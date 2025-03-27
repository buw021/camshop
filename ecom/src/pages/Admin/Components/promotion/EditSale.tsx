import React, { useEffect, useState } from "react";

import { RoundedMdButton } from "../main/Buttons";
import { showToast } from "../showToast";
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
  isOnSale: boolean;
  salePrice: number;
  saleStartDate: Date;
  saleExpiryDate: Date;
  _id: string;
  productInfo: ProductInfo;
}

interface EditSaleProps {
  sale: SaleInterface;
  close: () => void;
  fetch: () => void;
}

const EditSale: React.FC<EditSaleProps> = ({ sale, close, fetch }) => {
  const { salePrice, _id, productInfo } = sale;
  const [duration, setDuration] = useState<{
    startDate: Date;
    expiryDate: Date;
  }>({
    startDate: new Date(),
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  });
  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed" | undefined
  >();
  const [value, setValue] = useState<number | undefined>();
  const [newSalePriceBttn, setNewSalePriceBttn] = useState<boolean>(false);
  const [newSalePrice, setNewSalePrice] = useState<number | undefined>();
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    dateType: "startDate" | "expiryDate",
  ) => {
    if (dateType === "startDate") {
      const today = new Date();
      const value = new Date(e.target.value);
      if (today <= value) {
        console.log(today, value);
        setDuration((prev) => ({
          ...prev,
          [dateType]: new Date(e.target.value),
        }));
      } else {
        showToast("please enter a valid date", "error");
      }
    }
    if (dateType === "expiryDate") {
      const start = duration.startDate;
      const value = new Date(e.target.value);
      if (start)
        if (start <= value) {
          setDuration((prev) => ({
            ...prev,
            [dateType]: new Date(e.target.value),
          }));
        } else {
          showToast("please enter a valid date", "error");
        }
    }
  };

  const saveNewSaleData = async () => {
    try {
      const response = await axiosInstance.post("/save-new-sale-data", {
        saleData: { _id, value, newSalePrice, discountType, duration },
      });
      if (response.status === 200) {
        showToast("Success on saving new sale data", "success");
        fetch();
        close();
      } else {
        showToast(`${response.data.message}`, "error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const calculateSalePrice = (
    origPrice: number,
    discountType: "percentage" | "fixed" | undefined,
    value: number | undefined,
  ) => {
    if (!value || !discountType || !origPrice) return;
    let price: number = origPrice;
    switch (discountType) {
      case "percentage":
        price = parseFloat((origPrice - (origPrice * value) / 100).toFixed(2));
        return setNewSalePrice(price);

      case "fixed":
        price = parseFloat((origPrice - value).toFixed(2));
        return setNewSalePrice(price);
      default:
        return setNewSalePrice(price);
    }
  };

  useEffect(() => {
    calculateSalePrice(productInfo.variants.variantPrice, discountType, value);
  }, [discountType, productInfo.variants.variantPrice, value]);

  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center rounded-xl bg-zinc-900/20 backdrop-blur-sm sm:px-2 sm:py-4">
      <div className="relative flex w-full flex-col gap-2 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:max-w-[800px] sm:p-8">
        <span
          className={`material-symbols-outlined absolute right-4 top-4 z-20 flex h-7 w-7 select-none items-center justify-center rounded-full bg-zinc-900/10 text-center text-xl text-zinc-800 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
          onClick={close}
        >
          close
        </span>

        {sale && (
          <div className="flex h-full flex-col gap-4 text-sm">
            <h1 className="text-lg font-medium tracking-tight sm:text-xl">
              Edit Sale Data
            </h1>
            <div className="flex flex-col gap-2 rounded-lg border-[1px] p-2 sm:p-4">
              <p>
                <span className="font-medium tracking-wide">Name: </span>
                {productInfo.name} {productInfo.variants.variantName}{" "}
                {productInfo.variants.variantColor}
              </p>
              <p>
                <span className="font-medium tracking-wide">Category: </span>
                {productInfo.category}
              </p>
              <p>
                <span className="font-medium tracking-wide">Price:</span> €{" "}
                {productInfo.variants.variantPrice.toFixed(2)}
              </p>
              <p>
                <span className="font-medium tracking-wide">Sale Price:</span> €{" "}
                {salePrice.toFixed(2)}{" "}
                {`(${(((productInfo.variants.variantPrice - salePrice) / productInfo.variants.variantPrice) * 100).toFixed(2)}%)`}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg border-[1px] p-2 sm:p-4">
              <div className="felx-wrap flex gap-2">
                <RoundedMdButton onClick={() => setNewSalePriceBttn(true)}>
                  <span className="material-symbols-outlined -ml-1 text-base leading-3">
                    edit_square
                  </span>
                  Set New Sale Price
                </RoundedMdButton>
                <RoundedMdButton
                  onClick={() => {
                    setNewSalePriceBttn(false);
                    setDiscountType(undefined);
                    setValue(0);
                  }}
                >
                  <span className="material-symbols-outlined -ml-1 text-base leading-3">
                    cycle
                  </span>
                  Keep Current Sale Price
                </RoundedMdButton>
              </div>

              <div
                className={`flex select-none flex-col gap-2 ${!newSalePriceBttn && "opacity-50"} relative`}
              >
                <div className="flex flex-col items-start gap-2">
                  <label
                    htmlFor={"promo-type"}
                    className="pr-1 text-xs font-medium"
                  >
                    Discount Type :
                  </label>

                  <div className="items flex gap-2">
                    <div
                      className={`flex items-center gap-2 rounded-md border-[1px] border-zinc-200 text-sm leading-3 ${discountType === "percentage" ? "border-white ring-2 ring-blue-500 drop-shadow-sm" : ""}`}
                    >
                      <input
                        type="radio"
                        id={"percentage"}
                        name={"discount-type"}
                        checked={discountType === "percentage"}
                        onChange={() => {
                          setDiscountType("percentage");
                          setValue(0);
                          setNewSalePrice(undefined);
                        }}
                        className="ml-2"
                        disabled={!newSalePriceBttn}
                      />
                      <label
                        htmlFor={"percentage"}
                        className="select-none py-2 pr-2 text-xs leading-[11px]"
                      >
                        Percentage
                      </label>
                    </div>
                    <div
                      className={`flex items-center gap-2 rounded-md border-[1px] border-zinc-200 text-sm leading-3 ${discountType === "fixed" ? "border-white ring-2 ring-blue-500 drop-shadow-sm" : ""}`}
                    >
                      <input
                        type="radio"
                        id={"fixed"}
                        name={"discount-type"}
                        checked={discountType === "fixed"}
                        onChange={() => {
                          setDiscountType("fixed");
                          setValue(0);
                          setNewSalePrice(undefined);
                        }}
                        className="ml-2"
                        disabled={!newSalePriceBttn}
                      />
                      <label
                        htmlFor={"fixed"}
                        className="select-none py-2 pr-2 text-xs leading-[11px]"
                      >
                        Fixed
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <label
                    htmlFor={"discount-value"}
                    className="text-xs font-medium"
                  >
                    Value:
                  </label>
                  <input
                    type="number"
                    className="roboto-medium w-20 rounded-md border-2 border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-900 outline-none outline-1 focus:border-zinc-300"
                    placeholder="Ex. 5"
                    disabled={!discountType}
                    value={value !== null && value !== 0 ? value : 0}
                    onChange={(e) => {
                      let newValue = Number(e.target.value);
                      if (discountType === "percentage" && newValue > 100) {
                        newValue = 1;
                      }
                      if (
                        discountType === "fixed" &&
                        newValue > sale.productInfo.variants.variantPrice
                      ) {
                        newValue = 1;
                      }
                      setValue(newValue);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "e" || e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      }
                    }}
                    required
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                  ></input>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor={"promoCode"} className="text-xs font-medium">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={
                      duration.startDate instanceof Date
                        ? duration.startDate.toISOString().slice(0, 10)
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
                      duration.expiryDate instanceof Date
                        ? duration.expiryDate.toISOString().slice(0, 10)
                        : ""
                    }
                    className="border-zinc-150 w-26 rounded-md border-[1px] bg-zinc-50 px-1 py-1 text-xs font-medium tracking-wide text-zinc-900 outline-none outline-1 drop-shadow-sm hover:border-zinc-300 focus:border-zinc-300"
                    title="Expiration Date"
                    onChange={(e) => handleDateChange(e, "expiryDate")}
                  ></input>
                </div>
              </div>
              <div className="my-2 h-[1px] w-full bg-zinc-200"></div>
              <p className={` ${!newSalePriceBttn && "opacity-50"}`}>
                <span className="font-medium tracking-wide">
                  New Sale Price:
                </span>{" "}
                € {newSalePrice ?? "0.00"}
              </p>
              <p className="">
                <span className="font-medium tracking-wide">Start Date:</span>{" "}
                {new Date(duration.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="">
                <span className="font-medium tracking-wide">
                  Expiration Date:
                </span>{" "}
                {new Date(duration.expiryDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="">
                <span className="font-medium tracking-wide">Duration :</span>{" "}
                {Math.ceil(
                  (new Date(duration.expiryDate).getTime() -
                    new Date(duration.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                day(s)
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 self-end">
          <RoundedMdButton
            onClick={() => {
              if (window.confirm("Are you sure you want to discard changes?")) {
                close();
              }
              return;
            }}
          >
            Discard Changes
          </RoundedMdButton>
          <RoundedMdButton
            onClick={async () => {
              if (
                window.confirm(
                  "Saving changes will resume the product on sale. Would you like to save?",
                )
              ) {
                saveNewSaleData();
              }
              return;
            }}
          >
            Save
          </RoundedMdButton>
        </div>
      </div>
    </div>
  );
};

export default EditSale;
