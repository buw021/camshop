export interface Attributes {
  [key: string]: string;
}

export interface saleId {
  salePrice: number | null;
}


export interface Variant {
  variantName: string;
  variantColor: string;
  variantStocks: number | null;
  variantContent: string[];
  variantImgs: string[];
  selectedImgFiles: File[];
  previewUrl: string[];
  variantPrice: number | null;
  saleId: saleId | null;
  _id?: string;
}

export interface Product {
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  description: string;
  specifications: Attributes[];
  variants: Variant[];
  tags: string[];
  _id?: string;
}
  

export interface PromoCode {
  code: string;
  description: string;
  type: "percentage" | "fixed" | null;
  value: number | null;
  startDate: Date | null;
  endDate: Date | null;
  usageLimit: number | null;
  keywords: string[] ;
}