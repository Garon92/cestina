/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const ACCENT = '#e05cd2';

export default defineConfig({
  base: '/cestina/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/cestina/',
        name: 'Čeština pro Adámka',
        short_name: 'Čeština',
        description: 'Písmenka, slabiky, slova a věty – hravé procvičování čtení a psaní pro malé čtenáře.',
        lang: 'cs',
        dir: 'ltr',
        start_url: '/cestina/',
        scope: '/cestina/',
        display: 'standalone',
        orientation: 'any',
        theme_color: ACCENT,
        background_color: '#fdf4fc',
        categories: ['education', 'kids'],
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        navigateFallback: '/cestina/index.html',
        navigateFallbackDenylist: [/\.html$/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: { port: 5172, strictPort: true },
  preview: { port: 5172, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 700 },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
