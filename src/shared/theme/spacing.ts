export const spacing = {
  micro: 4,
  item: 8,
  control: 12,
  component: 16,
  card: 24,
  panel: 32,
  page: 40,
  section: 40,
  layout: 48,
  spacious: 64,
} as const;

export type SpacingToken = keyof typeof spacing;
