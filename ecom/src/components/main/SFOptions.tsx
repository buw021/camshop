import React from "react";

interface ShippingOptionsProps {
  selectedSFOption: string;
  handleOptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const shippingOptions = [
  { id: "standard", label: "Standard Shipping (5-7 business days)", cost: 5.0 },
  { id: "express", label: "Express Shipping (1-2 business days)", cost: 15.0 },
];

const SFOptions: React.FC<ShippingOptionsProps> = ({
  selectedSFOption,
  handleOptionChange,
}) => {
  return (
    <>
      <div className="text-sm">
        <h3>Select Shipping Option: </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {shippingOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() =>
                handleOptionChange({
                  target: { value: option.id },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              className={`flex w-36 flex-col rounded-md border-[1px] p-2.5 ${selectedSFOption === option.id ? "border-zinc-300 bg-zinc-200" : "bg-zinc-50"}`}
            >
              <span className="w-full text-right font-medium tracking-wide">
                {option.label.split(" ").slice(0, 2).join(" ")}
              </span>
              <span className="w-full text-right text-xs text-zinc-700">
                {option.label.split(" ").slice(2).join(" ")}
              </span>
              <span className="mt-1 w-full text-right font-medium">
                €{option.cost.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default SFOptions;
