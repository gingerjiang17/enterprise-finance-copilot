"use client";

import { calculateBudgetVsActual } from "@/lib/budget";
import type { Row } from "@/lib/excel";
import {
  analyzeVarianceDrivers,
  type VarianceDriver,
} from "@/lib/varianceDrivers";

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

function formatSignedCompactNumber(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCompactNumber(value)}`;
}

function formatSignedPercent(value: number | null) {
  if (value === null) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function getStatusLabel(status: string) {
  if (status === "favorable") return "Favorable";
  if (status === "unfavorable") return "Unfavorable";
  if (status === "on-target") return "On Target";
  return "No Data";
}

function getSeverityClass(severity: VarianceDriver["severity"]) {
  if (severity === "High") return "bg-red-50 text-red-700";
  if (severity === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-zinc-100 text-zinc-600";
}

function getDirectionClass(direction: VarianceDriver["direction"]) {
  if (direction === "Favorable") return "text-emerald-600";
  if (direction === "Unfavorable") return "text-red-600";
  return "text-zinc-600";
}

function getVarianceTypeText(type: VarianceDriver["varianceType"]) {
  if (type === "Revenue Shortfall") return "收入未达预算";
  if (type === "Revenue Outperformance") return "收入超出预算";
  if (type === "Expense Overrun") return "费用超出预算";
  if (type === "Expense Saving") return "费用节约";
  return "轻微差异";
}

function VarianceDriverList({
  title,
  drivers,
  emptyText,
}: {
  title: string;
  drivers: VarianceDriver[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200/70">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>

      {drivers.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {drivers.map((driver) => (
            <div
              key={`${title}-${driver.label}-${driver.variance}`}
              className="rounded-xl bg-zinc-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {driver.label}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Actual:{" "}
                    {driver.actual === null
                      ? "n/a"
                      : formatCompactNumber(driver.actual)}{" "}
                    · Budget:{" "}
                    {driver.budget === null
                      ? "n/a"
                      : formatCompactNumber(driver.budget)}
                  </p>
                </div>

                <span
                  className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getSeverityClass(
                    driver.severity
                  )}`}
                >
                  {driver.severity}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3">
  <p
    className={`text-lg font-semibold ${getDirectionClass(
      driver.direction
    )}`}
  >
    {formatSignedCompactNumber(driver.variance)}
  </p>

  <p className="text-xs text-zinc-500">
    {formatSignedPercent(driver.variancePct)} vs budget
  </p>
</div>

<div className="mt-4 space-y-3 border-t border-zinc-200 pt-3">
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
      Variance Type
    </p>

    <p className="mt-1 text-sm font-semibold text-zinc-900">
  {getVarianceTypeText(driver.varianceType)}
</p>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
      Contribution
    </p>

    <p className="mt-1 text-sm text-zinc-600">
    {driver.contributionPct === null
  ? "n/a"
  : driver.direction === "Unfavorable"
    ? `占负向差异总额的 ${driver.contributionPct.toFixed(1)}%`
    : driver.direction === "Favorable"
      ? `占正向差异总额的 ${driver.contributionPct.toFixed(1)}%`
      : `贡献占比 ${driver.contributionPct.toFixed(1)}%`}
    </p>
  </div>

  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
      Management Focus
    </p>

    <p className="mt-1 text-sm leading-6 text-zinc-600">
      {driver.managementFocus}
    </p>
  </div>
</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-zinc-500">{emptyText}</p>
      )}
    </div>
  );
}

export default function BudgetVsActual({ data }: Props) {
  const metrics = calculateBudgetVsActual(data);
  const varianceDrivers = analyzeVarianceDrivers(
    data as Record<string, unknown>[]
  );

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
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Budget vs Actual
        </div>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
            Revenue Performance
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
          实际业绩与预算对比分析，并结合规则驱动的差异原因识别，深入分析业绩偏差来源。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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

          <span className="inline-flex w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
            {varianceDrivers.confidenceLevel} Driver Confidence
          </span>
        </div>
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
              <p className="mt-1 text-xs text-zinc-400">vs Budget</p>
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

        </>
      )}

      <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Variance Driver Intelligence
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
            基于上传的数据集，识别影响业绩的主要有利及不利差异因素。
            </p>
          </div>

          {varianceDrivers.hasVarianceData && (
            <p className="text-xs text-zinc-400">
              Dimension: {varianceDrivers.dimensionField ?? "Row level"}
            </p>
          )}
        </div>

        {!varianceDrivers.hasVarianceData ? (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200/70">
            <p className="text-sm font-medium text-zinc-700">
              Variance driver data is not available
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {varianceDrivers.managementAttention[0]}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
  <VarianceDriverList
    title="Top Unfavorable Drivers"
    drivers={varianceDrivers.topUnfavorable}
    emptyText="按业务单元汇总分析后，未发现明显的不利差异驱动因素。"
  />

  <VarianceDriverList
    title="Top Favorable Drivers"
    drivers={varianceDrivers.topFavorable}
    emptyText="按业务单元汇总分析后，未发现明显的有利差异驱动因素。"
  />
</div>

            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-200/70">
              <h3 className="text-sm font-semibold text-zinc-900">
                Management Attention
              </h3>

              <ul className="mt-3 space-y-2">
                {varianceDrivers.managementAttention.map((item, index) => (
                  <li
                    key={`management-attention-${index}`}
                    className="text-sm leading-6 text-zinc-600"
                  >
                    <span className="mr-2 text-zinc-400">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}