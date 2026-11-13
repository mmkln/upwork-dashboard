export {
  formatCompactCurrency,
  formatCurrency,
} from "../../shared/formatters";

export const formatLocation = (
  city: string | null,
  country: string | null,
) => [city, country].filter(Boolean).join(", ") || "Location not provided";
