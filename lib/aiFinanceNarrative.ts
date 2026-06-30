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
    sheetType?: string
  ): FinanceNarrativeResult {
    if (!rows.length) {
      return {
        executiveSummary:
          "No financial records were available for analysis. Upload a valid finance dataset to generate AI-style commentary.",
        keyFindings: [],
        riskFlags: ["No source data was available for narrative generation."],
        recommendedActions: [
          "Upload a P&L, GL Actuals, Business Unit, or Region-level finance file.",
        ],
        confidenceLevel: "Low",
      };
    }
  
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
  
    const revenueSummary = revenueField
      ? summarizeNumericField(rows, revenueField)
      : null;
  
    if (revenueSummary) {
      if (revenueSummary.total > 0) {
        keyFindings.push(
          `Revenue-related data appears directionally positive, with total ${revenueField} of approximately ${formatNumber(
            revenueSummary.total
          )}.`
        );
      } else if (revenueSummary.total < 0) {
        riskFlags.push(
          `Revenue-related data appears negative, with total ${revenueField} of approximately ${formatNumber(
            revenueSummary.total
          )}.`
        );
      }
  
      recommendedActions.push(
        `Review the main drivers behind ${revenueField} performance and compare them against budget, forecast, or prior period results.`
      );
    }
  
    const expenseSummaries = expenseFields
      .map((field) => summarizeNumericField(rows, field))
      .filter((summary): summary is NumericSummary => summary !== null);
  
    if (expenseSummaries.length > 0) {
      const largestExpense = expenseSummaries.sort(
        (a, b) => b.absoluteTotal - a.absoluteTotal
      )[0];
  
      keyFindings.push(
        `Cost-related fields were detected. The largest expense-related field is ${largestExpense.field}, with an absolute total of approximately ${formatNumber(
          largestExpense.absoluteTotal
        )}.`
      );
  
      riskFlags.push(
        `${largestExpense.field} should be reviewed for potential cost control opportunities, especially if the increase is not linked to revenue growth.`
      );
  
      recommendedActions.push(
        "Perform a variance review on major expense categories and separate one-off items from recurring operating costs."
      );
    }
  
    const profitSummary = profitField
      ? summarizeNumericField(rows, profitField)
      : null;
  
    if (profitSummary) {
      if (profitSummary.total > 0) {
        keyFindings.push(
          `Profitability indicators appear positive based on ${profitField}, with a total of approximately ${formatNumber(
            profitSummary.total
          )}.`
        );
      } else if (profitSummary.total < 0) {
        riskFlags.push(
          `Profitability may be under pressure based on ${profitField}, with a total of approximately ${formatNumber(
            profitSummary.total
          )}.`
        );
  
        recommendedActions.push(
          "Investigate whether the profitability pressure is driven by lower revenue, higher cost of sales, or operating expense growth."
        );
      }
    }
  
    const marginSummary = marginField
      ? summarizeNumericField(rows, marginField)
      : null;
  
    if (marginSummary) {
      const comparableMargin = getComparableMarginValue(marginSummary.average);
  
      keyFindings.push(
        `Margin-related data was detected in ${marginField}, with an average value of approximately ${formatMarginValue(
          marginSummary.average
        )}.`
      );
  
      if (comparableMargin < 20) {
        riskFlags.push(
          `${marginField} appears relatively low and may require management attention.`
        );
      }
  
      recommendedActions.push(
        "Bridge margin movement by separating price, volume, mix, and cost effects where data is available."
      );
    }
  
    if (dimensionField && amountField) {
      const topGroups = getTopGroupsByAmount(rows, dimensionField, amountField);
  
      if (topGroups.length > 0) {
        keyFindings.push(
          `The dataset includes ${dimensionField}-level detail. The largest contributors by ${amountField} are ${topGroups
            .map((group) => `${group.name} (${formatNumber(group.amount)})`)
            .join(", ")}.`
        );
  
        recommendedActions.push(
          `Use ${dimensionField}-level drilldown to identify whether performance is concentrated in a small number of business areas.`
        );
      }
    } else if (dimensionField) {
      keyFindings.push(
        `A management dimension was detected: ${dimensionField}. This supports further analysis by business area, region, department, or entity.`
      );
    }
  
    const glActualsDetected = isGlActualsSheet(rows, sheetType);
  
    if (glActualsDetected && accountField && amountField) {
      const topAccounts = getTopGroupsByAmount(rows, accountField, amountField, 5);
  
      if (topAccounts.length > 0) {
        riskFlags.push(
          `GL Actuals review: the largest accounts by ${amountField} are ${topAccounts
            .map((account) => `${account.name} (${formatNumber(account.amount)})`)
            .join(", ")}. These accounts should be checked for unusual or one-off postings.`
        );
  
        recommendedActions.push(
          "Review high-value GL accounts for accruals, reclassifications, manual journal entries, and unusual month-end postings."
        );
      }
    }
  
    if (keyFindings.length === 0) {
      keyFindings.push(
        "The uploaded dataset was parsed successfully, but only limited finance-specific fields were detected."
      );
    }
  
    if (riskFlags.length === 0) {
      riskFlags.push(
        "No major risk flag was detected by the rule-based narrative engine. This does not replace detailed variance analysis."
      );
    }
  
    if (recommendedActions.length === 0) {
      recommendedActions.push(
        "Add budget, forecast, prior period, business unit, region, or account-level fields to improve analysis depth."
      );
    }
  
    const executiveSummary =
      confidenceLevel === "Low"
        ? "The dataset supports only limited preview-level analysis. More structured finance fields are needed to generate a stronger management narrative."
        : `The uploaded finance dataset was analyzed using a rule-based AI narrative engine. The analysis detected ${matchedFieldCount} finance-relevant field signals across ${rows.length} records and generated management-level commentary on performance, risks, and recommended follow-up actions.`;
  
    return {
      executiveSummary,
      keyFindings,
      riskFlags,
      recommendedActions,
      confidenceLevel,
    };
  }