import React from "react";

interface ShippingOption {
  shippingType: string;
  shippingTime: string;
  shippingLabel: string;
  shippingCost: number;
  _id?: string;
}

interface ShipppingOptionFormProps {
  shippingOption: ShippingOption;
  setShippingOption: (option: ShippingOption) => void;
  setToggleShippingOption: (toggle: boolean) => void;
  action: () => void;
}

const ShipppingOptionForm: React.FC<ShipppingOptionFormProps> = ({
  shippingOption,
  setShippingOption,
  setToggleShippingOption,
  action,
}) => {
  return (
    <div className="absolute left-0 top-0 z-10 flex h-full w-full justify-center overflow-hidden rounded-xl bg-zinc-900/20 px-4 py-4 backdrop-blur-[2px] sm:items-center sm:px-10 sm:py-10">
      <form
        className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-zinc-50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (window.confirm("Are you sure you want to save changes?")) {
            action();
            setToggleShippingOption(false);
          }
        }}
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-md font-semibold capitalize"></h3>
          <label htmlFor="type" className="text-sm font-medium">
            Type:{" "}
            <span className="text-zin-500 text-xs font-normal">{`(e.g. Free, Standard)`}</span>
          </label>
          <input
            type="text"
            id="type"
            name="type"
            value={shippingOption?.shippingType}
            onChange={(e) =>
              setShippingOption({
                ...shippingOption,
                shippingType: e.target.value.toLowerCase(),
              })
            }
            className="rounded-md border-[1px] p-2 capitalize"
          />
          <label htmlFor="label" className="text-sm font-medium">
            Label:{" "}
            <span className="text-zin-500 text-xs font-normal">{`(e.g. Express Shipping, Standard Shipping)`}</span>
          </label>
          <input
            type="text"
            id="label"
            name="label"
            value={shippingOption?.shippingLabel}
            onChange={(e) =>
              setShippingOption({
                ...shippingOption,
                shippingLabel: e.target.value.toLowerCase(),
              })
            }
            className="rounded-md border-[1px] p-2 capitalize"
          />

          <label htmlFor="time" className="text-sm font-medium">
            Amount of Days:{" "}
            <span className="text-zin-500 text-xs font-normal">{`(e.g. 3-5 days)`}</span>
          </label>
          <input
            type="text"
            id="time"
            name="time"
            value={shippingOption?.shippingTime}
            onChange={(e) =>
              setShippingOption({
                ...shippingOption,
                shippingTime: e.target.value.toLowerCase(),
              })
            }
            className="rounded-md border-[1px] p-2"
          />
          <label htmlFor="cost" className="text-sm font-medium capitalize">
            Cost
          </label>
          <input
            type="number"
            id="cost"
            name="cost"
            min={0}
            value={shippingOption.shippingCost}
            onChange={(e) =>
              setShippingOption({
                ...shippingOption,
                shippingCost: parseFloat(e.target.value),
              })
            }
            className="rounded-md border-[1px] p-2 capitalize"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-md border-[1px] border-zinc-200 bg-zinc-100 p-2 font-medium text-zinc-900 hover:border-zinc-300 hover:bg-zinc-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setToggleShippingOption(false)}
              className="rounded-md border-[1px] border-zinc-200 bg-zinc-100 p-2 font-medium text-zinc-900 hover:border-zinc-300 hover:bg-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ShipppingOptionForm;
