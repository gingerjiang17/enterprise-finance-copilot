"use client";

import {
  generateAiFinanceNarrative,
  type FinanceNarrativeResult,
} from "@/lib/aiFinanceNarrative";

type Props = {
  rows: Record<string, unknown>[];
  sheetType?: string;
};

function ConfidenceBadge({
  confidenceLevel,
}: {
  confidenceLevel: FinanceNarrativeResult["confidenceLevel"];
}) {
  const className =
    confidenceLevel === "High"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : confidenceLevel === "Medium"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-zinc-100 text-zinc-600 ring-zinc-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      {confidenceLevel} Confidence
    </span>
  );
}

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
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-3">
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${markerClass}`}
              />
              <p className="text-sm leading-6 text-zinc-600">{item}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-6 text-zinc-500">
          No insight was generated for this section.
        </p>
      )}
    </div>
  );
}

export default function AiFinanceNarrative({ rows, sheetType }: Props) {
  const narrative = generateAiFinanceNarrative(rows, sheetType);

  return (
    <section className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200/70">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            AI Executive Summary
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
            Management Commentary
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Rule-based CFO-style commentary generated from uploaded finance
            data, including key findings, risk flags, and recommended actions.
          </p>
        </div>

        <ConfidenceBadge confidenceLevel={narrative.confidenceLevel} />
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-5 ring-1 ring-blue-100">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white">
            CFO View
          </span>
          <span className="text-xs font-medium text-zinc-400">
            Executive Summary
          </span>
        </div>

        <p className="text-sm leading-7 text-zinc-700">
          {narrative.executiveSummary}
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <InsightList
          title="Key Findings"
          description="Main performance signals detected from the uploaded dataset."
          items={narrative.keyFindings}
          variant="finding"
        />

        <InsightList
          title="Risk Flags"
          description="Potential issues that may require management attention."
          items={narrative.riskFlags}
          variant="risk"
        />

        <InsightList
          title="Recommended Actions"
          description="Suggested follow-up actions for finance review."
          items={narrative.recommendedActions}
          variant="action"
        />
      </div>
    </section>
  );
}