export interface WishlistID {
  productId: string;
  variantId: string;
}

export interface Wishlist {
    quantity: number;
    productId: string;
    variantId: string;
    name: string;
    variantName: string;
    variantColor: string;
    variantImg: string;
    saleId: { salePrice: number } | null;
    price: number;
  }