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

export const ObjectList: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectList: { [key: string]: any };

  deleteList: (index: number) => void;
}> = ({ objectList, deleteList }) => {
  return (
    <ul className="divide-y-2 overflow-auto">
      {Object.entries(objectList).map(([key, value], index) => (
        <li
          key={key}
          className="flex justify-start gap-1 text-nowrap px-2 py-0.5 hover:bg-zinc-200"
        >
          <button
            className="flex items-center"
            type="button"
            onClick={() => deleteList(index)}
          >
            <span className="material-symbols-outlined select-none text-[16px] hover:text-red-700">
              delete
            </span>
          </button>
          <span>|</span>
          <span className="font-medium">{key}:</span>
          <span>{formatValue(value)}</span>{" "}
        </li>
      ))}
    </ul>
  );
};
