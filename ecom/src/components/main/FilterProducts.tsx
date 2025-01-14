import React, { useState } from "react";
import Dropdown from "./Dropdown";

const FilterProducts = () => {
  const [, setValue] = useState<string | number>("");
  const list = [
    {
      value: "default",
      placeholder: "Default",
    },
    {
      value: "a-z",
      placeholder: "Sort by A-Z",
    },
    {
      value: "z-a",
      placeholder: "Sort by Z-A",
    },
  ];

  const handleDropdownValue = (newvalue: string | number) => {
    setValue(newvalue);
  };
  
  return (
    <div className="flex h-10 w-full items-center gap-2">
      <Dropdown
        label={"Order by: "}
        list={list}
        onValueChange={handleDropdownValue}
      ></Dropdown>
    </div>
  );
};

export default FilterProducts;
