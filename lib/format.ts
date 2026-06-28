const MISSING = "--";

export function formatCurrency(value: number | null): string {
  if (value === null) return MISSING;

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export function formatPercent(value: number | null): string {
  if (value === null) return MISSING;

  return `${(value * 100).toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
