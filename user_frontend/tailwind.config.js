/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5d7da",
        foreground: "#1a202c",
        primary: "#3b82f6",
        secondary: "#4b5563",
        accent: "#8b5cf6",
      },
    },
  },
  plugins: [],
}