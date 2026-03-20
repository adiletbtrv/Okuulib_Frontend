/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#161622",
        accent: "#E84326",
        "primary-muted": "#1E1E2D",
        "text-primary": "#FFFFFF",
        "text-secondary": "#B0B0C3",
      },
      borderRadius: {
        xl: 16,
      },
    },
  },
  plugins: [],
};
