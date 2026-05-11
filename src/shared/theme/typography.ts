export const typography = {
  display: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
  },
  body: {
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: "0",
    lineHeight: 1.5,
  },
  ui: {
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: "0",
    lineHeight: 1.25,
  },
  label: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.15em",
    lineHeight: 1.2,
    textTransform: "uppercase",
  },
  data: {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: "-0.01em",
    lineHeight: 1.1,
    fontVariantNumeric: "tabular-nums",
  },
} as const;

export type TypographyToken = keyof typeof typography;
