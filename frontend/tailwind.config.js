/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandRed: '#E50914',
        brandTeal: '#1A7A8B', // The exact button color from your Login screenshot
        cinemaBlack: '#020202',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-slide': 'fadeSlideIn 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}