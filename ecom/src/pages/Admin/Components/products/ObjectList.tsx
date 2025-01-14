const formatValue = (value: unknown) => {
  if (typeof value === "object" && value !== null) {
    return (
      <>
        {Object.entries(value).map(([nestedKey, nestedValue], index) => (
          <span key={index}>
            <strong className="capitalize">{nestedKey}</strong>:{" "}
            {formatValue(nestedValue)}
          </span>
        ))}
      </>
    );
  }
  return String(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ObjectList: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectList: any;

  deleteList: (index: number) => void;
}> = ({ objectList, deleteList }) => {
  return (
    <ul className="divide-y-2">
      {Object.entries(objectList).map(([key, value], index) => (
        <li
          key={key}
          className="flex justify-between gap-2 px-2 py-0.5 hover:bg-zinc-200"
        >
          <span>{formatValue(value)}</span>{" "}
          <button
            className="flex items-center"
            type="button"
            onClick={() => deleteList(index)}
          >
            <span className="material-symbols-outlined select-none text-[16px] hover:text-red-700">
              delete
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
