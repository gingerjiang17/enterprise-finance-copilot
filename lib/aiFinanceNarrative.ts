import { calculateFinanceMetrics } from "./financeMetrics";
import type { Row } from "./excel";
import { VarianceDriverResult } from "./varianceDrivers";

export type FinanceNarrativeResult = {
    executiveSummary: string;
    keyFindings: string[];
    riskFlags: string[];
    recommendedActions: string[];
    confidenceLevel: "High" | "Medium" | "Low";
  };
  
  type NumericSummary = {
    field: string;
    count: number;
    total: number;
    average: number;
    min: number;
    max: number;
    absoluteTotal: number;
  };
  
  const REVENUE_PATTERNS = [
    "revenue",
    "sales",
    "turnover",
    "net sales",
    "gross sales",
  ];
  
  const EXPENSE_PATTERNS = [
    "expense",
    "expenses",
    "cost",
    "cost of sales",
    "cost of goods sold",
    "cogs",
    "opex",
    "operating expense",
    "sg&a",
    "sga",
    "marketing",
    "salary",
    "payroll",
    "rent",
    "travel",
  ];
  
  const PROFIT_PATTERNS = [
    "gross profit",
    "operating profit",
    "net profit",
    "profit",
    "net income",
    "operating income",
    "ebitda",
    "ebit",
  ];
  
  const MARGIN_PATTERNS = [
    "margin",
    "gross margin",
    "operating margin",
    "profit margin",
  ];
  
  const AMOUNT_PATTERNS = [
    "amount",
    "actual",
    "value",
    "balance",
    "debit",
    "credit",
    "total",
  ];
  
  const ACCOUNT_PATTERNS = [
    "account",
    "account name",
    "gl account",
    "gl",
    "ledger",
    "description",
  ];
  
  const DIMENSION_PATTERNS = [
    "business unit",
    "bu",
    "region",
    "department",
    "dept",
    "division",
    "entity",
    "market",
    "country",
    "location",
  ];
  
  function normalizeKey(key: string): string {
    return key.toLowerCase().replace(/[_-]/g, " ").trim();
  }
  
  function keyMatches(key: string, patterns: string[]): boolean {
    const normalized = normalizeKey(key);
  
    return patterns.some((pattern) => {
      const normalizedPattern = normalizeKey(pattern);
      return normalized === normalizedPattern || normalized.includes(normalizedPattern);
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
    const columns = getColumnNames(rows);
    return columns.find((column) => keyMatches(column, patterns));
  }
  
  function findColumns(
    rows: Record<string, unknown>[],
    patterns: string[]
  ): string[] {
    const columns = getColumnNames(rows);
    return columns.filter((column) => keyMatches(column, patterns));
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
  
  function formatMarginValue(value: number): string {
    const normalizedValue = Math.abs(value) <= 1 ? value * 100 : value;
    return `${normalizedValue.toFixed(1)}%`;
  }
  
  function getComparableMarginValue(value: number): number {
    return Math.abs(value) <= 1 ? value * 100 : value;
  }
  
  function summarizeNumericField(
    rows: Record<string, unknown>[],
    field: string
  ): NumericSummary | null {
    const values = rows
      .map((row) => toNumber(row[field]))
      .filter((value): value is number => value !== null);
  
    if (values.length === 0) {
      return null;
    }
  
    const total = values.reduce((sum, value) => sum + value, 0);
    const absoluteTotal = values.reduce((sum, value) => sum + Math.abs(value), 0);
  
    return {
      field,
      count: values.length,
      total,
      average: total / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      absoluteTotal,
    };
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
  
  function getTopGroupsByAmount(
    rows: Record<string, unknown>[],
    groupField: string,
    amountField: string,
    limit = 3
  ): Array<{ name: string; amount: number }> {
    const groupMap = new Map<string, number>();
  
    rows.forEach((row) => {
      const groupName = getStringValue(row[groupField]);
      const amount = toNumber(row[amountField]);
  
      if (!groupName || amount === null) {
        return;
      }
  
      const currentAmount = groupMap.get(groupName) ?? 0;
      groupMap.set(groupName, currentAmount + amount);
    });
  
    return Array.from(groupMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, limit);
  }
  
  function detectConfidenceLevel(args: {
    rowCount: number;
    matchedFieldCount: number;
    hasAmountField: boolean;
  }): FinanceNarrativeResult["confidenceLevel"] {
    if (args.rowCount < 3 || args.matchedFieldCount <= 1) {
      return "Low";
    }
  
    if (args.rowCount >= 10 && args.matchedFieldCount >= 3 && args.hasAmountField) {
      return "High";
    }
  
    return "Medium";
  }
  
  function isGlActualsSheet(
    rows: Record<string, unknown>[],
    sheetType?: string
  ): boolean {
    const normalizedSheetType = sheetType?.toLowerCase() ?? "";
    const accountField = findFirstColumn(rows, ACCOUNT_PATTERNS);
    const amountField = findFirstColumn(rows, AMOUNT_PATTERNS);
  
    return (
      normalizedSheetType.includes("gl") ||
      normalizedSheetType.includes("actual") ||
      Boolean(accountField && amountField)
    );
  }
  
  export function generateAiFinanceNarrative(
    rows: Record<string, unknown>[],
    sheetType?: string,
    varianceDrivers?:VarianceDriverResult
  ): FinanceNarrativeResult {
    if (!rows.length) {
      return {
        executiveSummary:
        "当前没有可用于分析的财务数据，请上传有效财务文件以生成管理层分析。",        keyFindings: [],
        riskFlags: ["当前没有可用于生成分析的数据来源。"],
        recommendedActions: [
          "请上传相关财务文件",
        ],
        confidenceLevel: "Low",
      };
    }
    
    const financeMetrics = calculateFinanceMetrics(rows as Row[]);
    const revenueField = findFirstColumn(rows, REVENUE_PATTERNS);
    const expenseFields = findColumns(rows, EXPENSE_PATTERNS);
    const profitField = findFirstColumn(rows, PROFIT_PATTERNS);
    const marginField = findFirstColumn(rows, MARGIN_PATTERNS);
    const amountField = findFirstColumn(rows, AMOUNT_PATTERNS);
    const accountField = findFirstColumn(rows, ACCOUNT_PATTERNS);
    const dimensionField = findFirstColumn(rows, DIMENSION_PATTERNS);
  
    const matchedFieldCount = [
      revenueField,
      profitField,
      marginField,
      amountField,
      accountField,
      dimensionField,
      ...expenseFields,
    ].filter(Boolean).length;
  
    const confidenceLevel = detectConfidenceLevel({
      rowCount: rows.length,
      matchedFieldCount,
      hasAmountField: Boolean(amountField),
    });
  
    const keyFindings: string[] = [];
    const riskFlags: string[] = [];
    const recommendedActions: string[] = [];
    const coreMetricFindingParts: string[] = [];

if (financeMetrics.revenue !== null) {
  coreMetricFindingParts.push(
    `收入约为 ${formatNumber(financeMetrics.revenue)}`
  );
}

if (financeMetrics.grossProfit !== null) {
  coreMetricFindingParts.push(
    `毛利润约为 ${formatNumber(financeMetrics.grossProfit)}`
  );
}

if (financeMetrics.grossMargin !== null) {
  coreMetricFindingParts.push(
    `毛利率约为 ${formatMarginValue(financeMetrics.grossMargin)}`
  );
}

if (financeMetrics.netProfit !== null) {
  coreMetricFindingParts.push(
    `净利润约为 ${formatNumber(financeMetrics.netProfit)}`
  );
}

if (coreMetricFindingParts.length > 0) {
  keyFindings.push(
    `基于统一财务指标口径，本期${coreMetricFindingParts.join("，")}。`
  );
}

    if (
      varianceDrivers &&
      varianceDrivers.topUnfavorable.length > 0
    ) {
      const topDriver = varianceDrivers.topUnfavorable[0];
    
      keyFindings.push(
        topDriver.contributionPct !== null
          ? `${topDriver.label} 是主要负向差异来源，占负向差异总额 ${topDriver.contributionPct.toFixed(
              1
            )}%，建议作为本期预算复盘的优先关注对象。`
          : `${topDriver.label} 是主要负向差异来源，建议作为本期预算复盘的优先关注对象。`
      );
    
      riskFlags.push(
        topDriver.contributionPct !== null
          ? `${topDriver.label} 贡献了 ${topDriver.contributionPct.toFixed(
              1
            )}% 的负向差异，可能影响整体收入达成及预算执行表现。`
          : `${topDriver.label} 是当前主要负向差异来源，可能影响整体预算执行表现。`
      );
    
      recommendedActions.push(
        topDriver.managementFocus
          ? `优先复核 ${topDriver.label}：${topDriver.managementFocus}`
          : `优先复核 ${topDriver.label} 的收入达成路径、订单量、客户转化及价格执行情况。`
      );
    }
  
    if (dimensionField && amountField) {
      const topGroups = getTopGroupsByAmount(rows, dimensionField, amountField);
  
      if (topGroups.length > 0) {
        keyFindings.push(
          `从 ${dimensionField} 维度看，${topGroups
    .map((group) => `${group.name}（${formatNumber(group.amount)}）`)
    .join("、")} 是当前金额影响较大的主体。`
        );
  
        recommendedActions.push(
          `建议进一步拆分 ${dimensionField} 维度数据，确认金额波动是否集中在少数主体或业务区域。`
        );
      }
    } else if (dimensionField) {
      keyFindings.push(
        `当前数据已包含 ${dimensionField} 维度，可用于后续按主体、区域或业务单元进行拆分分析。`
      );
    }
  
    const glActualsDetected = isGlActualsSheet(rows, sheetType);
  
    if (glActualsDetected && accountField && amountField) {
      const topAccounts = getTopGroupsByAmount(rows, accountField, amountField, 5);
  
      if (topAccounts.length > 0) {
        riskFlags.push(
          `从 GL Actuals 看，金额影响较大的科目包括 ${topAccounts
    .map((account) => `${account.name}（${formatNumber(account.amount)}）`)
    .join("、")}，建议重点关注是否存在一次性入账、重分类或异常分录。`
);
  
        recommendedActions.push(
         "建议重点检查高金额 GL 科目的预提、重分类、手工调整分录及月末集中入账情况。"
);
      }
    }
  
    if (keyFindings.length === 0) {
      keyFindings.push(
        "数据文件已成功解析，但当前识别到的财务字段有限，建议补充更多财务维度以提升分析深度。"
      );
    }
  
    if (riskFlags.length === 0) {
      riskFlags.push(
        "基于当前规则分析未发现明显风险事项，但结果不能替代详细的财务差异分析。"
      );
    }
  
    if (recommendedActions.length === 0) {
      recommendedActions.push(
        "建议增加预算、预测、历史期间、业务单元、区域或科目级数据，以提升分析深度。"
      );
    }
  
    const metricsSummaryParts: string[] = [];

if (financeMetrics.revenue !== null) {
  metricsSummaryParts.push(
    `收入约为 ${formatNumber(financeMetrics.revenue)}`
  );
}

if (financeMetrics.grossMargin !== null) {
  metricsSummaryParts.push(
    `毛利率约为 ${formatMarginValue(financeMetrics.grossMargin)}`
  );
}

if (financeMetrics.netProfit !== null) {
  metricsSummaryParts.push(
    `净利润约为 ${formatNumber(financeMetrics.netProfit)}`
  );
}

const metricsSummary =
  metricsSummaryParts.length > 0
    ? `基于统一财务指标口径，本期${metricsSummaryParts.join("，")}。`
    : "";

    let driverSummary = "";

    if (
      varianceDrivers &&
      varianceDrivers.topUnfavorable.length > 0
    ) {
      const topDriver = varianceDrivers.topUnfavorable[0];
    
      driverSummary =
        topDriver.contributionPct !== null
          ? `其中 ${topDriver.label} 是主要负向差异来源，占负向差异总额 ${topDriver.contributionPct.toFixed(
              1
            )}%。`
          : `其中 ${topDriver.label} 是主要负向差异来源，建议优先复核该业务单元的预算执行情况。`;
    }

    const executiveSummary =
    confidenceLevel === "Low"
      ? "当前数据仅支持基础分析，建议补充更完整的财务字段，以生成更深入的管理层分析。"
      : `${metricsSummary}${driverSummary}系统进一步识别关键经营表现、潜在风险及后续行动建议，形成管理层视角分析。`;
    
    return {
      executiveSummary,
      keyFindings,
      riskFlags,
      recommendedActions,
      confidenceLevel,
    };
  }