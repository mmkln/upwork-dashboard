export const chartColors = {
  primary: "#0066CC",
  base: "#1D1D1F",
  teal: "#00C3D0",
  green: "#34C759",
  amber: "#FFCC00",
  rose: "#FF383C",
  violet: "#AF52DE",
  indigo: "#5856D6",
  slate: "#636366",
} as const;

export const chartColorSequence = [
  chartColors.primary,
  chartColors.teal,
  chartColors.green,
  chartColors.amber,
  chartColors.rose,
  chartColors.violet,
  chartColors.indigo,
  chartColors.slate,
] as const;
