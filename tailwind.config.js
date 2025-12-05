/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
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
