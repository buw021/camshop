import { AddressInterface } from "../../../../interfaces/user";

interface Attributes {
  [key: string]: string;
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
  minimumOrderValue: number;
  usageLimit: number | null;
  usageCount?: number;
  keywords: string[] ;
}

export interface ItemsProps {
  createdAt: string;
  discountedPrice: number | null;
  isOnSale: boolean;
  name: string;
  price: number;
  productId: string;
  quantity: number;
  salePrice: number;
  updatedAt: string;
  variantColor: string;
  variantId: string;
  variantImg: string;
  variantName: string;
}

export interface OrderProps {
  createdAt: string;
  customOrderId: string;
  discountAmount: number;
  userId: string;
  userEmail: string;
  items: [ItemsProps];
  originalTotalAmount: number;
  paymentMethod: string;
  paymentUrl: string;
  placedAt: string;
  promoCode: string | null;
  shippingAddress: AddressInterface;
  shippingCost: number;
  shippingOption: string;
  status: string;
  totalAmount: number;
  trackingNo: string | null;
  trackingLink: string | null;
  paymentStatus: boolean;
  fulfilled: boolean
  _id: string;
}

export interface FiltersProps {
  status: string[];
  paymentStatus: string;
  fulfillmentStatus: string;
  searchQuery: string;
  dateStart: string;
  dateEnd: string;
}