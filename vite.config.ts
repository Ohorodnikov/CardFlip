import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use absolute root for user/org pages (username.github.io)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
});