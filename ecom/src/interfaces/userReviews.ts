

export interface UserReviewProps {
    _id: string;
    edit: boolean;
    productId: string;
    variantId: string;
    name: string;
    variantName: string;
    variantColor: string;
    variantImg: string;
    orderNumber: string;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    title?: string;
    message?: string;
  }