import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv } from 'vite';

import { timestampPlugin } from './vite/viteTimestampPlugin';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: mode === 'production' ? [react(), timestampPlugin(env)] : [react()],
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
  };
});
