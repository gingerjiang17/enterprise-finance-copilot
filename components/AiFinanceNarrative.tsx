import {
    FinanceNarrativeResult,
    generateAiFinanceNarrative,
  } from "@/lib/aiFinanceNarrative"
  
  type AiFinanceNarrativeProps = {
    rows: Record<string, unknown>[]
    sheetType?: string
  }
  
  function ConfidenceBadge({
    confidenceLevel,
  }: {
    confidenceLevel: FinanceNarrativeResult["confidenceLevel"]
  }) {
    const className =
      confidenceLevel === "High"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : confidenceLevel === "Medium"
          ? "bg-amber-100 text-amber-700 border-amber-200"
          : "bg-slate-100 text-slate-600 border-slate-200"
  
    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}
      >
        {confidenceLevel} Confidence
      </span>
    )
  }
  
  function NarrativeSection({
    title,
    items,
    emptyText,
  }: {
    title: string
    items: string[]
    emptyText: string
  }) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
  
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={`${title}-${index}`}
                className="text-sm leading-6 text-slate-600"
              >
                <span className="mr-2 text-slate-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">{emptyText}</p>
        )}
      </div>
    )
  }
  
  export default function AiFinanceNarrative({
    rows,
    sheetType,
  }: AiFinanceNarrativeProps) {
    const narrative = generateAiFinanceNarrative(rows, sheetType)
  
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              AI Finance Narrative
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Management Commentary
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Rule-based financial commentary generated from uploaded finance data.
            </p>
          </div>
  
          <ConfidenceBadge confidenceLevel={narrative.confidenceLevel} />
        </div>
  
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Executive Summary
          </h3>
          <p className="text-sm leading-6 text-slate-600">
            {narrative.executiveSummary}
          </p>
        </div>
  
        <div className="grid gap-4 lg:grid-cols-3">
          <NarrativeSection
            title="Key Findings"
            items={narrative.keyFindings}
            emptyText="No key finding was generated from the current dataset."
          />
  
          <NarrativeSection
            title="Risk Flags"
            items={narrative.riskFlags}
            emptyText="No major risk flag was detected."
          />
  
          <NarrativeSection
            title="Recommended Actions"
            items={narrative.recommendedActions}
            emptyText="No recommended action was generated."
          />
        </div>
      </section>
    )
  }