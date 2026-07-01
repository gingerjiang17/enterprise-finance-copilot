"use client";

import type { Row } from "@/lib/excel";

type Props = {
  rows: Row[];
};

export default function ExecutiveInsights({ rows }: Props) {
  return (
    <section className="mt-6 w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-zinc-200/70">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        Quick Insights
      </p>

      <h3 className="mt-1 text-lg font-semibold text-zinc-900">
        Key Highlights
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        System detected {rows.length} rows of financial data ready for analysis.
      </p>
    </section>
  );
}