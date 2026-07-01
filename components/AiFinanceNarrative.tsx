"use client";

import type { FinanceNarrativeResult } from "@/lib/aiFinanceNarrative";

type Props = {
  rows: any[];
  sheetType?: string;
};

export default function AiFinanceNarrative({ rows }: Props) {
  return (
    <section className="mt-8 w-full rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-zinc-200/70">
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-500">
          AI Executive Summary
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          Management Commentary
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Rule-based CFO-style commentary generated from uploaded finance data.
        </p>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500">
        AI narrative is generated from Budget, Revenue, Cost and Margin signals
        detected in the dataset.
      </div>
    </section>
  );
}