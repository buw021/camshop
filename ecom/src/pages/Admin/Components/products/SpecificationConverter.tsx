import { useState } from "react";

const SpecificationConverter: React.FC<{
  insert: (object: object) => void;
}> = ({ insert }) => {
  const [text, setText] = useState("");

  const convertToJSON = () => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    const json: Record<string, string> = {};

    lines.forEach((line) => {
      const parts = line.split(": ");
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        json[key] = value;
      }
    });

    return JSON.stringify(json, null, 4);
  };

  const handleInsert = async () => {
    try {
      const convertedJson = await convertToJSON();
      insert(JSON.parse(convertedJson));
      setText("");
    } catch (error) {
      console.error("Error converting specifications:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex. Title: Value (press Enter for new line)"
        className="h-24 w-full overflow-auto rounded-md border border-gray-300 p-2"
      />
      <br />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          handleInsert();
        }}
        className="-mt-2 roboto-medium rounded-md bg-zinc-200 p-2 text-xs uppercase tracking-wide ease-linear hover:text-zinc-500 focus:bg-zinc-300 focus:text-zinc-700"
      >
        Insert
      </button>
    </div>
  );
};

export default SpecificationConverter;
