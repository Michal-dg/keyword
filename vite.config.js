// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',          // katalog źródłowy (tam, gdzie package.json)
  publicDir: false,   // nic nie kopiujemy z public/ w trybie dev
  build: {
    outDir: 'public',     // Vite zapisuje build prosto do ./public
    emptyOutDir: true,    // przy każdym buildzie czyści stary public/
    rollupOptions: {
      input: './index.html'
    }
  }
});