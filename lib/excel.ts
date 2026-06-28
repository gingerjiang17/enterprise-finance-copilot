import * as XLSX from "xlsx";

export type Row = Record<string, unknown>;

export function getSheetRows(
  workbook: XLSX.WorkBook,
  sheetName: string,
): Row[] {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return [];

  return XLSX.utils.sheet_to_json<Row>(worksheet);
}
