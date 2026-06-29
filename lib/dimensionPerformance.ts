export type DimensionPerformanceItem = {
    dimensionValue: string;
    revenue: number;
    grossProfit: number;
    grossMargin: number | null;
    revenueShare: number | null;
  };
  
  export type DimensionPerformanceResult = {
    hasData: boolean;
    dimensionLabel: string;
    items: DimensionPerformanceItem[];
    columns: {
      dimension?: string;
      revenue?: string;
      grossProfit?: string;
    };
    missingColumns: string[];
  };
  
  type Row = Record<string, unknown>;
  
  type AnalyzeDimensionPerformanceParams = {
    rows: Row[];
    dimensionLabel: string;
    dimensionColumnCandidates: string[];
    revenueColumnCandidates?: string[];
    grossProfitColumnCandidates?: string[];
  };
  
  const DEFAULT_REVENUE_COLUMNS = [
    "Revenue",
    "Sales",
    "Net Sales",
    "Actual Revenue",
  ];
  
  const DEFAULT_GROSS_PROFIT_COLUMNS = [
    "Gross Profit",
    "GrossProfit",
    "GP",
    "Actual Gross Profit",
  ];
  
  function normalizeColumnName(columnName: string) {
    return columnName.toLowerCase().replace(/[\s_\-/.]/g, "");
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
  
  export function analyzeDimensionPerformance({
    rows,
    dimensionLabel,
    dimensionColumnCandidates,
    revenueColumnCandidates = DEFAULT_REVENUE_COLUMNS,
    grossProfitColumnCandidates = DEFAULT_GROSS_PROFIT_COLUMNS,
  }: AnalyzeDimensionPerformanceParams): DimensionPerformanceResult {
    if (!rows.length) {
      return {
        hasData: false,
        dimensionLabel,
        items: [],
        columns: {},
        missingColumns: [dimensionLabel, "Revenue", "Gross Profit"],
      };
    }
  
    const dimensionColumn = findColumn(rows, dimensionColumnCandidates);
    const revenueColumn = findColumn(rows, revenueColumnCandidates);
    const grossProfitColumn = findColumn(rows, grossProfitColumnCandidates);
  
    const missingColumns: string[] = [];
  
    if (!dimensionColumn) {
      missingColumns.push(dimensionLabel);
    }
  
    if (!revenueColumn) {
      missingColumns.push("Revenue");
    }
  
    if (!grossProfitColumn) {
      missingColumns.push("Gross Profit");
    }
  
    if (missingColumns.length > 0) {
      return {
        hasData: false,
        dimensionLabel,
        items: [],
        columns: {
          dimension: dimensionColumn,
          revenue: revenueColumn,
          grossProfit: grossProfitColumn,
        },
        missingColumns,
      };
    }
  
    if (!dimensionColumn || !revenueColumn || !grossProfitColumn) {
      return {
        hasData: false,
        dimensionLabel,
        items: [],
        columns: {
          dimension: dimensionColumn,
          revenue: revenueColumn,
          grossProfit: grossProfitColumn,
        },
        missingColumns: [dimensionLabel, "Revenue", "Gross Profit"],
      };
    }
  
    const groupedData = new Map<
      string,
      {
        revenue: number;
        grossProfit: number;
      }
    >();
  
    rows.forEach((row) => {
      const rawDimensionValue = row[dimensionColumn];
  
      const dimensionValue =
        typeof rawDimensionValue === "string" && rawDimensionValue.trim()
          ? rawDimensionValue.trim()
          : "Unassigned";
  
      const revenue = parseNumber(row[revenueColumn]);
      const grossProfit = parseNumber(row[grossProfitColumn]);
  
      const current = groupedData.get(dimensionValue) ?? {
        revenue: 0,
        grossProfit: 0,
      };
  
      groupedData.set(dimensionValue, {
        revenue: current.revenue + revenue,
        grossProfit: current.grossProfit + grossProfit,
      });
    });
  
    const totalRevenue = Array.from(groupedData.values()).reduce(
      (sum, item) => sum + item.revenue,
      0
    );
  
    const items = Array.from(groupedData.entries())
      .map(([dimensionValue, value]) => {
        const grossMargin =
          value.revenue === 0 ? null : value.grossProfit / value.revenue;
  
        const revenueShare =
          totalRevenue === 0 ? null : value.revenue / totalRevenue;
  
        return {
          dimensionValue,
          revenue: value.revenue,
          grossProfit: value.grossProfit,
          grossMargin,
          revenueShare,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  
    return {
      hasData: items.length > 0,
      dimensionLabel,
      items,
      columns: {
        dimension: dimensionColumn,
        revenue: revenueColumn,
        grossProfit: grossProfitColumn,
      },
      missingColumns: [],
    };
  }