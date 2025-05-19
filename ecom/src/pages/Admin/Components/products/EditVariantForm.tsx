import React, { useRef, useState } from "react";
import { InputBox } from "./InputBox";
import AutoAddContent from "./AutoAddContent";

import {
  DndContext,
  SensorDescriptor,
  SensorOptions,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableImagePreview } from "./ImagePreviews";
interface Variant {
  variantName: string;
  variantColor: string;
  variantStocks: number | null;
  variantContent: string[];
  variantImgs: string[];
  selectedImgFiles?: File[];
  previewUrl: string[];
  variantPrice: number | null;
  _id?: string;
}

interface VariantFormProps {
  formIndex: number;
  variant: Variant;
  handleVariantChange: (
    formIndex: number,
    field: keyof Variant,
    value: number | string,
  ) => void;
  deleteItem: (
    formIndex: number,
    itemIndex: number,
    field: keyof Variant,
  ) => void;
  insertContent: (formIndex: number, value: string) => void;
  removeThis: (formIndex: number) => void;
  errMsg: { [key: string]: string };
  handleFileSelection: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  handleDeleteImage: (index: number, formIndex: number) => void;
  handleDeleteOldImage: (index: number, formIndex: number, url: string) => void;
  moveOldImage: (
    index: number,
    direction: "up" | "down",
    formIndex: number,
  ) => void;
  contentList: string[];
  handleDragEndOld: (event: import("@dnd-kit/core").DragEndEvent) => void;
  handleDragEndNew: (event: import("@dnd-kit/core").DragEndEvent) => void;
  sensors: SensorDescriptor<SensorOptions>[];
}

