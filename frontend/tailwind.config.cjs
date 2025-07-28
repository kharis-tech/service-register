/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-maroon': '#4A044E',
        'brand-purple': '#3B0764',
        'brand-gold': '#FFD700',
        'brand-light': '#F3F4F6',
        'brand-dark': '#111827',
      },
    },
  },
  plugins: [],
}