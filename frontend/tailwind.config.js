/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f5',
          100: '#e6f2ec',
          200: '#cce6d9',
          300: '#99cca3',
          400: '#66b38c',
          500: '#1B5E43', // Deep Green
          600: '#154934',
          700: '#103727',
          800: '#0a251a',
          900: '#05120d',
        },
        warm: {
          50: '#FAF9F6', // Warm Neutral background
          100: '#F5F3EC',
          200: '#EBE7DC',
          300: '#DCD5C5',
          400: '#C7BCAA',
          500: '#AD9E88',
        },
        accent: {
          amber: '#D97706',
          coral: '#E11D48',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
