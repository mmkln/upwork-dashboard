const uiFoundationPreset = require("./packages/ui-foundation/tailwind.preset.cjs");

module.exports = {
  ...uiFoundationPreset,
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./packages/ui-foundation/src/**/*.{js,ts,jsx,tsx}",
  ],
};
