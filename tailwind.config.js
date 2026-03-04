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
          bg: '#050505',

          green: '#00FF66',
          red: '#FF3B3B',
          yellow: '#FFD84D',
          cyan: '#00E5FF',

          greenSoft: '#33FF33',
          redSoft: '#FF2A2A',
          amber: '#FFCC00',
          cyanSoft: '#00FFFF',
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
