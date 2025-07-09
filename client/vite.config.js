import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    host: '0.0.0.0', // Allows access from external devices (needed for Ngrok)
    port: 5173, 

    proxy: {
      '/api': {
        target: 'process.env.REACT_APP_API_URL',
        changeOrigin: true,
      },
    },
  },
});