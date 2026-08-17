/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDFF',
          100: '#E5FAFE',
          200: '#C7F5FD',
          300: '#92EEFF', // Primary Hackathon Accent
          400: '#70E5FB',
          500: '#38D2F3',
          600: '#12B3D8',
          700: '#0E8FAE',
          800: '#11718A',
          900: '#145D71',
          DEFAULT: '#92EEFF',
        },
        slate: {
          850: '#151F32',
          950: '#0B0F19'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'glow-accent': '0 0 20px -3px rgba(146, 238, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
