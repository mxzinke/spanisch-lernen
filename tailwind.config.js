/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, calm palette for a focused learning environment
        sand: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe3d6',
          300: '#ddd2c0',
          400: '#c9b89e',
        },
        cream: '#faf6f0',
        terracotta: {
          DEFAULT: '#c77b58',
          light: '#d4967a',
          dark: '#a65d3d',
        },
        clay: {
          DEFAULT: '#d4a574',
          light: '#e2be94',
        },
        olive: {
          DEFAULT: '#8b9a6d',
          light: '#a3b188',
          dark: '#6f7d54',
        },
        rose: {
          muted: '#c9a9a6',
          dark: '#a65d57',
        },
        warm: {
          gray: '#6b635b',
          brown: '#4a4039',
          gold: '#d4a84b',
        },
        // Semantic colors (muted versions)
        success: '#8b9a6d',
        error: '#c9a9a6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'lifted': '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        'elevated': '0 10px 25px rgba(0,0,0,0.08), 0 6px 10px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
