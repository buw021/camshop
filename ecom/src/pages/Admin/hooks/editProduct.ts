import { useCallback, useState } from "react";
import {isEqual} from "lodash";
import { Product, Variant } from "../Components/interface/interfaces";
// eslint-disable-next-line @typescript-eslint/no-explicit-any


export const useProduct = (data: Product) => {

  const initialData = {
    _id: data._id,
    name: data.name,
    category: data.category,
    subCategory: data.subCategory,
    brand: data.brand,
    description: data.description,
    specifications: Array.isArray(data.specifications) ? data.specifications : [],
    variants: data.variants.map((variant) => ({
      ...variant,
      selectedImgFiles: [],
      previewUrl: [],
    })),
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
  const [product, setProduct] = useState<Product>({
    _id: data._id,
    name: data.name,
    category: data.category,
    subCategory: data.subCategory,
    brand: data.brand,
    description: data.description,
    specifications: Array.isArray(data.specifications) ? data.specifications : [],
    variants: data.variants.map((variant) => ({
      ...variant,
      selectedImgFiles: [],
      previewUrl: [],
    })),
    tags: Array.isArray(data.tags) ? data.tags : [],
  });
  
  const hasChanges = (): boolean => { return !isEqual(initialData, product); };

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


      const moveOldImage = (index: number, direction: 'up' | 'down', variantIndex: number) => {
        setProduct((prevProduct) => {
          const updatedVariants = prevProduct.variants.map((variant, idx) => {
            if (idx === variantIndex) {
              const newVariantImgs = [...variant.variantImgs];
           
      
              if (direction === 'up' && index > 0) {
                [newVariantImgs[index], newVariantImgs[index - 1]] = [newVariantImgs[index - 1], newVariantImgs[index]];
              } else if (direction === 'down' && index < newVariantImgs.length - 1) {
                [newVariantImgs[index], newVariantImgs[index + 1]] = [newVariantImgs[index + 1], newVariantImgs[index]];
              }
      
              return {
                ...variant,
                variantImgs: newVariantImgs,
             
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
              product.specifications.length === 0 &&
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

      return { product, setProduct, addValue, handleFileSelection,moveOldImage, handleVariantChange, isProductEmpty, isVariantEmpty, hasChanges }
};