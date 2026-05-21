export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede8f8',
          200: '#ddd6f5',
          300: '#c4b8ea',
          400: '#a593dc',
          500: '#7c6fb5',
          600: '#5F4F86',
          700: '#4a3d6e',
          800: '#3d3060',
          900: '#2e2449',
        },
        surface: '#f0f3ff',
        card: '#ffffff',
      },
      fontFamily: {
        sans:    ['Onest', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['Geist Mono', 'Courier New', 'monospace'],
        display: ['Onest', 'Inter', 'sans-serif'],
      },
    }
  },
  plugins: []
}
