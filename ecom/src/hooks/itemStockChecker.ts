
import axiosInstance from "../services/axiosInstance"


export const checkItemStock = async (productId: string, variantId: string, quantity: number): Promise<boolean | null> => {
    try {
        const response = await axiosInstance.get(`/checkItemStocks`, {
            params: {
                productId: productId,
                variantId: variantId,
                quantity: quantity
            }
        });
        if(response.status === 200){
            if(response.data.warning){
                return false;
            }
            if(response.data.success){
                return true;
            }
        }else if(response.status === 404){
            return false;
        }
        return null
    } catch (error) {
        console.error("Error checking item stock:", error);
        return null;
    }
};
