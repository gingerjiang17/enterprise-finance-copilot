"use client";

import { analyzeGlReviewAgent } from "@/lib/aiGlReviewAgent";

type Props = {
  rows: Record<string, unknown>[];
};

export default function AiGlReviewAgent({ rows }: Props) {
  const result = analyzeGlReviewAgent(rows);

  const confidenceText = {
    High: "高",
    Medium: "中",
    Low: "低",
  };

  return (
    <section className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200/70">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          GL Review Insights
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          基于 GL Actuals 数据进行智能审核，识别异常波动、预算偏差及潜在会计风险。
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-medium text-slate-500">
            Review Status
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {result.reviewStatus}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-medium text-slate-500">
            Confidence Level
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {confidenceText[result.confidenceLevel]}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-6">
          <p className="text-sm font-medium text-slate-500">
            Review Findings
          </p>

          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {result.keyFindings.length}
          </p>
        </div>
      </div>

      {/* Findings */}
      {result.keyFindings.length > 0 ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {result.keyFindings.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-200/70"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Review Finding {index + 1}
                  </h3>

                  <span
                    className={`
                      shrink-0
                      rounded-full
                      px-2.5
                      py-1
                      text-xs
                      font-medium
                      ${
                        item.severity === "Critical"
                          ? "bg-red-50 text-red-700"
                          : item.severity === "High"
                          ? "bg-orange-50 text-orange-700"
                          : item.severity === "Medium"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-green-50 text-green-700"
                      }
                    `}
                  >
                    {item.severity}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm leading-6 text-zinc-600">
                  <span className="font-semibold text-zinc-900">
                    Finding:
                  </span>{" "}
                  {item.finding}
                </p>

                <p className="text-sm leading-6 text-zinc-600">
                  <span className="font-semibold text-zinc-900">
                    Risk:
                  </span>{" "}
                  {item.risk}
                </p>

                <p className="text-sm leading-6 text-zinc-600">
                  <span className="font-semibold text-zinc-900">
                    Recommended Action:
                  </span>{" "}
                  {item.recommendedAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">
            Review Completed
          </p>

          <p className="mt-2 text-sm leading-6 text-emerald-700">
            当前 GL 数据未发现明显异常项目。
          </p>

          <p className="mt-1 text-sm leading-6 text-emerald-700">
            建议继续执行日常月结检查和账务核对流程。
          </p>
        </div>
      )}
    </section>
  );
}