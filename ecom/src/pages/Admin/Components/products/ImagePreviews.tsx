import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

export const SortableImagePreview = ({
  id,
  url,
  onDelete,
}: {
  id: string;
  url: string;
  onDelete: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="relative flex h-32 w-32 items-center rounded bg-white p-1 shadow-sm outline-none"
    >
      <div
        {...listeners}
        className="flex h-full w-full items-center outline-none"
      >
        <img src={url} alt="preview" className="h-auto w-full outline-none" />
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-0 top-0 rounded-full bg-zinc-600/70 px-1 text-white outline-none"
      >
        &times;
      </button>
    </div>
  );
};
