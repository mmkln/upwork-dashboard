import { UpworkJob } from "../models";

const sanitizeNumericString = (raw: string): string => {
  const sanitized = raw.replace(/[^0-9.,-]+/g, "");
  if (!sanitized) {
    return "";
  }

  if (sanitized.includes(",") && !sanitized.includes(".")) {
    return sanitized.replace(",", ".");
  }

  return sanitized.replace(/,/g, "");
};

export const parseRate = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = sanitizeNumericString(value);
    if (!normalized) {
      return null;
    }

    const numeric = Number.parseFloat(normalized);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

export const computeJobRate = (job: UpworkJob): number | null => {
  const hourlyRates = Array.isArray(job.hourly_rates)
    ? job.hourly_rates
        .map((rate) => parseRate(rate))
        .filter((rate): rate is number => rate != null)
    : [];

  if (hourlyRates.length === 0) {
    const directRate = parseRate(job.average_rate);
    return directRate != null && directRate > 0 ? directRate : null;
  }

  const total = hourlyRates.reduce((sum, current) => sum + current, 0);
  const average = total / hourlyRates.length;
  return Number.isFinite(average) && average > 0 ? average : null;
};

export const createSearchableContent = (job: UpworkJob): string => {
  return [
    job.title ?? "",
    job.description ?? "",
    ...(job.skills ?? []),
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};
