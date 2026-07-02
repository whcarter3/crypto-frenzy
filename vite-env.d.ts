/// <reference types="vite/client" />

// Injected at build time from package.json via vite.config.ts `define`
declare const __APP_VERSION__: string;

// True only for builds running on Vercel (see vite.config.ts `define`)
declare const __VERCEL__: boolean;
