"use client";

import ChartCard from "@/components/ChartCard";
import TrendLineChart from "@/components/TrendLineChart";
import type { TrendChartData } from "@/lib/charts";

type TrendChartsProps = {
  chartData: TrendChartData;
};

function formatRevenue(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatMargin(value: number): string {
  return `${(value * 100).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

export default function TrendCharts({ chartData }: TrendChartsProps) {
  const { hasPeriod, points } = chartData;
  const isEmpty = !hasPeriod || points.length === 0;

  const revenueData = points.map((point) => ({
    period: point.period,
    value: point.revenue,
  }));

  const grossMarginData = points.map((point) => ({
    period: point.period,
    value: point.grossMargin,
  }));

  return (
    <div className="mt-10 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Revenue Trend by Period"
        isEmpty={isEmpty}
        emptyMessage="No Period column found in this worksheet."
      >
        <TrendLineChart
          data={revenueData}
          valueFormatter={formatRevenue}
        />
      </ChartCard>

      <ChartCard
        title="Gross Margin Trend by Period"
        isEmpty={isEmpty}
        emptyMessage="No Period column found in this worksheet."
      >
        <TrendLineChart
          data={grossMarginData}
          valueFormatter={formatMargin}
          yAxisFormatter={(value) =>
            `${(value * 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}%`
          }
        />
      </ChartCard>
    </div>
  );
}
