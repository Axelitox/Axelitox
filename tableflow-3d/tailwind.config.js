/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        bg: '#F5F3EE',
        surface: '#FFFFFF',
        ink: '#242424',
        muted: '#858585',
        line: '#E7E3DA',
        accent: { DEFAULT: '#D84A42', dark: '#BB3834', soft: '#FBEDEC' },
        wood: '#D4B995',
        furniture: '#B8BBB8',
        st: {
          available: '#48A77A',
          reserved: '#E8A547',
          occupied: '#D95E55',
          cleaning: '#8C9EAB',
          blocked: '#5E5E5E',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(36,36,36,0.04), 0 4px 16px rgba(36,36,36,0.06)',
        float: '0 2px 6px rgba(36,36,36,0.06), 0 12px 32px rgba(36,36,36,0.10)',
      },
      borderRadius: { xl2: '14px' },
    },
  },
  plugins: [],
}
