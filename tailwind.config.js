export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf4',
          100: '#d6f2e0',
          200: '#a8e3bf',
          300: '#6dcc96',
          400: '#34b06b',
          500: '#1a8c4e',
          600: '#157040',
          700: '#0f5530',
          800: '#0a3d22',
          900: '#062716',
        },
        surface: '#fafaf9',
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'stream': 'stream 0.1s ease-out',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        stream: { from: { opacity: '0.4' }, to: { opacity: '1' } },
      }
    }
  },
  plugins: []
}
