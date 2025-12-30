import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Using relative base path './' is the most robust setting for GitHub Pages,
  // as it works whether the site is at the root or in a repository subpath.
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    // Ensures that the output is compatible with standard static servers
    target: 'esnext'
  },
});
