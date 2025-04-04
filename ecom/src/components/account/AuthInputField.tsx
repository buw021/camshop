import React, { useState } from "react";
import { motion, easeIn } from "framer-motion";

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addError: boolean;
  disabled?: boolean;
}

const variants = {
  initial: { x: 0 },
  focus: {
    x: 0,
    top: 5,

    fontSize: "12px",
    transition: {
      easeIn,
      duration: 0.125,
    },
  },
};

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  addError,
  disabled,
}) => {
  const [isFocused, setFocus] = useState(false);
  return (
    <motion.div
      className={`relative flex w-full items-center gap-1 rounded-lg bg-gray-100 px-1 hover:cursor-text ${
        addError
          ? "ring-2 ring-red-500"
          : isFocused
            ? "ring-2 ring-blue-500"
            : "ring-2 ring-gray-300"
      } ring-inset`}
    >
      <motion.label
        htmlFor={id}
        className={`roboto-regular absolute left-3 text-sm leading-4 hover:cursor-text ${
          isFocused ? "text-blue-500" : "text-gray-500"
        } ${addError && "text-red-500"} bg-none`}
        variants={variants}
        initial="initial"
        animate={value || isFocused ? "focus" : "initial"}
      >
        {label}
      </motion.label>
      <input
        type={type}
        name={id}
        id={id}
        className="text-md roboto-regular mx-2 mb-1 mr-8 mt-6 w-full bg-transparent bg-none text-gray-900 outline-none"
        required
        autoComplete="off"
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(true)} // Set focus state to true when input is focused
        onBlur={() => setFocus(false)} // Set focus state to false when input loses focus
        disabled={disabled}
      />
    </motion.div>
  );
};

export default InputField;
