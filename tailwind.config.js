/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8E8',
        sky: '#C0F7FE',
        yellow: '#FFD700',
        coral: '#FF6F61',
        lavender: '#4B0082',
        mint: '#00FF7F',
        blue: '#00BFFF',
        pink: '#FF4081',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Baloo 2"', 'sans-serif'],
      },
      boxShadow: {
        neo: '5px 5px 0 #111111',
      },
    },
  },
  plugins: [],
}

