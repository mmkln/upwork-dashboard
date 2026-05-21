export const motion = {
  duration: {
    instant: 0,
    fast: 120,
    standard: 180,
    medium: 220,
    disclosure: 240,
    slow: 300,
  },
  delay: {
    labelReveal: 90,
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

export type MotionToken = typeof motion;
