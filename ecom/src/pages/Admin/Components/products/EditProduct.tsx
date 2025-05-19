import React, { useEffect, useRef, useState } from "react";
import { ObjectList } from "./ObjectList";
import axiosInstance from "../../Services/axiosInstance";
import PreviewForm from "./EditProductPreview";
import { Product, Variant } from "../interface/interfaces";
import { subCats } from "./categories";
import { InputBox } from "./InputBox";
import { useProduct } from "../../hooks/editProduct";
import { showToast } from "../showToast";
import VariantForm from "./EditVariantForm";
import SpecificationConverter from "./SpecificationConverter";
import AutoAddContent from "./AutoAddContent";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { SortableImagePreview } from "./ImagePreviews";
const renderOptions = (category: string): React.ReactNode => {
  const options = subCats[category] || [];
  return options.map((val, index) => (
    <option key={index} value={val} className="capitalize">
      {val}
    </option>
  ));
};

const DataList: React.FC<{
  formIndex: number;
  array: string[];
  field: keyof Variant;
  deleteItem: (formIndex: number, index: number, field: keyof Variant) => void;
}> = ({ formIndex, array, field, deleteItem }) => {
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

const EditProduct: React.FC<{
  handleCancel: () => void;
  setIsDirty: (dirty: boolean) => void;
  getData: Product;
  onProductUpdated: () => void;
}> = ({ handleCancel, setIsDirty, getData, onProductUpdated }) => {
  const {
    product,
    setProduct,
    addValue,
    handleFileSelection,
    handleVariantChange,
    hasChanges,
    moveOldImage,
    handleDragEndNew,
    handleDragEndOld,
  } = useProduct(getData);

  const [activeMenu, setActiveMenu] = useState<"product" | "variant">(
    "product",
  );
  const [specTitle, setSpecTitle] = useState<string>("");
  const [specVal, setSpecVal] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [tagCheck, setTagCheck] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    product.category,
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    product.subCategory,
  );
  const [customCategory, setCustomCategory] = useState<string>("");
  const customCategoryRef = useRef<HTMLInputElement>(null);
  const customCatElement = document.getElementById("custom-category");
  const [customSubCategory, setCustomSubCategory] = useState<string>("");
  const customSubCategoryRef = useRef<HTMLInputElement>(null);
  const customSubCatElement = document.getElementById("custom-subcategory");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showingVariant, setShowingVariant] = useState<number>(1);
  const [preview, setPreview] = useState<boolean>(false);
  const [contentList, setContentList] = useState<string[]>([]);
  const [content, setContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayProgress, setDisplayProgress] = useState(0); // Gradual progress display
  const [imageToDelete, setImageToDelete] = useState<string[]>([]);

  const handleFileUpload = async () => {
    try {
      const hasFilesToUpload = product.variants.some(
        (variant) => variant.selectedImgFiles.length > 0,
      );
      if (!hasFilesToUpload) {
        console.log("No files to upload");
        return [];
      }
      const formData = new FormData();

      product.variants.forEach((variant, idx) => {
        (variant.selectedImgFiles as File[]).forEach((file) => {
          formData.append(`variant${idx}`, file);
        });
      });

      // Upload files
      const response = await axiosInstance.post("/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            progressEvent.total
              ? (progressEvent.loaded * 100) / progressEvent.total
              : 0,
          );

          animateProgress(percentCompleted);
        },
      });
      const data = response.data;

      if (data.success) {
        animateProgress(100);
        const filePaths: string[] = data.filePaths;
        return filePaths;
      } else {
        showToast("An error occurred during the upload.", "error");
        setDisplayProgress(0);
        return false;
      }
    } catch (error) {
      console.error("File upload error:", error);
      setDisplayProgress(0);
      showToast("An error occurred: Unable to upload the images.", "error");
      return false;
    }
  };

  const animateProgress = (target: number) => {
    const step = 1; // Increment by 1% per step
    const interval = 20; // Interval in milliseconds (adjust for smoothness)
    const intervalId = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= target) {
          clearInterval(intervalId); // Stop when target is reached
          return target;
        }
        return prev + step; // Increment the display progress
      });
    }, interval);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deleteUploadedFiles = async (filePaths: string[]) => {
    try {
      const response = await axiosInstance.post("/delete-uploaded-files", {
        filePaths,
      });
      if (response.data.success) {
        return true;
      }
      console.log("Uploaded files deleted successfully");
    } catch (error) {
      console.error("Error deleting uploaded files:", error);
    }
  };

  const handleDeleteImage = (index: number, formIndex: number) => {
    setProduct((prevProduct) => {
      const updatedVariants = prevProduct.variants.map((variant, idx) => {
        if (formIndex === idx) {
          return {
            ...variant,
            // Filter out the image at the specified index from selectedImgFiles
            selectedImgFiles: (variant.selectedImgFiles as File[]).filter(
              (_, iIdx) => iIdx !== index,
            ),
            // Filter out the corresponding preview URL for the image being deleted
            previewUrl: variant.previewUrl.filter((_, iIdx) => iIdx !== index),
          };
        }
        return variant;
      });
      return {
        ...prevProduct,
        variants: updatedVariants,
      };
    });
  };

  const handleDeleteOldImage = (
    index: number,
    formIndex: number,
    url: string,
  ) => {
    setImageToDelete((prev) => [...prev, url]);

    setProduct((prevProduct) => {
      const updatedVariants = prevProduct.variants.map((variant, idx) => {
        if (formIndex === idx) {
          return {
            ...variant,
            // Filter out the image at the specified index from selectedImgFiles
            variantImgs: (variant.variantImgs as string[]).filter(
              (_, iIdx) => iIdx !== index,
            ),
            // Filter out the corresponding preview URL for the image being delete
          };
        }
        return variant;
      });
      return {
        ...prevProduct,
        variants: updatedVariants,
      };
    });
  };

  useEffect(() => {
    if (product) {
      setIsDirty(hasChanges());
    }
  }, [product, setIsDirty, hasChanges]);

  const handleSelectCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCustomCategory("");
    setSelectedSubCategory("");
    setCustomSubCategory("");
    setProduct({ ...product, subCategory: "" });
    setProduct({ ...product, category: e.target.value });
    const value = e.target.value;
    setSelectedCategory(value);
  };

  const handleSelectSubCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCustomSubCategory("");
    setSelectedSubCategory(value);
    setProduct({ ...product, subCategory: e.target.value });
  };

  const handleCustomCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value);
    setProduct({ ...product, category: e.target.value });
  };

  const handleCustomSubCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSubCategory(e.target.value);
    setProduct({ ...product, subCategory: e.target.value });
  };

  const handleShowVariant = (index: number) => {
    setShowingVariant(index);
  };

  const insertSpecs = () => {
    if (specTitle && specVal) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        specifications: {
          ...prevProduct.specifications,
          [specTitle]: specVal,
        },
      }));
      setSpecTitle("");
      setSpecVal("");
    }
  };

  const insertTag = (val: string) => {
    if (product.tags.includes(val.toLowerCase())) {
      setTagCheck(true);
    } else if (val && !product.tags.includes(val.toLowerCase())) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        tags: [...prevProduct.tags, val.toLowerCase()],
      }));
      setTag("");
      setTagCheck(false);
    }
  };

  const deleteTag = (index: number) => {
    setProduct((prevProduct) => {
      const updatedTag = prevProduct.tags.filter((_, idx) => idx !== index);
      return {
        ...prevProduct,
        tags: updatedTag,
      };
    });
  };

  const insertContent = (variantIndex: number, value: string) => {
    if (value) {
      if (product.variants[variantIndex].variantContent.includes(value)) {
        return;
      }
      setProduct((prevProduct) => {
        const updatedVariants = prevProduct.variants.map((variant, idx) => {
          if (variantIndex === idx) {
            return {
              ...variant,
              variantContent: [...variant.variantContent, value],
            };
          }
          return variant;
        });

        return {
          ...prevProduct,
          variants: updatedVariants,
        };
      });
    }
  };

  const deleteItem = (
    formIndex: number,
    itemIndex: number,
    field: keyof Variant,
  ) => {
    setProduct((prevProduct) => {
      const updatedVariants = prevProduct.variants.map((variant, idx) => {
        if (formIndex === idx) {
          return {
            ...variant,
            [field]: (variant[field] as string[]).filter(
              (_, iIdx) => iIdx !== itemIndex,
            ),
          };
        }
        return variant;
      });
      return {
        ...prevProduct,
        variants: updatedVariants,
      };
    });
  };

  const deleteList = (itemIndex: number) => {
    setProduct((prevProduct) => {
      const updatedSpecifications = Object.fromEntries(
        Object.entries(prevProduct.specifications).filter(
          (_, iIdx) => iIdx !== itemIndex,
        ),
      );

      return {
        ...prevProduct,
        specifications: updatedSpecifications,
      };
    });
  };

  const addVariant = () => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      variants: [
        ...prevProduct.variants,
        {
          variantName: "",
          variantColor: "",
          variantStocks: 0,
          variantContent: [],
          variantImgs: [],
          selectedImgFiles: [],
          previewUrl: [],
          variantPrice: 0,
        },
      ],
    }));
    setShowingVariant(product.variants.length + 1);
    setActiveMenu("variant");
  };

  const removeVariant = (formIndex: number) => {
    const variant = product.variants[formIndex];
    const isVariantEmpty =
      !variant.variantName &&
      !variant.variantColor &&
      variant.variantStocks === 0 &&
      variant.variantContent.length === 0 &&
      variant.variantImgs.length === 0 &&
      variant.selectedImgFiles.length === 0 &&
      variant.previewUrl.length === 0 &&
      variant.variantPrice === 0;
    if (!isVariantEmpty) {
      const confirmDelete = window.confirm(
        "There are unsaved changes in this variant. Do you really want to delete it?",
      );
      if (!confirmDelete) return;
    }
    if (product.variants.length > 1) {
      setProduct((prevProduct) => {
        const updatedVariants = prevProduct.variants.filter(
          (_, iIdx) => iIdx !== formIndex,
        );
        return {
          ...prevProduct,
          variants: updatedVariants,
        };
      });
    }
  };

  const conditionSubCategory =
    (selectedCategory === "camera" || selectedCategory === "lens") &&
    selectedSubCategory === "other"
      ? false
      : !(selectedCategory === "accessories" || selectedCategory === "other");

  //Check and error handling

  const checkBeforeSubmit = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (product.name === "") {
      newErrors.name = "Product name cannot be empty";
    }

    if (product.brand === "") {
      newErrors.brand = "Product brand cannot be empty";
    }

    if (product.description === "") {
      newErrors.description = "Product description cannot be empty";
    }

    if (product.category === "") {
      newErrors.category = "Product category cannot be empty";
    }

    if (product.subCategory === "") {
      newErrors.subCategory = "Product subcategory cannot be empty";
    }

    if (customCatElement && customCategory === "") {
      newErrors.customCategory = "Product category cannot be empty";
    }

    if (customSubCatElement && customSubCategory === "") {
      newErrors.customSubCategory = "Product subcategory cannot be empty";
    }

    product.variants.forEach((variant, index) => {
      if (index > 0 && variant.variantName === "") {
        newErrors[`vname${index}`] = "Variant name cannot be empty";
      }

      if (
        variant.variantPrice === 0 ||
        variant.variantPrice === null ||
        variant.variantPrice === undefined
      ) {
        newErrors[`price${index}`] = "Price cannot be 0 or empty";
      }

      if (
        variant.variantStocks === 0 ||
        variant.variantStocks === null ||
        variant.variantStocks === undefined
      ) {
        newErrors[`stocks${index}`] = "Stocks cannot be 0 or empty";
      }

      if (
        variant.variantImgs.length === 0 &&
        variant.selectedImgFiles.length === 0
      ) {
        newErrors[`images${index}`] = "Please insert at least one image";
      }
    });

    // Directly set the new errors
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  const getVariantErrors = (index: number): { [key: string]: string } => {
    const variantErrors: { [key: string]: string } = {};
    if (errors[`vname${index}`]) variantErrors.vname = errors[`vname${index}`];
    if (errors[`price${index}`]) variantErrors.price = errors[`price${index}`];
    if (errors[`stocks${index}`])
      variantErrors.stocks = errors[`stocks${index}`];
    if (errors[`images${index}`])
      variantErrors.images = errors[`images${index}`];

    return variantErrors;
  };

  useEffect(() => {
    if (selectedCategory === "other" && customCategoryRef.current) {
      customCategoryRef.current.focus();
    }

    if (selectedSubCategory === "other" && customSubCategoryRef.current) {
      customSubCategoryRef.current.focus();
    }
  }, [selectedCategory, selectedSubCategory]);

  useEffect(() => {
    if (product.variants.length < showingVariant + 1) {
      if (product.variants.length === 1) {
        handleShowVariant(1);
      } else {
        handleShowVariant(showingVariant - 1);
      }
    }
  }, [product.variants.length, showingVariant]);

  const togglePreview = () => {
    setPreview(!preview);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasErrors = checkBeforeSubmit();
    if (!hasErrors) {
      togglePreview();
    } else {
      console.log("Errors found:", errors);
    }
  };

  const updateProduct = async (
    fileImgs: string[] = [],
    oldImagetodelete: string[] = [],
  ) => {
    try {
      const response = await axiosInstance.post("/update-product", {
        product,
        fileImgs,
        oldImagetodelete,
      });
      if (response.data.success) {
        showToast("Product Successfully Updated", "success");
        setIsDirty(false);
        onProductUpdated();
        handleCancel();
        return true;
      } else {
        showToast("An Error has occurred", "error");
        if (fileImgs.length > 0) {
          deleteUploadedFiles(fileImgs);
        }
        return false;
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const confirm = async () => {
    const check = window.confirm("Are you sure you want to proceed?");
    if (check) {
      const hasFilesToUpload = product.variants.some(
        (variant) => variant.selectedImgFiles.length > 0,
      );
      if (hasFilesToUpload) {
        const fileUploadSuccess = await handleFileUpload();
        if (fileUploadSuccess) {
          await updateProduct(fileUploadSuccess, imageToDelete);
        }
      } else {
        await updateProduct([], imageToDelete);
      }
    }
  };

  const getAllVariantContent = React.useCallback(() => {
    const contentSet = new Set<string>();

    product.variants.forEach((variant: Variant) => {
      variant.variantContent.forEach((content: string) => {
        contentSet.add(content);
      });
    });

    setContentList(Array.from(contentSet)); // Convert Set to an array
  }, [product.variants]);

  useEffect(() => {
    getAllVariantContent();
  }, [getAllVariantContent]);
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
  return (
    <form className="relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-lg bg-white px-6 py-4 text-xs">
      {preview && (
        <>
          <PreviewForm
            product={product}
            togglePreview={togglePreview}
            confirm={confirm}
            processing={false}
            uploadProgress={displayProgress}
          ></PreviewForm>
        </>
      )}

      <span
        className={`material-symbols-outlined absolute right-2 top-2 z-20 h-8 w-8 select-none self-end rounded-full bg-zinc-900/10 text-center text-xl leading-8 text-zinc-800 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
        onClick={() => {
          if (hasChanges()) {
            const confirmLeave = window.confirm(
              "You have unsaved changes. Do you really want to leave?",
            );
            if (!confirmLeave) return;
            handleCancel();
          } else {
            handleCancel();
          }
        }}
      >
        close
      </span>
      <h1 className="roboto-medium capitalized text-lg tracking-wide">
        Edit Product
      </h1>
      <div>
        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault;
              setActiveMenu("product");
            }}
          >
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 hover:cursor-pointer hover:bg-zinc-200 ${activeMenu === "product" && "border-zinc-300 bg-zinc-200"}`}
            >
              Product Information
            </p>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault;
              if (product.variants.length > 1) {
                setActiveMenu("variant");
              } else {
                showToast("Please add at least one variant", "warning");
              }
            }}
          >
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 hover:cursor-pointer hover:bg-zinc-200 ${activeMenu === "variant" && "border-zinc-300 bg-zinc-200"}`}
            >
              Variants
            </p>
          </button>
          <button
            type="button"
            onClick={addVariant}
            className="roboto-medium flex items-center gap-1 rounded bg-zinc-100 px-2 text-lg leading-3 text-zinc-600 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white focus:ring-2 focus:ring-zinc-300"
          >
            <span className="text-[11px] uppercase tracking-wide">
              Add variant
            </span>
          </button>
        </div>
      </div>
      {/* the FORM! */}
      <div
        className={`scrollbar-hide flex flex-col flex-nowrap justify-start gap-5 overflow-auto p-4 sm:flex-row md:flex-wrap ${activeMenu !== "product" && "hidden"}`}
      >
        {/* General Info */}
        <div className="relative order-1 flex w-full flex-col gap-2 rounded p-4 shadow ring-2 ring-zinc-100 sm:max-w-sm">
          <label className="roboto-medium text-sm tracking-wider">
            Genral Information
          </label>
          <div className="flex w-full flex-col gap-2">
            <InputBox
              label="Product Name"
              name={"product-name"}
              placeholder=""
              value={product.name}
              onChange={(e) => addValue("name", e.target.value)}
              req={true}
              errMsg={errors.name || ""}
            ></InputBox>
            <InputBox
              label="Brand"
              name={"brand"}
              placeholder={``}
              value={product.brand}
              onChange={(e) => addValue("brand", e.target.value)}
              req={true}
              errMsg={errors.brand || ""}
            ></InputBox>
          </div>
          <div className="flex h-full flex-col gap-1">
            <label className="capitalized roboto-medium leading-3 tracking-wide">
              Description <span className="text-red-500">* </span>
            </label>
            <textarea
              className={`h-40 min-h-32 resize-none overflow-y-auto rounded-md bg-zinc-100 p-2.5 text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 sm:h-full ${errors.description && "ring-2 ring-red-200"}`}
              value={product.description}
              onChange={(e) => addValue("description", e.target.value)}
              required
            ></textarea>
            {errors.description && (
              <span className="text-[11px] font-normal text-red-600">
                {errors.description}
              </span>
            )}
          </div>
        </div>
        {/* Categories */}
        <div className="relative order-3 flex w-full flex-col gap-2 rounded p-4 shadow ring-2 ring-zinc-100 sm:max-w-sm">
          <label className="roboto-medium text-sm tracking-wider">
            Category, Type and Tags
          </label>
          <div className="flex flex-col gap-1">
            <label className="capitalized roboto-medium leading-3 tracking-wide">
              {selectedCategory === "other" && "Custom "}Product Category{" "}
              <span className="text-red-500">* </span>
            </label>
            <div className="relative w-full">
              <select
                className={`w-full select-none rounded-md bg-zinc-100 px-1 py-2.5 text-sm capitalize text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 ${selectedCategory === "other" && "focus:ring-0"} ${!customCatElement && errors.category && "ring-2 ring-red-200"}`}
                disabled={selectedCategory === "other"}
                value={selectedCategory}
                onChange={handleSelectCategory}
                required
              >
                <option value=""></option>
                <option value="camera">Camera</option>
                <option value="lens">Lens</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
              {selectedCategory === "other" && (
                <div className="absolute left-0 top-0 flex w-full">
                  <label className="sr-only">custom category</label>
                  <input
                    id="custom-category"
                    className={`mr-1 w-full select-none rounded-l-md bg-zinc-100 p-2.5 text-sm text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 ${errors.customCategory && "ring-2 ring-red-200"}`}
                    type="text"
                    value={customCategory}
                    ref={customCategoryRef}
                    onChange={handleCustomCategory}
                    placeholder=""
                    required
                  />
                  <button
                    type="button"
                    className="group relative flex items-center justify-center rounded-r-md bg-zinc-200 px-5 py-2.5 text-sm"
                    onClick={() => {
                      setSelectedCategory("");
                      setCustomCategory("");
                      setProduct((prevProducts) => ({
                        ...prevProducts,
                        category: "",
                      }));
                    }}
                  >
                    <span
                      className={`material-symbols-outlined leading-0 absolute text-center text-zinc-500 group-hover:text-zinc-600`}
                    >
                      close
                    </span>
                  </button>
                </div>
              )}
            </div>
            {!errors.customCategory && errors.category && (
              <span className="text-[11px] font-normal text-red-600">
                {errors.category}
              </span>
            )}
            {errors.customCategory && (
              <span className="text-[11px] font-normal text-red-600">
                {errors.customCategory}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="capitalized roboto-medium leading-3 tracking-wide">
              {!conditionSubCategory && "Custom "}Product Subcategory{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative w-full">
              <select
                className={`w-full select-none rounded-md bg-zinc-100 px-1 py-2.5 text-sm text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 ${!conditionSubCategory && "focus:ring-none"} capitalize disabled:hover:cursor-not-allowed ${!customSubCatElement && errors.subCategory && "ring-2 ring-red-200"}`}
                disabled={
                  selectedCategory === "" ||
                  selectedCategory === "accessories" ||
                  selectedCategory === "other"
                }
                value={selectedSubCategory}
                onChange={handleSelectSubCategory}
                required={
                  selectedCategory === "camera" || selectedCategory === "lens"
                }
              >
                <option value=""></option>
                {renderOptions(selectedCategory)}
              </select>
              {!conditionSubCategory && (
                <div className="absolute left-0 top-0 flex w-full">
                  <label className="sr-only">custom subcategory</label>
                  <input
                    id="custom-subcategory"
                    className={`mr-1 w-full select-none rounded-l-md bg-zinc-100 p-2.5 text-sm text-zinc-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 ${errors.customSubCategory && "ring-2 ring-red-200"}`}
                    type="text"
                    ref={customSubCategoryRef}
                    value={customSubCategory}
                    onChange={handleCustomSubCategory}
                    placeholder=""
                  />
                  <button
                    type="button"
                    className="group relative flex items-center justify-center rounded-r-md bg-zinc-200 px-5 py-2.5 text-sm"
                    onClick={() => {
                      setSelectedSubCategory("");
                      setCustomSubCategory("");
                      setProduct((prevProducts) => ({
                        ...prevProducts,
                        subCategory: "",
                      }));
                    }}
                  >
                    <span
                      className={`material-symbols-outlined leading-0 absolute text-center text-zinc-500 group-hover:text-zinc-600`}
                    >
                      close
                    </span>
                  </button>
                </div>
              )}
            </div>

            {product.category ? (
              <>
                {!errors.customSubCategory && errors.subCategory && (
                  <span className="text-[11px] font-normal text-red-600">
                    {errors.subCategory}
                  </span>
                )}
                {errors.customSubCategory && (
                  <span className="text-[11px] font-normal text-red-600">
                    {errors.customSubCategory}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] font-normal text-red-600">
                Please select a category first
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="capitalized roboto-medium leading-3 tracking-wide">
              Product Tags:
            </label>
            <div className="flex">
              <input
                id="Product Tags"
                className="mr-1 w-full select-none rounded-l-md bg-zinc-100 p-2.5 text-sm text-zinc-700 outline-none ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
                type="text"
                value={tag}
                onChange={(e) => {
                  const value = e.target.value;
                  const noSpacesValue = value.replace(/\s/g, "");
                  setTag(noSpacesValue);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertTag(tag);
                  }
                }}
                placeholder=""
              />
              <button
                type="button"
                className="group relative flex items-center justify-center rounded-r-md bg-zinc-200 px-5 py-2.5 text-sm"
                onClick={() => insertTag(tag)}
              >
                <span
                  className={`material-symbols-outlined leading-0 absolute text-center text-zinc-500 group-hover:text-zinc-600`}
                >
                  arrow_forward
                </span>
              </button>
            </div>
            {tagCheck && (
              <p className="text-[11px] tracking-wide text-red-600">
                This tag is already added
              </p>
            )}
          </div>
          <div className="mt-1 h-full min-h-24 overflow-auto rounded-md bg-zinc-100">
            <ul className="flex w-full select-none flex-wrap gap-2 overflow-auto rounded-sm p-2.5 text-zinc-700">
              {product.tags.map((val, index) => (
                <li
                  key={index}
                  className="capitalized flex select-none items-center gap-2 rounded-sm bg-zinc-50 px-2 py-1 text-zinc-700 outline-none ring-1 ring-zinc-200 hover:bg-zinc-100 hover:ring-zinc-300"
                >
                  <span>{val}</span>
                  <span
                    className="material-symbols-outlined z-10 text-base leading-3 hover:cursor-pointer hover:text-red-700"
                    onClick={() => deleteTag(index)}
                  >
                    cancel
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Specifications */}
        <div className="relative order-4 flex w-full flex-col gap-2 rounded p-4 shadow ring-2 ring-zinc-100 sm:max-w-sm">
          <label className="capitalized roboto-medium text-sm tracking-wide">
            Specifications
          </label>
          <div className="flex flex-col gap-2">
            <InputBox
              label="Product Specification"
              name={"specification-title"}
              req={false}
              placeholder={``}
              value={specTitle}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length === 0 || value.charAt(0) !== " ") {
                  setSpecTitle(e.target.value);
                }
              }}
              errMsg=""
            ></InputBox>
            <InputBox
              label="Product Specification Content"
              name={"specification-value"}
              req={false}
              placeholder={``}
              value={specVal}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length === 0 || value.charAt(0) !== " ") {
                  setSpecVal(e.target.value);
                }
              }}
              errMsg=""
            ></InputBox>
          </div>
          <button
            type="button"
            onClick={insertSpecs}
            className="roboto-medium rounded-md bg-zinc-200 p-2 text-xs uppercase tracking-wide ease-linear hover:text-zinc-500 focus:bg-zinc-300 focus:text-zinc-700"
          >
            Insert
          </button>
          <SpecificationConverter
            insert={(params) => {
              setProduct((prevProduct) => ({
                ...prevProduct,
                specifications: {
                  ...prevProduct.specifications,
                  ...params,
                },
              }));
            }}
          ></SpecificationConverter>
          <div className="h-full min-h-40 overflow-auto rounded-md bg-zinc-100 p-2.5">
            <ObjectList
              objectList={product.specifications}
              deleteList={deleteList}
            ></ObjectList>
          </div>
        </div>
        {/* Additional info */}
        <div className="relative order-2 flex w-full flex-col gap-2 rounded p-4 shadow ring-2 ring-zinc-100 sm:max-w-sm">
          <label className="capitalized roboto-medium text-sm tracking-wide">
            Additional Information / Stocks / Price / Content
          </label>
          <div className="flex w-full flex-col gap-2">
            <InputBox
              label="Name"
              name={"variant-name"}
              req={false}
              placeholder={``}
              value={product.variants[0].variantName}
              onChange={(e) => {
                handleVariantChange(0, "variantName", e.target.value);
              }}
              errMsg={""}
            ></InputBox>
            <InputBox
              label="Color"
              name={"variant-color"}
              req={false}
              placeholder={``}
              value={product.variants[0].variantColor}
              onChange={(e) => {
                handleVariantChange(0, "variantColor", e.target.value);
              }}
              errMsg={""}
            ></InputBox>
            <div className="flex gap-2">
              <InputBox
                label="Stocks"
                name={"variant-stocks"}
                req={true}
                type="number"
                min={0}
                placeholder={``}
                value={
                  product.variants[0].variantStocks
                    ? product.variants[0].variantStocks
                    : ""
                }
                onChange={(e) => {
                  const value = Number(e.target.value);
                  handleVariantChange(0, "variantStocks", value);
                }}
                errMsg={errors.stocks0 || ""}
              ></InputBox>
              <InputBox
                label="Price"
                name={"variant-price"}
                req={true}
                type="number"
                min={0}
                placeholder={``}
                value={
                  product.variants[0].variantPrice
                    ? product.variants[0].variantPrice
                    : ""
                }
                onChange={(e) => {
                  const value = Number(e.target.value);
                  handleVariantChange(0, "variantPrice", value);
                }}
                errMsg={errors.price0 || ""}
              ></InputBox>
            </div>
            <div className="">
              <div className="flex w-full flex-col gap-2">
                <InputBox
                  label="Content (In the box)"
                  name={"variant-content"}
                  req={false}
                  placeholder={``}
                  value={content}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length === 0 || value.charAt(0) !== " ") {
                      setContent(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault;
                      insertContent(0, content);
                      setContent("");
                    }
                  }}
                  errMsg=""
                ></InputBox>
                <button
                  type="button"
                  className="roboto-medium rounded-md bg-zinc-200 p-2 text-xs uppercase tracking-wide ease-linear hover:text-zinc-500 focus:bg-zinc-300 focus:text-zinc-700"
                  onClick={() => {
                    insertContent(0, content);
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
                        insertContent(0, val);
                        setContent("");
                      });
                    }}
                  ></AutoAddContent>
                )}
                <div className="h-28 overflow-auto rounded-md bg-zinc-100 p-2.5">
                  {product.variants[0].variantContent.length === 0 && (
                    <>
                      <span className="text-zinc-400">Ex. Charger</span>
                    </>
                  )}
                  <DataList
                    formIndex={0}
                    array={product.variants[0].variantContent}
                    field={"variantContent"}
                    deleteItem={deleteItem}
                  ></DataList>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Images */}
        <div className="relative order-5 flex w-full flex-col gap-2 rounded p-4 shadow ring-2 ring-zinc-100 sm:max-w-sm">
          <label className="roboto-medium text-sm tracking-wider">
            Images <span className="text-red-500">* </span>
          </label>
          <div className="flex">
            <input
              type="file"
              ref={fileInputRef}
              className={`mr-1 w-full select-none rounded-md bg-zinc-100 p-2.5 text-sm text-zinc-700 outline-none hover:cursor-pointer focus:bg-white focus:ring-2 focus:ring-blue-400 ${errors.customSubCategory && "ring-2 ring-red-200"}`}
              multiple
              onChange={(e) => handleFileSelection(e, 0)}
            ></input>
          </div>

          <div
            className={`flex h-full min-h-40 flex-col flex-wrap justify-center gap-2 overflow-auto rounded-md bg-zinc-100 p-2.5 ${errors.images0 && "ring-2 ring-red-200"}`}
          >
            Images
            <div className="flex flex-wrap gap-2 border-b-2 pb-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndOld}
              >
                <SortableContext
                  items={product.variants[0].variantImgs.map(
                    (_, index) => `${0}-${index}`,
                  )}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex h-full min-h-40 flex-wrap justify-evenly gap-2 overflow-auto rounded-md bg-zinc-100 p-2.5">
                    {product.variants[0].variantImgs.map((url, index) => (
                      <SortableImagePreview
                        key={`${0}-${index}`}
                        id={`${0}-${index}`}
                        url={url}
                        onDelete={() => handleDeleteOldImage(index, 0, url)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            {product.variants[0].previewUrl.length > 0 && (
              <>
                To be Added:
                <div className="flex flex-wrap gap-2 border-b-2 pb-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndNew}
                  >
                    <SortableContext
                      items={product.variants[0].previewUrl.map(
                        (_, index) => `${0}-${index}`,
                      )}
                      strategy={rectSortingStrategy}
                    >
                      <div className="flex min-h-40 flex-wrap justify-center gap-2 overflow-auto rounded-md p-2.5">
                        {product.variants[0].previewUrl.map((url, index) => (
                          <SortableImagePreview
                            key={`${0}-${index}`}
                            id={`${0}-${index}`}
                            url={url}
                            onDelete={() => handleDeleteImage(index, 0)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </>
            )}
          </div>
          {errors.images0 && (
            <span className="text-[11px] font-normal text-red-600">
              {errors.images0}
            </span>
          )}
        </div>
      </div>
      <div className={`self-end text-sm`}>
        <button
          type="button"
          className="rounded bg-zinc-500 px-2.5 py-1 text-white hover:bg-zinc-700 focus:bg-zinc-500 focus:ring-2 focus:ring-zinc-400"
          onClick={(e) => {
            handleSubmitForm(e);
          }}
        >
          Submit
        </button>
      </div>

      <div
        className={`scrollbar-hide flex h-full w-full flex-col gap-1 overflow-auto sm:flex-row ${activeMenu !== "variant" && "hidden"}`}
      >
        <div className="scrollbar-hide sm:[--] flex h-12 flex-shrink-0 flex-grow-0 flex-row gap-2 overflow-scroll py-[11px] pl-2 sm:h-full sm:flex-col sm:pl-1">
          {product.variants.map((_, index) => {
            if (index === 0) {
              return null;
            }
            return (
              <button
                type="button"
                key={index}
                onClick={(e) => {
                  e.preventDefault;
                  handleShowVariant(index);
                }}
                className={`rounded-t-md bg-zinc-100 px-4 hover:bg-zinc-300 sm:w-8 sm:rounded-l-md sm:rounded-r-none sm:px-2 sm:py-3 ${showingVariant === index && "border-x-[1px] border-b-0 border-t-[1px] border-zinc-400 bg-zinc-300 sm:border-y-[1px] sm:border-l-[1px] sm:border-r-0"}`}
              >
                {index}
              </button>
            );
          })}
        </div>
        {product.variants.map((form, index) => {
          if (index === 0) {
            return null;
          }
          return (
            <div
              className={`${showingVariant !== index && "hidden"} 1 h-full w-full`}
              key={index}
            >
              <VariantForm
                formIndex={index}
                variant={form}
                handleVariantChange={handleVariantChange}
                insertContent={insertContent}
                deleteItem={deleteItem}
                removeThis={removeVariant}
                handleFileSelection={handleFileSelection}
                handleDeleteImage={handleDeleteImage}
                handleDeleteOldImage={handleDeleteOldImage}
                errMsg={getVariantErrors(index)}
                moveOldImage={moveOldImage}
                contentList={contentList}
                handleDragEndNew={handleDragEndNew}
                handleDragEndOld={handleDragEndOld}
                sensors={sensors}
              />
            </div>
          );
        })}
      </div>
    </form>
  );
};

export default EditProduct;
