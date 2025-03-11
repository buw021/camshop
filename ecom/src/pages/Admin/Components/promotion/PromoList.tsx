import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PromoCode } from "../interface/interfaces";
import axiosInstance from "../../Services/axiosInstance";
import PromoCodeForm from "./PromoCodeForm";

const Row_Cells: React.FC<{
  handleEditPromo: (promo: PromoCode) => void;
  promo: PromoCode;
  index: number;
}> = ({ promo, index, handleEditPromo }) => (
  <tr className="border-y-[1px] hover:bg-zinc-100">
    {/* <td className="flex items-center px-4 py-1.5">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
      />
    </td> */}
    <td className="whitespace-nowrap py-1 pl-8 pr-6 text-left capitalize">
      {index + 1}
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
      {promo.code || ""}
    </td>
    {/* <td className="px-6 text-center capitalize">{promo.type || ""}</td> */}
    <td className="whitespace-nowrap pl-8 pr-6 text-left font-medium capitalize">
      {promo.type === "fixed"
        ? `${promo.value} €`
        : promo.type === "percentage"
          ? `${promo.value} %`
          : promo.value || ""}
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
      {`${promo.minimumOrderValue} €` || "None"}
    </td>

    <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
      {promo.startDate && promo.endDate ? (
        (() => {
          const daysLeft = Math.ceil(
            (new Date(promo.endDate).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          );
          return (
            <span className={daysLeft <= 0 ? "text-red-600" : "text-green-600"}>
              {daysLeft <= 0 ? "Expired" : daysLeft}
            </span>
          );
        })()
      ) : (
        <span className="text-green-600">Unlimited</span>
      )}
    </td>

    <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
      {promo.usageLimit === null ? (
        <span className="text-green-600">Unlimited</span>
      ) : promo.usageLimit !== null && promo.usageCount !== undefined ? (
        promo.usageLimit - promo.usageCount <= 0 ? (
          <span className="text-red-600">Limit Exceeded</span>
        ) : (
          Math.max(promo.usageLimit - promo.usageCount, 0)
        )
      ) : (
        <span className="text-green-600">Unlimited</span>
      )}
    </td>

    <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
      {promo.startDate
        ? new Date(promo.startDate).toLocaleDateString("en-GB")
        : ""}
    </td>
    <td className="whitespace-nowrap pl-8 pr-6 text-left capitalize">
      {promo.endDate
        ? new Date(promo.endDate).toLocaleDateString("en-GB")
        : "None"}
    </td>
    <td className="pr-6text-left whitespace-nowrap pl-8 text-xs font-medium capitalize">
      <button
        className="rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700"
        onClick={(e) => {
          e.preventDefault();
          handleEditPromo(promo);
        }}
      >
        <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
          edit_square
        </span>
        Edit
      </button>
      <button
        className="ml-1 rounded-lg border-[1px] border-zinc-300 bg-white py-0.5 pl-7 pr-2 text-xs font-medium tracking-wide drop-shadow-sm hover:text-zinc-700"
        onClick={(e) => {
          e.preventDefault();
          handleEditPromo(promo);
        }}
      >
        <span className="material-symbols-outlined absolute left-2 top-1 text-base leading-3">
          archive
        </span>
        Archive
      </button>
    </td>
  </tr>
);

const PromoList = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [toggleAddPromo, setToggleAddPromo] = useState(false);
  const [toggleEditPromo, setToggleEditPromo] = useState(false);
  const [type, setType] = useState<"active" | "inactive">("active");
  const [currentPromo, setCurrentPromo] = useState<PromoCode | undefined>(
    undefined,
  );

  const handleAddPromo = () => {
    setToggleAddPromo(!toggleAddPromo);
  };

  const handleEditPromo = (promo: PromoCode) => {
    setCurrentPromo(promo);
    setToggleEditPromo(true);
  };

  const handleCloseEditPromo = () => {
    setCurrentPromo(undefined);
    setToggleEditPromo(false);
  };

  const handlePromoType = () => {
    if (type === "active") {
      setType("inactive");
    } else {
      setType("active");
    }
  };

  const fetchPromos = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/get-promos`, {
        params: { type },
      });
      setPromos(response.data);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    }
  }, [type]);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PromoCode | null;
    direction: string;
  } | null>(null);

  const sortedPromos = useMemo(() => {
    if (!promos || !sortConfig) return promos;

    const { key, direction } = sortConfig;

    const sortablePromos = [...promos];
    sortablePromos.sort((a, b) => {
      if (!key) {
        return direction === "ascending" ? 1 : -1;
      }

      const aValue = a[key];
      const bValue = b[key];

      // Handle comparison for different data types
      if (key === "startDate") {
        return direction === "ascending"
          ? new Date(aValue as string | number | Date).getTime() -
              new Date(bValue as string | number | Date).getTime()
          : new Date(bValue as string | number | Date).getTime() -
              new Date(aValue as string | number | Date).getTime();
      }

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

    return sortablePromos;
  }, [promos, sortConfig]);

  const requestSort = (key: keyof PromoCode | null) => {
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

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          onClick={() => handlePromoType()}
        >
          {type === "active" ? "Show Inactive" : "Show Active"}
        </button>
        <button
          className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          onClick={() => handleAddPromo()}
        >
          Add New Promo
        </button>
      </div>
      <div className="relative h-full w-full overflow-auto bg-white">
        {toggleAddPromo && (
          <PromoCodeForm
            onClose={handleAddPromo}
            type="add"
            fetch={fetchPromos}
          ></PromoCodeForm>
        )}
        {toggleEditPromo && (
          <PromoCodeForm
            onClose={handleCloseEditPromo}
            type="edit"
            fetch={fetchPromos}
            promo={currentPromo}
          ></PromoCodeForm>
        )}
        <table className="w-full table-auto overflow-hidden text-sm">
          <thead className="">
            <tr className="h-8 text-nowrap bg-zinc-100">
              {/* <th scope="col" className="rounded-l-lg px-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                  <label className="sr-only">checkbox</label>
                </div>
              </th> */}
              <th className="cursor-pointer rounded-l-lg px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                No.
              </th>

              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("code")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Code
                <span className="material-symbols-outlined absolute top-2.5 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>

              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("value")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Value
                <span className="material-symbols-outlined absolute top-2.5 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Minimum Order
              </th>

              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Days/Time Left
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Usage Count Left
              </th>
              <th
                className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600"
                onClick={() => requestSort("startDate")}
              >
                <span className="mr-2 rounded border-[1px]" />
                Start Date
                <span className="material-symbols-outlined absolute top-2.5 px-1 text-sm leading-3">
                  swap_vert
                </span>
              </th>
              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                End Date
              </th>

              <th className="cursor-pointer px-6 text-left font-medium capitalize tracking-wide text-zinc-500 hover:text-zinc-600">
                <span className="mr-2 rounded border-[1px]" />
                Manage
              </th>
            </tr>
          </thead>
          <tbody className="">
            <tr>
              <td colSpan={8} className="h-2"></td>
            </tr>
            {sortedPromos.map((promo, index) => (
              <Row_Cells
                key={index}
                promo={promo}
                index={index}
                handleEditPromo={handleEditPromo}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PromoList;
