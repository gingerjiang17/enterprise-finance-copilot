"use client";

import { calculateBudgetVsActual } from "@/lib/budget";
import type { Row } from "@/lib/excel";

type Props = {
  data: Row[];
};

function formatFullNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) return "--";
  return `${value.toFixed(1)}%`;
}

function getStatusLabel(status: string) {
  if (status === "favorable") return "Favorable";
  if (status === "unfavorable") return "Unfavorable";
  if (status === "on-target") return "On Target";
  return "No Data";
}

export default function BudgetVsActual({ data }: Props) {
  const metrics = calculateBudgetVsActual(data);

  const isFavorable = metrics.status === "favorable";
  const isUnfavorable = metrics.status === "unfavorable";

  const comparisonBase = Math.max(
    Math.abs(metrics.actual),
    Math.abs(metrics.budget),
    1
  );

  const budgetWidth = Math.min(
    100,
    (Math.abs(metrics.budget) / comparisonBase) * 100
  );

  const actualWidth = Math.min(
    100,
    (Math.abs(metrics.actual) / comparisonBase) * 100
  );

  return (
    <section className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200/70">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Budget vs Actual
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
            Revenue Performance
          </h2>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            isFavorable
              ? "bg-emerald-50 text-emerald-700"
              : isUnfavorable
                ? "bg-red-50 text-red-700"
                : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {getStatusLabel(metrics.status)}
        </span>
      </div>

      {!metrics.hasBudgetData ? (
        <div className="rounded-2xl bg-zinc-50 p-6">
          <p className="text-sm font-medium text-zinc-700">
            Budget data is not available
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {metrics.message}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Budget</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {formatCompactNumber(metrics.budget)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {formatFullNumber(metrics.budget)}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Actual</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {formatCompactNumber(metrics.actual)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {formatFullNumber(metrics.actual)}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Variance</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  isFavorable
                    ? "text-emerald-600"
                    : isUnfavorable
                      ? "text-red-600"
                      : "text-zinc-900"
                }`}
              >
                {metrics.variance > 0 ? "+" : ""}
                {formatCompactNumber(metrics.variance)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {formatFullNumber(metrics.variance)}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-sm text-zinc-500">Variance %</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  isFavorable
                    ? "text-emerald-600"
                    : isUnfavorable
                      ? "text-red-600"
                      : "text-zinc-900"
                }`}
              >
                {metrics.variance > 0 ? "+" : ""}
                {formatPercent(metrics.variancePct)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                vs Budget
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-zinc-600">Budget</span>
                  <span className="text-zinc-500">
                    {formatCompactNumber(metrics.budget)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className="h-full rounded-full bg-zinc-500"
                    style={{ width: `${budgetWidth}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-zinc-600">Actual</span>
                  <span className="text-zinc-500">
                    {formatCompactNumber(metrics.actual)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className={`h-full rounded-full ${
                      isFavorable
                        ? "bg-emerald-500"
                        : isUnfavorable
                          ? "bg-red-500"
                          : "bg-zinc-500"
                    }`}
                    style={{ width: `${actualWidth}%` }}
                  />
                </div>
              </div>
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