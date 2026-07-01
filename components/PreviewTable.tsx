"use client";

import { useState } from "react";
import type { Row } from "@/lib/excel";

type PreviewTableProps = {
  rows: Row[];
};

export default function PreviewTable({ rows }: PreviewTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (rows.length === 0) return null;

  const columns = Object.keys(rows[0]);

  return (
    <section className="mt-10 w-full rounded-2xl bg-white text-left shadow-lg shadow-zinc-900/5 ring-1 ring-zinc-200/70">
      <div className="flex flex-col gap-3 border-b border-zinc-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Raw Data Preview
          </p>
          <h2 className="mt-1 text-sm font-semibold text-zinc-900">
            Preview first {rows.length} rows
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Collapsed by default to keep the dashboard focused on executive
            insights.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
          className="inline-flex w-fit items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          {isExpanded ? "Hide Preview Table" : "Show Preview Table"}
        </button>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-6 py-3 font-medium text-zinc-500"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-zinc-50 last:border-b-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="whitespace-nowrap px-6 py-3 text-zinc-700"
                    >
                      {row[column] != null ? String(row[column]) : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}