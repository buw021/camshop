import React from "react";

interface RoundedButtonProps {
  buttonType?: "primary" | "secondary";
  children: React.ReactNode;
  onClick: () => void;
}

export const RoundedButton: React.FC<RoundedButtonProps> = ({
  buttonType,
  children,
  onClick,
}) => {
  return (
    <>
      <button
        className={`w-full max-w-[400px] rounded-full py-2 text-lg font-medium transition-all duration-200 ${buttonType === "secondary" ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300" : "bg-zinc-900 text-white hover:bg-zinc-700"}`}
        onClick={onClick}
      >
        {children}
      </button>
    </>
  );
};

export const PageButtons: React.FC<{
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  totalPages: number;
}> = ({ setCurrentPage, currentPage, totalPages }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
      >
        Previous
      </button>
      <span className="text-xs font-bold uppercase leading-3 tracking-wide text-zinc-500">
        Page {totalPages > 0 ? currentPage : 0} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0}
        className="rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:bg-zinc-300"
      >
        Next
      </button>
    </div>
  );
};
