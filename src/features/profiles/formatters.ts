import type { ProfileNumericValue } from "./types";

const asNumber = (value: ProfileNumericValue): number | null => {
  if (value === null || value === "") return null;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const formatCurrency = (
  value: ProfileNumericValue,
  suffix = "",
) => {
  const numericValue = asNumber(value);
  if (numericValue === null) return "—";
  return `$${numericValue.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}${suffix}`;
};

export const formatCompactCurrency = (value: ProfileNumericValue) => {
  const numericValue = asNumber(value);
  if (numericValue === null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue);
};

export const formatLocation = (
  city: string | null,
  country: string | null,
) => [city, country].filter(Boolean).join(", ") || "Location not provided";
