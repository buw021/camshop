import React from "react";

interface ButtonProps {
  buttonType?: "primary" | "secondary";
  children: React.ReactNode;
  onClick: () => void;
}

export const RoundedButton: React.FC<ButtonProps> = ({
  buttonType,
  children,
  onClick,
}) => {
  return (
    <>
      <button
        className={`w-full rounded-full py-2 text-lg font-medium transition-all duration-200 md:max-w-[300px] ${buttonType === "secondary" ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300" : "bg-zinc-900 text-white hover:bg-zinc-700"}`}
        onClick={onClick}
      >
        {children}
      </button>
    </>
  );
};
