import { createContext, useEffect, useState, ReactNode, useCallback } from "react";
import axiosInstance from "../../Services/axiosInstance";

type MonthlyRevenue = {
  month: string;
  revenue: number;
  orders: number;
};

type AnalyticsData = {
  totalRevenue: number;
  lastMonthRevenue: number;
  thisMonthRevenue: number;
  revenueGrowthRate: number;
  totalOrders: number;
  thisMonthOrders: number;
  lastMonthOrders: number;
  orderGrowthRate: number;
  avgOrderValue: number;
  monthlyRevenue: MonthlyRevenue[];
};

type AnalyticsContextType = {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

export const AnalyticsContext = createContext<AnalyticsContextType>({
  data: null,
  loading: false,
  error: null,
  refresh: () => {},
});

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get<AnalyticsData>("/analytics");
      setData(res.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <AnalyticsContext.Provider
      value={{
        data,
        loading,
        error,
        refresh: fetchAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
