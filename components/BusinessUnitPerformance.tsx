import { analyzeBusinessUnitPerformance } from "../lib/businessUnit";

type BusinessUnitPerformanceProps = {
  rows: Record<string, unknown>[];
};

function formatCompactNumber(value: number) {
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

export default function BusinessUnitPerformance({
  rows,
}: BusinessUnitPerformanceProps) {
  const result = analyzeBusinessUnitPerformance(rows);

  if (!result.hasData) {
    return (
        <section className="mt-6 w-full max-w-6xl rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-left shadow-sm">
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Unit Performance
          </h2>
          <p className="text-sm text-slate-500">
            Analyze revenue, gross profit, gross margin, and revenue share by
            business unit.
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">
            Business Unit Performance is not available for this sheet.
          </p>

          <p className="mt-2">
            Missing required columns:{" "}
            <span className="font-medium">
              {result.missingColumns.join(", ")}
            </span>
          </p>

          <p className="mt-1">
            Please select a sheet that contains business unit level financial
            data.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-slate-900">
          Business Unit Performance
        </h2>
        <p className="text-sm text-slate-500">
        按业务单元分析收入贡献及盈利能力。
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Business Unit</th>
              <th className="px-3 py-2 text-right">Revenue</th>
              <th className="px-3 py-2 text-right">Gross Profit</th>
              <th className="px-3 py-2 text-right">Gross Margin</th>
              <th className="px-3 py-2 text-right">Revenue Share</th>
            </tr>
          </thead>

          <tbody>
            {result.items.map((item) => (
              <tr
                key={item.businessUnit}
                className="rounded-xl bg-slate-50 text-slate-800"
              >
                <td className="rounded-l-xl px-3 py-3 font-medium">
                  {item.businessUnit}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCompactNumber(item.revenue)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCompactNumber(item.grossProfit)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatPercent(item.grossMargin)}
                </td>
                <td className="rounded-r-xl px-3 py-3 text-right">
                  {formatPercent(item.revenueShare)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </section>
  );
}