"use client";

import {
  reviewDataQuality,
  type DataQualityStatus,
} from "@/lib/dataQualityReview";

type Props = {
  rows: Record<string, unknown>[];
};

function getStatusClass(status: DataQualityStatus) {
  if (status === "Pass") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "Warning") {
    return "bg-yellow-50 text-yellow-700 ring-yellow-100";
  }

  return "bg-red-50 text-red-700 ring-red-100";
}

function getStatusText(status: DataQualityStatus) {
  if (status === "Pass") {
    return "Pass";
  }

  if (status === "Warning") {
    return "Warning";
  }

  return "Failed";
}

export default function DataQualityReview({ rows }: Props) {
  const result = reviewDataQuality(rows);

  return (
    <section className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200/70">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Data Quality Review
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            对上传的 GL 数据进行基础质量检查，识别字段缺失、金额格式异常及重复记录风险。
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(
            result.overallStatus
          )}`}
        >
          {getStatusText(result.overallStatus)}
        </span>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Total Rows
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {result.totalRows}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Passed
          </p>

          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {result.passedChecks}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Warnings
          </p>

          <p className="mt-2 text-2xl font-semibold text-yellow-700">
            {result.warningChecks}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Failed
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-700">
            {result.failedChecks}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {result.checks.map((check, index) => (
          <div
            key={index}
            className="rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-200/70"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-zinc-900">
                {check.title}
              </h3>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getStatusClass(
                  check.status
                )}`}
              >
                {getStatusText(check.status)}
              </span>
            </div>

            <p className="text-sm leading-6 text-zinc-600">
              {check.message}
            </p>

            {typeof check.affectedRows === "number" &&
              check.affectedRows > 0 && (
                <p className="mt-3 text-xs font-medium text-slate-400">
                  Affected Rows: {check.affectedRows}
                </p>
              )}
          </div>
        ))}
      </div>
    </section>
  );
}