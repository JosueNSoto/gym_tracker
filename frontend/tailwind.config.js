/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta principal HSL
        platinum: 'hsl(210, 13%, 94%)',
        silver: 'hsl(210, 3%, 77%)',
        steel: 'hsl(210, 5%, 62%)',
        slate: 'hsl(210, 11%, 47%)',
        gunmetal: 'hsl(210, 7%, 22%)',
        
        // Alias semánticos para uso en la app
        'app-bg': 'hsl(210, 7%, 22%)',        // gunmetal - fondo principal
        'app-surface': 'hsl(210, 11%, 47%)',   // slate - superficies/cards
        'app-border': 'hsl(210, 5%, 62%)',     // steel - bordes
        'app-text': 'hsl(210, 13%, 94%)',      // platinum - texto principal
        'app-text-muted': 'hsl(210, 3%, 77%)', // silver - texto secundario
        
        // Notificaciones (mantener colores vibrantes)
        'notify-success': '#10b981',
        'notify-error': '#ef4444',
        'notify-warning': '#f59e0b',
      },
    },
  },
  plugins: [],
}
