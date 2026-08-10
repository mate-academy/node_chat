/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  // Let Vuetify handle most UI, Tailwind is for utilities/layout only
  corePlugins: {
    preflight: false, // Disable Tailwind reset so it doesn't clash with Vuetify
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
