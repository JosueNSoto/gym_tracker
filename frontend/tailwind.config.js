/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'gym-primary': '#3b82f6', // Azul principal
        'gym-secondary': '#10b981', // Verde éxito
        'gym-accent': '#f59e0b', // Naranja records
        'gym-bg': '#f8fafc',
        'gym-card': '#ffffff',
        'gym-text': '#1e293b',
        'gym-muted': '#64748b',
        'gym-dark': '#0f172a',
      },
    },
  },
  plugins: [],
}
