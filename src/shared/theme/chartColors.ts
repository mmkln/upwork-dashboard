export const chartColors = {
  primary: "#2563EB",
  base: "#0F172A",
  teal: "#0F766E",
  green: "#10B981",
  amber: "#F59E0B",
  rose: "#F43F5E",
  violet: "#7C3AED",
  slate: "#64748B",
} as const;

export const chartColorSequence = [
  chartColors.primary,
  chartColors.teal,
  chartColors.green,
  chartColors.amber,
  chartColors.rose,
  chartColors.violet,
  chartColors.slate,
] as const;
