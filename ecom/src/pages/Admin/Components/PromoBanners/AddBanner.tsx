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
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

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
    <div ref={setNodeRef} style={style} className="relative" {...attributes}>
      <div {...listeners}>
        <img
          src={url}
          alt="preview"
          className="h-32 w-full rounded-md bg-zinc-200 object-scale-down"
        />
      </div>

      <p className="overflow-hidden text-ellipsis text-nowrap text-xs">
        {name}
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Prevent DnD from stealing the click
          e.preventDefault();
          onRemove();
        }}
        className="absolute right-2 top-2 z-30 rounded-full bg-red-500 px-[5px] py-0.5 text-xs text-white hover:bg-red-600"
      >
        ✕
      </button>
    </div>
  );
};

type BannerImage = {
  id: string;
  file: File;
  url: string;
};

const AddBanner: React.FC<{
  setQuickAdd: (req: boolean) => void;
  uploadSuccess: () => void;
}> = ({ setQuickAdd, uploadSuccess }) => {
  const [images, setImages] = useState<BannerImage[]>([]);
  const [displayProgress, setDisplayProgress] = useState(0);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selected = Array.from(event.target.files).slice(0, 10);
      const withPreview = selected.map((file, index) => ({
        id: `${file.name}-${index}`,
        file,
        url: URL.createObjectURL(file),
      }));
      setImages(withPreview);
    }
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append("files", img.file));

      const response = await axiosInstance.post(
        "/upload-img-banners",
        formData,
        {
          onUploadProgress: (e) => {
            const percent = Math.round((e.loaded * 100) / (e.total || 1));
            animateProgress(percent);
          },
        },
      );

      const { success, saved, failed } = response.data;

      animateProgress(100);

      if (success) {
        setTimeout(() => {
          setDisplayProgress(0);
          setQuickAdd(false);
          showToast("Images uploaded successfully!", "success");
          uploadSuccess();
        }, 1000);
        return saved;
      } else {
        // Partial or full failure
        setDisplayProgress(0);

        if (saved?.length > 0 && failed?.length > 0) {
          showToast(
            `Some images uploaded (${saved.length}), but ${failed.length} failed.`,
            "warning",
          );
        } else if (failed?.length > 0) {
          showToast("All image uploads failed.", "error");
        } else {
          showToast("An unknown error occurred during the upload.", "error");
        }

        return false;
      }
    } catch (error) {
      console.error("File upload error:", error);
      setDisplayProgress(0);

      showToast(`Unable to upload the images.: ${error}`, "error");

      return false;
    }
  };

  const animateProgress = (target: number) => {
    const step = 1;
    const interval = 20;
    const intervalId = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= target) {
          clearInterval(intervalId);
          return target;
        }
        return prev + step;
      });
    }, interval);
  };

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
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over?.id);
      setImages((imgs) => arrayMove(imgs, oldIndex, newIndex));
    }
  };

  return (
    <div className="absolute left-0 top-0 z-20 flex h-full w-full select-none justify-center overflow-hidden rounded-xl bg-zinc-900/20 px-4 py-4 backdrop-blur-[2px] sm:items-center sm:px-10 sm:py-10">
      <form className="relative flex w-full max-w-2xl flex-col gap-4 rounded-xl bg-zinc-50 p-4">
        {displayProgress > 0 && (
          <div className="absolute left-0 top-0 z-40 flex h-full w-full flex-col items-center justify-center bg-zinc-500/30 backdrop-blur-sm">
            <p className="tracking wide w-full text-center text-sm font-medium leading-3 text-gray-700">
              Uploading Images
            </p>
            <div className="relative mt-2 flex h-5 w-40 overflow-hidden rounded-full border-[1px] border-zinc-400 bg-zinc-200">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${displayProgress}%` }}
              ></div>
              <p className="tracking wide absolute w-full text-center text-sm font-medium text-gray-700">
                {displayProgress}%
              </p>
            </div>
          </div>
        )}

        <input
          type="file"
          className="mr-1 w-full select-none rounded-md bg-zinc-100 p-2.5 text-sm text-zinc-700 outline-none hover:cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-400"
          multiple
          accept="image/*"
          onChange={handleFileSelection}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((img) => img.id)}
            strategy={rectSortingStrategy}
          >
            <div className="relative grid h-80 grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden sm:grid-cols-4">
              {images.length === 0 && (
                <p className="absolute w-full select-none self-center text-center text-sm text-zinc-500">
                  No images selected
                </p>
              )}
              {images.map((img) => (
                <SortableImage
                  key={img.id}
                  id={img.id}
                  url={img.url}
                  name={img.file.name}
                  onRemove={() =>
                    setImages((imgs) => imgs.filter((i) => i.id !== img.id))
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button
          type="submit"
          className="rounded-md border border-zinc-200 bg-zinc-100 p-2 font-medium text-zinc-900 hover:border-zinc-300 hover:bg-zinc-200"
          onClick={(e) => {
            e.preventDefault();
            handleFileUpload();
          }}
        >
          Submit
        </button>
      </form>

      <span
        className="material-symbols-outlined absolute right-2 top-2 z-30 h-8 w-8 select-none self-end rounded-full bg-zinc-100 text-center text-xl leading-8 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:bg-zinc-200 hover:text-zinc-500"
        onClick={() => setQuickAdd(false)}
      >
        close
      </span>
    </div>
  );
};

export default AddBanner;
