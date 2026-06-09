import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  publicDir: 'public',
  appType: 'spa',
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    reportCompressedSize: true,
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],

          tanstack: ['@tanstack/react-query', '@tanstack/react-router'],
        },
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@feature': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@store': path.resolve(__dirname, './src/shared/stores'),
      '@hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@lib': path.resolve(__dirname, './src/shared/lib'),
      '@utils': path.resolve(__dirname, './src/shared/utils'),
      '@errors': path.resolve(__dirname, './src/shared/errors'),
      '@config': path.resolve(__dirname, './src/shared/config'),
      '@sharedType': path.resolve(__dirname, './src/shared/types'),
      '@validator': path.resolve(__dirname, './src/shared/validators'),
    },
  },
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
});
