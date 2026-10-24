/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', "system-ui", "sans-serif"],
      },
      // Warm "home" palette used across the app
      colors: {
        sand: {
          50: "#fcfaf6",
          100: "#f7f0e6",
          200: "#efe3d3",
          300: "#e3d3bf",
        },
        cocoa: {
          400: "#9a8473",
          500: "#7e6a5b",
          600: "#6a5848",
          700: "#5a4637",
          800: "#3f2c1f",
          900: "#2f251e",
        },
        gold: {
          100: "#f8ead4",
          300: "#ecd0a4",
          400: "#d8b57e",
          500: "#c79f6c",
          600: "#a97c48",
          700: "#8a6232",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(47,37,30,0.06), 0 8px 24px rgba(79,56,35,0.08)",
        "card-hover": "0 2px 4px rgba(47,37,30,0.08), 0 16px 36px rgba(79,56,35,0.16)",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slideUp 0.25s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
