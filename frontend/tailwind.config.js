/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta Mulled Wine - Tonos morados/violetas
        'mulled-wine': {
          '50': 'hsl(0, 0%, 100%)',           // Blanco puro - texto principal
          '100': 'hsl(252, 83%, 98%)',        // Violeta muy claro
          '200': 'hsl(246, 33%, 83%)',        // Violeta claro
          '300': 'hsl(246, 34%, 79%)',        // Texto secundario/muted
          '400': 'hsl(246, 21%, 61%)',        // Elementos medios, hover
          '500': 'hsl(247, 15%, 52%)',        // Bordes, divisores
          '600': 'hsl(246, 14%, 28%)',        // Superficies/cards
          '700': 'hsl(244, 17%, 16%)',        // Fondo principal (más oscuro)
          '800': 'hsl(244, 20%, 12%)',        // Fondo aún más oscuro (variante)
          '900': 'hsl(244, 25%, 8%)',         // Fondo profundo (variante)
        },
        
        // Notificaciones (colores vibrantes para contraste)
        notify: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
        }
      },
    },
  },
  plugins: [],
}
