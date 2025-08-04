/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/renderer/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Ubuntu-inspired color palette
        ubuntu: {
          orange: "#E95420",
          purple: "#772953",
          warmGray: "#AEA79F",
          coolGray: "#333333",
          lightGray: "#F7F7F7",
          darkGray: "#2C2C2C",
        },
      },
    },
  },
  plugins: [],
};
