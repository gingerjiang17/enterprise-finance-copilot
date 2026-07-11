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

export type FinanceMetrics = {
  revenue: number | null;
  grossProfit: number | null;
  grossMargin: number | null;
  netProfit: number | null;
  revenueColumn: string | null;
  grossProfitColumn: string | null;
  cogsColumn: string | null;
  netProfitColumn: string | null;
};

export function calculateFinanceMetrics(rows: Row[]): FinanceMetrics {
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
    cogsColumn
  );

  const grossMargin =
    grossProfit !== null && revenue !== null && revenue !== 0
      ? grossProfit / revenue
      : null;

  const netProfit =
    netProfitColumn !== null ? sumColumn(rows, netProfitColumn) : null;

  return {
    revenue,
    grossProfit,
    grossMargin,
    netProfit,
    revenueColumn,
    grossProfitColumn,
    cogsColumn,
    netProfitColumn,
  };
}