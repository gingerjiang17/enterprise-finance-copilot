import type { Row } from "@/lib/excel";

type PreviewTableProps = {
  rows: Row[];
};

export default function PreviewTable({ rows }: PreviewTableProps) {
  if (rows.length === 0) return null;

  const columns = Object.keys(rows[0]);

  return (
    <div className="mt-10 w-full overflow-hidden rounded-2xl bg-white text-left shadow-lg shadow-zinc-900/5">
      <div className="border-b border-zinc-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">
          Preview (first 10 rows)
        </h2>
      </div>
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
    </div>
  );
}
