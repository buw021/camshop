import React, { useCallback, useEffect, useState } from "react";
import { PromoCode } from "../interface/interfaces";
import axiosInstance from "../../Services/axiosInstance";
import PromoCodeForm from "./PromoCodeForm";

const Row_Cells: React.FC<{
  handleEditPromo: (promo: PromoCode) => void;
  promo: PromoCode;
  index: number;
}> = ({ promo, index, handleEditPromo }) => (
  <tr className="hover:bg-zinc-200">
    <td className="px-4 items-center flex py-2">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
      />
    </td>
    <td className="px-6 text-center">{index + 1}</td>
    <td className="px-6 text-center">{promo.code || ""}</td>
    {/* <td className="px-6 text-center capitalize">{promo.type || ""}</td> */}
    <td className="px-6 text-center">
      {promo.type === "fixed"
        ? `${promo.value} €`
        : promo.type === "percentage"
          ? `${promo.value} %`
          : promo.value || ""}
    </td>
    <td className="px-6 text-center">
      {`${promo.minimumOrderValue} €` || "None"}
    </td>

    <td className="px-6 text-center">
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

    <td className="px-6 text-center">
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

    <td className="px-6 text-center">
      {promo.startDate
        ? new Date(promo.startDate).toLocaleDateString("en-GB")
        : ""}
    </td>
    <td className="px-6 text-center">
      {promo.endDate
        ? new Date(promo.endDate).toLocaleDateString("en-GB")
        : "None"}
    </td>
    {/*  <td className="px-6 text-center">{promo.keywords || "None"}</td> */}
    <td className="px-6 text-center">
      <button
        className="text-blue-600 hover:text-blue-900"
        onClick={(e) => {
          e.preventDefault();
          handleEditPromo(promo);
        }}
      >
        Manage
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
  }

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

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          className={`roboto-medium self-start rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500`}
          onClick={() => handlePromoType()}
        >
          {type === "active" ? "Show Inactive" : "Show Active"}
        </button>
        <button
          className="roboto-medium self-end rounded-md bg-zinc-400 px-2 py-1 text-sm uppercase tracking-wide text-white transition-all duration-100 hover:bg-zinc-500"
          onClick={() => handleAddPromo()}
        >
          Add New Promo
        </button>
      </div>
      <div className="relative h-full w-full overflow-auto rounded">
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
        <table className="w-full table-auto divide-y divide-gray-300 text-sm">
          <thead className="bg-zinc-200 h-8">
            <tr className="">
              <th scope="col" className="px-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                  <label className="sr-only">checkbox</label>
                </div>
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                No.
              </th>

              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Code
              </th>
              {/*  <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Description
            </th> */}
              {/* <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Type
              </th> */}
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Value
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Minimum Order
              </th>

              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Days/Time Left
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Usage Count Left
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Start Date
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                End Date
              </th>
              {/*   <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Keywords {"(Conditions)"}
              </th> */}
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Manage
              </th>
              {/*  <th scope="col" className="p-4">
                <span className="sr-only">Manage</span>
              </th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {promos.map((promo, index) => (
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
