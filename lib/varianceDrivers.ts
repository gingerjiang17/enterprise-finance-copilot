export type VarianceDirection = "Favorable" | "Unfavorable" | "Neutral";

export type VarianceSeverity = "High" | "Medium" | "Low";

export type VarianceType =
  | "Revenue Shortfall"
  | "Revenue Outperformance"
  | "Expense Overrun"
  | "Expense Saving"
  | "Minor Variance";

export type VarianceDriver = {
  label: string;
  actual: number | null;
  budget: number | null;
  variance: number;
  variancePct: number | null;
  direction: VarianceDirection;
  severity: VarianceSeverity;
  varianceType: VarianceType;
  contributionPct: number | null;
  detectionLogic: string[];
  managementFocus: string;
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

function getVarianceType(
  direction: VarianceDirection,
  isCostRow: boolean,
  variancePct: number | null
): VarianceType {
  const absPct = variancePct === null ? 0 : Math.abs(variancePct);

  if (absPct < 1) {
    return "Minor Variance";
  }

  if (isCostRow) {
    return direction === "Unfavorable"
      ? "Expense Overrun"
      : "Expense Saving";
  }

  return direction === "Unfavorable"
    ? "Revenue Shortfall"
    : "Revenue Outperformance";
}

function buildDetectionLogic(
  varianceType: VarianceType,
  variancePct: number | null,
  contributionPct: number | null
): string[] {
  const logic: string[] = [];

  if (
    varianceType === "Revenue Shortfall" ||
    varianceType === "Revenue Outperformance"
  ) {
    logic.push(
      varianceType === "Revenue Shortfall"
        ? "Actual Revenue 低于 Budget Revenue，触发收入预算差异检查。"
        : "Actual Revenue 高于 Budget Revenue，触发收入正向差异检查。"
    );
  }

  if (
    varianceType === "Expense Overrun" ||
    varianceType === "Expense Saving"
  ) {
    logic.push(
      varianceType === "Expense Overrun"
        ? "Actual Expense 高于 Budget Expense，触发费用超预算检查。"
        : "Actual Expense 低于 Budget Expense，触发费用节约检查。"
    );
  }

  if (varianceType === "Minor Variance") {
    logic.push("Variance rate 未达到重大差异阈值，暂归类为轻微差异。");
  }

  if (variancePct !== null) {
    logic.push(
      `Variance rate 为 ${formatPct(variancePct)}，用于判断差异严重程度。`
    );
  }

  if (contributionPct !== null) {
    logic.push(
      `该 driver 贡献了 ${formatPct(contributionPct)} 的同方向总差异。`
    );
  }

  return logic;
}

function buildManagementFocus(varianceType: VarianceType): string {
  if (varianceType === "Revenue Shortfall") {
    return "重点复核订单量、客户转化及价格执行情况。";
  }

  if (varianceType === "Revenue Outperformance") {
    return "总结超预算收入来源，评估增长是否具备持续性。";
  }

  if (varianceType === "Expense Overrun") {
    return "重点复核费用审批、预算控制及一次性费用项目。";
  }

  if (varianceType === "Expense Saving") {
    return "确认费用节约是否来自效率提升，或存在项目延期、费用跨期等因素。";
  }

  return "持续跟踪该项目，当前差异未达到重大复核阈值。";
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

    const driverLabels = topUnfavorable
      .map((driver) => driver.label)
      .join("、");

    attention.push(
      `本期收入低于预算，负向差异主要集中在 ${driverLabels} 等业务单元。`
    );

    if (largest.contributionPct !== null) {
      attention.push(
        `${largest.label} 是最大差异来源，占负向差异总额的 ${formatPct(
          largest.contributionPct
        )}，建议优先复核收入达成路径。`
      );
    } else {
      attention.push(
        `${largest.label} 是当前最大的负向差异来源，实际表现较预算减少约 ${formatNumber(
          largest.variance
        )}（较预算 ${formatPct(largest.variancePct)}）。`
      );
    }

    const highSeverityItems = topUnfavorable.filter(
      (driver) => driver.severity === "High"
    );

    if (highSeverityItems.length > 0) {
      attention.push(
        `当前检测到 ${highSeverityItems.length} 项高风险差异事项，建议进一步结合订单量、价格执行、客户转化及一次性影响进行分析。`
      );
    }
  } else {
    attention.push(
      "基于规则驱动的差异分析，当前未发现明显重大负向差异事项。"
    );
  }

  if (topFavorable.length > 0) {
    const largestFavorable = topFavorable[0];

    attention.push(
      `${largestFavorable.label} 是主要正向差异来源，建议评估该增长是否具备持续性。`
    );
  }

  if (actualField && budgetField && dimensionField) {
    attention.push(
      `差异驱动因素已按 ${dimensionField} 汇总，便于管理层快速定位重点复核对象。`
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
        isCostDriver:
          driver.varianceType === "Expense Overrun" ||
          driver.varianceType === "Expense Saving",
      });

      return;
    }

    existing.actual += driver.actual ?? 0;
    existing.budget += driver.budget ?? 0;
    existing.variance += driver.variance;
    existing.hasActual = existing.hasActual || driver.actual !== null;
    existing.hasBudget = existing.hasBudget || driver.budget !== null;

    if (
      driver.varianceType === "Expense Overrun" ||
      driver.varianceType === "Expense Saving"
    ) {
      existing.isCostDriver = true;
    }
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
      const varianceType = getVarianceType(
        direction,
        group.isCostDriver,
        variancePct
      );

      return {
        label: group.label,
        actual,
        budget,
        variance: group.variance,
        variancePct,
        direction,
        severity,
        varianceType,
        contributionPct: null,
        detectionLogic: [],
        managementFocus: buildManagementFocus(varianceType),
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
      const varianceType = getVarianceType(
        direction,
        isCostRow,
        variancePct
      );

      return {
        label: buildLabel(row, dimensionField, index),
        actual,
        budget,
        variance,
        variancePct,
        direction,
        severity,
        varianceType,
        contributionPct: null,
        detectionLogic: [],
        managementFocus: buildManagementFocus(varianceType),
      };
    })
    .filter((driver): driver is VarianceDriver => driver !== null);

  const drivers = dimensionField
    ? aggregateDriversByLabel(rowLevelDrivers)
    : rowLevelDrivers;

  const favorableTotal = drivers
    .filter((driver) => driver.direction === "Favorable")
    .reduce((sum, driver) => sum + Math.abs(driver.variance), 0);

  const unfavorableTotal = drivers
    .filter((driver) => driver.direction === "Unfavorable")
    .reduce((sum, driver) => sum + Math.abs(driver.variance), 0);

  const enrichedDrivers = drivers.map((driver) => {
    const total =
      driver.direction === "Favorable"
        ? favorableTotal
        : driver.direction === "Unfavorable"
          ? unfavorableTotal
          : 0;

    const contributionPct =
      total > 0 ? (Math.abs(driver.variance) / total) * 100 : null;

    return {
      ...driver,
      contributionPct,
      detectionLogic: buildDetectionLogic(
        driver.varianceType,
        driver.variancePct,
        contributionPct
      ),
      managementFocus: buildManagementFocus(driver.varianceType),
    };
  });

  const topFavorable = enrichedDrivers
    .filter((driver) => driver.direction === "Favorable")
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 3);

  const topUnfavorable = enrichedDrivers
    .filter((driver) => driver.direction === "Unfavorable")
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 3);

  const confidenceLevel =
    hasActualBudget && enrichedDrivers.length >= 5
      ? "High"
      : hasActualBudget || enrichedDrivers.length >= 3
        ? "Medium"
        : "Low";

  return {
    hasVarianceData: enrichedDrivers.length > 0,
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