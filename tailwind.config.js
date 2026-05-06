/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#080000',
        neon: '#ff1744',
        rage: '#ff6d00',
        glitch: '#ffea00',
        danger: '#ff0033',
      },
      boxShadow: {
        glow: '0 0 22px rgba(255, 23, 68, 0.4)',
        'glow-orange': '0 0 22px rgba(255, 109, 0, 0.35)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
