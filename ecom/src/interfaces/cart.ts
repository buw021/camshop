export interface CartID { 
    productId: string;
    variantId: string;
    quantity: number;
}

export interface CartInterface {
    productId: string;
    variantId: string;
    name: string;
    variantName: string;
    variantColor: string;
    variantImg: string;
    price: number;
    quantity: number;
    saleId: {salePrice: number | null} | null;
    discountedPrice?: number;
    variantStocks: number;
}
