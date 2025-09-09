/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#27ae60",
        secondary: "#1e8b4d",
        accent: "#6bb6a7",
        background: "#f0f2f5",
        card: "#ffffff",
      },
    },
  },
  plugins: [],
};
