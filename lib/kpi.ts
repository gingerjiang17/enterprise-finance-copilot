import { formatCurrency, formatPercent } from "./format";
import type { Row } from "./excel";
import {
  COGS_ALIASES,
  findColumn,
  getGrossProfitForRows,
  GROSS_PROFIT_ALIASES,
  NET_PROFIT_ALIASES,
  REVENUE_ALIASES,
  sumColumn,
} from "./columns";

export type KpiDisplay = {
  revenue: string;
  grossProfit: string;
  grossMargin: string;
  netProfit: string;
};

export function calculateKpis(rows: Row[]): KpiDisplay {
  const revenueColumn = findColumn(rows, REVENUE_ALIASES);
  const grossProfitColumn = findColumn(rows, GROSS_PROFIT_ALIASES);
  const cogsColumn = findColumn(rows, COGS_ALIASES);
  const netProfitColumn = findColumn(rows, NET_PROFIT_ALIASES);

  const revenue =
    revenueColumn !== null ? sumColumn(rows, revenueColumn) : null;

  const grossProfit = getGrossProfitForRows(
    rows,
    revenueColumn,
    grossProfitColumn,
    cogsColumn,
  );

  let grossMargin: number | null = null;
  if (grossProfit !== null && revenue !== null && revenue !== 0) {
    grossMargin = grossProfit / revenue;
  }

  const netProfit =
    netProfitColumn !== null ? sumColumn(rows, netProfitColumn) : null;

  return {
    revenue: formatCurrency(revenue),
    grossProfit: formatCurrency(grossProfit),
    grossMargin: formatPercent(grossMargin),
    netProfit: formatCurrency(netProfit),
  };
}
