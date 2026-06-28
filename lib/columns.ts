import type { Row } from "./excel";

export const REVENUE_ALIASES = [
  "revenue",
  "total revenue",
  "sales",
  "net sales",
  "total sales",
];

export const GROSS_PROFIT_ALIASES = ["gross profit"];

export const COGS_ALIASES = [
  "cogs",
  "cost of goods sold",
  "cost of sales",
  "cost of goods",
];

export const NET_PROFIT_ALIASES = ["net profit", "net income"];

export const PERIOD_ALIASES = [
  "period",
  "date",
  "month",
  "quarter",
  "year",
  "time period",
  "fiscal period",
];

export function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/[_-]+/g, " ");
}

export function findColumn(rows: Row[], aliases: string[]): string | null {
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

export function parseNumber(value: unknown): number | null {
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

export function sumColumn(rows: Row[], column: string): number {
  return rows.reduce((total, row) => {
    const value = parseNumber(row[column]);
    return value !== null ? total + value : total;
  }, 0);
}

export function getGrossProfitForRows(
  rows: Row[],
  revenueColumn: string | null,
  grossProfitColumn: string | null,
  cogsColumn: string | null,
): number | null {
  if (grossProfitColumn !== null) {
    return sumColumn(rows, grossProfitColumn);
  }

  if (revenueColumn !== null && cogsColumn !== null) {
    return sumColumn(rows, revenueColumn) - sumColumn(rows, cogsColumn);
  }

  return null;
}
