/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#181816', charcoal: '#232320', paper: '#F7F6F2', line: '#DAD6CC',
        muted: '#6E6B62', gold: '#9C7A3C', 'gold-light': '#C9AE7A',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
