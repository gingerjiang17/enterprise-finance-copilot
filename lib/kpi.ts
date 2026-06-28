import { formatCurrency, formatPercent } from "./format";
import type { Row } from "./excel";

export type KpiDisplay = {
  revenue: string;
  grossProfit: string;
  grossMargin: string;
  netProfit: string;
};

const REVENUE_ALIASES = [
  "revenue",
  "total revenue",
  "sales",
  "net sales",
  "total sales",
];

const GROSS_PROFIT_ALIASES = ["gross profit"];

const COGS_ALIASES = [
  "cogs",
  "cost of goods sold",
  "cost of sales",
  "cost of goods",
];

const NET_PROFIT_ALIASES = ["net profit", "net income"];

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/[_-]+/g, " ");
}

function findColumn(rows: Row[], aliases: string[]): string | null {
  if (rows.length === 0) return null;

  const normalizedAliases = aliases.map(normalizeKey);
  const keys = Object.keys(rows[0]);

  for (const key of keys) {
    if (normalizedAliases.includes(normalizeKey(key))) {
      return key;
    }
  }

  return null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/[$,\s]/g, "");
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return null;
}

function sumColumn(rows: Row[], column: string): number {
  return rows.reduce((total, row) => {
    const value = parseNumber(row[column]);
    return value !== null ? total + value : total;
  }, 0);
}

export function calculateKpis(rows: Row[]): KpiDisplay {
  const revenueColumn = findColumn(rows, REVENUE_ALIASES);
  const grossProfitColumn = findColumn(rows, GROSS_PROFIT_ALIASES);
  const cogsColumn = findColumn(rows, COGS_ALIASES);
  const netProfitColumn = findColumn(rows, NET_PROFIT_ALIASES);

  const revenue =
    revenueColumn !== null ? sumColumn(rows, revenueColumn) : null;

  let grossProfit: number | null = null;
  if (grossProfitColumn !== null) {
    grossProfit = sumColumn(rows, grossProfitColumn);
  } else if (revenueColumn !== null && cogsColumn !== null) {
    grossProfit = sumColumn(rows, revenueColumn) - sumColumn(rows, cogsColumn);
  }

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
