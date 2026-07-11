"use client";

import type { VarianceDriverResult } from "@/lib/varianceDrivers";

import {
  generateAiFinanceNarrative,
} from "@/lib/aiFinanceNarrative";


type Props = {
  rows: Record<string, unknown>[];
  sheetType?: string;
  varianceDrivers?: VarianceDriverResult;
};



function InsightList({
  title,
  description,
  items,
  variant,
}: {
  title: string;
  description: string;
  items: string[];
  variant: "finding" | "risk" | "action";
}) {

  const markerClass =
    variant === "finding"
      ? "bg-blue-500"
      : variant === "risk"
        ? "bg-red-500"
        : "bg-emerald-500";


  return (
    <div className="rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-200/70">

      <div className="mb-4">

        <h3 className="text-sm font-semibold text-zinc-900">
          {title}
        </h3>


        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>

      </div>



      {items.length > 0 ? (

        <ul className="space-y-3">

          {items.map((item, index) => (

            <li
              key={`${title}-${index}`}
              className="flex gap-3"
            >

              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${markerClass}`}
              />


              <p className="text-sm leading-6 text-zinc-600">
                {item}
              </p>

            </li>

          ))}

        </ul>


      ) : (

        <p className="text-sm leading-6 text-zinc-500">
          当前暂无相关分析结果。
        </p>

      )}

    </div>
  );
}





export default function AiFinanceNarrative({
  rows,
  sheetType,
  varianceDrivers,
}: Props) {


  const narrative =
    generateAiFinanceNarrative(
      rows,
      sheetType,
      varianceDrivers
    );



  return (

    <section className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200/70">


      {/* Header */}

      <div className="mb-6">





        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">

          Management Commentary

        </h2>



        <p className="mt-2 max-w-5xl text-sm leading-6 text-zinc-500">

          基于上传财务数据生成管理层视角分析，包含关键发现、风险提示以及后续行动建议。

        </p>


      </div>





      {/* Executive Summary */}

      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-5 ring-1 ring-blue-100">


        <div className="mb-3 flex items-center">


          <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white">

            Management Perspective

          </span>


        </div>



        <p className="text-sm leading-7 text-zinc-700">

          {narrative.executiveSummary}

        </p>



      </div>





      {/* Insights */}

      <div className="mt-5 grid gap-5 lg:grid-cols-3">


        <InsightList

          title="Key Findings"

          description="从上传数据中识别出的主要经营表现信号。"

          items={
            narrative.keyFindings
          }

          variant="finding"

        />



        <InsightList

          title="Risk Flags"

          description="可能需要管理层进一步关注的潜在风险事项。"

          items={
            narrative.riskFlags
          }

          variant="risk"

        />



        <InsightList

          title="Recommended Actions"

          description="针对财务审核提出的后续行动建议。"

          items={
            narrative.recommendedActions
          }

          variant="action"

        />


      </div>



    </section>

  );
}