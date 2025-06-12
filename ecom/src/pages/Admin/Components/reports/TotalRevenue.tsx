import { useAnalytics } from "./useAnalytics";
import { format, parse } from "date-fns";
import AnalyticsCard from "../main/AnalyticsCard";
const TotalRevenue = () => {
  const { data } = useAnalytics();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  return (
    <AnalyticsCard
      title="Total Revenue"
      value={
        data
          ? `€${data.thisMonthRevenue.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : "€0,00"
      }
      growthRate={data?.revenueGrowthRate || 0}
      data={data?.monthlyRevenue || []}
      dataKey="revenue"
      formatTooltip={({ month, orders }) => (
        <>
          <strong>
            {format(parse(month, "yyyy-MM", new Date()), "MMM yyyy")}
          </strong>
          <br />
          Orders: {orders}
        </>
      )}
    />
  );
};

export default TotalRevenue;
