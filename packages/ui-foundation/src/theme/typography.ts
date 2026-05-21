export const typography = {
  display: {
    fontSize: 34,
    fontWeight: 700,
    letterSpacing: "0",
    lineHeight: "41px",
  },
  heading: {
    fontSize: 22,
    fontWeight: 600,
    letterSpacing: "0",
    lineHeight: "28px",
  },
  body: {
    fontSize: 17,
    fontWeight: 400,
    letterSpacing: "0",
    lineHeight: "22px",
  },
  ui: {
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "0",
    lineHeight: "20px",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0",
    lineHeight: "18px",
  },
  data: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "0",
    lineHeight: "34px",
    fontVariantNumeric: "tabular-nums",
  },
} as const;

export type TypographyToken = keyof typeof typography;
