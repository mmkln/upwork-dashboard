import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "heading", "body", "ui", "label", "data"],
      color: [
        "surface-elevated",
        "surface-raised",
        "surface-chrome",
        "block",
        "block-subtle",
        "block-border",
        "control",
        "control-hover",
        "control-selected",
        "control-border",
        "island",
        "island-hover",
        "island-selected",
        "island-border",
        "sidebar",
        "sidebar-border",
        "material-liquid",
        "material-vibrant",
        "material-chrome",
        "premium-athens",
        "premium-shark",
        "premium-graphite",
        "premium-blue",
        "premium-indigo",
        "premium-purple",
      ],
      spacing: [
        "micro",
        "tag",
        "item",
        "control",
        "component",
        "card",
        "panel",
        "page",
        "section",
        "control-mini",
        "control-small",
        "target",
        "control-large",
        "layout",
        "control-xl",
        "spacious",
        "island",
        "block",
        "sidebar-inset",
        "app-gutter",
        "content-gutter",
        "app-rail",
        "sidebar-collapsed",
        "sidebar-expanded",
        "search",
        "search-compact",
        "number-field",
        "inspector",
        "menu",
        "popover",
      ],
      shadow: ["block", "material", "premium"],
      radius: ["island", "block", "control", "item"],
    },
    classGroups: {
      shadow: [{ shadow: ["block", "material", "premium"] }],
      rounded: [{ rounded: ["island", "block", "control", "item"] }],
      duration: [
        {
          duration: [
            "motion-instant",
            "motion-fast",
            "motion",
            "motion-medium",
            "motion-disclosure",
            "motion-slow",
          ],
        },
      ],
      ease: [
        {
          ease: ["motion-standard", "motion-emphasized", "motion-exit"],
        },
      ],
      delay: [{ delay: ["motion-label"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
