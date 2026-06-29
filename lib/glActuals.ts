export type GlActualsSummaryItem = {
    line: string;
    actual: number;
    budget: number;
    variance: number;
    variancePercent: number | null;
    forecast: number | null;
    priorYear: number | null;
  };
  
  export type GlActualsSummaryResult = {
    hasData: boolean;
    items: GlActualsSummaryItem[];
    columns: {
      line?: string;
      actual?: string;
      budget?: string;
      forecast?: string;
      priorYear?: string;
    };
    missingColumns: string[];
  };
  
  type Row = Record<string, unknown>;
  
  const LINE_COLUMNS = [
    "P&L Line",
    "PL Line",
    "P L Line",
    "Financial Line",
    "Account Line",
  ];
  
  const ACTUAL_COLUMNS = ["Actual", "Actuals", "Actual Amount"];
  
  const BUDGET_COLUMNS = ["Budget", "Budget Amount"];
  
  const FORECAST_COLUMNS = ["Forecast", "Forecast Amount"];
  
  const PRIOR_YEAR_COLUMNS = [
    "Prior Year",
    "Prior Year Actual",
    "PY",
    "Last Year",
  ];
  
  const FINANCE_LINE_ORDER = [
    "Revenue",
    "COGS",
    "Gross Profit",
    "Selling Expense",
    "G&A Expense",
    "R&D Expense",
    "Operating Profit",
    "Other Income",
    "Finance Cost",
    "Tax Expense",
    "Net Profit",
  ];
  
  function normalizeColumnName(columnName: string) {
    return columnName.toLowerCase().replace(/[\s_\-/.&%]/g, "");
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
  
  function getFinanceLineOrder(line: string) {
    const normalizedLine = normalizeColumnName(line);
  
    const index = FINANCE_LINE_ORDER.findIndex(
      (item) => normalizeColumnName(item) === normalizedLine
    );
  
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  }
  
  export function analyzeGlActuals(rows: Row[]): GlActualsSummaryResult {
    if (!rows.length) {
      return {
        hasData: false,
        items: [],
        columns: {},
        missingColumns: ["P&L Line", "Actual", "Budget"],
      };
    }
  
    const lineColumn = findColumn(rows, LINE_COLUMNS);
    const actualColumn = findColumn(rows, ACTUAL_COLUMNS);
    const budgetColumn = findColumn(rows, BUDGET_COLUMNS);
    const forecastColumn = findColumn(rows, FORECAST_COLUMNS);
    const priorYearColumn = findColumn(rows, PRIOR_YEAR_COLUMNS);
  
    const missingColumns: string[] = [];
  
    if (!lineColumn) {
      missingColumns.push("P&L Line");
    }
  
    if (!actualColumn) {
      missingColumns.push("Actual");
    }
  
    if (!budgetColumn) {
      missingColumns.push("Budget");
    }
  
    if (missingColumns.length > 0) {
      return {
        hasData: false,
        items: [],
        columns: {
          line: lineColumn,
          actual: actualColumn,
          budget: budgetColumn,
          forecast: forecastColumn,
          priorYear: priorYearColumn,
        },
        missingColumns,
      };
    }
  
    if (!lineColumn || !actualColumn || !budgetColumn) {
      return {
        hasData: false,
        items: [],
        columns: {
          line: lineColumn,
          actual: actualColumn,
          budget: budgetColumn,
          forecast: forecastColumn,
          priorYear: priorYearColumn,
        },
        missingColumns: ["P&L Line", "Actual", "Budget"],
      };
    }
  
    const groupedData = new Map<
      string,
      {
        actual: number;
        budget: number;
        forecast: number;
        priorYear: number;
      }
    >();
  
    rows.forEach((row) => {
      const rawLine = row[lineColumn];
  
      const line =
        typeof rawLine === "string" && rawLine.trim()
          ? rawLine.trim()
          : "Unassigned";
  
      const current = groupedData.get(line) ?? {
        actual: 0,
        budget: 0,
        forecast: 0,
        priorYear: 0,
      };
  
      groupedData.set(line, {
        actual: current.actual + parseNumber(row[actualColumn]),
        budget: current.budget + parseNumber(row[budgetColumn]),
        forecast:
          current.forecast +
          (forecastColumn ? parseNumber(row[forecastColumn]) : 0),
        priorYear:
          current.priorYear +
          (priorYearColumn ? parseNumber(row[priorYearColumn]) : 0),
      });
    });
  
    const items = Array.from(groupedData.entries())
      .map(([line, value]) => {
        const variance = value.actual - value.budget;
        const variancePercent =
          value.budget === 0 ? null : variance / Math.abs(value.budget);
  
        return {
          line,
          actual: value.actual,
          budget: value.budget,
          variance,
          variancePercent,
          forecast: forecastColumn ? value.forecast : null,
          priorYear: priorYearColumn ? value.priorYear : null,
        };
      })
      .sort((a, b) => {
        const orderA = getFinanceLineOrder(a.line);
        const orderB = getFinanceLineOrder(b.line);
  
        if (orderA !== orderB) {
          return orderA - orderB;
        }
  
        return b.actual - a.actual;
      });
  
    return {
      hasData: items.length > 0,
      items,
      columns: {
        line: lineColumn,
        actual: actualColumn,
        budget: budgetColumn,
        forecast: forecastColumn,
        priorYear: priorYearColumn,
      },
      missingColumns: [],
    };
  }