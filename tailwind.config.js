/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F14',
        pitch: '#123524',
        accent: '#22c55e',
        panel: '#111827',
        line: '#1f2937',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
