import { useCallback, useState } from "react";
import { Product, Variant } from "../Components/interface/interfaces";
import {
 
 
  DragEndEvent,
} from "@dnd-kit/core";
import {

arrayMove,

} from "@dnd-kit/sortable";

// DnD sensors



export const useProduct = () => {

    const [product, setProduct] = useState<Product>({
        name: "",
        category: "",
        subCategory: "",
        brand: "",
        description: "",
        specifications: {},
        variants: [
          {
            variantName: "",
            variantColor: "",
            variantStocks: null,
            variantContent: [],
            variantImgs: [],
            selectedImgFiles: [],
            previewUrl: [],
            variantPrice: null,
          },
        ],
        tags: [],
      });

      const handleFileSelection = (
        event: React.ChangeEvent<HTMLInputElement>,
        index: number,
      ) => {
        if (event.target.files && event.target.files.length > 0) {
          const filesArray = Array.from(event.target.files).slice(0, 10); // Limit to 10 files
          const previewArray = filesArray.map((file) => URL.createObjectURL(file));
          setProduct((prevProduct) => {
            const updatedVariants = prevProduct.variants.map((variant, idx) => {
              if (index === idx) {
                return {
                  ...variant,
                  selectedImgFiles: filesArray,
                  previewUrl: previewArray,
                };
              }
              return variant;
            });
            return { ...prevProduct, variants: updatedVariants };
          });
        }
      };

      const moveImage = (index: number, direction: 'up' | 'down', variantIndex: number) => {
        setProduct((prevProduct) => {
          const updatedVariants = prevProduct.variants.map((variant, idx) => {
            if (idx === variantIndex) {
              const newPreviewUrls = [...variant.previewUrl];
              const newSelectedImgFiles = [...variant.selectedImgFiles];
      
              if (direction === 'up' && index > 0) {
                [newPreviewUrls[index], newPreviewUrls[index - 1]] = [newPreviewUrls[index - 1], newPreviewUrls[index]];
                [newSelectedImgFiles[index], newSelectedImgFiles[index - 1]] = [newSelectedImgFiles[index - 1], newSelectedImgFiles[index]];
              } else if (direction === 'down' && index < newPreviewUrls.length - 1) {
                [newPreviewUrls[index], newPreviewUrls[index + 1]] = [newPreviewUrls[index + 1], newPreviewUrls[index]];
                [newSelectedImgFiles[index], newSelectedImgFiles[index + 1]] = [newSelectedImgFiles[index + 1], newSelectedImgFiles[index]];
              }
      
              return {
                ...variant,
                previewUrl: newPreviewUrls,
                selectedImgFiles: newSelectedImgFiles,
              };
            }
            return variant;
          });
      
          return { ...prevProduct, variants: updatedVariants };
        });
      };
      

      const handleVariantChange = (
        formIndex: number,
        field: string,
        value: number | string | string[],
      ) => {
        if (typeof value === "string") {
          if (value.charAt(0) === " ") {
            return;
          }
        }
        setProduct((prevProduct) => {
          const updatedVariants = prevProduct.variants.map((variant, idx) => {
            if (formIndex === idx) {
              return { ...variant, [field]: value };
            }
            return variant;
          });
          return { ...prevProduct, variants: updatedVariants };
        });
      };

      const isVariantEmpty = useCallback((variant: Variant): boolean => {
          return (
            variant.variantName === "" &&
            variant.variantColor === "" &&
            (variant.variantStocks === 0 || variant.variantStocks === null) &&
            variant.variantImgs.length === 0 &&
            (variant.variantPrice === 0 || variant.variantPrice === null) &&
            variant.variantContent.length === 0
          );
        }, []);
      
        const isProductEmpty = useCallback(
          (product: Product): boolean => {
            return (
              product.name === "" &&
              product.brand === "" &&
              product.category === "" &&
              product.subCategory === "" &&
              product.description === "" &&
              Object.keys(product.specifications).length === 0 &&
              product.tags.length === 0 &&
              isVariantEmpty(product.variants[0])
            );
          },
          [isVariantEmpty],
        );
      
        const addValue = (field: string, value: string) => {
           if (value.length === 0 || value.charAt(0) !== " ") {
             setProduct((prevProduct) => {
               return {
                 ...prevProduct,
                 [field]: value,
               };
             });
           }
         };
 

// Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const [activeVariantStr, ...activeUrlParts] = active.id.toString().split("-");
  const [overVariantStr, ...overUrlParts] = over.id.toString().split("-");

  const activeVariantIndex = parseInt(activeVariantStr);
  const overVariantIndex = parseInt(overVariantStr);

  // Join back the URL in case it contains hyphens
  const activeUrl = activeUrlParts.join("-");
  const overUrl = overUrlParts.join("-");

  if (activeVariantIndex !== overVariantIndex) return;

  setProduct((prev) => {
    const variant = prev.variants[activeVariantIndex];

    const oldIndex = variant.previewUrl.findIndex((url) => url === activeUrl);
    const newIndex = variant.previewUrl.findIndex((url) => url === overUrl);

    if (oldIndex === -1 || newIndex === -1) return prev;

    const newPreviewUrls = arrayMove(variant.previewUrl, oldIndex, newIndex);
    const newFiles = arrayMove(variant.selectedImgFiles, oldIndex, newIndex);

    const updatedVariants = [...prev.variants];
    updatedVariants[activeVariantIndex] = {
      ...variant,
      previewUrl: newPreviewUrls,
      selectedImgFiles: newFiles,
    };

    return { ...prev, variants: updatedVariants };
  });
};


      return { product, setProduct, addValue, handleFileSelection, handleVariantChange, isProductEmpty, isVariantEmpty, moveImage, handleDragEnd };
};