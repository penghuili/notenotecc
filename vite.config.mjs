import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { timestampPlugin } from './vite/viteTimestampPlugin';

export default defineConfig({
  plugins: [react(), timestampPlugin()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
