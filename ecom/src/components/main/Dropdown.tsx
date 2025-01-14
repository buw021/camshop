import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface List {
  value: string | number;
  placeholder: string | number;
}

interface Dropdown {
  label: string;
  list: List[];
  onValueChange: (value: string | number) => void;
  selectedValue: string | number; // New prop
}

const Dropdown: React.FC<Dropdown> = ({
  label,
  list,
  onValueChange,
  selectedValue: propSelectedValue,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | number>(
    propSelectedValue,
  );
  const [placeholder, setPlaceholder] = useState<string | number>(
    list.find((item) => item.value === propSelectedValue)?.placeholder ??
      list[0].placeholder,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  const selectedOption = (
    val: string | number,
    placeholder: string | number,
  ) => {
    setSelectedValue(val);
    setPlaceholder(placeholder);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update state when prop changes
  useEffect(() => {
    setSelectedValue(propSelectedValue);
    setPlaceholder(
      list.find((item) => item.value === propSelectedValue)?.placeholder ??
        list[0].placeholder,
    );
  }, [propSelectedValue, list]);

  return (
    <div ref={dropdownRef} className="">
      <button
        className="group group-hover:cursor-pointer"
        onClick={() => setShow(!show)}
      >
        <h1 className="roboto-medium relative flex text-sm text-zinc-700 underline underline-offset-4 group-hover:text-zinc-950">
          <span>
            {label}
            <span className="capitalize">{placeholder}</span>
          </span>
          <div className="absolute -right-1 -top-1">
            <span
              className={`material-symbols-outlined absolute select-none text-lg transition-all duration-300 ${
                show ? "opacity-100" : "rotate-180 opacity-0"
              }`}
            >
              keyboard_arrow_down
            </span>
          </div>
        </h1>
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            className="absolute z-20 mt-8 rounded-md border-[1px] border-zinc-500 bg-white px-3 py-2"
            initial={{ opacity: 0, y: -5 }}
            exit={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="flex flex-col gap-2">
              {list.map((list, index) => (
                <li key={index} className="flex gap-2">
                  <button
                    className="flex items-center gap-2"
                    type="button"
                    onClick={() => {
                      selectedOption(list.value, list.placeholder);
                      onValueChange(list.value);
                      setShow(!show);
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {list.value === selectedValue
                        ? "radio_button_checked"
                        : "radio_button_unchecked"}
                    </span>
                    <span>{list.placeholder}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
