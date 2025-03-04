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
    items: [ItemsProps];
    status: 'pending' | 'payment failed' | 'shipped' | 'delivered' | 'cancelled' | 'refund on process' | 'refunded' | 'processed';
    totalAmount: number;
    paymentStatus: boolean;
    _id: string;
  }