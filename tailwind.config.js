/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High contrast colors for accessibility
        primary: {
          DEFAULT: '#0066CC',
          dark: '#004080',
          light: '#3399FF'
        },
        danger: {
          DEFAULT: '#CC0000',
          dark: '#990000'
        },
        success: {
          DEFAULT: '#00AA00',
          dark: '#008800'
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
      }
    },
  },
  plugins: [],
}
