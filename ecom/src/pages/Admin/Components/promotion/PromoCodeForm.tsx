import React, { useEffect, useState } from "react";
import { PromoCode } from "../interface/interfaces";
import axios from "axios";

interface FormInterface {
  onClose: () => void;
}

const inputDesign =
  "w-full select-none rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:ring-zinc-300";

const PromoCodeForm: React.FC<FormInterface> = ({ onClose }) => {
  const [promo, setPromo] = useState<PromoCode>({
    code: "",
    description: "",
    type: null,
    value: null,
    startDate: null,
    endDate: null,
    usageLimit: null,
    keywords: [],
  });
  const [usageType, setUsageType] = useState<"limited" | "unlimited" | null>();
  const [promoCondition, setPromoCondition] = useState<
    "all" | "keywords" | null
  >();
  const [newKeyword, setNewKeyword] = useState("");
  useEffect(() => {
    setPromo((prevPromo) => ({
      ...prevPromo,
      startDate: new Date(),
    }));
  }, []);

  useEffect(() => {
    if (usageType === "unlimited") {
      setPromo((prevPromo) => ({ ...prevPromo, usageLimit: null }));
    }
  }, [usageType]);

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    dateType: "startDate" | "endDate",
  ) => {
    if (dateType === "startDate") {
      const today = new Date();
      const value = new Date(e.target.value);
      if (today <= value) {
        console.log(today, value);
        setPromo((prevPromo) => ({
          ...prevPromo,
          [dateType]: new Date(e.target.value),
        }));
      } else {
        console.log("please enter a valid date");
      }
    }
    if (dateType === "endDate") {
      const start = promo.startDate;
      const value = new Date(e.target.value);
      if (start)
        if (start <= value) {
          setPromo((prevPromo) => ({
            ...prevPromo,
            [dateType]: new Date(e.target.value),
          }));
        } else {
          console.log("please enter a valid date");
        }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const regex = /^[a-zA-Z0-9]*$/;
    if (regex.test(value)) {
      setPromo({ ...promo, code: e.target.value });
    }
  };

  const handleCondition = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setPromo((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword],
      }));
      setNewKeyword("");
      console.log(promo);
    }
  };

  const deleteKeyword = (index: number) => {
    setPromo((prev) => {
      const updatedSpecs = prev.keywords.filter((_, idx) => idx !== index);
      return {
        ...prev,
        keywords: updatedSpecs,
      };
    });
  };

  const handleClose = () => {
    if (!promo) {
      onClose();
    } else {
      const shouldClose = window.confirm("Are you sure you want to close?");
      if (shouldClose) {
        onClose();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/add-promo", promo);
      if (res.status === 201) {
        setPromo({
          code: "",
          description: "",
          type: null,
          value: 0,
          startDate: null,
          endDate: null,
          usageLimit: null,
          keywords: [],
        });
        setNewKeyword("");
        setUsageType(null);
        setPromoCondition(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="absolute left-0 top-0 z-10 flex h-full w-full justify-center overflow-hidden rounded-xl bg-zinc-900/20 px-4 py-4 backdrop-blur-[2px] sm:items-center sm:px-10 sm:py-10">
      <form onSubmit={handleSubmit} action="" method="POST" className="h-full">
        <div className="relative flex max-h-full w-full max-w-md flex-col gap-4 overflow-auto rounded bg-white p-4 px-8 text-sm">
          <button
            type="button"
            className="transitio-all absolute right-4 duration-200 hover:text-zinc-400"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined text-md">close</span>
          </button>

          <div className="mb-2">
            <p className="roboto-medium text-center text-base uppercase tracking-wide">
              Add Promo Code
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={"promoCode"} className="text-sm font-medium">
              Code:
            </label>
            <input
              type="text"
              className={`${inputDesign} uppercase`}
              placeholder="Promo Code"
              value={promo.code}
              onChange={handleCodeChange}
              required
              maxLength={100}
            ></input>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={"description"} className="text-sm font-medium">
              Description:
            </label>
            <textarea
              name=""
              id=""
              className={inputDesign}
              value={promo.description}
              onChange={(e) =>
                setPromo({ ...promo, description: e.target.value })
              }
            ></textarea>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor={"promo-type"} className="pr-1 text-sm font-medium">
              Type:
            </label>

            <div className="flex items-center gap-2 text-sm leading-3">
              <input
                type="radio"
                id={"percentage"}
                name={"promo-type"}
                checked={promo.type === "percentage"}
                onChange={() => setPromo({ ...promo, type: "percentage" })}
              />
              <label htmlFor={"percentage"} className="text-sm leading-[11px]">
                Percentage
              </label>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                id={"fixed"}
                name={"promo-type"}
                checked={promo.type === "fixed"}
                onChange={() => setPromo({ ...promo, type: "fixed" })}
              />
              <label htmlFor={"fixed"} className="text-sm leading-[11px]">
                Fixed
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={"promoCode"} className="text-sm font-medium">
              Value:
            </label>
            <input
              type="number"
              className={inputDesign}
              placeholder="Ex. 5"
              disabled={!promo.type}
              value={
                promo.value !== null && promo.value !== 0 ? promo.value : ""
              }
              onChange={(e) =>
                setPromo({ ...promo, value: Number(e.target.value) })
              }
              required
              maxLength={100}
            ></input>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col gap-1">
              <label htmlFor={"promoCode"} className="text-sm font-medium">
                Start Date:
              </label>
              <input
                type="date"
                value={
                  promo.startDate
                    ? promo.startDate.toISOString().slice(0, 10)
                    : ""
                }
                className="w-36 select-none rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
                onChange={(e) => handleDateChange(e, "startDate")}
                required
              ></input>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={"promoCode"} className="text-sm font-medium">
                End Date:
              </label>
              <input
                type="date"
                value={
                  promo.endDate ? promo.endDate.toISOString().slice(0, 10) : ""
                }
                className="w-36 select-none rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
                onChange={(e) => handleDateChange(e, "endDate")}
                required
              ></input>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:self-auto">
            <div className="flex flex-wrap gap-2">
              <label htmlFor={"promoCode"} className="pr-2 text-sm font-medium">
                Usage Limit:
              </label>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm leading-3">
                  <input
                    type="radio"
                    id={"limited"}
                    name={"usage-limit"}
                    checked={usageType === "limited"}
                    onChange={() => setUsageType("limited")}
                  />
                  <label htmlFor={"limited"} className="text-sm leading-[11px]">
                    Limited
                  </label>
                </div>
                <div className="flex items-center gap-2 text-sm leading-[11px]">
                  <input
                    type="radio"
                    id={"unlimited"}
                    name={"usage-limit"}
                    checked={usageType === "unlimited"}
                    onChange={() => {
                      setUsageType("unlimited");
                      setPromo((prev) => ({ ...prev, usageLimit: null }));
                    }}
                  />
                  <label htmlFor={"unlimited"} className="text-sm">
                    Unlimited
                  </label>
                </div>
              </div>
              <input
                type="number"
                className={inputDesign}
                placeholder="Ex. 100"
                value={promo.usageLimit !== null ? promo.usageLimit : ""}
                disabled={
                  usageType === "unlimited" || usageType === null || !usageType
                }
                onChange={(e) =>
                  setPromo({ ...promo, usageLimit: Number(e.target.value) })
                }
                min={0}
                required
              ></input>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor={"promoCode"} className="text-sm font-medium">
              Conditions:{" "}
              <span className="roboto-regular text-xs text-zinc-400">{`(Brands or Categories)`}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center justify-center gap-2 text-sm">
                <input
                  type="radio"
                  id={"all"}
                  name={"condition"}
                  checked={promoCondition === "all"}
                  onChange={() => {
                    setPromoCondition("all");
                    setPromo((prev) => ({ ...prev, keywords: [] }));
                  }}
                />
                <label htmlFor={"all"} className="text-sm leading-[11px]">
                  All
                </label>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  id={"keywords"}
                  name={"condition"}
                  checked={promoCondition === "keywords"}
                  onChange={() => setPromoCondition("keywords")}
                />
                <label htmlFor={"keywords"} className="text-sm leading-[11px]">
                  Brand & Categories
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className={inputDesign}
                placeholder="Ex. "
                disabled={promoCondition === "all" || !promoCondition}
                maxLength={100}
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleCondition}
              ></input>

              <button
                type="button"
                className="rounded bg-zinc-500 px-2 py-0.5 text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                disabled={promoCondition === "all" || !promoCondition}
                onClick={() => {
                  if (newKeyword) {
                    setPromo((prev) => ({
                      ...prev,
                      keywords: [...prev.keywords, newKeyword],
                    }));
                    setNewKeyword("");
                  }
                }}
              >
                Insert
              </button>
            </div>

            <ul className="flex w-full select-none flex-wrap gap-2 overflow-auto rounded-sm bg-zinc-50 px-2 py-2 text-zinc-700 outline-none ring-1 ring-zinc-200">
              {promo.keywords.length ? (
                <>
                  {promo.keywords.map((value, index) => (
                    <li
                      key={index}
                      className="flex select-none items-center gap-2 rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 hover:bg-zinc-100 hover:ring-zinc-300"
                    >
                      <span>{value}</span>
                      <span
                        className="material-symbols-outlined z-10 text-base leading-3 hover:cursor-pointer hover:text-red-700"
                        onClick={() => deleteKeyword(index)}
                      >
                        cancel
                      </span>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  <li className="flex select-none items-center gap-2 rounded-sm bg-zinc-50 px-2 py-1 text-zinc-400">
                    Empty
                  </li>
                </>
              )}
            </ul>
          </div>
          <button
            type="submit"
            className="rounded bg-zinc-500 px-2 py-0.5 text-white hover:bg-zinc-700"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromoCodeForm;