const VariantForm: React.FC<VariantFormProps> = ({
  formIndex,
  variant,
  handleVariantChange,
  insertContent,
  deleteItem,
  removeThis,
  handleFileSelection,
  handleDeleteImage,
  handleDeleteOldImage,
  errMsg,
  contentList,
  handleDragEndOld,
  handleDragEndNew,
  sensors,
}) => {
  const [content, setContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DataList: React.FC<{
    formIndex: number;
    array: string[];
    field: keyof Variant;
  }> = ({ formIndex, array, field }) => {
    return (
      <>
        <ul className="divide-y-2">
          {array.map((list, index) => (
            <li
              key={index}
              className="flex justify-between gap-2 px-2 py-0.5 hover:bg-zinc-200"
            >
              <span>{list}</span>
              <button
                className="flex items-center"
                type="button"
                onClick={() => deleteItem(formIndex, index, field)}
              >
                <span className="material-symbols-outlined select-none text-[16px] hover:text-red-700">
                  delete
                </span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const borderDif = formIndex % 2;

  return (
    <>
      <div
        className={`relative flex w-full flex-col flex-wrap gap-5 rounded-md p-2.5 sm:flex-row md:flex-nowrap ${borderDif === 1 && "border-zinc-400"}`}
      >
        <label htmlFor="" hidden>
          Variant # {formIndex + 1}
        </label>
        <div className="relative flex w-full flex-col gap-2 rounded p-4 shadow ring-2 ring-zinc-100 md:max-w-[400px]">
          <label className="roboto-medium text-sm tracking-wider">
            Variant Information
          </label>
          <div className="flex h-full w-full flex-col gap-2">
            <InputBox
              label="Variant Name"
              name={"variant-name"}
              req={true}
              placeholder={``}
              value={variant.variantName}
              onChange={(e) => {
                handleVariantChange(formIndex, "variantName", e.target.value);
              }}
              errMsg={errMsg.vname || ""}
            ></InputBox>
            <InputBox
              label="Variant Color"
              name={"variant-color"}
              req={false}
              placeholder={``}
              value={variant.variantColor}
              onChange={(e) => {
                handleVariantChange(formIndex, "variantColor", e.target.value);
              }}
              errMsg=""
            ></InputBox>
            <div className="flex gap-2">
              <InputBox
                label="Variant Stocks"
                name={"variant-stocks"}
                req={true}
                type="number"
                min={0}
                placeholder={``}
                value={variant.variantStocks ? variant.variantStocks : ""}
                onChange={(e) => {
                  handleVariantChange(
                    formIndex,
                    "variantStocks",
                    e.target.value,
                  );
                }}
                errMsg={errMsg.stocks || ""}
              ></InputBox>
              <InputBox
                label="Variant Price"
                name={"variant-price"}
                req={true}
                type="number"
                min={0}
                placeholder={``}
                value={variant.variantPrice ? variant.variantPrice : ""}
                onChange={(e) => {
                  handleVariantChange(
                    formIndex,
                    "variantPrice",
                    e.target.value,
                  );
                }}
                errMsg={errMsg.price || ""}
              ></InputBox>
            </div>
            <div className="">
              <div className="flex w-full flex-col gap-2">
                <InputBox
                  label="Variant Content (In the box)"
                  name={"variant-content"}
                  req={false}
                  placeholder={``}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                  }}
                  errMsg=""
                ></InputBox>
                <button
                  type="button"
                  className="roboto-medium rounded-md bg-zinc-200 p-2 text-xs uppercase tracking-wide ease-linear hover:text-zinc-500 focus:bg-zinc-300 focus:text-zinc-700"
                  onClick={() => {
                    insertContent(formIndex, content);
                    setContent("");
                  }}
                  onKeyDown={() => {
                    insertContent(formIndex, content);
                    setContent("");
                  }}
                >
                  Insert
                </button>
                {contentList.length > 0 && (
                  <AutoAddContent
                    array={contentList}
                    add={(array) => {
                      array.forEach((val) => {
                        insertContent(formIndex, val);
                        setContent("");
                      });
                    }}
                  ></AutoAddContent>
                )}
                <div className="h-28 overflow-auto rounded-md bg-zinc-100 p-2.5">
                  {variant.variantContent.length === 0 && (
                    <>
                      <span className="text-zinc-400">Ex. Charger</span>
                    </>
                  )}
                  <DataList
                    formIndex={formIndex}
                    array={variant.variantContent}
                    field={"variantContent"}
                  ></DataList>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative flex h-full w-full max-w-lg flex-col gap-4">
          <div className="relative flex w-full flex-col gap-2 rounded p-4 shadow ring-2 ring-zinc-100">
            <label className="roboto-medium text-sm tracking-wider">
              Variant Images <span className="text-red-500">* </span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              className="w-full select-none rounded-sm bg-zinc-100 px-3 py-2 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
              multiple
              onChange={(e) => {
                handleFileSelection(e, formIndex);
              }}
            ></input>

            <div
              className={`flex h-full min-h-40 flex-col flex-wrap justify-center gap-2 overflow-auto rounded-md bg-zinc-100 p-2.5 ${errMsg.images && "ring-2 ring-red-200"}`}
            >
              Images
              <div className="flex flex-wrap gap-2 border-b-2 pb-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEndOld}
                >
                  <SortableContext
                    items={variant.variantImgs.map(
                      (_, index) => `${formIndex}-${index}`,
                    )}
                    strategy={rectSortingStrategy}
                  >
                    <div className="flex h-full min-h-40 flex-wrap justify-evenly gap-2 bg-zinc-100 overflow-auto rounded-md p-2.5">
                      {variant.variantImgs.map((url, index) => (
                        <SortableImagePreview
                          key={`${formIndex}-${index}`}
                          id={`${formIndex}-${index}`}
                          url={url}
                          onDelete={() =>
                            handleDeleteOldImage(index, formIndex, url)
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              {variant.previewUrl.length > 0 && (
                <>
                  To be Added:
                  <div className="flex flex-wrap gap-2 border-b-2 pb-2">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEndNew}
                    >
                      <SortableContext
                        items={variant.previewUrl.map(
                          (_, index) => `${formIndex}-${index}`,
                        )}
                        strategy={rectSortingStrategy}
                      >
                        <div className="flex h-full min-h-40 flex-wrap justify-center gap-2 overflow-auto rounded-md p-2.5">
                          {variant.previewUrl.map((url, index) => (
                            <SortableImagePreview
                              key={`${formIndex}-${index}`}
                              id={`${formIndex}-${index}`}
                              url={url}
                              onDelete={() =>
                                handleDeleteImage(index, formIndex)
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </>
              )}
            </div>
            {errMsg.images && (
              <span className="text-[11px] font-normal text-red-600">
                {errMsg.images}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault;
              removeThis(formIndex);
            }}
            className="self-end rounded-sm ring-2 ring-red-700"
          >
            <span className="select-none px-2 text-xs font-medium uppercase text-red-700 hover:underline">
              remove variant
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default VariantForm;
