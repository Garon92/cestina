/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { g92NotFoundPage, g92Pwa } from './src/kit/pwa.ts';

export default defineConfig({
  base: '/cestina/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA(
      // Název manifestu z kitu: „Čeština – Čtení a psaní pro Adámka“ (C-19).
      g92Pwa('cestina', {
        description: 'Písmenka, slabiky, slova a věty – hravé procvičování čtení a psaní pro malé čtenáře.',
        // Staré adresy (abeceda.html…) jsou přesměrovací stránky – nesmí je nahradit index.html.
        navigateFallbackDenylist: [/\.html$/],
      }),
    ),
    // dist/404.html – česká stránka s tlačítkem zpět do aplikace místo anglické chyby GitHubu (C-23).
    g92NotFoundPage('cestina'),
  ],
  server: { port: 5172, strictPort: true },
  preview: { port: 5172, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 700 },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
