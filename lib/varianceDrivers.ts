export type VarianceDirection = "Favorable" | "Unfavorable" | "Neutral";

export type VarianceSeverity = "High" | "Medium" | "Low";

export type VarianceDriver = {
  label: string;
  actual: number | null;
  budget: number | null;
  variance: number;
  variancePct: number | null;
  direction: VarianceDirection;
  severity: VarianceSeverity;
};

export type VarianceDriverResult = {
  hasVarianceData: boolean;
  actualField?: string;
  budgetField?: string;
  varianceField?: string;
  dimensionField?: string;
  topFavorable: VarianceDriver[];
  topUnfavorable: VarianceDriver[];
  managementAttention: string[];
  confidenceLevel: "High" | "Medium" | "Low";
};

const ACTUAL_PATTERNS = [
  "actual revenue",
  "actual sales",
  "actual amount",
  "actual",
  "actuals",
  "revenue",
  "sales",
  "current",
  "realized",
];

const BUDGET_PATTERNS = [
  "budget revenue",
  "budget sales",
  "budget amount",
  "budget",
  "plan",
  "target",
  "forecast",
];

const VARIANCE_PATTERNS = ["variance", "var", "diff", "difference"];

const DIMENSION_PATTERNS = [
  "business unit",
  "bu",
  "region",
  "department",
  "dept",
  "division",
  "account",
  "account name",
  "category",
  "line item",
  "item",
  "description",
];

const COST_PATTERNS = [
  "expense",
  "cost",
  "cogs",
  "opex",
  "salary",
  "payroll",
  "rent",
  "travel",
  "marketing",
  "admin",
  "sg&a",
  "sga",
];

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[_-]/g, " ").trim();
}

function keyMatches(key: string, patterns: string[]): boolean {
  const normalized = normalizeKey(key);

  return patterns.some((pattern) => {
    const normalizedPattern = normalizeKey(pattern);
    return (
      normalized === normalizedPattern || normalized.includes(normalizedPattern)
    );
  });
}

function getColumnNames(rows: Record<string, unknown>[]): string[] {
  const columns = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => columns.add(key));
  });

  return Array.from(columns);
}

function findFirstColumn(
  rows: Record<string, unknown>[],
  patterns: string[]
): string | undefined {
  return getColumnNames(rows).find((column) => keyMatches(column, patterns));
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.toLowerCase() === "n/a" || trimmed === "-") {
    return null;
  }

  const isNegativeByParentheses =
    trimmed.startsWith("(") && trimmed.endsWith(")");

  const cleaned = trimmed
    .replace(/[,$£€¥%]/g, "")
    .replace(/[()]/g, "")
    .replace(/\s/g, "");

  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return isNegativeByParentheses ? -parsed : parsed;
}

function getStringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function formatNumber(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toFixed(0);
}

function formatPct(value: number | null): string {
  if (value === null) {
    return "n/a";
  }

  return `${value.toFixed(1)}%`;
}

function inferIsCostRow(row: Record<string, unknown>): boolean {
  const text = Object.values(row)
    .map((value) => getStringValue(value))
    .filter((value): value is string => value !== null)
    .join(" ")
    .toLowerCase();

  return COST_PATTERNS.some((pattern) => text.includes(pattern));
}

function getDirection(
  variance: number,
  isCostRow: boolean
): VarianceDirection {
  if (variance === 0) {
    return "Neutral";
  }

  if (isCostRow) {
    return variance > 0 ? "Unfavorable" : "Favorable";
  }

  return variance > 0 ? "Favorable" : "Unfavorable";
}

function getSeverity(
  variancePct: number | null,
  variance: number
): VarianceSeverity {
  const absPct = variancePct === null ? null : Math.abs(variancePct);
  const absVariance = Math.abs(variance);

  if ((absPct !== null && absPct >= 10) || absVariance >= 100_000) {
    return "High";
  }

  if ((absPct !== null && absPct >= 5) || absVariance >= 25_000) {
    return "Medium";
  }

  return "Low";
}

function buildLabel(
  row: Record<string, unknown>,
  dimensionField: string | undefined,
  index: number
): string {
  if (dimensionField) {
    const dimensionValue = getStringValue(row[dimensionField]);

    if (dimensionValue) {
      return dimensionValue;
    }
  }

  return `Row ${index + 1}`;
}

function buildManagementAttention(
  topUnfavorable: VarianceDriver[],
  topFavorable: VarianceDriver[],
  actualField?: string,
  budgetField?: string,
  dimensionField?: string
): string[] {
  const attention: string[] = [];

  if (topUnfavorable.length > 0) {
    const largest = topUnfavorable[0];

    attention.push(
      `${largest.label} is the largest unfavorable driver, with a variance of approximately ${formatNumber(
        largest.variance
      )} (${formatPct(largest.variancePct)} vs budget).`
    );

    const highSeverityItems = topUnfavorable.filter(
      (driver) => driver.severity === "High"
    );

    if (highSeverityItems.length > 0) {
      attention.push(
        `${highSeverityItems.length} high-severity unfavorable variance item${
          highSeverityItems.length > 1 ? "s were" : " was"
        } detected and should be reviewed with the relevant business owners.`
      );
    }
  } else {
    attention.push(
      "No major unfavorable variance was detected by the rule-based variance engine."
    );
  }

  if (topFavorable.length > 0) {
    const largestFavorable = topFavorable[0];

    attention.push(
      `${largestFavorable.label} is the strongest favorable driver, contributing approximately ${formatNumber(
        largestFavorable.variance
      )} (${formatPct(largestFavorable.variancePct)} vs budget).`
    );
  }

  if (actualField && budgetField) {
    attention.push(
      `Review ${actualField} against ${budgetField} and separate structural variance from timing, mix, or one-off impacts.`
    );
  }

  if (dimensionField) {
    attention.push(
      `Variance drivers are grouped by ${dimensionField}, helping management identify which segment requires follow-up.`
    );
  }

  return attention;
}

