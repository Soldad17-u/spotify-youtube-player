/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          'green-light': '#1ED760',
          black: '#000000',
          'dark-gray': '#121212',
          gray: '#181818',
          'light-gray': '#282828',
          white: '#FFFFFF',
          'text-gray': '#B3B3B3',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
};