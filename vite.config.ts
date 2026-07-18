/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

export default defineConfig({
  plugins: [
    react(),
    // Installable + offline: the game is fully client-side, so the
    // whole build precaches. autoUpdate swaps the service worker on
    // deploy without an update prompt — saves live in localStorage,
    // untouched by SW cache lifecycle.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'og.png'],
      manifest: {
        name: 'Crypto Frenzy',
        short_name: 'Crypto Frenzy',
        description:
          'A retro CRT-styled crypto trading sim. Borrow dirty money, ride volatile coins, and clear your debt before the days run out.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0f0a',
        theme_color: '#0a0f0a',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // SPA fallback for deep links (/game) while offline
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // the social card is fetched by crawlers, not the app —
        // no reason to precache 256KB into every player's SW
        globIgnores: ['og.png'],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    // Vercel Analytics loads /_vercel/insights/script.js, which only exists
    // on Vercel deployments — everywhere else the SPA fallback would serve
    // index.html as JS and crash the page with a SyntaxError.
    __VERCEL__: JSON.stringify(Boolean(process.env.VERCEL)),
  },
  // Port 3000 is shared contract with Cypress, CI, and Tauri's devUrl
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'helpers/**/*.test.ts'],
  },
});
