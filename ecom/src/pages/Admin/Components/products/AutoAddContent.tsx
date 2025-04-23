import React, { useState } from "react";

const AutoAddContent: React.FC<{
  array: string[];
  add: (array: string[]) => void;
}> = ({ array, add }) => {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <>
      <div className="h-28 overflow-auto rounded-md border-[1px] p-1">
        <ul className="divide-y-2">
          {array.map((list, index) => (
            <li
              key={index}
              className="flex select-none justify-between gap-2 px-2 py-0.5 hover:bg-zinc-200"
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(list)
                    ? prev.filter((item) => item !== list)
                    : [...prev, list],
                )
              }
            >
              <span>{list}</span>
              <input
                type="checkbox"
                checked={selected.includes(list)}
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(list)
                      ? prev.filter((item) => item !== list)
                      : [...prev, list],
                  )
                }
                onChange={() =>
                  setSelected((prev) =>
                    prev.includes(list)
                      ? prev.filter((item) => item !== list)
                      : [...prev, list],
                  )
                }
              />
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => {
          add(selected);
        }}
        className="roboto-medium rounded-md bg-zinc-200 p-2 text-xs uppercase tracking-wide ease-linear hover:text-zinc-500 focus:bg-zinc-300 focus:text-zinc-700"
      >
        Add
      </button>
    </>
  );
};

export default AutoAddContent;
