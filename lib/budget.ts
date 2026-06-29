import type { Row } from "./excel";

export type BudgetStatus =
  | "favorable"
  | "unfavorable"
  | "on-target"
  | "no-data";

export type BudgetVsActualMetrics = {
  hasBudgetData: boolean;
  actual: number;
  budget: number;
  variance: number;
  variancePct: number | null;
  status: BudgetStatus;
  actualColumn?: string;
  budgetColumn?: string;
  message?: string;
};

const ACTUAL_REVENUE_ALIASES = [
  "Revenue",
  "Actual Revenue",
  "Sales",
  "Net Sales",
  "Total Revenue",
  "Actual Sales",
];

const BUDGET_REVENUE_ALIASES = [
  "Budget Revenue",
  "Revenue Budget",
  "Budget_Revenue",
  "Revenue_Budget",
  "Rev Budget",
  "Budget Rev",
  "Plan Revenue",
  "Revenue Plan",
  "Target Revenue",
  "Revenue Target",
  "FY Budget Revenue",
  "Budget",
];

function normalizeColumnName(name: string) {
  return name.toLowerCase().replace(/[\s_\-()]/g, "");
}

function findExactColumn(row: Row | undefined, aliases: string[]) {
  if (!row) return undefined;

  const columns = Object.keys(row);

  return columns.find((column) => {
    const normalizedColumn = normalizeColumnName(column);

    return aliases.some(
      (alias) => normalizeColumnName(alias) === normalizedColumn
    );
  });
}

function findRevenueFallbackColumn(row: Row | undefined) {
  if (!row) return undefined;

  return Object.keys(row).find((column) => {
    const normalized = normalizeColumnName(column);

    return (
      normalized.includes("revenue") &&
      !normalized.includes("budget") &&
      !normalized.includes("plan") &&
      !normalized.includes("target")
    );
  });
}

function findBudgetRevenueFallbackColumn(row: Row | undefined) {
  if (!row) return undefined;

  return Object.keys(row).find((column) => {
    const normalized = normalizeColumnName(column);

    const hasRevenue = normalized.includes("revenue");
    const hasBudgetLikeWord =
      normalized.includes("budget") ||
      normalized.includes("plan") ||
      normalized.includes("target");

    return hasRevenue && hasBudgetLikeWord;
  });
}

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  if (typeof value === "string") {
    const cleaned = value
      .replace(/,/g, "")
      .replace(/\$/g, "")
      .replace(/￥/g, "")
      .replace(/¥/g, "")
      .trim();

    if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
      const parsed = Number(cleaned.slice(1, -1));
      return Number.isFinite(parsed) ? -parsed : 0;
    }

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function sumColumn(rows: Row[], columnName: string) {
  return rows.reduce((sum, row) => {
    return sum + toNumber(row[columnName]);
  }, 0);
}

function getStatus(variance: number): BudgetStatus {
  if (variance > 0) return "favorable";
  if (variance < 0) return "unfavorable";
  return "on-target";
}

export function calculateBudgetVsActual(
  rows: Row[]
): BudgetVsActualMetrics {
  if (rows.length === 0) {
    return {
      hasBudgetData: false,
      actual: 0,
      budget: 0,
      variance: 0,
      variancePct: null,
      status: "no-data",
      message: "No data available for this sheet.",
    };
  }

  const firstRow = rows[0];

  const actualColumn =
    findExactColumn(firstRow, ACTUAL_REVENUE_ALIASES) ??
    findRevenueFallbackColumn(firstRow);

  const budgetColumn =
    findExactColumn(firstRow, BUDGET_REVENUE_ALIASES) ??
    findBudgetRevenueFallbackColumn(firstRow);

  if (!actualColumn) {
    return {
      hasBudgetData: false,
      actual: 0,
      budget: 0,
      variance: 0,
      variancePct: null,
      status: "no-data",
      message:
        "No actual revenue column found. Please include a column such as Revenue, Actual Revenue, Sales, or Net Sales.",
    };
  }

  const actual = sumColumn(rows, actualColumn);

  if (!budgetColumn) {
    return {
      hasBudgetData: false,
      actual,
      budget: 0,
      variance: 0,
      variancePct: null,
      status: "no-data",
      actualColumn,
      message:
        "No budget revenue column found. Please include a column such as Budget Revenue, Revenue Budget, Plan Revenue, or Target Revenue.",
    };
  }

  const budget = sumColumn(rows, budgetColumn);
  const variance = actual - budget;
  const variancePct = budget !== 0 ? (variance / budget) * 100 : null;

  return {
    hasBudgetData: true,
    actual,
    budget,
    variance,
    variancePct,
    status: getStatus(variance),
    actualColumn,
    budgetColumn,
  };
}