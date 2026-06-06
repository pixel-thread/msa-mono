import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
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
  envPrefix: ['NEXT_PUBLIC_', 'VITE_'],
});
