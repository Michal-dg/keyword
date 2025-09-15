import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: false,          // NIC nie będzie kopiowane z public/
  build: {
    outDir: 'public',        // wynik ląduje tu, a Firebase wysyła ten folder
    emptyOutDir: true,
    rollupOptions: {
      input: './index.html'
    }
  }
});