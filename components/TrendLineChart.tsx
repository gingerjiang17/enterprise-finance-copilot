"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendLineChartProps = {
  data: { period: string; value: number | null }[];
  valueFormatter: (value: number) => string;
  yAxisFormatter?: (value: number) => string;
};

export default function TrendLineChart({
  data,
  valueFormatter,
  yAxisFormatter = valueFormatter,
}: TrendLineChartProps) {
  const chartData = data.map((point) => ({
    period: point.period,
    value: point.value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#f4f4f5" vertical={false} />
        <XAxis
          dataKey="period"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          dy={8}
        />
        <YAxis
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yAxisFormatter}
          width={56}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #e4e4e7",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            fontSize: "13px",
          }}
          formatter={(value) => {
            if (typeof value !== "number") return ["--", ""];
            return [valueFormatter(value), ""];
          }}
          labelStyle={{ color: "#71717a", marginBottom: 4 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#18181b"
          strokeWidth={2}
          dot={{ fill: "#18181b", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#18181b" }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
