/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        morale: '#10b981',
        supplies: '#f59e0b',
        threat: '#ef4444',
      }
    },
  },
  plugins: [],
}
