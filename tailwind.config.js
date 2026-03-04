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

          greenSoft: '#33ff33',
          redSoft: '#ff2a2a',
          amber: '#ffcc00',
          cyanSoft: '#00ffff',

          panel: '#040811',
          outline: '#1f2937',
        },
      },

      /* ─────────────────────────────
         TERMINAL FONT
      ───────────────────────────── */
      fontFamily: {
        terminal: ["'IBM Plex Mono'", 'monospace'],
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
