// vite.config.js
import { defineConfig } from 'vite';
import { VitePWA }  from 'vite-plugin-pwa';

export default defineConfig({
  // nie musisz podawać root: '.' – to wartość domyślna
  publicDir: false,        // nic nie kopiujemy z /public w trybie dev

  build: {
    outDir: 'public',      // gotowe pliki trafiają do ./public
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html'
    }
  },

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',   // SW sam sprawdza nową wersję
      manifest: {
        name: 'Keyword: Master English',
        short_name: 'Keyword',
        description: 'Master English, word by word!',
        theme_color: '#0284c7',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});