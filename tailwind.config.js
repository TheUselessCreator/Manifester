/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
        "*.{js,ts,jsx,tsx,mdx}"
    ],
  theme: {
    extend: {
      colors: {
        'steam-blue': '#1b2838',
        'steam-light': '#2a475e',
        'steam-accent': '#66c0f4',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