function aggregateDriversByLabel(drivers: VarianceDriver[]): VarianceDriver[] {
  const groupedDrivers = new Map<
    string,
    {
      label: string;
      actual: number;
      budget: number;
      variance: number;
      hasActual: boolean;
      hasBudget: boolean;
      isCostDriver: boolean;
    }
  >();

  drivers.forEach((driver) => {
    const existing = groupedDrivers.get(driver.label);

    if (!existing) {
      groupedDrivers.set(driver.label, {
        label: driver.label,
        actual: driver.actual ?? 0,
        budget: driver.budget ?? 0,
        variance: driver.variance,
        hasActual: driver.actual !== null,
        hasBudget: driver.budget !== null,
        isCostDriver: driver.direction === "Unfavorable" && driver.variance > 0,
      });

      return;
    }

    existing.actual += driver.actual ?? 0;
    existing.budget += driver.budget ?? 0;
    existing.variance += driver.variance;
    existing.hasActual = existing.hasActual || driver.actual !== null;
    existing.hasBudget = existing.hasBudget || driver.budget !== null;
  });

  return Array.from(groupedDrivers.values())
    .map((group) => {
      const actual = group.hasActual ? group.actual : null;
      const budget = group.hasBudget ? group.budget : null;
      const variancePct =
        budget !== null && budget !== 0
          ? (group.variance / Math.abs(budget)) * 100
          : null;

      const direction = getDirection(group.variance, group.isCostDriver);
      const severity = getSeverity(variancePct, group.variance);

      return {
        label: group.label,
        actual,
        budget,
        variance: group.variance,
        variancePct,
        direction,
        severity,
      };
    })
    .filter((driver) => driver.direction !== "Neutral");
}

export function analyzeVarianceDrivers(
  rows: Record<string, unknown>[]
): VarianceDriverResult {
  if (!rows.length) {
    return {
      hasVarianceData: false,
      topFavorable: [],
      topUnfavorable: [],
      managementAttention: [
        "No rows were available for variance driver analysis.",
      ],
      confidenceLevel: "Low",
    };
  }

  const actualField = findFirstColumn(rows, ACTUAL_PATTERNS);
  const budgetField = findFirstColumn(rows, BUDGET_PATTERNS);
  const varianceField = findFirstColumn(rows, VARIANCE_PATTERNS);
  const dimensionField = findFirstColumn(rows, DIMENSION_PATTERNS);

  const hasActualBudget = Boolean(actualField && budgetField);
  const hasVarianceOnly = Boolean(varianceField);

  if (!hasActualBudget && !hasVarianceOnly) {
    return {
      hasVarianceData: false,
      actualField,
      budgetField,
      varianceField,
      dimensionField,
      topFavorable: [],
      topUnfavorable: [],
      managementAttention: [
        "Actual, Budget, or Variance fields were not detected. Add budget or variance columns to enable driver analysis.",
      ],
      confidenceLevel: "Low",
    };
  }

  const rowLevelDrivers: VarianceDriver[] = rows
    .map((row, index) => {
      const actual = actualField ? toNumber(row[actualField]) : null;
      const budget = budgetField ? toNumber(row[budgetField]) : null;
      const explicitVariance = varianceField
        ? toNumber(row[varianceField])
        : null;

      const variance =
        explicitVariance ??
        (actual !== null && budget !== null ? actual - budget : null);

      if (variance === null || variance === 0) {
        return null;
      }

      const variancePct =
        budget !== null && budget !== 0
          ? (variance / Math.abs(budget)) * 100
          : null;

      const isCostRow = inferIsCostRow(row);
      const direction = getDirection(variance, isCostRow);
      const severity = getSeverity(variancePct, variance);

      return {
        label: buildLabel(row, dimensionField, index),
        actual,
        budget,
        variance,
        variancePct,
        direction,
        severity,
      };
    })
    .filter((driver): driver is VarianceDriver => driver !== null);

  const drivers = dimensionField
    ? aggregateDriversByLabel(rowLevelDrivers)
    : rowLevelDrivers;

  const topFavorable = drivers
    .filter((driver) => driver.direction === "Favorable")
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 3);

  const topUnfavorable = drivers
    .filter((driver) => driver.direction === "Unfavorable")
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 3);

  const confidenceLevel =
    hasActualBudget && drivers.length >= 5
      ? "High"
      : hasActualBudget || drivers.length >= 3
        ? "Medium"
        : "Low";

  return {
    hasVarianceData: drivers.length > 0,
    actualField,
    budgetField,
    varianceField,
    dimensionField,
    topFavorable,
    topUnfavorable,
    managementAttention: buildManagementAttention(
      topUnfavorable,
      topFavorable,
      actualField,
      budgetField,
      dimensionField
    ),
    confidenceLevel,
  };
}