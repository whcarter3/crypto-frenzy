/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      /* ─────────────────────────────
         CRT COLORS
      ───────────────────────────── */
      colors: {
        crt: {
          bg: '#02040a',

          green: '#00ff66',
          red: '#ff3355',
          yellow: '#ffd84d',
          cyan: '#00e5ff',

          transparentGreen: 'rgba(0, 255, 102, 0.1)',
          transparentRed: 'rgba(255, 51, 85, 0.1)',
          transparentYellow: 'rgba(255, 216, 77, 0.1)',
          transparentCyan: 'rgba(0, 229, 255, 0.1)',

          panel: '#040811',
          outline: '#1f2937',
        },
      },

      /* ─────────────────────────────
         TERMINAL FONT + MIN 16PX
      ───────────────────────────── */
      fontFamily: {
        terminal: ["'IBM Plex Mono'", 'monospace'],
      },
      fontSize: {
        xs: ['1rem', { lineHeight: '1.5rem' }] /* 16px min */,
        sm: ['1rem', { lineHeight: '1.5rem' }] /* 16px min */,
      },

      /* ─────────────────────────────
         EXISTING ANIMATIONS
      ───────────────────────────── */
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
