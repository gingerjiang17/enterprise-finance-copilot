import type { KpiDisplay } from "@/lib/kpi";

type KpiCardsProps = {
  metrics: KpiDisplay;
};

const KPI_ITEMS: { key: keyof KpiDisplay; label: string }[] = [
  { key: "revenue", label: "Revenue" },
  { key: "grossProfit", label: "Gross Profit" },
  { key: "grossMargin", label: "Gross Margin" },
  { key: "netProfit", label: "Net Profit" },
];

export default function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {KPI_ITEMS.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl bg-white p-6 text-left shadow-lg shadow-zinc-900/5"
        >
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
            {metrics[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
