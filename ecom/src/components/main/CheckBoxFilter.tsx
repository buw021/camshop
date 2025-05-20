import React, { useState } from "react";

type ItemType = { [key: string]: string };

interface CheckBoxFilterProps {
  list: ItemType[];
  labelKey: string;
  handleSelected: (array: string[], key: string) => void;
  buttonLabel?: string;
  selectedFilters?: string[];
}

const CheckBoxFilter: React.FC<CheckBoxFilterProps> = ({
  list,
  labelKey,
  handleSelected,
  selectedFilters,
  buttonLabel = "Filter",
}) => {
  const [selected, setSelected] = useState<string[]>(selectedFilters || []);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative flex w-full items-center">
      <div
        className="relative w-full"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setShowDropdown(false);
          }
        }}
        tabIndex={0}
      >
        <button
          className="relative w-full self-center rounded-md bg-zinc-800 py-[7px] pl-3 pr-7 text-start text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="select-none">{buttonLabel}</span>
          <span className="material-symbols-outlined absolute right-2 top-1.5 text-lg leading-3">
            keyboard_arrow_down
          </span>
        </button>
        {showDropdown && (
          <div className="absolute z-10 mt-2 w-full gap-1 rounded-md bg-white py-1 text-sm font-medium tracking-wide shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {list.length > 0 &&
                list.map((val: ItemType, index: number) => {
                  const label = val[labelKey];
                  return (
                    <label
                      key={index}
                      className="flex items-center px-2 hover:cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        checked={selected.includes(label)}
                        onChange={(e) => {
                          let newSelected;
                          if (e.target.checked) {
                            newSelected = [...selected, label];
                          } else {
                            newSelected = selected.filter((f) => f !== label);
                          }
                          setSelected(newSelected);
                          handleSelected(newSelected, labelKey);
                        }}
                      />
                      <span className="ml-2 capitalize">{label}</span>
                    </label>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckBoxFilter;
