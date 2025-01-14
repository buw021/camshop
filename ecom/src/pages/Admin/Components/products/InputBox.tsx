interface LabeledInput extends React.ComponentProps<"input"> {
  label: string;
  name: string;
  placeholder: string;
  req: boolean;
  errMsg: string;
}

export const InputBox: React.FC<LabeledInput> = ({
  label,
  name,
  req,
  errMsg,
  ...rest
}) => {
  return (
    <div className="flex w-full flex-col gap-1 text-zinc-700">
      <label
        htmlFor={name}
        className="capitalized roboto-medium leading-3 tracking-wide"
      >
        {label} {req && <span className="font-normal text-red-600">*</span>}
      </label>
      <input
        id={name}
        className={`w-full rounded-md bg-zinc-100 p-2.5 text-sm text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 ${errMsg && "ring-2 ring-red-200"}`}
        required={req}
        {...rest}
      />
      {errMsg && (
        <span className="text-[11px] font-normal text-red-600"> {errMsg}</span>
      )}
    </div>
  );
};
