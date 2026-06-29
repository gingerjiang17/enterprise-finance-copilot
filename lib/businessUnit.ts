export type BusinessUnitPerformanceItem = {
    businessUnit: string;
    revenue: number;
    grossProfit: number;
    grossMargin: number | null;
    revenueShare: number | null;
  };
  
  export type BusinessUnitPerformanceResult = {
    hasData: boolean;
    items: BusinessUnitPerformanceItem[];
    columns: {
      businessUnit?: string;
      revenue?: string;
      grossProfit?: string;
    };
    missingColumns: string[];
  };
  
  type Row = Record<string, unknown>;
  
  const BUSINESS_UNIT_COLUMNS = [
    "Business Unit",
    "BusinessUnit",
    "BU",
    "Division",
    "Department",
    "Segment",
  ];
  
  const REVENUE_COLUMNS = [
    "Revenue",
    "Sales",
    "Net Sales",
    "Actual Revenue",
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
  
  export function analyzeBusinessUnitPerformance(
    rows: Row[]
  ): BusinessUnitPerformanceResult {
    if (!rows.length) {
      return {
        hasData: false,
        items: [],
        columns: {},
        missingColumns: ["Business Unit", "Revenue", "Gross Profit"],
      };
    }
  
    const businessUnitColumn = findColumn(rows, BUSINESS_UNIT_COLUMNS);
    const revenueColumn = findColumn(rows, REVENUE_COLUMNS);
    const grossProfitColumn = findColumn(rows, GROSS_PROFIT_COLUMNS);
  
    const missingColumns: string[] = [];
  
    if (!businessUnitColumn) {
      missingColumns.push("Business Unit");
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
        items: [],
        columns: {
          businessUnit: businessUnitColumn,
          revenue: revenueColumn,
          grossProfit: grossProfitColumn,
        },
        missingColumns,
      };
    }
  if (!businessUnitColumn || !revenueColumn || !grossProfitColumn) {
  return {
    hasData: false,
    items: [],
    columns: {
      businessUnit: businessUnitColumn,
      revenue: revenueColumn,
      grossProfit: grossProfitColumn,
    },
    missingColumns: ["Business Unit", "Revenue", "Gross Profit"],
  };
}

if (!businessUnitColumn || !revenueColumn || !grossProfitColumn) {
    return {
      hasData: false,
      items: [],
      columns: {
        businessUnit: businessUnitColumn,
        revenue: revenueColumn,
        grossProfit: grossProfitColumn,
      },
      missingColumns: ["Business Unit", "Revenue", "Gross Profit"],
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
      const rawBusinessUnit = row[businessUnitColumn];
      const businessUnit =
        typeof rawBusinessUnit === "string" && rawBusinessUnit.trim()
          ? rawBusinessUnit.trim()
          : "Unassigned";
  
      const revenue = parseNumber(row[revenueColumn]);
      const grossProfit = parseNumber(row[grossProfitColumn]);
  
      const current = groupedData.get(businessUnit) ?? {
        revenue: 0,
        grossProfit: 0,
      };
  
      groupedData.set(businessUnit, {
        revenue: current.revenue + revenue,
        grossProfit: current.grossProfit + grossProfit,
      });
    });
  
    const totalRevenue = Array.from(groupedData.values()).reduce(
      (sum, item) => sum + item.revenue,
      0
    );
  
    const items = Array.from(groupedData.entries())
      .map(([businessUnit, value]) => {
        const grossMargin =
          value.revenue === 0 ? null : value.grossProfit / value.revenue;
  
        const revenueShare =
          totalRevenue === 0 ? null : value.revenue / totalRevenue;
  
        return {
          businessUnit,
          revenue: value.revenue,
          grossProfit: value.grossProfit,
          grossMargin,
          revenueShare,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  
    return {
      hasData: items.length > 0,
      items,
      columns: {
        businessUnit: businessUnitColumn,
        revenue: revenueColumn,
        grossProfit: grossProfitColumn,
      },
      missingColumns: [],
    };
  }