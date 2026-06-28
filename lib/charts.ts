import type { Row } from "./excel";
import {
  COGS_ALIASES,
  findColumn,
  getGrossProfitForRows,
  GROSS_PROFIT_ALIASES,
  PERIOD_ALIASES,
  REVENUE_ALIASES,
  sumColumn,
} from "./columns";

export type PeriodTrendPoint = {
  period: string;
  revenue: number;
  grossMargin: number | null;
};

export type TrendChartData = {
  hasPeriod: boolean;
  points: PeriodTrendPoint[];
};

function groupRowsByPeriod(
  rows: Row[],
  periodColumn: string,
): Map<string, Row[]> {
  const groups = new Map<string, Row[]>();

  for (const row of rows) {
    const rawPeriod = row[periodColumn];
    if (rawPeriod == null || String(rawPeriod).trim() === "") continue;

    const period = String(rawPeriod).trim();
    const group = groups.get(period) ?? [];
    group.push(row);
    groups.set(period, group);
  }

  return groups;
}

function preservePeriodOrder(rows: Row[], periodColumn: string): string[] {
  const seen = new Set<string>();
  const order: string[] = [];

  for (const row of rows) {
    const rawPeriod = row[periodColumn];
    if (rawPeriod == null || String(rawPeriod).trim() === "") continue;

    const period = String(rawPeriod).trim();
    if (!seen.has(period)) {
      seen.add(period);
      order.push(period);
    }
  }

  return order;
}

export function buildTrendChartData(rows: Row[]): TrendChartData {
  const periodColumn = findColumn(rows, PERIOD_ALIASES);
  if (!periodColumn) {
    return { hasPeriod: false, points: [] };
  }

  const revenueColumn = findColumn(rows, REVENUE_ALIASES);
  const grossProfitColumn = findColumn(rows, GROSS_PROFIT_ALIASES);
  const cogsColumn = findColumn(rows, COGS_ALIASES);

  const groups = groupRowsByPeriod(rows, periodColumn);
  const periodOrder = preservePeriodOrder(rows, periodColumn);

  const points = periodOrder.map((period) => {
    const periodRows = groups.get(period) ?? [];
    const revenue =
      revenueColumn !== null ? sumColumn(periodRows, revenueColumn) : 0;

    const grossProfit = getGrossProfitForRows(
      periodRows,
      revenueColumn,
      grossProfitColumn,
      cogsColumn,
    );

    const grossMargin =
      grossProfit !== null && revenue !== 0 ? grossProfit / revenue : null;

    return { period, revenue, grossMargin };
  });

  return { hasPeriod: true, points };
}
