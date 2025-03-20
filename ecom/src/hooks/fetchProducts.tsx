import { useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
import { Variant } from "../interfaces/products";
// Adjust the path accordingly

const useFetchProducts = (
  page: number,
  limit: number,
  filters: { category?: string; keyword?: string },
  maxRetries = 3,
) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async (retryCount = 0) => {
      try {
        let query = `/get-variants?page=${page}&limit=${limit}`;
        if (filters.category) {
          query += `&category=${filters.category}`;
        }
        if (filters.keyword) {
          query += `&keyword=${filters.keyword}`;
        }

        const response = await axiosInstance.get(query);
        setVariants(response.data.variants);
        setTotal(response.data.total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (retryCount < maxRetries) {
          setTimeout(
            () => fetchProducts(retryCount + 1),
            Math.pow(2, retryCount) * 1000,
          ); // Exponential backoff
        } else {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [page, limit, filters, maxRetries]);

  return { variants, total, loading };
};

export default useFetchProducts;
