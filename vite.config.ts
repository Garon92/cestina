/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { g92Pwa } from './src/kit/pwa.ts';

export default defineConfig({
  base: '/cestina/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA(
      g92Pwa('cestina', {
        name: 'Čeština pro Adámka',
        shortName: 'Čeština',
        description: 'Písmenka, slabiky, slova a věty – hravé procvičování čtení a psaní pro malé čtenáře.',
        // Staré adresy (abeceda.html…) jsou přesměrovací stránky – nesmí je nahradit index.html.
        navigateFallbackDenylist: [/\.html$/],
      }),
    ),
  ],
  server: { port: 5172, strictPort: true },
  preview: { port: 5172, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 700 },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
});
