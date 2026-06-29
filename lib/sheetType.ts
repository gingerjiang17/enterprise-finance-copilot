export type SheetType = "pl" | "gl" | "unknown";

type Row = Record<string, unknown>;

const PL_COLUMNS = [
  "Period",
  "Revenue",
  "Gross Profit",
  "Gross Margin",
  "Net Profit",
  "Budget Revenue",
  "Business Unit",
  "Region",
];

const GL_COLUMNS = [
  "P&L Line",
  "PL Line",
  "Actual",
  "Budget",
  "Forecast",
  "Prior Year",
  "Account Code",
  "Account Name",
  "Cost Center",
  "Owner",
];

const GL_CORE_COLUMNS = ["P&L Line", "PL Line", "Actual", "Budget"];

function normalizeColumnName(columnName: string) {
  return columnName.toLowerCase().replace(/[\s_\-/.&%]/g, "");
}

function getColumns(rows: Row[]) {
  const firstRow = rows.find((row) => row && typeof row === "object");

  if (!firstRow) {
    return [];
  }

  return Object.keys(firstRow);
}

function hasMatchingColumn(columns: string[], candidates: string[]) {
  return columns.some((column) => {
    const normalizedColumn = normalizeColumnName(column);

    return candidates.some(
      (candidate) => normalizedColumn === normalizeColumnName(candidate)
    );
  });
}

function countMatchingColumns(columns: string[], candidates: string[]) {
  return candidates.filter((candidate) =>
    columns.some(
      (column) => normalizeColumnName(column) === normalizeColumnName(candidate)
    )
  ).length;
}

export function detectSheetType(rows: Row[]): SheetType {
  const columns = getColumns(rows);

  if (!columns.length) {
    return "unknown";
  }

  const glScore = countMatchingColumns(columns, GL_COLUMNS);
  const plScore = countMatchingColumns(columns, PL_COLUMNS);

  const hasGlLine = hasMatchingColumn(columns, ["P&L Line", "PL Line"]);
  const hasActual = hasMatchingColumn(columns, ["Actual", "Actuals"]);
  const hasBudget = hasMatchingColumn(columns, ["Budget", "Budget Amount"]);

  const hasRevenue = hasMatchingColumn(columns, ["Revenue", "Sales", "Net Sales"]);
  const hasGrossProfit = hasMatchingColumn(columns, [
    "Gross Profit",
    "GrossProfit",
    "GP",
  ]);

  if ((hasGlLine && hasActual && hasBudget) || glScore >= 5) {
    return "gl";
  }

  if ((hasRevenue && hasGrossProfit) || plScore >= 4) {
    return "pl";
  }

  return "unknown";
}