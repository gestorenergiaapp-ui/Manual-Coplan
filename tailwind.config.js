/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/{components,pages,context,hooks,utils}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0A2342', // Coplan Dark Blue
        'brand-secondary': '#E63946', // Red
        'brand-accent': '#E63946', // Red (as accent)
        'brand-light': '#F8F9FA', // Light Grey BG
        'brand-dark': '#212529',   // Dark Text
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      }
    }
  },
  plugins: [],
}