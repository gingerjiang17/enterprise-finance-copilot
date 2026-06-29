import { analyzeBusinessUnitPerformance } from "./businessUnit";

type Row = Record<string, unknown>;

export type ExecutiveInsightTone = "positive" | "warning" | "neutral";

export type ExecutiveInsight = {
  tone: ExecutiveInsightTone;
  title: string;
  description: string;
};

export type ExecutiveInsightsResult = {
  hasData: boolean;
  insights: ExecutiveInsight[];
  message?: string;
};

const REVENUE_COLUMNS = [
  "Revenue",
  "Sales",
  "Net Sales",
  "Actual Revenue",
];

const BUDGET_REVENUE_COLUMNS = [
  "Budget Revenue",
  "Revenue Budget",
  "Budgeted Revenue",
  "Budget Sales",
];

const GROSS_PROFIT_COLUMNS = [
  "Gross Profit",
  "GrossProfit",
  "GP",
  "Actual Gross Profit",
];

function normalizeColumnName(columnName: string) {
  return columnName
    .toLowerCase()
    .replace(/[\s_\-/.]/g, "");
}

function findColumn(rows: Row[], candidates: string[]) {
  const firstRow = rows.find((row) => row && typeof row === "object");

  if (!firstRow) {
    return undefined;
  }

  const columns = Object.keys(firstRow);

  return columns.find((column) => {
    const normalizedColumn = normalizeColumnName(column);

    return candidates.some(
      (candidate) => normalizedColumn === normalizeColumnName(candidate)
    );
  });
}

function parseNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  const isNegativeByParentheses =
    trimmedValue.startsWith("(") && trimmedValue.endsWith(")");

  const cleanedValue = trimmedValue
    .replace(/[,$%\s]/g, "")
    .replace(/[()]/g, "");

  const parsedValue = Number(cleanedValue);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return isNegativeByParentheses ? -parsedValue : parsedValue;
}

function sumColumn(rows: Row[], columnName: string) {
  return rows.reduce((sum, row) => sum + parseNumber(row[columnName]), 0);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatPercent(value: number | null) {
    if (value === null) {
      return "N/A";
    }
  
    return `${(value * 100).toFixed(1)}%`;
  }

export function generateExecutiveInsights(
  rows: Row[]
): ExecutiveInsightsResult {
  if (!rows.length) {
    return {
      hasData: false,
      insights: [],
      message: "Upload a financial dataset to generate executive insights.",
    };
  }

  const revenueColumn = findColumn(rows, REVENUE_COLUMNS);
  const budgetRevenueColumn = findColumn(rows, BUDGET_REVENUE_COLUMNS);
  const grossProfitColumn = findColumn(rows, GROSS_PROFIT_COLUMNS);

  const insights: ExecutiveInsight[] = [];

  if (revenueColumn) {
    const totalRevenue = sumColumn(rows, revenueColumn);

    insights.push({
      tone: "neutral",
      title: "Revenue overview",
      description: `Total revenue reached ${formatCompactNumber(
        totalRevenue
      )} for the selected sheet.`,
    });

    if (budgetRevenueColumn) {
      const totalBudgetRevenue = sumColumn(rows, budgetRevenueColumn);
      const variance = totalRevenue - totalBudgetRevenue;
      const variancePercent =
        totalBudgetRevenue === 0 ? 0 : variance / totalBudgetRevenue;

      insights.push({
        tone: variance >= 0 ? "positive" : "warning",
        title:
          variance >= 0
            ? "Revenue performance is favorable"
            : "Revenue performance is below budget",
        description: `Actual revenue ${
          variance >= 0 ? "exceeded" : "missed"
        } budget by ${formatCompactNumber(
          Math.abs(variance)
        )}, or ${formatPercent(Math.abs(variancePercent))}.`,
      });
    }
  }

  if (revenueColumn && grossProfitColumn) {
    const totalRevenue = sumColumn(rows, revenueColumn);
    const totalGrossProfit = sumColumn(rows, grossProfitColumn);

    if (totalRevenue !== 0) {
      const grossMargin = totalGrossProfit / totalRevenue;

      insights.push({
        tone: grossMargin >= 0.4 ? "positive" : "warning",
        title: "Gross margin performance",
        description: `Gross margin was ${formatPercent(
          grossMargin
        )}, indicating ${
          grossMargin >= 0.4
            ? "healthy profitability for the selected dataset"
            : "potential margin pressure that may require review"
        }.`,
      });
    }
  }

  const businessUnitPerformance = analyzeBusinessUnitPerformance(rows);

  if (businessUnitPerformance.hasData) {
    const topBusinessUnit = businessUnitPerformance.items[0];

    if (topBusinessUnit) {
      insights.push({
        tone: "neutral",
        title: "Top business unit",
        description: `${topBusinessUnit.businessUnit} was the largest revenue contributor, generating ${formatCompactNumber(
          topBusinessUnit.revenue
        )} and representing ${formatPercent(
          topBusinessUnit.revenueShare
        )} of total revenue.`,
      });
    }

    const unitsWithMargin = businessUnitPerformance.items.filter(
      (item) => item.grossMargin !== null
    );

    if (unitsWithMargin.length >= 2) {
      const highestMarginUnit = [...unitsWithMargin].sort(
        (a, b) => (b.grossMargin ?? 0) - (a.grossMargin ?? 0)
      )[0];

      const lowestMarginUnit = [...unitsWithMargin].sort(
        (a, b) => (a.grossMargin ?? 0) - (b.grossMargin ?? 0)
      )[0];

      if (highestMarginUnit && lowestMarginUnit) {
        insights.push({
          tone: "neutral",
          title: "Business unit margin comparison",
          description: `${
            highestMarginUnit.businessUnit
          } had the highest gross margin at ${formatPercent(
            highestMarginUnit.grossMargin
          )}, while ${
            lowestMarginUnit.businessUnit
          } had the lowest at ${formatPercent(lowestMarginUnit.grossMargin)}.`,
        });
      }
    }
  }

  if (!insights.length) {
    return {
      hasData: false,
      insights: [],
      message:
        "Executive insights are not available for this sheet because the required financial columns were not found.",
    };
  }

  return {
    hasData: true,
    insights: insights.slice(0, 5),
  };
}