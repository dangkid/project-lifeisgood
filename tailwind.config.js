/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nueva paleta de colores para ComunicaCentros
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#2563EB', // Azul profesional
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#10B981', // Verde crecimiento
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#F97316', // Naranja energía
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          DEFAULT: '#6B7280',
        },
        // Colores de estado para accesibilidad
        success: {
          DEFAULT: '#10B981',
          dark: '#059669'
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#D97706'
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#DC2626'
        },
        info: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB'
        }
      },
      fontSize: {
        // Extra large sizes for accessibility
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
        '8xl': '6rem'
      },
      spacing: {
        '128': '32rem',
        '144': '36rem'
      },
      screens: {
        // Breakpoints específicos para dispositivos AAC
        'xs': '320px',      // Teléfonos pequeños
        'sm': '640px',      // Teléfonos
        'md': '768px',      // Tablets pequeñas (iPad mini)
        'lg': '1024px',     // Tablets (iPad estándar)
        'xl': '1280px',     // Laptops pequeñas
        '2xl': '1536px',    // Desktop
        '3xl': '1920px',    // Desktop grandes
        'tablet': {'min': '768px', 'max': '1023px'}, // Rango específico tablets
        'ipad': {'min': '768px', 'max': '1024px'},   // Rango específico iPad
        'desktop': '1024px', // Desktop y tablets en landscape
      }
    },
  },
  plugins: [],
}
