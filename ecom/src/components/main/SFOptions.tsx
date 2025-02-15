import React, { useCallback, useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";

interface SFOptionProps {
  selectedSFOption: ShippingOptionProps;
  handleOptionChange: (sfOption: ShippingOptionProps) => void;
  totalOrderCost: number;
}

interface ShippingOptionProps {
  shippingType: string;
  shippingCost: number;
  shippingLabel: string;
  shippingTime: string;
  _id?: string;
}

const SFOptions: React.FC<SFOptionProps> = ({
  selectedSFOption,
  handleOptionChange,
  totalOrderCost,
}) => {
  const [shippingOptions, setShippingOptions] = useState<ShippingOptionProps[]>(
    [],
  );

  const getShippingOptions = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-sf-options", {
        params: { totalOrderCost },
      });
      if (response.data) setShippingOptions(response.data);
      else {
        console.log("No data found");
      }
    } catch (error) {
      console.error(error);
    }
  }, [totalOrderCost]);

  useEffect(() => {
    getShippingOptions();
  }, [getShippingOptions]);

  return (
    <>
      <div className="text-sm">
        <h3>Select Shipping Option: </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {shippingOptions.map((option) => (
            <button
              type="button"
              key={option.shippingType}
              onClick={() => handleOptionChange(option)}
              className={`flex w-36 flex-col rounded-md border-[1px] p-2.5 ${selectedSFOption.shippingType === option.shippingType ? "border-zinc-200 bg-zinc-100" : ""}`}
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
    </>
  );
};

export default SFOptions;
