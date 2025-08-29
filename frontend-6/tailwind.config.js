/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: 'hsl(240 5.9% 90%)',
      },
      colors: {
        border: 'hsl(240 5.9% 90%)',
        primary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        secondary: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        background: 'hsl(0, 0%, 98%)',
        foreground: 'hsl(240, 10%, 3.9%)',
        card: 'hsl(0, 0%, 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
