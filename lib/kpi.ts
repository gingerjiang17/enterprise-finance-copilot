import { formatCurrency, formatPercent } from "./format";
import type { Row } from "./excel";
import { calculateFinanceMetrics } from "./financeMetrics";

export type KpiDisplay = {
  revenue: string;
  grossProfit: string;
  grossMargin: string;
  netProfit: string;
};

export function calculateKpis(rows: Row[]): KpiDisplay {
  const metrics = calculateFinanceMetrics(rows);

  return {
    revenue: formatCurrency(metrics.revenue),
    grossProfit: formatCurrency(metrics.grossProfit),
    grossMargin: formatPercent(metrics.grossMargin),
    netProfit: formatCurrency(metrics.netProfit),
  };
}