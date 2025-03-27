export const RoundedMdButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <>
      <button
        className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-[7px] pl-3 pr-3 text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:border-[1px] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-300"
        onClick={onClick}
      >
        {children}
      </button>
    </>
  );
};
