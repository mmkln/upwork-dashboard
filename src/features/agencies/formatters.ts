import {
  formatCompactCurrency,
  formatCurrency,
} from "../../shared/formatters";
import type { AgencyNumericValue } from "./types";

export const formatLowerBoundCurrency = (
  value: AgencyNumericValue,
  isLowerBound: boolean,
): string => {
  const formatted = formatCompactCurrency(value);
  return isLowerBound && formatted !== "—" ? `${formatted}+` : formatted;
};

export const formatRateRange = (
  minimum: AgencyNumericValue,
  maximum: AgencyNumericValue,
): string => {
  if (minimum === null && maximum === null) return "—";
  if (minimum === null) return `Up to ${formatCurrency(maximum, "/hr")}`;
  if (maximum === null) return `From ${formatCurrency(minimum, "/hr")}`;
  if (Number(minimum) === Number(maximum)) {
    return formatCurrency(minimum, "/hr");
  }
  return `${formatCurrency(minimum)}–${formatCurrency(maximum)}/hr`;
};
