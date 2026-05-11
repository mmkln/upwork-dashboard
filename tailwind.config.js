/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          50: "#EFF0FE",
          100: "#E0E0FD",
          200: "#C4C5FA",
          300: "#A5A6F8",
          400: "#8688F5",
          500: "#696CF3",
          600: "#464BEE",
          700: "#212ADB",
          800: "#161DA6",
          900: "#0B106F",
          950: "#05084F",
        },
        secondary: {
          50: "#F1F3FD",
          100: "#E0E4FA",
          200: "#C4CDF5",
          300: "#A4B4F0",
          400: "#839AEB",
          500: "#6284E5",
          600: "#406DD4",
          700: "#3358AD",
          800: "#27458B",
          900: "#12244E",
          950: "#091634",
        },
        tertiary: {
          50: "#F2F3FB",
          100: "#E4E8F6",
          200: "#CDD3EF",
          300: "#B4BEE7",
          400: "#8D9EDB",
          500: "#6781CF",
          600: "#4B65AD",
          700: "#374B83",
          800: "#24335C",
          900: "#131C37",
          950: "#0B1227",
        },
        active: {
          50: "#F2F3FE",
          100: "#E0E0FE",
          200: "#C4C4FD",
          300: "#A5A6FB",
          400: "#898AFA",
          500: "#686AF8",
          600: "#484CF6",
          700: "#1824F0",
          800: "#0D15A9",
          900: "#05096A",
          950: "#03054E",
        },
      },
    },
  },
  plugins: [],
};
