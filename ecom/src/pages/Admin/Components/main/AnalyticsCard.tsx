// components/AnalyticsCard.tsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

type DataPoint = {
  month: string;
  [key: string]: number | string;
};

type AnalyticsCardProps = {
  title: string;
  value: string | number;
  growthRate: number;
  data: DataPoint[];
  dataKey: string;
  formatTooltip: (data: DataPoint) => React.ReactNode;
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  growthRate,
  data,
  dataKey,
  formatTooltip,
}) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div
          style={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 6,
            padding: "8px",
            fontSize: 14,
          }}
        >
          {formatTooltip(payload[0].payload)}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex w-full flex-col items-start gap-2 rounded-md border border-zinc-200 p-6 md:col-span-2">
      <div className="flex w-full flex-col gap-1 xl:gap-0">
        <h1 className="text-xs tracking-wide text-zinc-500 sm:text-sm">
          {title}{" "}
          {new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h1>
        <p
          title={`${value}`}
          className="w-full overflow-hidden text-xl font-bold tracking-wide sm:text-2xl"
        >
          {value}
        </p>
        <h1 className="text-xs tracking-wide text-zinc-500">
          {growthRate > 0 ? "+" : ""}
          {growthRate.toFixed(2)}% from last month
        </h1>
      </div>
      <div className="h-full min-h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData}>
            <XAxis fontSize={10} hide />
            <YAxis fontSize={10} hide />
            <CartesianGrid stroke="none" />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#27272A"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCard;
