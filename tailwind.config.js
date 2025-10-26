/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'surface-primary': '#F3F3F8',
        'surface-card': '#FFFFFF',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        accent: '#6366F1',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
}
