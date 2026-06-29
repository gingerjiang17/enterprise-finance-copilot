import { analyzeGlActuals } from "@/lib/glActuals";

type GlActualsSummaryProps = {
  rows: Record<string, unknown>[];
};

function formatCompactNumber(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function getVarianceClassName(value: number) {
  if (value > 0) {
    return "text-emerald-600";
  }

  if (value < 0) {
    return "text-rose-600";
  }

  return "text-slate-700";
}

export default function GlActualsSummary({ rows }: GlActualsSummaryProps) {
  const result = analyzeGlActuals(rows);

  if (!result.hasData) {
    return (
      <section className="mt-6 w-full max-w-6xl rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-left shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            GL Actuals Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Summarize actuals by P&L line and compare against budget, forecast,
            and prior year.
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">
            GL Actuals Summary is not available for this sheet.
          </p>
          <p className="mt-2">
            Missing required columns:{" "}
            <span className="font-medium">
              {result.missingColumns.join(", ")}
            </span>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          GL Actuals Summary
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Summarize actuals by P&L line and compare against budget, forecast,
          and prior year.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">P&L Line</th>
              <th className="px-3 py-2 text-right">Actual</th>
              <th className="px-3 py-2 text-right">Budget</th>
              <th className="px-3 py-2 text-right">Variance</th>
              <th className="px-3 py-2 text-right">Variance %</th>
              <th className="px-3 py-2 text-right">Forecast</th>
              <th className="px-3 py-2 text-right">Prior Year</th>
            </tr>
          </thead>

          <tbody>
            {result.items.map((item) => (
              <tr key={item.line} className="rounded-xl bg-slate-50 text-slate-800">
                <td className="rounded-l-xl px-3 py-3 font-medium">
                  {item.line}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCompactNumber(item.actual)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCompactNumber(item.budget)}
                </td>
                <td
                  className={`px-3 py-3 text-right font-medium ${getVarianceClassName(
                    item.variance
                  )}`}
                >
                  {formatCompactNumber(item.variance)}
                </td>
                <td
                  className={`px-3 py-3 text-right font-medium ${getVarianceClassName(
                    item.variance
                  )}`}
                >
                  {formatPercent(item.variancePercent)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCompactNumber(item.forecast)}
                </td>
                <td className="rounded-r-xl px-3 py-3 text-right">
                  {formatCompactNumber(item.priorYear)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        <span>Column mapping: </span>
        <span>P&L Line = {result.columns.line}</span>
        <span className="mx-2">·</span>
        <span>Actual = {result.columns.actual}</span>
        <span className="mx-2">·</span>
        <span>Budget = {result.columns.budget}</span>
        {result.columns.forecast && (
          <>
            <span className="mx-2">·</span>
            <span>Forecast = {result.columns.forecast}</span>
          </>
        )}
        {result.columns.priorYear && (
          <>
            <span className="mx-2">·</span>
            <span>Prior Year = {result.columns.priorYear}</span>
          </>
        )}
      </div>
    </section>
  );
}