import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

export default defineConfig({
  plugins: [react()],
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
});
