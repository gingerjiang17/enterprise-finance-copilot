"use client";

import { calculateBudgetVsActual } from "@/lib/budget";
import type { Row } from "@/lib/excel";

type Props = {
  data: Row[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) return "--";
  return `${value.toFixed(1)}%`;
}

export default function BudgetVsActual({ data }: Props) {
  const metrics = calculateBudgetVsActual(data);

  const isPositive = metrics.variance >= 0;

  return (
    <section className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200/70">
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-500">
          Budget vs Actual
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          Revenue Performance
        </h2>
      </div>

      {!metrics.hasBudgetData ? (
        <div className="rounded-2xl bg-zinc-50 p-6 text-sm text-zinc-500">
          {metrics.message}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Budget</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {formatNumber(metrics.budget)}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Actual</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {formatNumber(metrics.actual)}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Variance</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatNumber(metrics.variance)}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Variance %</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatPercent(metrics.variancePct)}
              </p>
            </div>
          </div>

          <div className="mt-6 text-xs text-zinc-400">
            Actual column: {metrics.actualColumn} · Budget column:{" "}
            {metrics.budgetColumn}
          </div>
        </>
      )}
    </section>
  );
}