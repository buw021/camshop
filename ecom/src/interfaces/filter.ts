import { Attributes } from "./products";

export interface Filter {
    subCategory: string;
    brand: string;
    minPrice: number | null;
    maxPrice: number | null;
    onSale: boolean;
    colors: string[];
    specs: Attributes[];
}