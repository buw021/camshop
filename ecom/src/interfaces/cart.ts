export interface Cart {
    productId: string;
    variantId: string;
    name: string;
    variantName: string;
    variantColor: string;
    variantImg: string;
    price: number;
    quantity: number;
    isOnSale: boolean;
    salePrice: number | null
  }
