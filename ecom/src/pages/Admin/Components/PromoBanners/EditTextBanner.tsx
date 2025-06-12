import React, { useEffect, useState } from "react";
import axiosInstance from "../../Services/axiosInstance";
import { showToast } from "../showToast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTextBannerProps {
  id: string;
  text: string;
  editingText?: TextBannerProps | undefined;
  setEditingText?: () => void;
  onRemove?: () => void;
}

const SortableTextBanner = ({
  id,
  text,
  editingText,
  onRemove,
  setEditingText,
}: SortableTextBannerProps) => {
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
    backgroundColor: isDragging ? "#f0f0f0" : "transparent",
    border: isDragging ? "none" : "1px solid #e0e0e0",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex w-full gap-2 border-zinc-200 p-2"
      {...attributes}
    >
      <div {...listeners} className="flex w-full gap-2">
        <p className="overflow-hidden text-ellipsis text-nowrap text-xs">
          {text}
        </p>
      </div>
      <div className="flex items-start gap-2">
        <div>
          <button
            type="button"
            onClick={() => {
              if (setEditingText) setEditingText();
            }}
            hidden={editingText?.id === id}
            className="relative self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (setEditingText) setEditingText();
            }}
            hidden={editingText?.id !== id}
            className="relative self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          >
            save
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="right-2 top-2 z-30 rounded-full bg-red-500 px-[5px] py-0.5 text-xs text-white hover:bg-red-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

interface TextBannerProps {
  text: string;
  active: boolean;
  id: string;
}

const EditTextBanner: React.FC<{
  setQuickAdd: (req: boolean) => void;
  success: () => void;
}> = ({ setQuickAdd, success }) => {
  const [textBanners, setTextBanners] = useState<TextBannerProps[]>([]);
  const [editingText, setEditingText] = useState<TextBannerProps | undefined>();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const pointerSensor = useSensor(PointerSensor);
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(isTouchDevice ? touchSensor : pointerSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = textBanners.findIndex((list) => list.id === active.id);
      const newIndex = textBanners.findIndex((list) => list.id === over?.id);
      setTextBanners((list) => arrayMove(list, oldIndex, newIndex));
    }
    console.log("Drag Ended", textBanners);
  };

  const handleAdd = () => {
    const randomId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);
    const textB = {
      text: (document.getElementById("textBanner") as HTMLTextAreaElement)
        .value,
      active: false,
      id: randomId,
    };
    setTextBanners((prev) => [...prev, textB]);
    (document.getElementById("textBanner") as HTMLTextAreaElement).value = "";
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post("/add-text-banners", {
        textBanners,
      });
      if (response.status === 200) {
        showToast("Text Banners added successfully!", "success");
        success();
        setQuickAdd(false);
      } else {
        showToast("Failed to add Text Banners.", "error");
      }
    } catch (error) {
      console.error("Error adding text banners:", error);
      showToast("An error occurred while adding Text Banners.", "error");
    }
  };

  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-full select-none justify-center overflow-hidden rounded-xl bg-zinc-900/20 px-4 py-4 backdrop-blur-[2px] sm:items-center sm:px-10 sm:py-10">
      <div className="flex w-full max-w-2xl flex-col gap-2 rounded bg-white pb-4">
        <form className="relative flex w-full max-w-2xl flex-col gap-4 rounded-xl p-4">
          <p className="font-medium tracking-wide">Edit Text Banner</p>
          <textarea
            name="textBanner"
            id="textBanner"
            className="h-40 max-h-40 w-full rounded border border-zinc-300 p-2 text-sm leading-4"
          ></textarea>
          {/*   <button
            type="button"
            className="relative self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
            onClick={handleAdd}
          >
            Add
          </button> */}
        </form>
        <div className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={({ active }) => setActiveId(String(active.id))}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext
              items={textBanners.map((list) => list.id)}
              strategy={rectSortingStrategy}
            >
              <div className="relative grid h-full min-h-56 grid-cols-1 gap-2 overflow-y-auto overflow-x-hidden rounded border border-zinc-300 p-2">
                {textBanners.length === 0 && (
                  <p className="absolute w-full select-none self-center text-center text-sm text-zinc-500">
                    No Banners Added
                  </p>
                )}
                {textBanners.map((list) => (
                  <SortableTextBanner
                    key={list.id}
                    id={list.id}
                    text={list.text}
                    editingText={editingText ? editingText : undefined}
                    setEditingText={() => setEditingText(list)}
                    onRemove={() => {
                      setTextBanners((banners) =>
                        banners.filter((i) => i.id !== list.id),
                      );
                    }}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <SortableTextBanner
                  id={activeId}
                  text={textBanners.find((b) => b.id === activeId)?.text || ""}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        <button
          type="button"
          className="relative flex self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
          onClick={(e) => {
            e.preventDefault();
            console.log("Submitting Text Banners:", textBanners);
          }}
        >
          Submit
        </button>
      </div>

      <span
        className="material-symbols-outlined absolute right-2 top-2 z-30 h-8 w-8 select-none self-end rounded-full bg-zinc-100 text-center text-xl leading-8 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:bg-zinc-200 hover:text-zinc-500"
        onClick={() => setQuickAdd(false)}
      >
        close
      </span>
    </div>
  );
};

export default EditTextBanner;
