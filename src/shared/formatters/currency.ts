export type NumericValue = number | string | null;

const asNumber = (value: NumericValue): number | null => {
  if (value === null || value === "") return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const formatCurrency = (
  value: NumericValue,
  suffix = "",
): string => {
  const numericValue = asNumber(value);
  if (numericValue === null) return "—";

  return `$${numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}${suffix}`;
};

export const formatCompactCurrency = (value: NumericValue): string => {
  const numericValue = asNumber(value);
  if (numericValue === null) return "—";

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue);
};
