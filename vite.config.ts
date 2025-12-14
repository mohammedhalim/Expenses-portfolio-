import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // This base path ensures assets load correctly on GitHub Pages subdirectories
  base: './', 
  build: {
    outDir: 'dist',
  }
});