import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
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
      plugins: [
        visualizer({
          open: false,
          filename: 'bundle-stats.html',
        }),
      ],
      output: {
        manualChunks: id => {
          if (id.includes('node_modules')) {
            if (id.includes('openpgp')) {
              return 'openpgp';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
