import React, { useCallback, useEffect, useRef, useState } from "react";
import AddBanner from "./AddBanner";
import axiosInstance from "../../Services/axiosInstance";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { showToast } from "../showToast";

interface SortableImageProps {
  id: string;
  url: string;
  name: string;
  onRemove: () => void;
}

const SortableImage = ({ id, url, name, onRemove }: SortableImageProps) => {
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
      style={style}
      className="relative w-full"
      {...attributes}
    >
      <div {...listeners}>
        <img
          src={url}
          alt="preview"
          className="h-32 w-full rounded-md bg-zinc-200 object-scale-down p-2 xl:h-44"
        />
      </div>

      <p className="hidden overflow-hidden text-ellipsis text-nowrap text-xs">
        {name}
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Prevent DnD from stealing the click
          e.preventDefault();
          onRemove();
        }}
        className="absolute right-2 top-2 z-10 rounded-full bg-red-500 px-[5px] py-0.5 text-xs text-white hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  );
};

type Props = {
  id: string;
  images: {
    _id: string;
    filepath: string;
  }[];
};

const SortableImagePreview: React.FC<Props> = ({ id, images }) => {
  const image = images.find((img) => img._id === id);

  if (!image) return null;

  return (
    <div
      className=""
      style={{
        pointerEvents: "none",
        backgroundColor: "white",
        opacity: 0.5,
      }}
    >
      <img
        src={image.filepath}
        alt={id}
        className="h-32 w-full rounded-md bg-zinc-200 object-scale-down p-2 lg:h-44"
      />
    </div>
  );
};

interface Image {
  filepath: string;
  active: boolean;
  _id: string;
}

const ManageBanners: React.FC<{ close: () => void }> = ({ close }) => {
  const [quickAdd, setQuickAdd] = useState(false);
  const [origImgOrder, setOrigImgOrder] = useState<Image[]>();
  const [images, setImages] = useState<Image[]>();
  const [activeId, setActiveId] = useState<string | null>(null);
  const draggingZone = useRef<HTMLDivElement | null>(null);
  const [outside, setOutside] = useState(false);
  const [tbDeleted, setTbDeleted] = useState<Image[]>();
  const fetchBanners = useCallback(async () => {
    try {
      const reponse = await axiosInstance.get("/get-banners");
      if (reponse.status === 200) {
        setOrigImgOrder(reponse.data);
        setImages(reponse.data);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  }, []);

  const refetchImages = () => {
    fetchBanners();
  };

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

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
    if (!images) return;
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img._id === active.id);
      const newIndex = images.findIndex((img) => img._id === over?.id);
      setImages((imgs) => (imgs ? arrayMove(imgs, oldIndex, newIndex) : imgs));
    }
    setActiveId(null);
  };

  useEffect(() => {
    if (!activeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = draggingZone.current?.getBoundingClientRect();
      if (!bounds) return;

      const isOutside =
        e.clientX < bounds.left ||
        e.clientX > bounds.right ||
        e.clientY < bounds.top ||
        e.clientY > bounds.bottom;

      setOutside(isOutside);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) {
      document.body.classList.remove("cursor-grabbing", "cursor-not-allowed");
      return;
    }

    if (outside) {
      document.body.classList.add("cursor-not-allowed");
      document.body.classList.remove("cursor-grabbing");
    } else {
      document.body.classList.add("cursor-grabbing");
      document.body.classList.remove("cursor-not-allowed");
    }

    return () => {
      document.body.classList.remove("cursor-grabbing", "cursor-not-allowed");
    };
  }, [activeId, outside]);

  const saveChanges = async () => {
    if (!confirm("Are you sure you want to save changes?")) {
      return;
    }
    try {
      const response = await axiosInstance.post("/update-banners", {
        images,
        tbDeleted,
      });
      if (response.status === 200) {
        showToast("Images uploaded successfully!", "success");
        refetchImages();
      }
    } catch (error) {
      console.error("Error updating banners:", error);
    }
  };

  return (
    <div className="absolute left-0 top-0 z-10 flex h-full w-full justify-center overflow-hidden rounded-xl bg-zinc-900/20 px-4 py-4 backdrop-blur-[2px] sm:items-center sm:px-10 sm:py-10">
      {quickAdd && (
        <AddBanner
          setQuickAdd={setQuickAdd}
          uploadSuccess={refetchImages}
        ></AddBanner>
      )}
      <div className="relative flex h-full w-full flex-col items-center gap-4 overflow-hidden rounded-md bg-white p-2.5 px-10">
        <p className="self-start text-lg font-medium tracking-wide">
          Manage Banners | Arrange Banners
        </p>

        <div className="flex flex-wrap gap-2 self-end">
          <button
            title="Add New Image"
            className="relative self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700"
            onClick={() => setQuickAdd(!quickAdd)}
          >
            Add New Image
          </button>
          <button
            title="Save Changes"
            className="relative self-center rounded-md bg-zinc-800 px-3 py-[7px] text-xs font-medium uppercase leading-3 tracking-wide text-white drop-shadow-sm transition-all duration-100 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
            onClick={saveChanges}
            disabled={
              !images ||
              !origImgOrder ||
              JSON.stringify(origImgOrder.map((img) => img._id)) ===
                JSON.stringify(images.map((img) => img._id))
            }
          >
            Save Changes
          </button>
        </div>
        {images && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragStart={({ active }) => setActiveId(String(active.id))}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext
              items={images.map((img) => img._id)}
              strategy={rectSortingStrategy}
            >
              <div
                ref={draggingZone}
                className="relative grid h-full w-full grid-cols-2 gap-2 overflow-x-hidden rounded-md border-2 border-zinc-200 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4"
                style={{ overscrollBehavior: "contain" }}
              >
                {images.map((img) => (
                  <SortableImage
                    key={img._id}
                    id={img._id}
                    url={img.filepath}
                    name={img._id}
                    onRemove={() => {
                      setTbDeleted((prev) => [...(prev ?? []), img]);
                      setImages((imgs) =>
                        imgs ? imgs.filter((i) => i._id !== img._id) : imgs,
                      );
                    }}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <SortableImagePreview id={activeId} images={images} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <span
          className={`material-symbols-outlined absolute right-2 top-2 z-10 h-8 w-8 select-none self-end rounded-full bg-zinc-100 text-center text-xl leading-8 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:bg-zinc-200 hover:text-zinc-900`}
          onClick={() => close()}
        >
          close
        </span>
      </div>
    </div>
  );
};

export default ManageBanners;
