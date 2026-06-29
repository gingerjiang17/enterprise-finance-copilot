import type { Row } from "./excel";

export type BudgetVsActualMetrics = {
  hasBudgetData: boolean;
  actual: number;
  budget: number;
  variance: number;
  variancePct: number | null;
  actualColumn?: string;
  budgetColumn?: string;
  message?: string;
};

const ACTUAL_REVENUE_ALIASES = [
  "Revenue",
  "Actual Revenue",
  "Sales",
  "Net Sales",
  "Actual",
];

const BUDGET_REVENUE_ALIASES = [
  "Budget Revenue",
  "Revenue Budget",
  "Budget",
  "Budget_Revenue",
  "Revenue_Budget",
  "Rev Budget",
  "FY Budget",
];

function normalizeColumnName(name: string) {
  return name.toLowerCase().replace(/[\s_\-()]/g, "");
}

function findColumn(row: Row | undefined, aliases: string[]) {
  if (!row) return undefined;

  const columns = Object.keys(row);

  return columns.find((column) => {
    const normalizedColumn = normalizeColumnName(column);

    return aliases.some(
      (alias) => normalizeColumnName(alias) === normalizedColumn
    );
  });
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
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
      message: "No data available for this sheet.",
    };
  }

  const firstRow = rows[0];

  const actualColumn = findColumn(firstRow, ACTUAL_REVENUE_ALIASES);
  const budgetColumn = findColumn(firstRow, BUDGET_REVENUE_ALIASES);

  if (!actualColumn) {
    return {
      hasBudgetData: false,
      actual: 0,
      budget: 0,
      variance: 0,
      variancePct: null,
      message: "No Actual Revenue column found in this worksheet.",
    };
  }

  if (!budgetColumn) {
    return {
      hasBudgetData: false,
      actual: sumColumn(rows, actualColumn),
      budget: 0,
      variance: 0,
      variancePct: null,
      actualColumn,
      message: "No Budget data available for this sheet.",
    };
  }

  const actual = sumColumn(rows, actualColumn);
  const budget = sumColumn(rows, budgetColumn);
  const variance = actual - budget;
  const variancePct = budget !== 0 ? (variance / budget) * 100 : null;

  return {
    hasBudgetData: true,
    actual,
    budget,
    variance,
    variancePct,
    actualColumn,
    budgetColumn,
  };
}