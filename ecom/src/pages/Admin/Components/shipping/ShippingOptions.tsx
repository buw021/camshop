import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../Services/axiosInstance";
import ShipppingOptionForm from "./ShipppingOptionForm";
import { showToast } from "../showToast";

interface ShippingOptionProps {
  shippingType: string;
  shippingCost: number;
  shippingLabel: string;
  shippingTime: string;
  _id?: string;
}

const SFOptions = () => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionProps[]>(
    [],
  );

  const [toggleEditShippingOption, setToggleEditShippingOption] =
    useState(false);
  const [toggleNewShippingOption, setToggleNewShippingOption] = useState(false);

  const [editShippingOption, setEditShippingOption] =
    useState<ShippingOptionProps>({
      shippingType: "",
      shippingCost: 0,
      shippingLabel: "",
      shippingTime: "",
      _id: "",
    });

  const [newShippingOption, setNewShippingOption] =
    useState<ShippingOptionProps>({
      shippingType: "",
      shippingCost: 0,
      shippingLabel: "",
      shippingTime: "",
    });

  const getShippingOptions = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-sf-optionsA");
      if (response.data) setShippingOptions(response.data);
      else {
        console.log("No data found");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const updateShippingOption = async () => {
    try {
      const response = await axiosInstance.post("/update-sf-option", {
        editShippingOption,
      });
      if (response.data) {
        showToast("Shipping Option Updated", "success");
        setToggleEditShippingOption(false);
        setEditShippingOption({
          shippingType: "",
          shippingCost: 0,
          shippingLabel: "",
          shippingTime: "",
        });
        getShippingOptions();
        return;
      }
      showToast("Failed to update shipping option", "error");
    } catch (error) {
      console.error(error);
    }
  };

  const addShippingOption = async () => {
    console.log(newShippingOption);
    try {
      const response = await axiosInstance.post("/add-sf-option", {
        newShippingOption,
      });
      if (response.data) {
        showToast("Shipping Option Added", "success");
        setToggleEditShippingOption(false);
        setNewShippingOption({
          shippingType: "",
          shippingCost: 0,
          shippingLabel: "",
          shippingTime: "",
        });
        getShippingOptions();
        return;
      }
      showToast("Failed to add shipping option", "error");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getShippingOptions();
  }, [getShippingOptions]);

  return (
    <div className="h-56 max-w-96 rounded-md border-[1px] border-zinc-200 p-4">
      {toggleEditShippingOption && (
        <ShipppingOptionForm
          shippingOption={editShippingOption}
          setShippingOption={setEditShippingOption}
          setToggleShippingOption={setToggleEditShippingOption}
          action={updateShippingOption}
        />
      )}
      {toggleNewShippingOption && (
        <ShipppingOptionForm
          shippingOption={newShippingOption}
          setShippingOption={setNewShippingOption}
          setToggleShippingOption={setToggleNewShippingOption}
          action={addShippingOption}
        />
      )}
      <div className="text-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs">Select to Edit a Shipping Option: </p>
          {shippingOptions.length < 3 && (
            <button
              type="button"
              className="rounded-md bg-zinc-700 px-2 py-0.5 text-xs font-medium tracking-wide text-white hover:bg-zinc-500"
              onClick={() => setToggleNewShippingOption(true)}
            >
              Add Shipping Options
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {shippingOptions.map((option) => (
            <button
              key={option.shippingType}
              className={`flex w-36 flex-col rounded-md border-[1px] p-2.5 hover:bg-zinc-100 ${editShippingOption.shippingType === option.shippingType ? "bg-zinc-100" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setToggleEditShippingOption(true);
                setEditShippingOption(option);
              }}
            >
              <span className="w-full text-right font-medium capitalize tracking-wide">
                {option.shippingLabel}
              </span>
              <span className="w-full text-right text-xs capitalize text-zinc-700">
                {"("}
                {option.shippingTime} business days{")"}
              </span>
              <span className="mt-1 w-full text-right font-medium">
                €{option.shippingCost.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SFOptions;
