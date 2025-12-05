/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spanish: {
          red: '#c60b1e',
          yellow: '#ffc400',
        }
      }
    },
  },
  plugins: [],
}
